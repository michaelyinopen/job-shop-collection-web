import { createReducer, createSelector } from '@reduxjs/toolkit'
import type { EntityState } from '@reduxjs/toolkit'
import { createCustomReducer, backwardCompose } from '../../../utility'
import {
  resetJobSetEditor,
  setJobSetFromAppStore,

  setTitle,
  setDescription,
  addMachine,
  setMachineTitle,
  setMachineDescription,
  removeMachine,
  createJob,
  deleteJob,
  createProcedure,
  setProcedureMachineId,
  setProcedureProcessingTime,
  moveProcedure,
  deleteProcedure,
  setIsAutoTimeOptions,
  setMaxTime,
  setViewStartTime,
  setViewEndTime,
  setMinViewDuration,
  setMaxViewDuration,
  middlewareCalculatedAutoTimeOptions,
} from './actions'
import type { JobSetEditorState } from './store'

export type JobSetEditorFormDataState = {
  title: string
  description: string
  machines: EntityState<MachineState>
  jobs: EntityState<JobState>
  procedures: EntityState<ProcedureState>
  isAutoTimeOptions: boolean
  timeOptions: TimeOptionsState
}

type MachineState = {
  id: number
  title: string
  description: string
}

type JobState = {
  id: number
}

type ProcedureState = {
  id: number
  jobId: number
  machineId: number | null
  processingTimeMs: number
  sequence: number
}

type TimeOptionsState = {
  maxTimeMs: number
  viewStartTimeMs: number
  viewEndTimeMs: number
  minViewDurationMs: number
  maxViewDurationMs: number
}

export type TimeOptions = TimeOptionsState

const machineInitialState = (id: number): MachineState => ({
  id: id,
  title: `M${id}`,
  description: `Machine ${id}`,
})

const machineReducer = (id: number) => createCustomReducer(
  machineInitialState(id),
  {
    [addMachine.type]: state => state, // returns initial state
    [setMachineTitle.type]: (state, { payload: { value } }) => {
      state.title = value
    },
    [setMachineDescription.type]: (state, { payload: { value } }) => {
      state.description = value
    }
  }
)

const jobInitialState = (id: number): JobState => ({ id })

const procedureInitialState = (id: number): Partial<ProcedureState> => ({
  id: id,
  jobId: undefined,
  machineId: null,
  processingTimeMs: 0,
  sequence: undefined,
})

const procedureReducer = (id: number) => createCustomReducer(
  procedureInitialState(id),
  {
    [createProcedure.type]: (state, _action, { jobId, sequence }) => {
      state.jobId = jobId
      state.sequence = sequence
    },
    [setProcedureMachineId.type]: (state, { payload: { machineIdValue } }) => {
      state.machineId = machineIdValue
    },
    [setProcedureProcessingTime.type]: (state, { payload: { processingMs } }) => {
      state.processingTimeMs = processingMs
    },
    [moveProcedure.type]: (state, _action, { sequence }) => {
      state.sequence = sequence
    }
  }
)

const formDataInitialState: JobSetEditorFormDataState = {
  title: '',
  description: '',
  machines: {
    ids: [],
    entities: {},
  },
  jobs: {
    ids: [],
    entities: {},
  },
  procedures: {
    ids: [],
    entities: {},
  },
  isAutoTimeOptions: true,
  timeOptions: {
    maxTimeMs: 0,
    viewStartTimeMs: 0,
    viewEndTimeMs: 0,
    minViewDurationMs: 0,
    maxViewDurationMs: 0
  }
}

