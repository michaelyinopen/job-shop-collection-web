import * as React from 'react'
import clsx from 'clsx'
import {
  ownerDocument,
  capitalize,
  useForkRef,
  useControlled,
  Popper,
  Grow,
  ClickAwayListener,
  Paper,
  MenuList,
} from '@material-ui/core'

function isFilled(obj) {
  return obj && obj.value !== ''
}

function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b
  }

  return String(a) === String(b)
}

function isEmpty(display) {
  return display == null || (typeof display === 'string' && !display.trim())
}

/**
 * @ignore - internal component.
 */
const PopperSelectInput = React.forwardRef(function SelectInput(props, ref) {
  const {
    'aria-label': ariaLabel,
    autoFocus,
    autoWidth,
    children,
    classes,
    className,
    defaultValue,
    disabled,
    displayEmpty,
    IconComponent,
    inputRef: inputRefProp,
    labelId,
    MenuProps = {},
    name,
    onBlur,
    onChange,
    onClose,
    onFocus,
    onOpen,
    open: openProp,
    readOnly,
    renderValue,
    SelectDisplayProps = {},
    tabIndex: tabIndexProp,
    // catching `type` from Input which makes no sense for SelectInput
    type,
    value: valueProp,
    variant = 'standard',
    ...other
  } = props

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'Select',
  })

  const inputRef = React.useRef(null)
  const displayNodeRef = React.useRef(null)
  const { current: isOpenControlled } = React.useRef(openProp != null)
  const [menuMinWidthState, setMenuMinWidthState] = React.useState()
  const [openState, setOpenState] = React.useState(false)
  const handleRef = useForkRef(ref, inputRefProp)

  React.useImperativeHandle(
    handleRef,
    () => ({
      focus: () => {
        displayNodeRef.current.focus()
      },
      node: inputRef.current,
      value,
    }),
    [value],
  )

  React.useEffect(() => {
    if (autoFocus && displayNodeRef.current) {
      displayNodeRef.current.focus()
    }
  }, [autoFocus])

  React.useEffect(() => {
    if (displayNodeRef.current) {
      const label = ownerDocument(displayNodeRef.current).getElementById(labelId)
      if (label) {
        const handler = (e) => {
          if (getSelection().isCollapsed) {
            displayNodeRef.current.focus()
          }
        }
        label.addEventListener('click', handler)
        return () => {
          label.removeEventListener('click', handler)
        }
      }
    }

    return undefined
  }, [labelId])

  const update = (open, event) => {
    if (open) {
      if (onOpen) {
        onOpen(event)
      }
    } else if (onClose) {
      onClose(event)
    }

    if (!isOpenControlled) {
      setMenuMinWidthState(autoWidth ? null : displayNodeRef.current.clientWidth)
      setOpenState(open)
    }
  }

  const handleMouseDown = (event) => {
    // Ignore everything but left-click
    if (event.button !== 0) {
      return
    }
    // Hijack the default focus behavior.
    event.preventDefault()
    displayNodeRef.current.focus()

    update(true, event)
  }

  const handleClose = (event) => {
    update(false, event)
  }

  const childrenArray = React.Children.toArray(children)

  // Support autofill.
  const handleChange = (event) => {
    const index = childrenArray.map((child) => child.props.value).indexOf(event.target.value)

    if (index === -1) {
      return
    }

    const child = childrenArray[index]
    setValue(child.props.value)

    if (onChange) {
      onChange(event, child)
    }
  }

  const handleItemClick = (child) => (event) => {
    update(false, event)

    const newValue = child.props.value

    if (child.props.onClick) {
      child.props.onClick(event)
    }

    if (value === newValue) {
      return
    }

    setValue(newValue)

    if (onChange) {
      event.persist()
      // Preact support, target is read only property on a native event.
      Object.defineProperty(event, 'target', { writable: true, value: { value: newValue, name } })
      onChange(event, child)
    }
  }

  const handleKeyDown = (event) => {
    if (!readOnly) {
      const validKeys = [
        ' ',
        'ArrowUp',
        'ArrowDown',
        // The native select doesn't respond to enter on MacOS, but it's recommended by
        // https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
        'Enter',
      ]

      if (validKeys.indexOf(event.key) !== -1) {
        event.preventDefault()
        update(true, event)
      }
    }
  }

  const open = displayNodeRef.current !== null && (isOpenControlled ? openProp : openState)

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      displayNodeRef.current.focus()
    }
    prevOpen.current = open
  }, [open])

  const handleBlur = (event) => {
    // if open event.stopImmediatePropagation
    if (!open && onBlur) {
      event.persist()
      // Preact support, target is read only property on a native event.
      Object.defineProperty(event, 'target', { writable: true, value: { value, name } })
      onBlur(event)
    }
  }

  delete other['aria-invalid']

  let display
  let displaySingle
  let computeDisplay = false
  let foundMatch = false

  // No need to display any value if the field is empty.
  if (isFilled({ value }) || displayEmpty) {
    if (renderValue) {
      display = renderValue(value)
    } else {
      computeDisplay = true
    }
  }

  const items = childrenArray.map((child) => {
    if (!React.isValidElement(child)) {
      return null
    }

    let selected = areEqualValues(value, child.props.value)
    if (selected && computeDisplay) {
      displaySingle = child.props.children
    }

    if (selected) {
      foundMatch = true
    }

    return React.cloneElement(child, {
      'aria-selected': selected ? 'true' : undefined,
      onClick: handleItemClick(child),
      onKeyUp: (event) => {
        if (event.key === ' ') {
          // otherwise our MenuItems dispatches a click event
          // it's not behavior of the native <option> and causes
          // the select to close immediately since we open on space keydown
          event.preventDefault()
        }

        if (child.props.onKeyUp) {
          child.props.onKeyUp(event)
        }
      },
      role: 'option',
      selected,
      value: undefined, // The value is most likely not a valid HTML attribute.
      'data-value': child.props.value, // Instead, we provide it as a data attribute.
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (!foundMatch && value !== '') {
        const values = childrenArray.map((child) => child.props.value)
        console.warn(
          [
            `Material-UI: You have provided an out-of-range value \`${value}\` for the select ${name ? `(name="${name}") ` : ''
            }component.`,
            "Consider providing a value that matches one of the available options or ''.",
            `The available values are ${values
              .filter((x) => x != null)
              .map((x) => `\`${x}\``)
              .join(', ') || '""'
            }.`,
          ].join('\n'),
        )
      }
    }, [foundMatch, childrenArray, name, value])
  }

  if (computeDisplay) {
    display = displaySingle
  }

  // Avoid performing a layout computation in the render method.
  let menuMinWidth = menuMinWidthState

  if (!autoWidth && isOpenControlled && displayNodeRef.current) {
    menuMinWidth = displayNodeRef.current.clientWidth
  }

  let tabIndex
  if (typeof tabIndexProp !== 'undefined') {
    tabIndex = tabIndexProp
  } else {
    tabIndex = disabled ? null : 0
  }

  const buttonId = SelectDisplayProps.id || (name ? `mui-component-select-${name}` : undefined)

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      handleClose()
    }
  }

  return (
    <React.Fragment>
      <ClickAwayListener
        onClickAway={handleClose}
      >
        <div style={{ display: 'inline-flex', width: '100%', position: 'relative' }}>
          <div
            className={clsx(
              classes.root, // TODO v5: merge root and select
              classes.select,
              classes.selectMenu,
              classes[variant],
              {
                [classes.disabled]: disabled,
              },
              className,
            )}
            ref={displayNodeRef}
            tabIndex={tabIndex}
            role="button"
            aria-disabled={disabled ? 'true' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            aria-labelledby={[labelId, buttonId].filter(Boolean).join(' ') || undefined}
            onKeyDown={handleKeyDown}
            onMouseDown={disabled || readOnly ? null : handleMouseDown}
            onBlur={handleBlur}
            onFocus={onFocus}
            {...SelectDisplayProps}
            // The id is required for proper a11y
            id={buttonId}
          >
            {/* So the vertical align positioning algorithm kicks in. */}
            {isEmpty(display) ? (
              // eslint-disable-next-line react/no-danger
              <span dangerouslySetInnerHTML={{ __html: '&#8203' }} />
            ) : (
              display
            )}
          </div>
          <input
            value={Array.isArray(value) ? value.join(',') : value}
            name={name}
            ref={inputRef}
            aria-hidden
            onChange={handleChange}
            tabIndex={-1}
            className={classes.nativeInput}
            autoFocus={autoFocus}
            {...other}
          />
          <IconComponent
            className={clsx(classes.icon, classes[`icon${capitalize(variant)}`], {
              [classes.iconOpen]: open,
              [classes.disabled]: disabled,
            })}
          />
          <Popper
            open={open}
            anchorEl={displayNodeRef.current}
            placement='bottom-start'
            transition
            style={{ zIndex: 900 }}
          >
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: 'top' }}
              >
                <Paper
                  {...MenuProps.PaperProps}
                  style={{
                    minWidth: menuMinWidth,
                    ...(MenuProps.PaperProps != null ? MenuProps.PaperProps.style : null),
                  }}
                >
                  <MenuList
                    autoFocusItem={open}
                    aria-labelledby={labelId}
                    id="menu-list-grow"
                    role='listbox'
                    disableListWrap
                    {...MenuProps.MenuListProps}
                    onKeyDown={handleListKeyDown}
                  >
                    {items}
                  </MenuList>
                </Paper>
              </Grow >
            )}
          </Popper>
        </div>
      </ClickAwayListener>
    </React.Fragment >
  )
})

export { PopperSelectInput }