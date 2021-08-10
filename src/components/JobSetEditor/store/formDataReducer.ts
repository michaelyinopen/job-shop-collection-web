import { createReducer, createSelector } from '@reduxjs/toolkit'
import type { EntityState } from '@reduxjs/toolkit'
import {
  createCustomReducer,
  backwardCompose,
  getNewJobColor
} from '../../../utility'
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
  changeJobColor,
} from './actions'
import type { JobSetEditorState } from './store'

export type JobSetEditorFormDataState = {
  title: string
  description: string
  machines: EntityState<MachineState>
  jobs: EntityState<JobState>
  jobColors: EntityState<JobColorState>
  procedures: EntityState<ProcedureState>
  isAutoTimeOptions: boolean
  autoTimeOptions: TimeOptionsState
  manualTimeOptions: TimeOptionsState
}

type MachineState = {
  id: number
  title: string
  description: string
}

type JobState = {
  id: number
}

type JobColorState = {
  jobId: number
  color: string
  textColor: string
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

const jobColorInitialState = (id: number): JobState => ({ id })
const jobColorReducer = (id: number) => createCustomReducer(
  jobColorInitialState(id),
  {
    [createJob.type]: (state, _action, { color, textColor }) => {
      state.color = color
      state.textColor = textColor
    },
    [changeJobColor.type]: (state, _action, { color, textColor }) => {
      state.color = color
      state.textColor = textColor
    }
  }
)

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
  jobColors: {
    ids: [],
    entities: {},
  },
  procedures: {
    ids: [],
    entities: {},
  },
  isAutoTimeOptions: true,
  autoTimeOptions: {
    maxTimeMs: 0,
    viewStartTimeMs: 0,
    viewEndTimeMs: 0,
    minViewDurationMs: 0,
    maxViewDurationMs: 0
  },
  manualTimeOptions: {
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

      const excludeColors = Object.values(state.jobColors.entities)
        .map(jc => jc!.color)
      const { color, textColor } = getNewJobColor(excludeColors)
      state.jobColors.ids.push(newJobId)
      state.jobColors.entities[newJobId] =
        jobColorReducer(newJobId)(undefined, action, { color, textColor })
    })
    .addCase(changeJobColor, (state, action) => {
      const { payload: { jobId } } = action
      const excludeColors = Object.values(state.jobColors.entities)
        .map(jc => jc!.color)
      const { color, textColor } = getNewJobColor(excludeColors, state.jobColors.entities[jobId]!.color)
      state.jobColors.entities[jobId] =
        jobColorReducer(jobId)(state.jobColors.entities[jobId], action, { color, textColor })
    })
    .addCase(deleteJob, (state, { payload: { jobId } }) => {
      const index = state.jobs.ids.indexOf(jobId)
      if (index !== -1) {
        state.jobs.ids.splice(index, 1)
        delete state.jobs.entities[jobId]
      }

      const jobColorIndex = state.jobColors.ids.indexOf(jobId)
      if (jobColorIndex !== -1) {
        state.jobColors.ids.splice(jobColorIndex, 1)
        delete state.jobColors.entities[jobId]
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
        state.manualTimeOptions.maxTimeMs = maxTimeMs
      }
    })
    .addCase(setViewStartTime, (state, { payload: { viewStartTimeMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.manualTimeOptions.viewStartTimeMs = viewStartTimeMs
      }
    })
    .addCase(setViewEndTime, (state, { payload: { viewEndTimeMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.manualTimeOptions.viewEndTimeMs = viewEndTimeMs
      }
    })
    .addCase(setMinViewDuration, (state, { payload: { minViewDurationMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.manualTimeOptions.minViewDurationMs = minViewDurationMs
      }
    })
    .addCase(setMaxViewDuration, (state, { payload: { maxViewDurationMs } }) => {
      if (!state.isAutoTimeOptions) {
        state.manualTimeOptions.maxViewDurationMs = maxViewDurationMs
      }
    })
    .addCase(middlewareCalculatedAutoTimeOptions, (state, { payload: { timeOptions } }) => {
      if (state.isAutoTimeOptions) {
        state.autoTimeOptions.maxTimeMs = timeOptions.maxTimeMs
        state.autoTimeOptions.viewStartTimeMs = timeOptions.viewStartTimeMs
        state.autoTimeOptions.viewEndTimeMs = timeOptions.viewEndTimeMs
        state.autoTimeOptions.minViewDurationMs = timeOptions.minViewDurationMs
        state.autoTimeOptions.maxViewDurationMs = timeOptions.maxViewDurationMs
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
  const machineIdsSelector = createSelector(
    backwardCompose(
      jobSetsEditorFormDataSelector,
      (state: JobSetEditorFormDataState) => state.machines.ids
    ),
    machineIds => [...machineIds].sort()
  )
  const createMachineTitleSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.machines.entities[id]?.title
  )
  const createMachineDescriptionSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.machines.entities[id]?.description
  )
  const jobIdsSelector = createSelector(
    backwardCompose(
      jobSetsEditorFormDataSelector,
      (state: JobSetEditorFormDataState) => state.jobs.ids
    ),
    jobIds => [...jobIds].sort()
  )
  const createJobColorSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.jobColors.entities[id]?.color,
  )
  const createJobTextColorSelector = (id: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.jobColors.entities[id]?.textColor,
  )
  const proceduresSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures
  )
  const createProcedureIdsOfJobSelector = (jobId: number) => createSelector(
    proceduresSelector,
    (procedures: EntityState<ProcedureState>) =>
      Object.values(procedures.entities)
        .filter(p => p && p.jobId === jobId)
        .sort((a, b) => a!.sequence - b!.sequence)
        .map(p => p!.id)
  )
  const createProcedureMachineIdSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.machineId
  )
  const createProcedureProcessingTimeMsSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.processingTimeMs
  )
  const createProcedureSequenceSelector = (procedureId: number) => backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.procedures.entities[procedureId]?.sequence
  )
  const createProceduresAffectedByMachineSelector = (machineId: number) => createSelector(
    proceduresSelector,
    (procedures: EntityState<ProcedureState>) =>
      Object.values(procedures.entities)
        .filter(p => p && p.machineId === machineId)
        .sort((a, b) => (a!.jobId - b!.jobId) || (a!.sequence - b!.sequence))
  )
  const isAutoTimeOptionsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.isAutoTimeOptions
  )
  const timeOptionsSelector = backwardCompose(
    jobSetsEditorFormDataSelector,
    (state: JobSetEditorFormDataState) => state.isAutoTimeOptions
      ? state.autoTimeOptions
      : state.manualTimeOptions
  )
  const maxTimeMsSelector = backwardCompose(
    timeOptionsSelector,
    (timeOptions: TimeOptionsState) => timeOptions.maxTimeMs
  )
  const viewStartTimeMsSelector = backwardCompose(
    timeOptionsSelector,
    (timeOptions: TimeOptionsState) => timeOptions.viewStartTimeMs
  )
  const viewEndTimeMsSelector = backwardCompose(
    timeOptionsSelector,
    (timeOptions: TimeOptionsState) => timeOptions.viewEndTimeMs
  )
  const maxViewDurationMsSelector = backwardCompose(
    timeOptionsSelector,
    (timeOptions: TimeOptionsState) => timeOptions.maxViewDurationMs
  )
  const minViewDurationMsSelector = backwardCompose(
    timeOptionsSelector,
    (timeOptions: TimeOptionsState) => timeOptions.minViewDurationMs
  )
  return {
    titleSelector,
    descriptionSelector,
    machineIdsSelector,
    createMachineTitleSelector,
    createMachineDescriptionSelector,
    jobIdsSelector,
    createJobColorSelector,
    createJobTextColorSelector,
    createProcedureIdsOfJobSelector,
    createProcedureMachineIdSelector,
    createProcedureProcessingTimeMsSelector,
    createProcedureSequenceSelector,
    createProceduresAffectedByMachineSelector,
    isAutoTimeOptionsSelector,
    maxTimeMsSelector,
    viewStartTimeMsSelector,
    viewEndTimeMsSelector,
    maxViewDurationMsSelector,
    minViewDurationMsSelector,
  }
}