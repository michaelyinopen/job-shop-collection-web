import * as fromActionTypes from './actionTypes';
import { ActionCreators } from 'redux-undo';

export const setReadOnly = isReadOnly => ({
  type: fromActionTypes.setReadOnly,
  isReadOnly: Boolean(isReadOnly)
});

export const setTitle = title => ({
  type: fromActionTypes.setTitle,
  title
});

export const setDescription = description => ({
  type: fromActionTypes.setDescription,
  description
});

export const addMachine = () => ({
  type: fromActionTypes.addMachine
});

export const updateMachineTitle = (id, title) => ({
  type: fromActionTypes.updateMachineTitle,
  id,
  title
});

export const updateMachineDescription = (id, description) => ({
  type: fromActionTypes.updateMachineDescription,
  id,
  description
});

export const removeMachine = id => ({
  type: fromActionTypes.removeMachine,
  id
});

export const createJob = () => ({
  type: fromActionTypes.createJob
});

export const deleteJob = id => ({ // also deletes procedures of job
  type: fromActionTypes.deleteJob,
  id
});

export const createProcedure = jobId => ({
  type: fromActionTypes.createProcedure,
  jobId
});

export const updateProcedure = (id, procedure) => ({
  type: fromActionTypes.updateProcedure,
  id,
  machineId: procedure.machineId,
  processingMilliseconds: procedure.processingMilliseconds
});

// targetSequence is this procedure's sequence after move
export const moveProcedure = (id, targetSequence) => ({
  type: fromActionTypes.moveProcedure,
  id,
  targetSequence
});

export const deleteProcedure = id => ({
  type: fromActionTypes.deleteProcedure,
  id
});

export const setIsAutoTimeOptions = isAuto => ({
  type: fromActionTypes.setIsAutoTimeOptions,
  isAuto
});

export const setMaxTimeFromRef = maxTimeFromRef => ({
  type: fromActionTypes.setMaxTimeFromRef,
  maxTimeFromRef
});

export const setViewStartTimeFromRef = viewStartTimeFromRef => ({
  type: fromActionTypes.setViewStartTimeFromRef,
  viewStartTimeFromRef
});

export const setViewEndTimeFromRef = viewEndTimeFromRef => ({
  type: fromActionTypes.setViewEndTimeFromRef,
  viewEndTimeFromRef
});


export const setMinViewDuration = minViewDuration => ({
  type: fromActionTypes.setMinViewDuration,
  minViewDuration
});

export const setMaxViewDuration = maxViewDuration => ({
  type: fromActionTypes.setMaxViewDuration,
  maxViewDuration
});

export const changeJobColor = id => ({
  type: fromActionTypes.changeJobColor,
  id
});

export const undo = ActionCreators.undo;

export const redo = ActionCreators.redo;