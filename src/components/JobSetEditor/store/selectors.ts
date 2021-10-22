import memoize from 'lodash/memoize'
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect'
import {
  arraysEqual,
  shallowEqualObjects,
} from '../../../utility'
import { conflictHasRelatedChanges } from './editHistory'
import type { Operation, Step } from './editHistory'
import {
  formData_To_UpdateJobSetRequest,
  formData_To_CreateJobSetRequest,
} from './formDataConversion'
import type { JobSetEditorState } from './jobSetEditorReducer'

export const jobSetsEditorIdSelector = (state: JobSetEditorState) => state.id
export const jobSetsEditorIsLockedSelector = (state: JobSetEditorState) => state.isLocked
export const jobSetsEditorIsEditSelector = (state: JobSetEditorState) => state.isEdit
export const jobSetsEditorLoadStatusSelector = (state: JobSetEditorState) => state.loadStatus
export const jobSetsEditorInitializedSelector = (state: JobSetEditorState) => state.initialized
export const currentStepIndexSelector = (state: JobSetEditorState) => state.currentStepIndex

//#region formData
export const titleSelector = (state: JobSetEditorState) => state.formData.title
export const descriptionSelector = (state: JobSetEditorState) => state.formData.description
export const machineIdsSelector = (state: JobSetEditorState) => state.formData.machines.ids
export const machinesSelector = createSelector(
  (state: JobSetEditorState) => state.formData.machines,
  (machines) => {
    return machines.ids.map(id => machines.entities[id])
  }
)
export const createMachineTitleSelector = (id: string) => (state: JobSetEditorState) => {
  return state.formData.machines.entities[id]?.title
}
export const createMachineDescriptionSelector = (id: string) => (state: JobSetEditorState) => {
  return state.formData.machines.entities[id]?.description
}
export const jobIdsSelector = (state: JobSetEditorState) => state.formData.jobs.ids
export const createJobTitleSelector = (id: string) => (state: JobSetEditorState) =>
  state.formData.jobs.entities[id]?.title
export const createJobColorSelector = (id: string) => (state: JobSetEditorState) =>
  state.formData.jobColors.entities[id]?.color
export const createJobTextColorSelector = (id: string) => (state: JobSetEditorState) =>
  state.formData.jobColors.entities[id]?.textColor
export const createProcedureIdsOfJobSelector = (jobId: string) => (state: JobSetEditorState) =>
  state.formData.jobs.entities[jobId]?.procedures.ids
export const createProcedureMachineIdSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId]?.procedures.entities[procedureId]?.machineId
export const createProcedureProcessingTimeMsSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId]?.procedures.entities[procedureId]?.processingTimeMs
export const createProcedureIndexSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) =>
    state.formData.jobs.entities[jobId]?.procedures.ids.indexOf(procedureId)
export const createProceduresAffectedByMachineSelector = (machineId: string) =>
  (state: JobSetEditorState) => {
    const allProcedures = Object.values(state.formData.jobs.entities).flatMap(j => Object.values(j.procedures.entities))
    return allProcedures.filter(p => p.machineId === machineId)
  }
export const canProcedureMoveUpSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) => {
    const procedureIndex = state.formData.jobs.entities[jobId]?.procedures.ids.indexOf(procedureId)
    return procedureIndex !== undefined
      && procedureIndex !== -1
      && procedureIndex !== 0
  }
export const canProcedureMoveDownSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) => {
    const procedureIndex = state.formData.jobs.entities[jobId]?.procedures.ids.indexOf(procedureId)
    return procedureIndex !== undefined
      && procedureIndex !== -1
      && procedureIndex !== state.formData.jobs.entities[jobId]?.procedures.ids.length - 1
  }
export const procedureIndexSelector = (jobId: string, procedureId: string) =>
  (state: JobSetEditorState) => {
    return state.formData.jobs.entities[jobId]?.procedures.ids.indexOf(procedureId)
  }
export const isAutoTimeOptionsSelector = (state: JobSetEditorState) => state.formData.isAutoTimeOptions
export const maxTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions?.maxTimeMs
    : state.formData.manualTimeOptions.maxTimeMs
export const viewStartTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions?.viewStartTimeMs
    : state.formData.manualTimeOptions.viewStartTimeMs
export const viewEndTimeMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions?.viewEndTimeMs
    : state.formData.manualTimeOptions.viewEndTimeMs
export const maxViewDurationMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions?.maxViewDurationMs
    : state.formData.manualTimeOptions.maxViewDurationMs
export const minViewDurationMsSelector = (state: JobSetEditorState) =>
  state.formData.isAutoTimeOptions
    ? state.formData.autoTimeOptions?.minViewDurationMs
    : state.formData.manualTimeOptions.minViewDurationMs
//#endregion formData

