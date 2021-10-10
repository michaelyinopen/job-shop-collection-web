import { nanoid } from 'nanoid'
import { createAction } from '@reduxjs/toolkit'
import type { TimeOptions } from './jobSetEditorReducer'
import type { Step } from './editHistory'

export const resetJobSetEditor = createAction('jobSetEditor/resetJobSetEditor')
export const setJobSetEditorId = createAction<number | undefined>('jobSetEditor/setJobSetEditorId')
export const setJobSetEditorIsEdit = createAction<boolean>('jobSetEditor/setJobSetEditorIsEdit')
export const loadedJobSet = createAction('jobSetEditor/loadedJobSet')
export const failedToLoadJobSet = createAction('jobSetEditor/failedToLoadJobSet')

export type AppStoreJobSetHeader = {
  id: number
  title: string
  description?: string
  versionToken: string
  isLocked: boolean
  hasDetail: false
}

export type AppStoreJobSetDetail = {
  id: number
  title: string
  description?: string
  content: string
  jobColors: string
  isAutoTimeOptions: boolean
  timeOptions: string
  isLocked: boolean
  versionToken: string
  hasDetail: true
}

export type AppStoreJobSet = AppStoreJobSetHeader | AppStoreJobSetDetail

export const setJobSetFromAppStore = createAction(
  'jobSetEditor/setJobSetFromAppStore',
  (jobSet: AppStoreJobSet | undefined, loaded: boolean) => ({
    payload: {
      jobSet,
      loaded
    }
  })
)

export const setTitle = createAction<string>('jobSetEditor/setTitle')
export const focusTitle = createAction('jobSetEditor/focusTitle')

export const setDescription = createAction<string>('jobSetEditor/setDescription')

export const addMachine = createAction(
  'jobSetEditor/addMachine',
  () => ({
    payload: {
      id: nanoid()
    }
  })
)

export const setMachineTitle = createAction(
  'jobSetEditor/setMachineTitle',
  (machineId: string, value: string) => ({
    payload: {
      machineId,
      value
    }
  })
)
export const focusMachineTitle = createAction(
  'jobSetEditor/focusMachineTitle',
  (machineId: string) => ({
    payload: {
      machineId
    }
  })
)

export const setMachineDescription = createAction(
  'jobSetEditor/setMachineDescription',
  (machineId: string, value: string) => ({
    payload: {
      machineId,
      value
    }
  })
)

export const removeMachine = createAction(
  'jobSetEditor/removeMachine',
  (machineId: string) => ({
    payload: {
      machineId
    }
  })
)

//#region Job
export const createJob = createAction(
  'jobSetEditor/createJob',
  () => ({
    payload: {
      id: nanoid()
    }
  })
)

export const changeJobColor = createAction(
  'jobSetEditor/changeJobColor',
  (jobId: string) => ({
    payload: {
      jobId
    }
  })
)

export const deleteJob = createAction(
  'jobSetEditor/deletePdeleteJobrocedure',
  (jobId: string) => ({
    payload: {
      jobId
    }
  })
)
//#endregion Job

//#region Procedure
export const createProcedure = createAction(
  'jobSetEditor/createProcedure',
  (jobId: string) => ({
    payload: {
      jobId,
      id: nanoid()
    }
  })
)

export const setProcedureMachineId = createAction(
  'jobSetEditor/setProcedureMachineId',
  (
    jobId: string,
    procedureId: string,
    machineIdValue: string | null
  ) => ({
    payload: {
      jobId,
      procedureId,
      machineIdValue
    }
  })
)
export const focusProcedureMachineId = createAction(
  'jobSetEditor/focusProcedureMachineId',
  (
    jobId: string,
    procedureId: string
  ) => ({
    payload: {
      jobId,
      procedureId
    }
  })
)

