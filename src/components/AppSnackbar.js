import React, { useContext, useCallback } from 'react';
import { Snackbar } from '@material-ui/core';
import { useSnackbar } from '../store/useSelectors'
import JobShopCollectionDispatchContext from './JobShopCollectionDispatchContext';
import { closeSnackbar } from '../store/actionCreators';

const AppSnackbar = React.memo(({
  open,
  message,
  onClose
}) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{message}</span>}
    />
  );
});

const AppSnackbarContainer = () => {
  const [open, message] = useSnackbar();
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const onClose = useCallback(
    (_event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      dispatch(closeSnackbar());
    },
    [dispatch]
  )
  return (
    <AppSnackbar
      open={open}
      message={message}
      onClose={onClose}
    />
  );
};

export default AppSnackbarContainer;