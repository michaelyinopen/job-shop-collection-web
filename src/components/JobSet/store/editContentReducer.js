import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import { isEqual } from 'lodash';
import { addMilliseconds } from 'date-fns/fp';
import compareJobSetWithState from './compareJobSetWithState';
import createReducer from '../../../functions/createReducer';
import updateObject from '../../../functions/updateObject';
import updateKeyInObject from '../../../functions/updateKeyInObject';
import getNextOfMax from '../../../functions/getNextOfMax';
import toDate from '../../../functions/toDate';
import timeOptionsAdjustReducer, { adjustTimeOptions } from './timeOptionsAdjustReducer'
import getNewColor from './jobColor';
import jobColorAdjustReducer, { adjustJobColors } from './jobColorAdjustReducer'
import {
  setTitle,
  setDescription,

  addMachine,
  updateMachineTitle,
  updateMachineDescription,
  removeMachine,

  createJob,
  deleteJob,

  createProcedure,
  updateProcedure,
  moveProcedure,
  deleteProcedure,

  setIsAutoTimeOptions,
  setMaxTimeFromRef,
  setViewStartTimeFromRef,
  setViewEndTimeFromRef,
  setMinViewDuration,
  setMaxViewDuration,

  changeJobColor
} from './actionTypes';
import { jobSetEditorUpdatingActionsTypes } from '../../../store/currentJobSetAdjustReducer';

//#region title description
const titleInitialState = null;

const title = createReducer(
  titleInitialState,
  {
    [setTitle]: (_state, action) => action.title
  }
);

const descriptionInitialState = null;

const description = createReducer(
  descriptionInitialState,
  {
    [setDescription]: (_state, action) => action.description
  }
);
//#endregion title description

//#region Machines
const machineInitialState = id => ({
  id,
  title: `M${id}`,
  description: `Machine ${id}`
});

const machine = id => createReducer(
  machineInitialState(id),
  {
    [addMachine]: state => state, // redundent because returns initial state
    [updateMachineTitle]: (state, action) => updateObject(state, { title: action.title }),
    [updateMachineDescription]: (state, action) => updateObject(state, { description: action.description }),
  }
);

const machinesInitialState = {};
const machines = createReducer(
  machinesInitialState,
  {
    [addMachine]: (state, action) => {
      const id = getNextOfMax(Object.keys(state));
      return {
        ...state,
        [id]: machine(id)(undefined, action)
      };
    },
    [updateMachineTitle]: (state, action) => updateKeyInObject(state, action.id, m => machine(action.id)(m, action)),
    [updateMachineDescription]: (state, action) => updateKeyInObject(state, action.id, m => machine(action.id)(m, action)),
    [removeMachine]: (state, { id }) => {
      if (!state.hasOwnProperty(id)) {
        return state;
      }
      const { [id]: _removed, ...restState } = state;
      return restState;
    },
  }
);

export const initMachines = machinesArg => {
  return machinesArg.reduce(
    (acc, m) => {
      acc[m.id] = {
        ...machineInitialState(m.id),
        title: m.title,
        description: m.description,
      };
      return acc;
    },
    {}
  );
};
//#endregion Machines

//#region Jobs
const jobInitialState = id => ({
  id
});

const job = id => createReducer(
  jobInitialState(id),
  {
    [createJob]: state => state// redundent because returns initial state
  }
);

const jobsInitialState = {};
const jobs = createReducer(
  jobsInitialState,
  {
    [createJob]: (state, action) => {
      const id = getNextOfMax(Object.keys(state));
      return {
        ...state,
        [id]: job(id)(undefined, action)
      };
    },
    [deleteJob]: (state, { id }) => {
      if (!state.hasOwnProperty(id)) {
        return state;
      }
      const { [id]: _removed, ...restState } = state;
      return restState;
    },
  }
);

export const initJobs = jobsArg => {
  return jobsArg.reduce(
    (acc, j) => {
      acc[j.id] = {
        ...jobInitialState(j.id),
      };
      return acc;
    },
    {}
  );
};
//#endregion jobs

//#region Procedures
const procedureInitialState = id => ({
  id,
  jobId: undefined,
  machineId: undefined,
  sequence: undefined,
  processingMilliseconds: undefined
});

const procedure = id => createReducer(
  procedureInitialState(id),
  {
    [createProcedure]: (state, { jobId }, sequence) => ({
      ...state,
      jobId,
      sequence
    }),
    [updateProcedure]: (state, action) => updateObject(state, { machineId: action.machineId, processingMilliseconds: action.processingMilliseconds }),
    [moveProcedure]: (state, _action, sequence) => updateObject(state, { sequence }),
    [deleteProcedure]: (state, _action, sequence) => updateObject(state, { sequence }),
    [removeMachine]: (state, { id: machineId }) => {
      if (state.machineId !== machineId) {
        return state;
      }
      return {
        ...state,
        machineId: undefined
      };
    },
  }
);

