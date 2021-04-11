import React, { useContext, useCallback, useState } from 'react';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { deleteJob } from '../store/actionCreators';
import {
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';

const DeleteJobButton = React.memo(({
  id,
  deleteTooltip,
  open,
  clickOpenCallback,
  closeCallback,
  confirmCallback
}) => {
  return (
    <div>
      <Tooltip title={deleteTooltip} placement="right-end">
        <IconButton onClick={clickOpenCallback}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={closeCallback}
      >
        <DialogTitle>{deleteTooltip + "?"}</DialogTitle>
        <DialogActions>
          <Button onClick={closeCallback} variant="outlined" color="primary">
            Cancel
              </Button>
          <Button onClick={confirmCallback} variant="contained" color="primary" autoFocus>
            Ok
            </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
});

const DeleteJobButtonContainer = ({
  id,
}) => {
  const deleteTooltip = `Delete Job ${id}`;

  const [open, setOpen] = useState(false);
  const clickOpenCallback = useCallback(
    () => setOpen(true),
    [setOpen]
  );
  const closeCallback = useCallback(
    () => setOpen(false),
    [setOpen]
  );

  const dispatch = useContext(JobShopCollectionDispatchContext);
  const confirmCallback = useCallback(
    () => {
      dispatch(deleteJob(id));
      closeCallback();
    },
    [dispatch, id, closeCallback]
  );
  return (
    <DeleteJobButton
      id={id}
      deleteTooltip={deleteTooltip}
      open={open}
      clickOpenCallback={clickOpenCallback}
      closeCallback={closeCallback}
      confirmCallback={confirmCallback}
    />
  );
};

export default DeleteJobButtonContainer;