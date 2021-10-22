import {
  createReducer,
} from '@reduxjs/toolkit'
import { getNewJobColor } from '../../../utility'
import * as actions from './actions'
import { appStoreJobSet_To_FormData, mergeUninitializedJobSet } from './formDataConversion'
import { calculateRefreshedStep, redoStep, undoStep } from './editHistory'
import type { Step } from './editHistory'
import type { ValidationError } from './validation'

export type JobSetEditorState = {
  id?: number
  isLocked: boolean
  isEdit: boolean
  hasDetail: boolean
  loadStatus: 'not loaded' | 'loaded' | 'failed'
  initialized: boolean
  formData: FormDataState
  steps: Step[],
  currentStepIndex: number,
  lastVersion?: {
    versionToken: string,
    formData: FormDataState
  },
  isHistoryPanelOpen: boolean,
  touched: TouchedState,
  validationError: ValidationErrorState,
}

//#region FormDataState
export type FormDataState = {
  title: string
  description: string
  machines: {
    ids: string[],
    entities: {
      [id: string]: MachineState
    }
  }
  jobs: {
    ids: string[],
    entities: {
      [id: string]: JobState
    }
  }
  jobColors: {
    ids: string[],
    entities: {
      [id: string]: JobColorState
    }
  }
  isAutoTimeOptions: boolean
  autoTimeOptions?: TimeOptionsState
  manualTimeOptions: TimeOptionsState
}

export type MachineState = {
  id: string
  title: string
  description: string
}

export type JobState = {
  id: string
  title: string
  procedures: {
    ids: string[],
    entities: {
      [id: string]: ProcedureState
    }
  }
}

export type ProcedureState = {
  id: string
  jobId: string
  machineId: string | null
  processingTimeMs: number
}

export type JobColorState = {
  jobId: string
  color: string
  textColor: string
}

export type TimeOptionsState = {
  maxTimeMs: number
  viewStartTimeMs: number
  viewEndTimeMs: number
  minViewDurationMs: number
  maxViewDurationMs: number
}
//#endregion FormDataState

export type TimeOptions = TimeOptionsState

export type TouchedState = {
  status: 'normal' | 'all'
  entities: {
    [path: string]: boolean
  }
}

export type ValidationErrorState = {
  ids: string[],
  entities: {
    [path: string]: ValidationError
  }
}

const formDataInitialState: FormDataState = {
  title: '',
  description: '',
  machines: {
    ids: [],
    entities: {}
  },
  jobs: {
    ids: [],
    entities: {}
  },
  jobColors: {
    ids: [],
    entities: {}
  },
  isAutoTimeOptions: true,
  autoTimeOptions: undefined,
  manualTimeOptions: {
    maxTimeMs: 0,
    viewStartTimeMs: 0,
    viewEndTimeMs: 0,
    minViewDurationMs: 0,
    maxViewDurationMs: 0,
  }
}

const jobSetEditorInitialState: JobSetEditorState = {
  id: undefined,
  isLocked: false,
  isEdit: false,
  hasDetail: false,
  loadStatus: 'not loaded',
  initialized: false,
  formData: formDataInitialState,
  steps: [{ id: 'initial', name: 'initial', operations: [] }],
  currentStepIndex: 0,
  lastVersion: undefined,
  isHistoryPanelOpen: false,
  touched: {
    status: 'normal',
    entities: {},
  },
  validationError: {
    ids: [],
    entities: {},
  },
}

