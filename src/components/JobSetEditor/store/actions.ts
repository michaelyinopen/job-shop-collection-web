import { createAction } from '@reduxjs/toolkit'
import type { TimeOptions } from './formDataReducer'

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

export const addMachine = createAction('jobSetEditor/addMachine')

export const setMachineTitle = createAction(
  'jobSetEditor/setMachineTitle',
  (machineId: number, value: string) => ({
    payload: {
      machineId,
      value
    }
  })
)
export const focusMachineTitle = createAction(
  'jobSetEditor/focusMachineTitle',
  (machineId: number) => ({
    payload: {
      machineId
    }
  })
)

export const setMachineDescription = createAction(
  'jobSetEditor/setMachineDescription',
  (machineId: number, value: string) => ({
    payload: {
      machineId,
      value
    }
  })
)

export const removeMachine = createAction(
  'jobSetEditor/removeMachine',
  (machineId: number) => ({
    payload: {
      machineId
    }
  })
)

//#region Job
export const createJob = createAction('jobSetEditor/createJob')

export const changeJobColor = createAction(
  'jobSetEditor/changeJobColor',
  (jobId: number) => ({
    payload: {
      jobId
    }
  })
)

export const deleteJob = createAction(
  'jobSetEditor/deletePdeleteJobrocedure',
  (jobId: number) => ({
    payload: {
      jobId
    }
  })
)
//#endregion Job

//#region Procedure
export const createProcedure = createAction(
  'jobSetEditor/createProcedure',
  (jobId: number) => ({
    payload: {
      jobId
    }
  })
)

export const setProcedureMachineId = createAction(
  'jobSetEditor/setProcedureMachineId',
  (procedureId: number, machineIdValue: number | null) => ({
    payload: {
      procedureId,
      machineIdValue
    }
  })
)
export const focusProcedureMachineId = createAction(
  'jobSetEditor/focusProcedureMachineId',
  (procedureId: number) => ({
    payload: {
      procedureId
    }
  })
)

export const setProcedureProcessingTime = createAction(
  'jobSetEditor/setProcedureProcessingTime',
  (procedureId: number, processingTimeMs: number) => ({
    payload: {
      procedureId,
      processingMs: processingTimeMs
    }
  })
)
export const focusProcedureProcessingTime = createAction(
  'jobSetEditor/focusProcedureProcessingTime',
  (procedureId: number) => ({
    payload: {
      procedureId
    }
  })
)

export const moveProcedure = createAction(
  'jobSetEditor/moveProcedure',
  // targetSequence is this procedure's sequence after move
  (procedureId: number, targetSequence: number) => ({
    payload: {
      procedureId,
      targetSequence
    }
  })
)

export const deleteProcedure = createAction(
  'jobSetEditor/deleteProcedure',
  (procedureId: number) => ({
    payload: {
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