export const setProcedureProcessingTime = createAction(
  'jobSetEditor/setProcedureProcessingTime',
  (
    jobId: string,
    procedureId: string,
    processingTimeMs: number
  ) => ({
    payload: {
      jobId,
      procedureId,
      processingMs: processingTimeMs
    }
  })
)
export const focusProcedureProcessingTime = createAction(
  'jobSetEditor/focusProcedureProcessingTime',
  (
    jobId: string,
    procedureId: string
  ) => ({
    payload: {
      jobId,
      procedureId
    }
  })
)

export const moveProcedure = createAction(
  'jobSetEditor/moveProcedure',
  // targetIndex is this procedure's index after move
  (
    jobId: string,
    procedureId: string,
    targetIndex: number
  ) => ({
    payload: {
      jobId,
      procedureId,
      targetIndex
    }
  })
)

export const deleteProcedure = createAction(
  'jobSetEditor/deleteProcedure',
  (
    jobId: string,
    procedureId: string
  ) => ({
    payload: {
      jobId,
      procedureId
    }
  })
)
//#endregion Procedure

//#region TimeOptions
export const setIsAutoTimeOptions = createAction<boolean>('jobSetEditor/setIsAutoTimeOptions')

export const setMaxTime = createAction(
  'jobSetEditor/setMaxTime',
  (maxTimeMs: number) => ({
    payload: {
      maxTimeMs
    }
  })
)
export const focusMaxTime = createAction('jobSetEditor/focusMaxTime')

export const setViewStartTime = createAction(
  'jobSetEditor/setViewStartTime',
  (viewStartTimeMs: number) => ({
    payload: {
      viewStartTimeMs
    }
  })
)
export const focusViewStartTime = createAction('jobSetEditor/focusViewStartTime')

export const setViewEndTime = createAction(
  'jobSetEditor/setViewEndTime',
  (viewEndTimeMs: number) => ({
    payload: {
      viewEndTimeMs
    }
  })
)
export const focusViewEndTime = createAction('jobSetEditor/focusViewEndTime')

export const setMinViewDuration = createAction(
  'jobSetEditor/setMinViewDuration',
  (minViewDurationMs: number) => ({
    payload: {
      minViewDurationMs
    }
  })
)
export const focusMinViewDuration = createAction('jobSetEditor/focusMinViewDuration')

export const setMaxViewDuration = createAction(
  'jobSetEditor/setMaxViewDuration',
  (maxViewDurationMs: number) => ({
    payload: {
      maxViewDurationMs
    }
  })
)
export const focusMaxViewDuration = createAction('jobSetEditor/focusMaxViewDuration')

export const middlewareCalculatedAutoTimeOptions = createAction(
  'jobSetEditor/middlewareCalculatedAutoTimeOptions',
  (timeOptions: TimeOptions) => ({
    payload: {
      timeOptions
    }
  })
)
//#endregion TimeOptions

// potential:
// move machines
// set job title
// move jobs

//#region Step
export const replaceLastStep = createAction<Step[]>('replaceLastStep')
export const undo = createAction('undo')
export const redo = createAction('redo')
export const jumpToStep = createAction<number>('jumpToStep')
export const savingStep = createAction(
  'savingStep',
  (stepIndex: number, saving: boolean) => ({
    payload: {
      stepIndex,
      saving
    }
  })
)
export const savedStep = createAction(
  'savedStep',
  (stepIndex: number) => ({
    payload: {
      stepIndex,
    }
  })
)

export const setMergeBehaviourMerge = createAction(
  'setMergeBehaviourMerge',
  (stepIndex: number) => ({
    payload: {
      stepIndex,
    }
  })
)
export const setMergeBehaviourDiscardLocal = createAction(
  'setMergeBehaviourDiscardLocal',
  (stepIndex: number) => ({
    payload: {
      stepIndex,
    }
  })
)
export const applyConflict = createAction(
  'applyConflict',
  (stepIndex: number, conflictIndex: number) => ({
    payload: {
      stepIndex,
      conflictIndex,
    }
  })
)
export const unApplyConflict = createAction(
  'unApplyConflict',
  (stepIndex: number, conflictIndex: number) => ({
    payload: {
      stepIndex,
      conflictIndex,
    }
  })
)
//#endregion Step