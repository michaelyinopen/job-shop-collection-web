import { cloneElement, forwardRef } from 'react'
import {
  withStyles,
  OutlinedInput,
} from '@material-ui/core'
import {
  mergeClasses,
} from '@material-ui/styles'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

import { styles as nativeSelectStyles } from '@material-ui/core/NativeSelect/NativeSelect' // use internal of MUI
import SelectInput from '@material-ui/core/Select/SelectInput' //todo replace by PopperSelectInput
import { PopperSelectInput } from './PopperSelectInput'

export const styles = nativeSelectStyles

let PopperSelect = forwardRef(function Select(props, ref) {
  const {
    autoWidth = false,
    children,
    classes,
    displayEmpty = false,
    IconComponent = ArrowDropDownIcon,
    id,
    input,
    inputProps,
    label,
    labelId,
    labelWidth = 0,
    MenuProps,
    multiple = false,
    native = false,
    onClose,
    onOpen,
    open,
    renderValue,
    SelectDisplayProps,
    variant = 'outlined',
    ...other
  } = props

  const inputComponent = PopperSelectInput

  const InputComponent = <OutlinedInput label={label} labelWidth={labelWidth} />

  return cloneElement(InputComponent, {
    // Most of the logic is implemented in `SelectInput`.
    // The `Select` component is a simple API wrapper to expose something better to play with.
    inputComponent,
    inputProps: {
      children,
      IconComponent,
      variant,
      type: undefined, // We render a select. We can ignore the type provided by the `Input`.
      multiple,
      ...(native
        ? { id }
        : {
          autoWidth,
          displayEmpty,
          labelId,
          MenuProps,
          onClose,
          onOpen,
          open,
          renderValue,
          SelectDisplayProps: { id, ...SelectDisplayProps },
        }),
      ...inputProps,
      classes: inputProps
        ? mergeClasses({
          baseClasses: classes,
          newClasses: inputProps.classes,
          Component: Select,
        })
        : classes,
      ...(input ? input.props.inputProps : {}),
    },
    ref,
    ...other,
  })
})

PopperSelect.muiName = 'Select'

PopperSelect = withStyles(styles, { name: 'MuiSelect' })(PopperSelect)

export { PopperSelect }