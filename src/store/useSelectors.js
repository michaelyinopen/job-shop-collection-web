import { useMemo, useContext } from 'react';
import JobShopCollectionMainStateContext from '../components/JobShopCollectionMainStateContext';
import JobShopCollectionStateContext from '../components/JobShopCollectionStateContext';

export const useJobShopCollectionMain = state => {
  const {
    snackbar,
    getJobSetsIsLoading,
    getJobSetsFailedMessage,
    jobSets,
    deletingJobSets,
  } = state;
  const jobShopCollectionMainMemo = useMemo(
    () => {
      return {
        snackbar,
        getJobSetsIsLoading,
        getJobSetsFailedMessage,
        jobSets,
        deletingJobSets
      }
    },
    [
      snackbar,
      getJobSetsIsLoading,
      getJobSetsFailedMessage,
      jobSets,
      deletingJobSets
    ]
  );
  return jobShopCollectionMainMemo;
};

export const useJobSetState = () => {
  const state = useContext(JobShopCollectionStateContext);
  const {
    currentJobSetId,
    jobSetEditor
  } = state;
  const JobSetStateMemo = useMemo(
    () => {
      return {
        currentJobSetId,
        jobSetEditor,
      }
    },
    [
      currentJobSetId,
      jobSetEditor,
    ]
  );
  return JobSetStateMemo;
};


export const useSnackbar = () => {
  const state = useContext(JobShopCollectionMainStateContext);
  const { isOpen, message } = state.snackbar;
  return [isOpen, message];
};

export const useGetJobSetsIsLoading = () => {
  const state = useContext(JobShopCollectionMainStateContext);
  return state.getJobSetsIsLoading;
};

export const useGetJobSetsFailedMessage = () => {
  const state = useContext(JobShopCollectionMainStateContext);
  return state.getJobSetsFailedMessage;
};

export const useJobSetHeaders = () => {
  const state = useContext(JobShopCollectionMainStateContext);
  const jobSetHeaders = useMemo(
    () => {
      return Object.values(state.jobSets)
        .filter(jobSet => jobSet.eTag)
        .map(jobSet => ({
          id: jobSet.id,
          title: jobSet.title,
          description: jobSet.description,
          eTag: jobSet.eTag
        }));
    },
    [state.jobSets]
  )
  return jobSetHeaders;
}

export const useJobSetHeader = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  const jobSet = state.jobSets[id];
  const jobSetHeader = useMemo(
    () => {
      if (!jobSet) {
        return undefined;
      }
      return {
        id: jobSet.id,
        title: jobSet.title,
        description: jobSet.description,
        eTag: jobSet.eTag
      };
    },
    [jobSet]
  )
  return jobSetHeader;
};

// returns [isDeleting, deleteSucceed, deleteFailed]
export const useJobSetDeleting = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  const deletingJobSet = state.deletingJobSets[id];
  if (deletingJobSet === undefined) {
    const isDeleting = false;
    const deleteSucceed = false;
    const deleteFailed = false;
    return [isDeleting, deleteSucceed, deleteFailed];
  }
  const isDeleting = true;
  const deleteSucceed = deletingJobSet.succeed;
  const deleteFailed = deletingJobSet.failed;
  return [isDeleting, deleteSucceed, deleteFailed];
};

export const useJobSetSomeDeleting = () => {
  const state = useContext(JobShopCollectionMainStateContext);
  const someDeleting = Object.keys(state.deletingJobSets).length > 0;
  return someDeleting;
};

export const useSelectedJobSets = idArray => {
  const state = useContext(JobShopCollectionMainStateContext);
  const selectedJobSets = useMemo(
    () => idArray.map(id => state.jobSets[id]).filter(js => js),
    [state.jobSets, idArray]
  );
  return selectedJobSets;
};

export const useJobSet = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  return state.jobSets[id];
};

// returns true when there is no jobSet in redux store
export const useIsLoadingJobSet = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  if (!id) {
    return false;
  }
  const jobSet = state.jobSets[id];
  return jobSet ? jobSet.isLoading : true;
};

export const useLoadJobSetFailedMessage = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  if (!id) {
    return undefined;
  }
  const jobSet = state.jobSets[id];
  return jobSet ? jobSet.loadFailedMessage : undefined;
};

export const useIsUpdatingJobSet = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  if (!id) {
    return false;
  }
  const jobSet = state.jobSets[id];
  return jobSet ? jobSet.isUpdating : false;
};

export const useUpdateJobSetFailedMessage = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  if (!id) {
    return undefined;
  }
  const jobSet = state.jobSets[id];
  return jobSet ? jobSet.updateFailedMessage : undefined;
};

export const useIsJobSetLocked = id => {
  const state = useContext(JobShopCollectionMainStateContext);
  if (!id) {
    return false;
  }
  const jobSet = state.jobSets[id];
  return jobSet ? jobSet.isLocked : false;
};