export const formDataReducer = createReducer(formDataInitialState, (builder) => {
  builder
    .addCase(resetJobSetEditor, (state) => {
      // todo
    })
    .addCase(setJobSetFromAppStore, (state) => {
      // todo
    })

    .addCase(setTitle, (state, { payload }) => {
      state.title = payload
    })
    .addCase(setDescription, (state, { payload }) => {
      state.description = payload
    })

    .addCase(addMachine, (state, action) => {
      const newMachineId = state.machines.ids.length
        ? Math.max(...state.machines.ids.map(id => +id)) + 1
        : 1
      const newMachine = machineReducer(newMachineId)(undefined, action)
      state.machines.ids.push(newMachineId)
      state.machines.entities[newMachineId] = newMachine
    })
    .addCase(setMachineTitle, (state, action) => {
      const { payload: { machineId } } = action
      state.machines.entities[machineId] =
        machineReducer(machineId)(state.machines.entities[machineId], action)
    })
    .addCase(setMachineDescription, (state, action) => {
      const { payload: { machineId } } = action
      state.machines.entities[machineId] =
        machineReducer(machineId)(state.machines.entities[machineId], action)
    })
    .addCase(removeMachine, (state, { payload: { machineId } }) => {
      const index = state.machines.ids.indexOf(machineId)
      if (index !== -1) {
        state.machines.ids.splice(index, 1)
        delete state.machines.entities[machineId]
      }
    })

    .addCase(createJob, (state, action) => {
      const newJobId = state.jobs.ids.length
        ? Math.max(...state.jobs.ids.map(id => +id)) + 1
        : 1
      const newJob = jobInitialState(newJobId)
      state.jobs.ids.push(newJobId)
      state.jobs.entities[newJobId] = newJob
    })
    .addCase(deleteJob, (state, { payload: { jobId } }) => {
      const index = state.jobs.ids.indexOf(jobId)
      if (index !== -1) {
        state.machines.ids.splice(index, 1)
        delete state.machines.entities[jobId]
      }
    })

    .addCase(createProcedure, (state, action) => {
      const { payload: { jobId } } = action
      const newProcedureId = state.procedures.ids.length
        ? Math.max(...state.procedures.ids.map(id => +id)) + 1
        : 1
      const existingSequences = Object.values(state.procedures.entities).map(p => p!.sequence)
      const sequence = existingSequences.length
        ? Math.max(...existingSequences) + 1
        : 1
      const newProcedure = procedureReducer(newProcedureId)(undefined, action, { sequence, jobId })
      state.procedures.ids.push(newProcedureId)
      state.procedures.entities[newProcedureId] = newProcedure
    })
    .addCase(setProcedureMachineId, (state, action) => {
      const { payload: { procedureId } } = action
      state.procedures.entities[procedureId] =
        machineReducer(procedureId)(state.machines.entities[procedureId], action)
    })
    .addCase(setProcedureProcessingTime, (state, action) => {
      const { payload: { procedureId } } = action
      state.procedures.entities[procedureId] =
        machineReducer(procedureId)(state.machines.entities[procedureId], action)
    })
    .addCase(moveProcedure, (state, action) => {
      // targetSequence is this procedure's sequence after move
      const { payload: { procedureId, targetSequence } } = action
      const targetProcedure = state.procedures.entities[procedureId]
      if (!targetProcedure) {
        return
      }
      const { jobId, sequence: sourceSequence } = targetProcedure
      if (sourceSequence === targetSequence) {
        return
      }
      const proceduresOfTheSameJob = Object.values(state.procedures.entities)
        .filter(p => p!.jobId === jobId)
        .map(p => p!)
      for (const procedure of proceduresOfTheSameJob) {
        const pId = procedure.id
        if (pId === targetProcedure.id) {
          // update target procedure
          state.procedures.entities[pId] =
            procedureReducer(pId)(state.procedures.entities[pId], action, { sequence: targetSequence })
        } else {
          // update sequence of other procedures in the same job
          let updatedSequence = procedure.sequence
          if (updatedSequence > sourceSequence) {
            updatedSequence -= 1
          }
          if (updatedSequence >= targetSequence) {
            updatedSequence += 1
          }
          if (updatedSequence !== procedure.sequence) {
            state.procedures.entities[pId] =
              procedureReducer(pId)(state.procedures.entities[pId], action, { sequence: updatedSequence })
          }
        }
      }
    })
    .addCase(deleteProcedure, (state, { payload: { procedureId } }) => {
      const index = state.procedures.ids.indexOf(procedureId)
      if (index !== -1) {
        state.procedures.ids.splice(index, 1)
        delete state.procedures.entities[procedureId]
      }
    })

    .addCase(setIsAutoTimeOptions, (state, { payload }) => {
      state.isAutoTimeOptions = payload
    })
    .addCase(setMaxTime, (state, { payload: { maxTimeMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.timeOptions.maxTimeMs = maxTimeMs
      }
    })
    .addCase(setViewStartTime, (state, { payload: { viewStartTimeMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.timeOptions.viewStartTimeMs = viewStartTimeMs
      }
    })
    .addCase(setViewEndTime, (state, { payload: { viewEndTimeMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.timeOptions.viewEndTimeMs = viewEndTimeMs
      }
    })
    .addCase(setMinViewDuration, (state, { payload: { minViewDurationMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.timeOptions.minViewDurationMs = minViewDurationMs
      }
    })
    .addCase(setMaxViewDuration, (state, { payload: { maxViewDurationMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.timeOptions.maxViewDurationMs = maxViewDurationMs
      }
    })
    .addCase(middlewareCalculatedAutoTimeOptions, (state, { payload: { timeOptions } }) => {
      if (state.isAutoTimeOptions) {
        state.timeOptions.maxTimeMs = timeOptions.maxTimeMs
        state.timeOptions.viewStartTimeMs = timeOptions.viewStartTimeMs
        state.timeOptions.viewEndTimeMs = timeOptions.viewEndTimeMs
        state.timeOptions.minViewDurationMs = timeOptions.minViewDurationMs
        state.timeOptions.maxViewDurationMs = timeOptions.maxViewDurationMs
      }
    })
})

type JobSetsEditorFormDataSelector = (jobSetEditorState: JobSetEditorState) => JobSetEditorFormDataState

export const getFormDataSelectors = (jobSetsEditorFormDataSelector: JobSetsEditorFormDataSelector) => {
  const titleSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.title
  )
  const descriptionSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.description
  )
  const machineIdsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.machines.ids
  )
  const machineTitleSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.machines.entities[id]?.title
  )
  const machineDescriptionSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.machines.entities[id]?.description
  )
  const jobIdsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.jobs.ids
  )
  const proceduresSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures
  )
  const createProcedureIdsOfJobSelector = (jobId: number) => createSelector(
    proceduresSelector,
    (procedures: EntityState<ProcedureState>) =>
      Object.values(procedures)
        .filter(p => p.jobId === jobId)
        .map(p => p.id) as number[]
  )
  const procedureMachineIdSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.machineId
  )
  const procedureProcessingTimeMsSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.processingTimeMs
  )
  const procedureSequenceSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.sequence
  )
  const isAutoTimeOptionsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.isAutoTimeOptions
  )
  const maxTimeMsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.timeOptions.maxTimeMs
  )
  const viewStartTimeMsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.timeOptions.viewStartTimeMs
  )
  const viewEndTimeMsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.timeOptions.viewEndTimeMs
  )
  const maxViewDurationMsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.timeOptions.maxViewDurationMs
  )
  const minViewDurationMsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.timeOptions.minViewDurationMs
  )
  return {
    titleSelector,
    descriptionSelector,
    machineIdsSelector,
    machineTitleSelector,
    machineDescriptionSelector,
    jobIdsSelector,
    createProcedureIdsOfJobSelector,
    procedureMachineIdSelector,
    procedureProcessingTimeMsSelector,
    procedureSequenceSelector,
    isAutoTimeOptionsSelector,
    maxTimeMsSelector,
    viewStartTimeMsSelector,
    viewEndTimeMsSelector,
    maxViewDurationMsSelector,
    minViewDurationMsSelector,
  }
}