const proceduresInitialState = {};
const procedures = createReducer(
  proceduresInitialState,
  {
    [createProcedure]: (state, action) => {
      const { jobId } = action;
      const id = getNextOfMax(Object.keys(state));
      const proceduresOfJobSequences = Object.values(state).filter(p => p.jobId === jobId).map(p => p.sequence);
      const nextSequence = getNextOfMax(proceduresOfJobSequences);
      return {
        ...state,
        [id]: procedure(id)(undefined, action, nextSequence)
      };
    },
    [updateProcedure]: (state, action) => updateKeyInObject(state, action.id, p => procedure(action.id)(p, action)),
    [moveProcedure]: (state, action) => {
      // targetSequence is this procedure's sequence after move
      const { id, targetSequence } = action;
      const actionProcedure = state[id];
      if (!actionProcedure) {
        return state;
      }
      const { jobId, sequence: sourceSequence } = actionProcedure;
      if (sourceSequence === targetSequence) {
        return state;
      }
      return Object.entries(state).reduce(
        (acc, [key, p]) => {
          const { id: currentId, jobId: currentJobId, sequence } = p;
          if (currentJobId !== jobId) {
            acc[key] = p;
            return acc;
          }
          if (currentId === id) {
            acc[key] = procedure(currentId)(p, action, targetSequence);
            return acc;
          }
          let updatedSequence = sequence;
          if (updatedSequence > sourceSequence) {
            updatedSequence = updatedSequence - 1;
          }
          if (updatedSequence >= targetSequence) { // note: use updatedSequence here
            updatedSequence = updatedSequence + 1;
          }

          acc[key] = procedure(currentId)(p, action, updatedSequence);
          return acc;
        },
        {}
      );
    },
    [deleteProcedure]: (state, action) => {
      const { id } = action;
      const procedureToDelete = state[id];
      if (!procedureToDelete) {
        return state;
      }
      const jobId = procedureToDelete.jobId;
      const sequenceOfDelete = procedureToDelete.sequence;
      return Object.entries(state)
        .reduce(
          (acc, [key, p]) => {
            const { id: currentId, jobId: currentJobId, sequence } = p;
            if (currentId === id) {
              return acc;
            }
            if (currentJobId !== jobId) {
              acc[key] = p;
              return acc;
            }
            let updatedSequence = sequence;
            if (updatedSequence > sequenceOfDelete) {
              updatedSequence = updatedSequence - 1;
            }
            acc[key] = procedure(currentId)(p, action, updatedSequence);
            return acc;
          },
          {}
        );
    },
    [deleteJob]: (state, { id: jobId }) => {
      if (!Object.values(state).some(p => p.jobId === jobId)) {
        return state;
      }
      return Object.entries(state)
        .filter(([_key, p]) => p.jobId !== jobId)
        .reduce(
          (acc, [key, p]) => {
            acc[key] = p
            return acc;
          },
          {}
        );
    },
    [removeMachine]: (state, action) => {
      const { id: machineId } = action;
      if (!Object.values(state).some(p => p.machineId === machineId)) {
        return state;
      }
      return Object.entries(state)
        .reduce(
          (acc, [key, p]) => {
            acc[key] = procedure(key)(p, action);
            return acc;
          },
          {}
        );
    }
  }
);

export const initProcedures = jobsArg => {
  return jobsArg
    .map(j => j.procedures)
    .reduce((acc, cur) => acc.concat(cur), [])
    .reduce(
      (acc, p) => {
        acc[p.id] = {
          ...procedureInitialState(p.id),
          jobId: p.jobId,
          machineId: p.machineId,
          sequence: p.sequence,
          processingMilliseconds: p.processingMilliseconds,
        };
        return acc;
      },
      {}
    );
}
//#endregion Procedures

//#region Time Options
const isAutoTimeOptionsInitialState = true;
const isAutoTimeOptions = createReducer(
  isAutoTimeOptionsInitialState,
  {
    [setIsAutoTimeOptions]: (_state, { isAuto }) => isAuto
  }
);

const referenceDateInitialState = new Date(0);
const timeOptionsInitialState = {
  referenceDate: referenceDateInitialState, // minTime === referenceDate
  maxTime: undefined,
  viewStartTime: undefined,
  viewEndTime: undefined,
  minViewDuration: undefined,
  maxViewDuration: undefined
};

