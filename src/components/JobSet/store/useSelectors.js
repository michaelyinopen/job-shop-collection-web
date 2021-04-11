import { useContext, useMemo } from 'react';
import { differenceInMilliseconds } from 'date-fns/fp';
import JobSetEditorStateContext from '../JobSetEditor/JobSetEditorStateContext';
import compareJobSetWithState from './compareJobSetWithState';
import JobSetStateContext from '../JobSetStateContext';

export const useJobSetEditorState = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.jobSetEditor.editContentHistory.present.editContent;
};

export const useCurrentJobSetId = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.currentJobSetId;
};

export const useReadOnly = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.jobSetEditor.editStatus.readOnly;
};

export const useTitle = () => {
  const state = useContext(JobSetEditorStateContext);
  return state.title;
};

export const useDescription = () => {
  const state = useContext(JobSetEditorStateContext);
  return state.description;
};

export const useMachineIds = () => {
  const state = useContext(JobSetEditorStateContext);
  const machineIds = useMemo(
    () => Object.keys(state.machines).map(Number).sort((a, b) => a - b),
    [state.machines]
  );
  return machineIds;
};

export const useMachines = () => {
  const state = useContext(JobSetEditorStateContext);
  const machines = useMemo(
    () => Object.values(state.machines).sort((a, b) => a.id - b.id),
    [state.machines]
  );
  return machines;
};

export const useMachine = id => {
  const state = useContext(JobSetEditorStateContext);
  return state.machines[id];
};

export const useJobIds = () => {
  const state = useContext(JobSetEditorStateContext);
  const jobIds = useMemo(
    () => Object.keys(state.jobs).map(Number).sort((a, b) => a - b),
    [state.jobs]
  );
  return jobIds;
};

export const useJob = id => {
  const state = useContext(JobSetEditorStateContext);
  return state.jobs[id];
};

export const useProcedureIds = () => {
  const state = useContext(JobSetEditorStateContext);
  const procedureIds = useMemo(
    () => Object.values(state.procedures).sort((a, b) => a.sequence - b.sequence).map(p => p.id),
    [state.procedures]
  );
  return procedureIds;
};

export const useProcedureOfJobIds = jobId => {
  const state = useContext(JobSetEditorStateContext);
  const procedureIds = useMemo(
    () => Object.values(state.procedures).filter(p => p.jobId === jobId).sort((a, b) => a.sequence - b.sequence).map(p => p.id),
    [state.procedures, jobId]
  );
  return procedureIds;
};

export const useProcedure = id => {
  const state = useContext(JobSetEditorStateContext);
  return state.procedures[id];
};

export const useGetProcedureSequence = () => {
  const state = useContext(JobSetEditorStateContext);
  const getProcedureSequence = useMemo(
    () => id => {
      const procedure = state.procedures[id];
      return procedure ? procedure.sequence : undefined;
    },
    [state.procedures]
  );
  return getProcedureSequence;
}

export const useProceduresOfMachine = machineId => {
  const state = useContext(JobSetEditorStateContext);
  const proceduresOfMachine = useMemo(
    () => Object.values(state.procedures).filter(p => p.machineId === machineId),
    [state.procedures, machineId]
  );
  return proceduresOfMachine;
}

export const useIsAutoTimeOptions = () => {
  const state = useContext(JobSetEditorStateContext);
  return state.isAutoTimeOptions;
}

export const useMaxTimeFromRef = () => {
  const state = useContext(JobSetEditorStateContext);
  const maxTimeFromRef = differenceInMilliseconds(state.timeOptions.referenceDate)(state.timeOptions.maxTime);
  return maxTimeFromRef;
}

export const useViewStartTimeFromRef = () => {
  const state = useContext(JobSetEditorStateContext);
  return differenceInMilliseconds(state.timeOptions.referenceDate)(state.timeOptions.viewStartTime);
}

export const useViewEndTimeFromRef = () => {
  const state = useContext(JobSetEditorStateContext);
  return differenceInMilliseconds(state.timeOptions.referenceDate)(state.timeOptions.viewEndTime);
}

