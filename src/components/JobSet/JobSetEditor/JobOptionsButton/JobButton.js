import React, { useCallback, useEffect } from 'react';
import { throttle } from 'lodash';
import { iconButtonPopperClosingWait } from '../../../../constants';
import { IconButton, Tooltip } from '@material-ui/core';

const JobIconButton = ({
  icon,
  title,
  popper,
  onIconButtonClick,
  onMouseLeave,
  onMouseEnter,
}) => {
  return (
    <div onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
      <Tooltip title={title} placement="right-end">
        <IconButton
          onClick={onIconButtonClick}
          style={{ marginRight: "8px" }}
        >
          {icon}
        </IconButton>
      </Tooltip>
      {popper}
    </div >
  )
};

const JobButton = ({
  open,
  handlePopperOpen,
  handlePopperClose,
  icon,
  title,
  popper,
}) => {
  //#region onIconButtonClick
  const toggleOpen = useCallback(
    e => {
      if (open) {
        handlePopperClose();
      }
      else {
        handlePopperOpen(e);
      }
    },
    [open, handlePopperOpen, handlePopperClose]
  );
  //#endregion onIconButtonClick

  //#region onMouseLeave
  const handlePopperCloseThrottled = useCallback(
    throttle(
      handlePopperClose,
      iconButtonPopperClosingWait,
      { leading: false, trailing: true }
    ),
    [handlePopperClose]
  );

  useEffect(
    () => {
      if (handlePopperCloseThrottled.cancel) {
        handlePopperCloseThrottled.cancel();
      }
    },
    [handlePopperCloseThrottled]
  );
  //#endregion onMouseLeave

  //#region onMouseEnter
  const cancelClosing = useCallback(
    () => {
      if (handlePopperCloseThrottled.cancel) {
        handlePopperCloseThrottled.cancel();
      }
    },
    [handlePopperCloseThrottled]
  );
  //#endregion onMouseEnter

  return (
    <JobIconButton
      icon={icon}
      title={title}
      popper={popper}
      onIconButtonClick={toggleOpen}
      onMouseLeave={handlePopperCloseThrottled}
      onMouseEnter={cancelClosing}
    />
  )
};
export default React.memo(JobButton);