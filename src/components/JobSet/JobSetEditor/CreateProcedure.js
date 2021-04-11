import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { createProcedure } from '../store/actionCreators';
import { procedure as procedureStyle } from './sharedStyles';

const useStyles = makeStyles(theme => ({
  procedure: procedureStyle(theme),
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  addIcon: { marginRight: theme.spacing(0.5) },
}));

const CreateProcedure = React.memo(({
  createProcedureCallback
}) => {
  const classes = useStyles();
  return (
    <div className={classes.procedure}>
      <Button
        variant="contained"
        color="primary"
        onClick={createProcedureCallback}
        className={classes.addButton}>
        <AddCircle className={classes.addIcon} />
        Procedure
      </Button>
    </div>
  );
});

const CreateProcedureContainer = ({
  jobId
}) => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const createProcedureCallback = useCallback(
    () => dispatch(createProcedure(jobId)),
    [dispatch, jobId]
  );
  return (
    <CreateProcedure
      createProcedureCallback={createProcedureCallback}
    />
  );
};

export const createProcedureKey = "CreateProcedure";

export default CreateProcedureContainer;