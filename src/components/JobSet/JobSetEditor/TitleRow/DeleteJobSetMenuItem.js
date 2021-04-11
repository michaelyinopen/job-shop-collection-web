import React, { useContext, useMemo, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  CircularProgress,
  MenuItem,
  ListItemIcon,
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { generatePath } from 'react-router';
import useReactRouter from 'use-react-router';
import JobShopCollectionDispatchContext from '../../../JobShopCollectionDispatchContext';
import { deleteJobSetApiAsync } from '../../../../api';
import { jobSets as jobSetsPath } from '../../../../routePaths';
import {
  deleteJobSetBegin,
  deleteJobSetSucceed,
  deleteJobSetFailed,
  showSnackbar
} from '../../../../store/actionCreators';
import {
  useJobSet,
  useJobSetDeleting,
  useIsJobSetLocked
} from '../../../../store/useSelectors';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  progressOnButton: {
    position: 'absolute',
    zIndex: 1,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: 'flex'
  },
}));

const DeleteJobSetMenuItem = React.memo(React.forwardRef((
  {
    id,
    isLocked,
    deleteTooltip,
    dialogOpen,
    clickOpenCallback,
    closeCallback,
    confirmCallback,
    isDeleting
  },
  ref
) => {
  const classes = useStyles();
  return (
    <MenuItem
      ref={ref}
      onClick={clickOpenCallback}
      disabled={isLocked}
    >
      <Tooltip title={deleteTooltip} placement="bottom-end">
        <div className={classes.wrapper}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        {isDeleting ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
        </div>
      </Tooltip>
      <Dialog
        open={dialogOpen}
        onClose={closeCallback}
      >
        <DialogTitle>{deleteTooltip + "?"}</DialogTitle>
        <DialogActions>
          <Button onClick={closeCallback} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={confirmCallback} variant="contained" color="secondary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </MenuItem>
  );
}));

const DeleteJobSetMenuItemContainer = React.forwardRef((
  {
    id,
  },
  ref
) => {
  const jobSet = useJobSet(id);
  const dispatch = useContext(JobShopCollectionDispatchContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const clickOpenCallback = useCallback(
    e => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      setDialogOpen(true)
    },
    [setDialogOpen]
  );
  const closeCallback = useCallback(
    e => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      setDialogOpen(false);
    },
    [setDialogOpen]
  );

  const [isDeletingState] = useJobSetDeleting(id);
  const { history: { push } } = useReactRouter();
  const deleteCompletedCallback = useMemo( // possibly add snackbar
    () => {
      const generatedJobSetsPath = generatePath(jobSetsPath);
      const callback = () => {
        closeCallback();
        dispatch(showSnackbar(`Deleted Job Set ${id}`));
        push(generatedJobSetsPath);
      }
      return callback;
    },
    [push, dispatch, id, closeCallback]
  );
  const onDelete = useMemo(
    () => {
      if (!id || !jobSet) {
        return null;
      }
      let isDeleting = false;
      const getIsDeleting = () => isDeleting;
      const callback = () => {
        if (getIsDeleting()) {
          return;
        }
        const deleteJobSetAsync = async () => {
          isDeleting = true;
          dispatch(deleteJobSetBegin(id));
          try {
            await deleteJobSetApiAsync(id, jobSet.eTag);
            isDeleting = false;
            dispatch(deleteJobSetSucceed(id, true));
            deleteCompletedCallback();
          }
          catch (e) {
            alert(`Failed to delete Job Set ${id}\nPlease try again.`);
            isDeleting = false;
            dispatch(deleteJobSetFailed(id, true));
          }
        };
        deleteJobSetAsync();
      };
      return callback;
    },
    [
      id,
      jobSet,
      dispatch,
      deleteCompletedCallback
    ]
  );

  const deleteTooltip = `Deleted Job Set ${id}`;

  const confirmCallback = useCallback(
    () => {
      onDelete();
    },
    [onDelete]
  );
  const isLocked = useIsJobSetLocked(id);

  if (!onDelete) {
    return null;
  };
  return (
    <DeleteJobSetMenuItem
      ref={ref}
      id={id}
      isLocked={isLocked}
      deleteTooltip={deleteTooltip}
      dialogOpen={dialogOpen}
      clickOpenCallback={clickOpenCallback}
      closeCallback={closeCallback}
      confirmCallback={confirmCallback}
      isDeleting={isDeletingState}
    />
  );
});

export default DeleteJobSetMenuItemContainer;