const timeOptions = createReducer(
  timeOptionsInitialState,
  {
    [setMaxTimeFromRef]: (state, { maxTimeFromRef }) => updateObject(
      state,
      { maxTime: addMilliseconds(maxTimeFromRef)(state.referenceDate) }
    ),
    [setViewStartTimeFromRef]: (state, { viewStartTimeFromRef }) => updateObject(
      state,
      { viewStartTime: addMilliseconds(viewStartTimeFromRef)(state.referenceDate) }
    ),
    [setViewEndTimeFromRef]: (state, { viewEndTimeFromRef }) => updateObject(
      state,
      { viewEndTime: addMilliseconds(viewEndTimeFromRef)(state.referenceDate) }
    ),
    [setMinViewDuration]: (state, { minViewDuration }) => updateObject(
      state,
      { minViewDuration }
    ),
    [setMaxViewDuration]: (state, { maxViewDuration }) => updateObject(
      state,
      { maxViewDuration }
    ),
  }
)
//#endregion Time Options

//#region jobColors
const jobColorInitialState = id => ({
  id,
  color: undefined,
  textColor: undefined,
});

const jobColor = id => createReducer(
  jobColorInitialState(id),
  {
    [changeJobColor]: (state, _action, jobColor) => updateObject(state, { color: jobColor.color, textColor: jobColor.textColor }),
  }
);

const jobColorsInitialState = {};
const jobColors = createReducer(
  jobColorsInitialState,
  {
    [changeJobColor]: (state, action) => {
      const { id } = action;
      const excludeColors = Object.values(state).map(jc => jc.color);
      const currentColor = state[id].color;
      const [color, textColor] = getNewColor(excludeColors, currentColor);
      return updateKeyInObject(state, id, jc => jobColor(id)(jc, action, { color, textColor }));
    }
  }
);
//#endregion jobColors

export const editContentInit = (
  {
    title = titleInitialState,
    description = descriptionInitialState,
    machines: machinesArg = [],
    jobs: jobsArg = [],
    isAutoTimeOptions = isAutoTimeOptionsInitialState,
    timeOptions: timeOptionsArg,
    jobColors: jobColorsArg,
  } = {},
  state = {}
) => {
  const {
    machines: machinesState = machinesInitialState,
    jobs: jobsState = jobsInitialState,
    procedures: proceduresState = proceduresInitialState,
    timeOptions: timeOptionsState = timeOptionsInitialState,
    jobColors: jobColorsState = jobColorsInitialState,
  } = state;
  const [isEqualContent, mappedMachines, mappedJobs, mappedProcedures] = compareJobSetWithState(
    {
      machines: machinesArg,
      jobs: jobsArg,
    },
    machinesState,
    jobsState,
    proceduresState
  );
  let clonedTimeOptions = timeOptionsArg ? {
    referenceDate: timeOptionsArg.referenceDate ? toDate(timeOptionsArg.referenceDate) : referenceDateInitialState,
    maxTime: toDate(timeOptionsArg.maxTime),
    viewStartTime: toDate(timeOptionsArg.viewStartTime),
    viewEndTime: toDate(timeOptionsArg.viewEndTime),
    minViewDuration: timeOptionsArg.minViewDuration,
    maxViewDuration: timeOptionsArg.maxViewDuration
  } : timeOptionsInitialState;
  if (isEqual(clonedTimeOptions, timeOptionsState)) {
    clonedTimeOptions = timeOptionsState
  };

  let newState = updateObject(state, {
    title,
    description,
    machines: isEqualContent ? machinesState : mappedMachines,
    jobs: isEqualContent ? jobsState : mappedJobs,
    procedures: isEqualContent ? proceduresState : mappedProcedures,
    isAutoTimeOptions,
    timeOptions: clonedTimeOptions,
    jobColors: jobColorsState
  });
  newState = adjustJobColors(newState, jobColorsArg);
  newState = adjustTimeOptions(newState);
  return newState;
};

const setJobSetReducer = (state, action, _previousState, jobSet) => {
  if (!jobSetEditorUpdatingActionsTypes.includes(action.type) || !jobSet) {
    return state;
  }
  return editContentInit(jobSet, state);
};

const editContentReducer = (state, action, ...rest) => reduceReducers(
  setJobSetReducer,
  combineReducers({
    title,
    description,
    machines,
    jobs,
    procedures,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  }),
  timeOptionsAdjustReducer,
  jobColorAdjustReducer
)(state, action, state, ...rest);

export default editContentReducer;