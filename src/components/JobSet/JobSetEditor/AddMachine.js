import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { addMachine } from '../store/actionCreators';
import { machine as machineStyle } from './sharedStyles';

const useStyles = makeStyles(theme => ({
  machine: machineStyle(theme),
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  addIcon: { marginRight: theme.spacing(0.5) },
}));

const AddMachine = React.memo(({
  addMachineCallback
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.machine}>
      <Button
        variant="contained"
        color="primary"
        onClick={addMachineCallback}
        className={classes.addButton}
      >
        <Add className={classes.addIcon} />
        Machine
      </Button>
    </Card>
  );
});

const AddMachineContainer = () => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const addMachineCallback = useCallback(
    () => dispatch(addMachine()),
    [dispatch]
  );
  return (
    <AddMachine
      addMachineCallback={addMachineCallback}
    />
  );
};

export default AddMachineContainer;