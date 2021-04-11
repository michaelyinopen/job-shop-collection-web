import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  /* Styles applied to the root element. */
  root: {
    transition: theme.transitions.create(['color', 'padding-top'], {
      duration: theme.transitions.duration.short,
    }),
    padding: '6px 0 8px',
    minWidth: 80,
    maxWidth: 168,
    flex: '1',
    color: 'inherit',
    borderColor: 'currentColor',
  },
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'column',
  },
  label: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(12),
    opacity: 1,
  },
}));

const LabeledButton = React.forwardRef(function BottomNavigationAction(props, ref) {
  const {
    className,
    icon,
    label,
    onChange,
    onClick,
    value,
    ...other
  } = props;

  const classes = useStyles();
  const handleChange = event => {
    if (onChange) {
      onChange(event, value);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <ButtonBase
      ref={ref}
      className={clsx(
        classes.root,
        className,
      )}
      focusRipple
      onClick={handleChange}
      {...other}
    >
      <span className={classes.wrapper}>
        {icon}
        <span
          className={classes.label}
        >
          {label}
        </span>
      </span>
    </ButtonBase>
  );
});

export default LabeledButton;