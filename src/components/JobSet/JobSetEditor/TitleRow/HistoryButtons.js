import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  IconButton,
} from '@material-ui/core';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@material-ui/icons';
import JobShopCollectionDispatchContext from '../../../JobShopCollectionDispatchContext';
import {
  undo,
  redo,
} from '../../store/actionCreators';
import {
  useHasUndo,
  useHasRedo,
} from '../../store/useSelectors';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  }
}));

const HistoryButtons = React.memo(({
  undoCallback,
  redoCallback,
  undoDisabled,
  redoDisabled,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <IconButton onClick={undoCallback} {...(undoDisabled ? { disabled: true } : {})} >
        <UndoIcon />
      </IconButton>
      <IconButton onClick={redoCallback} {...(redoDisabled ? { disabled: true } : {})}>
        <RedoIcon />
      </IconButton>
    </div>
  );
});

const HistoryButtonsContainer = ({
  id
}) => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const undoCallback = useCallback(
    () => dispatch(undo()),
    [dispatch]
  );
  const redoCallback = useCallback(
    () => dispatch(redo()),
    [dispatch]
  );
  const hasUndo = useHasUndo();
  const undoDisabled = !hasUndo;
  const hasRedo = useHasRedo();
  const redoDisabled = !hasRedo;
  return (
    <HistoryButtons
      undoCallback={undoCallback}
      redoCallback={redoCallback}
      undoDisabled={undoDisabled}
      redoDisabled={redoDisabled}
    />
  );
};

export default HistoryButtonsContainer;