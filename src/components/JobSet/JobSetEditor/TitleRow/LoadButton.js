import React, { useCallback, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  IconButton,
  CircularProgress,
  Typography
} from '@material-ui/core';
import { Refresh as RefreshIcon } from '@material-ui/icons';
import JobShopCollectionDispatchContext from '../../../JobShopCollectionDispatchContext';
import {
  getJobSetBegin,
  getJobSetSucceed,
  getJobSetFailed
} from '../../../../store/actionCreators';
import { getJobSetApiAsync } from '../../../../api';
import {
  useIsLoadingJobSet,
  useLoadJobSetFailedMessage
} from '../../../../store/useSelectors';

const useStyles = makeStyles(theme => ({
  withProgressWrapper: {
    position: 'relative'
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

const LoadButton = ({
  loadCallback,
  isLoading,
  failedMessage
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className={classes.withProgressWrapper}>
        <IconButton onClick={loadCallback}>
          <RefreshIcon />
        </IconButton>
        {isLoading ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
      </div>
      <Typography color="error">
        {failedMessage}
      </Typography>
    </React.Fragment>
  );
};

const LoadButtonContainer = ({
  id
}) => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const loadCallback = useCallback(
    () => {
      const getJobSetAsync = async () => {
        dispatch(getJobSetBegin(id));
        try {
          const jobSet = await getJobSetApiAsync(id);
          dispatch(getJobSetSucceed(id, jobSet));
        }
        catch (e) {
          dispatch(getJobSetFailed(id, e.message));
        }
      };
      getJobSetAsync();
    },
    [id, dispatch]
  );
  const isLoading = useIsLoadingJobSet(id);
  const failedMessage = useLoadJobSetFailedMessage(id);
  return (
    <LoadButton
      loadCallback={loadCallback}
      isLoading={isLoading}
      failedMessage={failedMessage}
    />
  );
};

export default LoadButtonContainer;