export const useMinViewDuration = () => {
  const state = useContext(JobSetEditorStateContext);
  return state.timeOptions.minViewDuration;
}

export const useMaxViewDuration = () => {
  const state = useContext(JobSetEditorStateContext);
  return state.timeOptions.maxViewDuration;
}

// returns [backgroundColor, textColor]
export const useJobColor = id => {
  const state = useContext(JobSetEditorStateContext);
  const jobColor = state.jobColors[id];
  if (jobColor) {
    return [jobColor.color, jobColor.textColor];
  }
}

const sortIdFn = (a, b) => a.id - b.id;
const sortSequenceFn = (a, b) => a.sequence - b.sequence;
export const useJobSet = () => {
  const state = useContext(JobSetEditorStateContext);
  const jobSet = useMemo(
    () => {
      return {
        machines: Object.values(state.machines).sort(sortIdFn),
        jobs: Object.values(state.jobs)
          .map(j => ({
            id: j.id,
            procedures: Object.values(state.procedures).filter(p => p.jobId === j.id).sort(sortSequenceFn)
          }))
          .sort(sortIdFn)
      };
    },
    [state.machines, state.jobs, state.procedures]
  );
  return jobSet;
};

export const useIsJobSetEqualFn = () => {
  const state = useContext(JobSetEditorStateContext);
  const isJobSetEqualFn = useMemo(
    () => jobSet => {
      return compareJobSetWithState(jobSet, state.machines, state.jobs, state.procedures);
    },
    [state.machines, state.jobs, state.procedures]
  );
  return isJobSetEqualFn;
};

export const useJobSetForCreation = () => {
  const state = useContext(JobSetEditorStateContext);
  const jobSetForCreation = useMemo(
    () => {
      const machines = Object.values(state.machines);
      const procedures = Object.values(state.procedures);
      const jobs = Object.values(state.jobs)
        .map(j => ({ ...j, procedures: procedures.filter(p => p.jobId === j.id) }));
      const content = JSON.stringify({
        machines,
        jobs
      });
      return {
        title: state.title,
        description: state.description,
        content,
        jobColors: JSON.stringify(Object.values(state.jobColors)),
        isAutoTimeOptions: state.isAutoTimeOptions,
        timeOptions: JSON.stringify(state.timeOptions)
      };
    },
    [state]
  );
  return jobSetForCreation;
};

export const useJobSetForUpdate = id => {
  const state = useContext(JobSetEditorStateContext);
  const jobSetForUpdate = useMemo(
    () => {
      const machines = Object.values(state.machines);
      const procedures = Object.values(state.procedures);
      const jobs = Object.values(state.jobs)
        .map(j => ({ ...j, procedures: procedures.filter(p => p.jobId === j.id) }));
      const content = JSON.stringify({
        machines,
        jobs
      });
      return {
        id,
        title: state.title,
        description: state.description,
        content,
        jobColors: JSON.stringify(Object.values(state.jobColors)),
        isAutoTimeOptions: state.isAutoTimeOptions,
        timeOptions: JSON.stringify(state.timeOptions)
      };
    },
    [state, id]
  );
  return jobSetForUpdate;
};

export const useCreatedId = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.jobSetEditor.editStatus.createdId;
};

export const useIsCreating = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.jobSetEditor.editStatus.isCreating;
};

export const useHasChanged = () => {
  const jobSetState = useContext(JobSetStateContext);
  return jobSetState.jobSetEditor.savedContent !== jobSetState.jobSetEditor.editContentHistory.present.editContent;
};

export const useHasUndo = () => {
  const jobSetState = useContext(JobSetStateContext);
  const hasUndo = jobSetState.jobSetEditor.editContentHistory.past.length > 0;
  return hasUndo;
};

export const useHasRedo = () => {
  const jobSetState = useContext(JobSetStateContext);
  const hasRedo = jobSetState.jobSetEditor.editContentHistory.future.length > 0;
  return hasRedo;
};