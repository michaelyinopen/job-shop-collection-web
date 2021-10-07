import type { JobSetEditorState } from './jobSetEditorReducer'

export const jobSetsEditorIsLockedSelector = (state: JobSetEditorState) => state.isLocked
export const jobSetsEditorIsEditSelector = (state: JobSetEditorState) => state.isEdit
export const jobSetsEditorHasDetailSelector = (state: JobSetEditorState) => state.hasDetail
export const jobSetsEditorLoadStatusSelector = (state: JobSetEditorState) => state.loadStatus
export const jobSetsEditorInitializedSelector = (state: JobSetEditorState) => state.initialized

//#region formData
export const titleSelector = (state: JobSetEditorState) => state.formData.title
export const descriptionSelector = (state: JobSetEditorState) => state.formData.description
export const machineIdsSelector = (state: JobSetEditorState) => state.formData.machines.ids
export const machinesSelector = (state: JobSetEditorState) => {
  return state.formData.machines.ids.map(id => state.formData.machines.entities[id])
}
export const createMachineTitleSelector = (id: string) => (state: JobSetEditorState) => {
  return state.formData.machines.entities[id].title
}
export const createMachineDescriptionSelector = (id: string) => (state: JobSetEditorState) => {
  return state.formData.machines.entities[id].description
}
export const jobIdsSelector = (state: JobSetEditorState) => state.formData.jobs.ids
export const createJobColorSelector = (id: string) => (state: JobSetEditorState) =>
  state.formData.jobColors.entities[id].color
export const createJobTextColorSelector = (id: string) => (state: JobSetEditorState) =>
  state.formData.jobColors.entities[id].textColor
export const createProcedureIdsOfJobSelector = (jobId: string) => (state: JobSetEditorState) =>
  state.formData.jobs.entities[jobId].procedures.ids
export const createProcedureMachineIdSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId].procedures.entities[procedureId].machineId
export const createProcedureProcessingTimeMsSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId].procedures.entities[procedureId].processingTimeMs
export const createProcedureIndexSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId].procedures.ids.indexOf(procedureId)
export const createProceduresAffectedByMachineSelector = (machineId: string) =>
  (state: JobSetEditorState) => {
    const allProcedures = Object.values(state.formData.jobs.entities).flatMap(j => Object.values(j.procedures.entities))
    return allProcedures.filter(p => p.machineId === machineId)
  }
export const isAutoTimeOptionsSelector = (state: JobSetEditorState) => state.formData.isAutoTimeOptions
export const maxTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions!.maxTimeMs
    : state.formData.manualTimeOptions.maxTimeMs
export const viewStartTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions!.viewStartTimeMs
    : state.formData.manualTimeOptions.viewStartTimeMs
export const viewEndTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions!.viewEndTimeMs
    : state.formData.manualTimeOptions.viewEndTimeMs
export const maxViewDurationMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions!.maxViewDurationMs
    : state.formData.manualTimeOptions.maxViewDurationMs
export const minViewDurationMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions!.minViewDurationMs
    : state.formData.manualTimeOptions.minViewDurationMs
//#endregion formData