export const promptExitWhenSavingSelector = (state: JobSetEditorState) => {
  const currentStep = state.steps[state.currentStepIndex]
  const isCurrentStepSaved = currentStep.saveStatus === 'saved'

  const isNew = state.id === undefined

  const isInitialStep = state.currentStepIndex === 0
  const latestVersionToken = state.lastVersion?.versionToken
  const isCurrentStepLatestVersion = currentStep.mergeBehaviour === 'discard local changes'
    && currentStep.versionToken === latestVersionToken
  const loadedFromRemote = isInitialStep || isCurrentStepLatestVersion

  return state.isEdit
    && !isCurrentStepSaved
    && (isNew || !loadedFromRemote)
}

export const updateJobSetRequestSelector = createSelector(
  jobSetsEditorIdSelector,
  (state: JobSetEditorState) => state.lastVersion?.versionToken,
  (state: JobSetEditorState) => state.formData,
  (id, versionToken, formData) => {
    if (!id || !versionToken) {
      return undefined
    }
    return formData_To_UpdateJobSetRequest(id, versionToken, formData)
  }
)

export const createJobSetRequestSelector = createSelector(
  (state: JobSetEditorState) => state.formData,
  (formData) => {
    return formData_To_CreateJobSetRequest(formData)
  }
)

export const fieldEditableSelector = (state: JobSetEditorState) => {
  const isNew = state.id === undefined
  return isNew || (state.isEdit && state.initialized)
}

export const showDetailSelector = (state: JobSetEditorState) => {
  const isNew = state.id === undefined
  return isNew || state.hasDetail
}

export const canUndoSelector = (state: JobSetEditorState) => state.currentStepIndex !== 0

export const canRedoSelector = (state: JobSetEditorState) => state.currentStepIndex !== state.steps.length - 1

export const isHistoryPanelOpenSelector = (state: JobSetEditorState) => state.isHistoryPanelOpen

const createArraysEqualSelectorCreator = createSelectorCreator(
  defaultMemoize,
  arraysEqual
)

export const stepIdsSelector = createArraysEqualSelectorCreator(
  (state: JobSetEditorState) => state.steps.map(s => s.id).reverse(),
  (stepIds) => stepIds
)

export const createStepSelector = (id: string) => createSelector(
  (state: JobSetEditorState) => state.steps,
  (steps) => {
    return steps.find(s => s.id === id)
  }
)

const createShallowEqualSelectorCreator = createSelectorCreator(
  defaultMemoize,
  shallowEqualObjects
)

export const createNormalStepSelector = (id: string) => createShallowEqualSelectorCreator(
  (state: JobSetEditorState) => {
    const step = state.steps.find(s => s.id === id)
    if (!step) {
      return undefined
    }
    return {
      id: step.id,
      versionToken: step.versionToken,
      name: step.name
    }
  },
  (step) => step
)

export const createStepDoneStatusSelector = (id: string) => createSelector(
  (state: JobSetEditorState) => state.steps,
  currentStepIndexSelector,
  (steps, currentStepIndex) => {
    const index = steps.findIndex(s => s.id === id)
    return index > currentStepIndex
      ? 'undone'
      : index === currentStepIndex
        ? 'current'
        : 'past'
  }
)

export const createHasRelatedChangesSelector = (
  stepId: string,
  conflictIndex: number
) => {
  // if the conflict changes, re-create the memoized function
  const hasRelatedChangesWithStepMemoize = defaultMemoize(
    (conflict: Operation) => {
      const hasRelatedChangesWithStep = (step: Step) => {
        return conflictHasRelatedChanges(conflict, step)
      }
      const memoized = memoize(hasRelatedChangesWithStep)
      memoized.cache = new WeakMap()
      return memoized
    }
  )
  const hasRelatedChangesMemoized = defaultMemoize(
    (
      hasRelatedChangesWithStepFn: (step: Step) => boolean,
      steps: Step[],
      stepIndex: number,
      currentStepIndex: number
    ) => {
      for (const step of steps.slice(stepIndex + 1, currentStepIndex + 1)) {
        if (hasRelatedChangesWithStepFn(step)) {
          return true
        }
      }
      return false
    }
  )

  function selector(state: JobSetEditorState) {
    const stepIndex = state.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      return undefined
    }
    const conflict = state.steps[stepIndex].operations?.[conflictIndex]
    if (!conflict) {
      return undefined
    }
    const hasRelatedChangesWithStepFn = hasRelatedChangesWithStepMemoize(conflict)
    const steps = state.steps
    const currentStepIndex = state.currentStepIndex

    const hasRelatedChanges = hasRelatedChangesMemoized(
      hasRelatedChangesWithStepFn,
      steps,
      stepIndex,
      currentStepIndex
    )
    return hasRelatedChanges
  }

  return selector
}

export const showErrorSelector = (path: string) => (state: JobSetEditorState) => {
  const editable = fieldEditableSelector(state)
  const touched = state.touched.status === 'all' || state.touched.entities[path] === true
  const validationError = state.validationError.entities[path]
  return editable && touched && validationError
}