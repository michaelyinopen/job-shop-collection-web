import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { createJob } from '../store/actionCreators';
import { Card, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { job as jobStyle } from './sharedStyles';

const useStyles = makeStyles(theme => ({
  job: jobStyle(theme),
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  addIcon: { marginRight: theme.spacing(0.5) },
}));

const CreateJob = React.memo(({
  createJobCallback
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.job}>
      <Button
        variant="contained"
        color="primary"
        onClick={createJobCallback}
        className={classes.addButton}
      >
        <Add className={classes.addIcon} />
        Job
      </Button>
    </Card>
  );
});

const CreateJobContainer = () => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const createJobCallback = useCallback(
    () => dispatch(createJob()),
    [dispatch]
  );
  return (
    <CreateJob
      createJobCallback={createJobCallback}
    />
  );
};

export default CreateJobContainer;