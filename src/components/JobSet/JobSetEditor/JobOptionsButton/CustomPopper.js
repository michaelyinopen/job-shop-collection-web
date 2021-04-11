import React from 'react';
import { Popper, Grow, Paper } from '@material-ui/core';

const noPointerEventStyle = { pointerEvents: "none" };

const CustomPopper = ({
  open,
  anchorElement,
  handlePopperClose,
  canSelect = true,
  children,
}) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorElement}
      onClose={handlePopperClose}
      placement='bottom-start'
      transition
      style={canSelect ? null : noPointerEventStyle}
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{ transformOrigin: 'top left' }}
        >
          <Paper>
            {children}
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

export default CustomPopper;