import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, TextField } from '@material-ui/core';
import RemoveMachineButton from './RemoveMachineButton';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { useMachine, useReadOnly } from '../store/useSelectors';
import { updateMachineTitle, updateMachineDescription } from '../store/actionCreators';
import useDebouncedValue from '../../../functions/useDebouncedValue';
import { typingInputDebounceWait } from '../../../constants';
import { machine as machineStyle } from './sharedStyles';

const useStyles = makeStyles(theme => ({
  machine: machineStyle(theme),
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  description: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: 320
  },
  separator: { flexGrow: 1 },
}));

const Machine = React.memo(({
  id,
  description,
  title,
  readOnly,
  onDescriptionChangeCallback,
  onTitleChangeCallback
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.machine}>
      <TextField
        label="Title"
        value={title || ''}
        onChange={onTitleChangeCallback}
        required
        error={!title || title.length === 0}
        variant="filled"
        margin="dense"
        className={classes.title}
        inputProps={readOnly ? { readOnly: true } : {}}
      />
      <TextField
        label="Description"
        value={description || ''}
        onChange={onDescriptionChangeCallback}
        variant="filled"
        margin="dense"
        multiline
        fullWidth
        className={classes.description}
        disabled={(!description || description.length === 0) && readOnly}
        inputProps={readOnly ? { readOnly: true } : {}}
      />
      <div className={classes.separator} />
      {!readOnly ? <RemoveMachineButton id={id} /> : null}
    </Card>
  );
});

const MachineContainer = ({
  id
}) => {
  const machine = useMachine(id);
  const readOnly = useReadOnly();

  const dispatch = useContext(JobShopCollectionDispatchContext);
  const dispatchUpdateMachineTitle = useCallback(
    value => dispatch(updateMachineTitle(id, value)),
    [dispatch, id]
  );

  const [title, onTitleChangeCallback] = useDebouncedValue(
    machine.title,
    dispatchUpdateMachineTitle,
    typingInputDebounceWait
  );

  const dispatchUpdateMachineDescription = useCallback(
    value => dispatch(updateMachineDescription(id, value)),
    [dispatch, id]
  );

  const [description, onDescriptionChangeCallback] = useDebouncedValue(
    machine.description,
    dispatchUpdateMachineDescription,
    typingInputDebounceWait
  );

  return (
    <Machine
      id={id}
      description={description}
      title={title}
      readOnly={readOnly}
      onDescriptionChangeCallback={onDescriptionChangeCallback}
      onTitleChangeCallback={onTitleChangeCallback}
    />
  );
};

export default MachineContainer;