export const jobSetEditorReducer = createReducer(jobSetEditorInitialState, (builder) => {
  builder
    .addCase(actions.resetJobSetEditor, (state) => {
      return jobSetEditorInitialState
    })
    .addCase(actions.setJobSetEditorId, (state, { payload: id }) => {
      state.id = id
    })
    .addCase(actions.setJobSetEditorIsEdit, (state, { payload: isEdit }) => {
      if (isEdit && !state.isEdit) {
        state.isEdit = true
      }
      else if (!isEdit && state.isEdit) {
        state.isEdit = false
        state.steps = jobSetEditorInitialState.steps
        state.currentStepIndex = jobSetEditorInitialState.currentStepIndex
        state.formData = state.lastVersion?.formData ?? jobSetEditorInitialState.formData
        state.touched = jobSetEditorInitialState.touched
      }
    })
    .addCase(actions.loadedJobSet, (state) => {
      state.loadStatus = 'loaded'
    })
    .addCase(actions.failedToLoadJobSet, (state) => {
      state.loadStatus = 'failed'
    })
    .addCase(actions.openHistoryPanel, (state) => {
      state.isHistoryPanelOpen = true
    })
    .addCase(actions.closeHistoryPanel, (state) => {
      state.isHistoryPanelOpen = false
    })
    .addCase(actions.setJobSetFromAppStore, (state, action) => {
      const { payload: { jobSet, loaded } } = action
      if (!state.initialized) {
        const newState = mergeUninitializedJobSet(
          jobSet,
          jobSetEditorInitialState,
          state
        ) ?? state
        if (loaded) {
          // if loaded, it is garunteed that (activity && activity.hasDetail) === true
          newState.initialized = true
          newState.lastVersion = {
            versionToken: jobSet!.versionToken,
            formData: newState.formData
          }
        }
        return newState
      }
      //state.initialized === true
      if (!jobSet
        || !jobSet.hasDetail) {
        return
      }
      const remoteFormData = appStoreJobSet_To_FormData(jobSet)
      const refreshedStep = calculateRefreshedStep(
        state.lastVersion!.formData,
        state.formData,
        remoteFormData,
        jobSet.versionToken
      )
      if (refreshedStep) {
        state.formData = redoStep(refreshedStep, state.formData)
        state.steps.splice(state.currentStepIndex + 1)
        state.steps.push(refreshedStep)
        state.currentStepIndex = state.steps.length - 1
        for (const step of state.steps.filter(s => s.saveStatus)) {
          step.saveStatus = undefined
        }
      }
      state.lastVersion = {
        versionToken: jobSet.versionToken,
        formData: remoteFormData
      }
    })
    //#region edit form actions
    .addCase(actions.setTitle, (state, { payload }) => {
      state.formData.title = payload
    })
    .addCase(actions.setDescription, (state, { payload }) => {
      state.formData.description = payload
    })
    .addCase(actions.addMachine, (state, { payload: { id } }) => {
      state.formData.machines.ids.push(id)
      const machineNumber = (Math.max(
        0,
        ...Object.values(state.formData.machines.entities)
          .map(m => parseInt(m.title.substring(1)))
          .filter(n => Number.isInteger(n))
      ) + 1).toString()
      state.formData.machines.entities[id] = {
        id: id,
        title: `M${machineNumber}`,
        description: `Machine ${machineNumber}`,
      }
    })
    .addCase(actions.setMachineTitle, (state, { payload: { machineId, value } }) => {
      state.formData.machines.entities[machineId].title = value
    })
    .addCase(actions.setMachineDescription, (state, { payload: { machineId, value } }) => {
      state.formData.machines.entities[machineId].description = value
    })
    // move machines
    .addCase(actions.removeMachine, (state, { payload: { machineId } }) => {
      const index = state.formData.machines.ids.findIndex(mId => mId === machineId)
      if (index !== -1) {
        state.formData.machines.ids.splice(index, 1)
      }
      delete state.formData.machines.entities[machineId]

      const proceduresOfMachine = Object.values(state.formData.jobs.entities)
        .flatMap(j => Object.values(j.procedures.entities))
        .filter(p => p!.machineId === machineId)
      for (const procedure of proceduresOfMachine) {
        procedure.machineId = null
      }
    })
    .addCase(actions.createJob, (state, { payload: { id } }) => {
      state.formData.jobs.ids.push(id)
      const jobTitle = (Math.max(
        0,
        ...Object.values(state.formData.jobs.entities)
          .map(j => parseInt(j.title))) + 1).toString()
      state.formData.jobs.entities[id] = {
        id,
        title: jobTitle,
        procedures: {
          ids: [],
          entities: {}
        }
      }
      // jobColor
      const excludeColors = Object.values(state.formData.jobColors.entities)
        .map(jc => jc!.color)
      const lastColor = excludeColors[excludeColors.length - 1]
      const { color, textColor } = getNewJobColor(excludeColors, lastColor)
      state.formData.jobColors.ids.push(id)
      state.formData.jobColors.entities[id] = {
        jobId: id,
        color,
        textColor,
      }
    })
    // set job title
    // move jobs
    .addCase(actions.changeJobColor, (state, { payload: { jobId } }) => {
      const excludeColors = Object.values(state.formData.jobColors.entities)
        .map(jc => jc!.color)
      const lastColor = state.formData.jobColors.entities[jobId]!.color
      const { color, textColor } = getNewJobColor(excludeColors, lastColor)
      state.formData.jobColors.entities[jobId] = {
        jobId,
        color,
        textColor,
      }
    })
    .addCase(actions.deleteJob, (state, { payload: { jobId } }) => {
      const jobIndex = state.formData.jobs.ids.findIndex(jId => jId === jobId)
      if (jobIndex !== -1) {
        state.formData.jobs.ids.splice(jobIndex, 1)
      }
      delete state.formData.jobs.entities[jobId]
      // jobColor
      const jobColorIndex = state.formData.jobColors.ids.findIndex(jId => jId === jobId)
      if (jobColorIndex !== -1) {
        state.formData.jobColors.ids.splice(jobColorIndex, 1)
      }
      delete state.formData.jobColors.entities[jobId]
    })
    .addCase(actions.createProcedure, (state, { payload: { jobId, id } }) => {
      state.formData.jobs.entities[jobId].procedures.ids.push(id)
      state.formData.jobs.entities[jobId].procedures.entities[id] = {
        id,
        jobId,
        machineId: null,
        processingTimeMs: 0,
      }
    })
    .addCase(actions.setProcedureMachineId, (state, action) => {
      const { payload: { jobId, procedureId, machineIdValue } } = action
      state.formData.jobs.entities[jobId].procedures.entities[procedureId].machineId
        = machineIdValue
    })
    .addCase(actions.setProcedureProcessingTime, (state, action) => {
      const { payload: { jobId, procedureId, processingMs } } = action
      state.formData.jobs.entities[jobId].procedures.entities[procedureId].processingTimeMs
        = processingMs
    })
    .addCase(actions.moveProcedure, (state, action) => {
      const { payload: { jobId, procedureId, targetIndex } } = action
      const originalIndex = state.formData.jobs.entities[jobId].procedures.ids.indexOf(procedureId)
      if (originalIndex > targetIndex) {
        state.formData.jobs.entities[jobId].procedures.ids = [
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(0, targetIndex),
          procedureId,
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(targetIndex, originalIndex),
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(originalIndex + 1)
        ]
      } else if (originalIndex < targetIndex) {
        state.formData.jobs.entities[jobId].procedures.ids = [
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(0, originalIndex),
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(originalIndex + 1, targetIndex + 1),
          procedureId,
          ...state.formData.jobs.entities[jobId].procedures.ids.slice(targetIndex + 1),
        ]
      }
    })
    .addCase(actions.deleteProcedure, (state, { payload: { jobId, procedureId } }) => {
      const index = state.formData.jobs.entities[jobId].procedures.ids.findIndex(pId => pId === procedureId)
      if (index !== -1) {
        state.formData.jobs.entities[jobId].procedures.ids.splice(index, 1)
      }
      delete state.formData.jobs.entities[jobId].procedures.entities[procedureId]
    })
    .addCase(actions.setIsAutoTimeOptions, (state, { payload }) => {
      state.formData.isAutoTimeOptions = payload
      if (state.formData.autoTimeOptions
        && state.formData.manualTimeOptions.maxTimeMs === 0
        && state.formData.manualTimeOptions.viewStartTimeMs === 0
        && state.formData.manualTimeOptions.viewEndTimeMs === 0
        && state.formData.manualTimeOptions.minViewDurationMs === 0
        && state.formData.manualTimeOptions.maxViewDurationMs === 0
      ) {
        state.formData.manualTimeOptions = {
          ...state.formData.autoTimeOptions
        }
      }
    })
    .addCase(actions.setMaxTime, (state, { payload: { maxTimeMs } }) => {
      state.formData.manualTimeOptions.maxTimeMs = maxTimeMs
    })
    .addCase(actions.setViewStartTime, (state, { payload: { viewStartTimeMs } }) => {
      state.formData.manualTimeOptions.viewStartTimeMs = viewStartTimeMs
    })
    .addCase(actions.setViewEndTime, (state, { payload: { viewEndTimeMs } }) => {
      state.formData.manualTimeOptions.viewEndTimeMs = viewEndTimeMs
    })
    .addCase(actions.setMinViewDuration, (state, { payload: { minViewDurationMs } }) => {
      state.formData.manualTimeOptions.minViewDurationMs = minViewDurationMs
    })
    .addCase(actions.setMaxViewDuration, (state, { payload: { maxViewDurationMs } }) => {
      state.formData.manualTimeOptions.maxViewDurationMs = maxViewDurationMs
    })
    .addCase(actions.middlewareCalculatedAutoTimeOptions, (state, { payload: { timeOptions } }) => {
      state.formData.autoTimeOptions = {
        ...timeOptions
      }
    })
    //#endregion edit form actions
    //#region Step
    .addCase(actions.replaceLastStep, (state, { payload }) => {
      state.steps.splice(state.currentStepIndex)
      state.steps.push(...payload)
      state.currentStepIndex = state.steps.length - 1
    })
    .addCase(actions.undo, (state) => {
      if (state.currentStepIndex > 0) {
        state.formData = undoStep(state.steps[state.currentStepIndex], state.formData)
        state.currentStepIndex = state.currentStepIndex - 1
      }
    })
    .addCase(actions.redo, (state) => {
      if (state.currentStepIndex < state.steps.length - 1) {
        state.formData = redoStep(state.steps[state.currentStepIndex + 1], state.formData)
        state.currentStepIndex = state.currentStepIndex + 1
      }
    })
    .addCase(actions.jumpToStep, (state, { payload: { stepId } }) => {
      const targetStepIndex = state.steps.findIndex(s => s.id === stepId)
      if (targetStepIndex >= 0 && targetStepIndex <= state.steps.length - 1) {
        let formData = state.formData
        if (targetStepIndex < state.currentStepIndex) {
          const stepsToUndo = state.steps
            .slice(targetStepIndex + 1, state.currentStepIndex + 1)
            .reverse()
          for (const stepToUndo of stepsToUndo) {
            formData = undoStep(stepToUndo, formData)
          }
        }
        else if (targetStepIndex > state.currentStepIndex) {
          const stepsToRedo = state.steps
            .slice(state.currentStepIndex + 1, targetStepIndex + 1)
          for (const stepToRedo of stepsToRedo) {
            formData = redoStep(stepToRedo, formData)
          }
        }
        state.formData = formData
        state.currentStepIndex = targetStepIndex
      }
    })
    .addCase(actions.savingStep, (state, { payload: { stepIndex, saving } }) => {
      if (stepIndex > state.steps.length - 1) {
        return
      }
      for (const step of state.steps.filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
      state.steps[stepIndex].saveStatus = saving ? 'saving' : undefined
    })
    .addCase(actions.savedStep, (state, { payload: { stepIndex } }) => {
      if (stepIndex > state.steps.length - 1) {
        return
      }
      for (const step of state.steps.filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
      state.steps[stepIndex].saveStatus = 'saved'
    })
    .addCase(actions.setMergeBehaviourMerge, (state, { payload: { stepId } }) => {
      const stepIndex = state.steps.findIndex(s => s.id === stepId)
      if (stepIndex === -1
        || state.currentStepIndex !== stepIndex
        || state.steps[stepIndex].mergeBehaviour === 'merge'
      ) {
        return
      }
      state.steps.splice(state.currentStepIndex + 1)

      // undo step, then change step to merge, then redo the updated step
      const step = state.steps[stepIndex]

      let formData = state.formData
      formData = undoStep(step, formData)
      step.mergeBehaviour = 'merge'
      for (const operation of step.operations) {
        operation.applied =
          operation.type === 'merge' ? true
            : operation.type === 'conflict' ? operation.conflictApplied!
              : operation.type === 'reverse local' ? false
                : false
      }
      formData = redoStep(step, formData)
      state.formData = formData

      for (const step of state.steps.slice(stepIndex).filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
    })
    .addCase(actions.setMergeBehaviourDiscardLocal, (state, { payload: { stepId } }) => {
      const stepIndex = state.steps.findIndex(s => s.id === stepId)
      if (stepIndex === -1
        || state.currentStepIndex !== stepIndex
        || state.steps[stepIndex].mergeBehaviour === 'discard local changes'
      ) {
        return
      }
      state.steps.splice(state.currentStepIndex + 1)

      // undo step, then change step to merge, then redo the updated step
      const step = state.steps[stepIndex]

      let formData = state.formData
      formData = undoStep(step, formData)
      step.mergeBehaviour = 'discard local changes'
      for (const operation of step.operations) {
        operation.applied = true
      }
      formData = redoStep(step, formData)
      state.formData = formData

      for (const step of state.steps.slice(stepIndex).filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
    })
    .addCase(actions.applyConflict, (state, { payload: { stepId, conflictIndex } }) => {
      const stepIndex = state.steps.findIndex(s => s.id === stepId)
      if (stepIndex === -1 || state.steps[stepIndex].mergeBehaviour !== 'merge') {
        return
      }
      state.steps.splice(state.currentStepIndex + 1)

      // undo all subsequent steps and the refreshed step
      // then update step's conflict's conflictApplied and apply
      // then redo the refreshed step and subsequent steps
      const step = state.steps[stepIndex]
      const conflictToApply = step.operations.filter(op => op.type === 'conflict')[conflictIndex]

      let formData = state.formData
      const stepsToUndo = state.steps
        .slice(stepIndex, state.currentStepIndex + 1)
        .reverse()
      for (const stepToUndo of stepsToUndo) {
        formData = undoStep(stepToUndo, formData)
      }

      conflictToApply.conflictApplied = true
      conflictToApply.applied = true

      const stepsToRedo = stepsToUndo.reverse()
      for (const stepToRedo of stepsToRedo) {
        formData = redoStep(stepToRedo, formData)
      }
      state.formData = formData

      for (const step of state.steps.slice(stepIndex).filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
    })
    .addCase(actions.unApplyConflict, (state, { payload: { stepId, conflictIndex } }) => {
      const stepIndex = state.steps.findIndex(s => s.id === stepId)
      if (stepIndex === -1 || state.steps[stepIndex].mergeBehaviour !== 'merge') {
        return
      }
      state.steps.splice(state.currentStepIndex + 1)

      // undo all subsequent steps and the refreshed step
      // then update step's conflict's conflictApplied and apply
      // then redo the refreshed step and subsequent steps
      const step = state.steps[stepIndex]
      const conflictToApply = step.operations.filter(op => op.type === 'conflict')[conflictIndex]

      let formData = state.formData
      const stepsToUndo = state.steps
        .slice(stepIndex, state.currentStepIndex + 1)
        .reverse()
      for (const stepToUndo of stepsToUndo) {
        formData = undoStep(stepToUndo, formData)
      }

      conflictToApply.conflictApplied = false
      conflictToApply.applied = false

      const stepsToRedo = stepsToUndo.reverse()
      for (const stepToRedo of stepsToRedo) {
        formData = redoStep(stepToRedo, formData)
      }
      state.formData = formData

      for (const step of state.steps.slice(stepIndex).filter(s => s.saveStatus)) {
        step.saveStatus = undefined
      }
    })
    //#endregion Step
    .addCase(actions.middlewareSetValidationErrors, (state, { payload: { validationErrors } }) => {
      const removedErrorPaths = state.validationError.ids
        .filter(path => !validationErrors.some(e => e.path === path))
      for (const removedErrorPath of removedErrorPaths) {
        delete state.validationError.entities[removedErrorPath]
      }
      if (removedErrorPaths.length > 0
        || state.validationError.ids.length !== validationErrors.length) {
        state.validationError.ids = validationErrors.map(e => e.path)
      }
      for (const validationError of validationErrors) {
        state.validationError.entities[validationError.path] = validationError
      }
    })
    //#region touched
    .addCase(actions.focusTitle, (state) => {
      state.touched.entities['/title'] = true
    })
    .addCase(actions.focusMachineTitle, (state, { payload: { machineId } }) => {
      state.touched.entities[`/machines/entities/${machineId}/title`] = true
    })
    .addCase(actions.focusProcedureMachineId, (state, { payload: { jobId, procedureId } }) => {
      state.touched.entities[`/jobs/entities/${jobId}/procedures/entities/${procedureId}/machineId`] = true
    })
    .addCase(actions.focusProcedureProcessingTime, (state, { payload: { jobId, procedureId } }) => {
      state.touched.entities[`/jobs/entities/${jobId}/procedures/entities/${procedureId}/processingTimeMs`] = true
    })
    .addCase(actions.focusMaxTime, (state) => {
      state.touched.entities[`/manualTimeOptions/maxTimeMs`] = true
    })
    .addCase(actions.focusViewEndTime, (state) => {
      state.touched.entities[`/manualTimeOptions/viewEndTimeMs`] = true
    })
    .addCase(actions.focusMinViewDuration, (state) => {
      state.touched.entities[`/manualTimeOptions/minViewDurationMs`] = true
    })
    .addCase(actions.focusMaxViewDuration, (state) => {
      state.touched.entities[`/manualTimeOptions/maxViewDurationMs`] = true
    })
  //#endregion touched
})