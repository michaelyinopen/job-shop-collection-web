import { useState, useEffect, useCallback } from 'react';
import { throttle } from 'lodash';
import { popperWait, forcePopperCloseWait } from '../../../../constants';

const usePopperHandlers = ({ wait = popperWait } = {}) => {
  const [anchorElement, setAnchorElement] = useState(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableOpenTimer, setDisableOpenTimer] = useState();
  const handlePopperOpenThrottled = useCallback(
    throttle(
      currentTarget => {
        setAnchorElement(currentTarget);
      },
      wait,
      { leading: false, trailing: true }
    ),
    [setAnchorElement]
  );
  const handlePopperOpen = useCallback(
    e => handlePopperOpenThrottled(e.currentTarget),
    [handlePopperOpenThrottled]
  );
  useEffect(() => { return () => handlePopperOpenThrottled.cancel(); }, [handlePopperOpenThrottled]);
  const handlePopperClose = useCallback(() => {
    if (handlePopperOpenThrottled.cancel) { handlePopperOpenThrottled.cancel(); }
    setAnchorElement(null);
  }, [setAnchorElement, handlePopperOpenThrottled]);
  const open = !disableOpen && Boolean(anchorElement);

  const forcePopperClose = useCallback(() => {
    handlePopperOpenThrottled.cancel();
    setAnchorElement(null);
    setDisableOpen(true);
    const timer = setTimeout(() => setDisableOpen(false), forcePopperCloseWait);
    setDisableOpenTimer(timer);
  }, [setDisableOpen, handlePopperOpenThrottled]);
  useEffect(() => {
    return () => clearTimeout(disableOpenTimer);
  }, [disableOpenTimer])

  return [anchorElement, open, handlePopperOpen, handlePopperClose, forcePopperClose];
};

export default usePopperHandlers;