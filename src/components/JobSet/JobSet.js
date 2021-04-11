import React, { useContext, useMemo, useEffect } from 'react';
import { generatePath, Redirect } from 'react-router';
import JobShopCollectionDispatchContext from '../JobShopCollectionDispatchContext';
import JobSetEditor from './JobSetEditor';
import { getJobSetApiAsync } from '../../api';
import {
  getJobSetBegin,
  getJobSetSucceed,
  getJobSetFailed,
  setCurrentJobSetId,
} from '../../store/actionCreators';
import { useJobSetState, useIsJobSetLocked } from '../../store/useSelectors';
import { getNewJobSetId, isNewJobSetId } from '../../functions/newJobSetId';
import { setReadOnly } from './store/actionCreators';
import JobSetStateContext from './JobSetStateContext';
import {
  useJobSetEditorState,
  useCurrentJobSetId,
} from './store/useSelectors';
import JobSetEditorStateContext from './JobSetEditor/JobSetEditorStateContext';
import { jobSet as jobSetPath } from '../../routePaths';

// when used as new jobset, id will be undefined
const JobSet = ({
  id,
  edit
}) => {
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const getJobSetAsync = useMemo(
    () => async () => {
      dispatch(getJobSetBegin(id));
      try {
        const jobSet = await getJobSetApiAsync(id);
        dispatch(getJobSetSucceed(id, jobSet));
      }
      catch (e) {
        dispatch(getJobSetFailed(id, e.message));
      }
    },
    [id, dispatch]
  );
  useEffect(
    () => {
      dispatch(setCurrentJobSetId(id ? id : getNewJobSetId()));
      if (id && !isNewJobSetId(id)) {
        getJobSetAsync();
      }
    },
    [id, getJobSetAsync, dispatch]
  );
  useEffect(
    () => {
      dispatch(setReadOnly(id && !edit));
    },
    [id, edit, dispatch]
  );
  const currentJobSetId = useCurrentJobSetId();
  const jobSetEditorState = useJobSetEditorState();

  const readOnlyPath = id ? generatePath(jobSetPath, { id }) : "/";
  const isLocked = useIsJobSetLocked(id);

  if ((id && currentJobSetId !== id) || (!id && !isNewJobSetId(currentJobSetId))) {
    return <div>transitioning...</div>;
  }
  if (isLocked && edit) {
    return <Redirect to={readOnlyPath} />
  }
  return (
    <JobSetEditorStateContext.Provider value={jobSetEditorState}>
      <JobSetEditor id={id} />
    </JobSetEditorStateContext.Provider>
  );
};

const JobSetWithContext = props => {
  const jobSetState = useJobSetState();
  return (
    <JobSetStateContext.Provider value={jobSetState}>
      <JobSet {...props} />
    </JobSetStateContext.Provider>
  );
};

export default JobSetWithContext;
