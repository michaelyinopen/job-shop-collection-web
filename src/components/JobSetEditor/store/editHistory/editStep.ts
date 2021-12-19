import type { Middleware, Dispatch } from 'redux'
import { nanoid } from 'nanoid'
import { arraysEqual } from '../../../../utility'
import * as actions from '../actions'
import {
  calculateStepName,
  getFieldChanges,
} from './StepCommon'
import type {
  FormData,
  Step,
  FieldChange
} from './types'

const excludeActionTypes = [
  actions.replaceLastStep,
  actions.setJobSetFromAppStore,
  actions.resetJobSetEditor,
  actions.setJobSetEditorIsEdit,

  actions.undo,
  actions.redo,
  actions.jumpToStep,
  actions.setMergeBehaviourMerge,
  actions.setMergeBehaviourDiscardLocal,
  actions.applyConflict,
  actions.unApplyConflict,

  actions.middlewareCalculatedAutoTimeOptions,
  actions.focusTitle,
  actions.focusMachineTitle,
  actions.focusProcedureMachineId,
  actions.focusProcedureProcessingTime,
  actions.focusMaxTime,
  actions.focusViewEndTime,
  actions.focusMinViewDuration,
  actions.focusMaxViewDuration,
  actions.openHistoryPanel,
  actions.closeHistoryPanel,

  actions.middlewareSetValidationErrors,
].map(a => a.type)

function combineFieldChanges(a: FieldChange, b: FieldChange): FieldChange[] {
  if (a.path !== b.path) {
    return [a, b] // not combined
  }
  if (('previousValue' in a) && ('previousValue' in b)) {
    return a.previousValue === b.newValue
      ? [] // combined resulting in no-op
      : [{ ...a, previousValue: a.previousValue, newValue: b.newValue }] // merged
  }
  if (('collectionChange' in a)
    && ('collectionChange' in b)
    && a.collectionChange.type === 'move'
    && b.collectionChange.type === 'move') {
    return (
      Array.isArray(a.collectionChange.previousValue)
      && Array.isArray(b.collectionChange.newValue)
      && arraysEqual(a.collectionChange.previousValue, b.collectionChange.newValue)
    )
      ? [] // combined resulting in no-op
      : [{
        ...a,
        collectionChange: {
          ...a.collectionChange,
          previousValue: a.collectionChange.previousValue,
          newValue: b.collectionChange.newValue
        }
      }] // merged
  }
  return [a, b] // not combined
}

export function calculateEditSteps(
  previousStep: Step,
  previousFormData: FormData,
  currentFormData: FormData)
  : Step[] {
  const fieldChanges = getFieldChanges(previousFormData, currentFormData).flat()
  if (fieldChanges.length === 0) {
    return [previousStep]
  }
  if (fieldChanges.length !== 1
    || previousStep.versionToken
    || previousStep.saveStatus
    || previousStep.operations.length !== 1
    || previousStep.operations[0].fieldChanges.length !== 1
  ) {
    const name = calculateStepName(fieldChanges)
    const newStep = {
      id: nanoid(),
      name,
      operations: [{
        type: 'edit' as const,
        fieldChanges,
        applied: true
      }]
    }
    return [previousStep, newStep]
  }
  const combinedFieldChanges = combineFieldChanges(
    previousStep.operations[0].fieldChanges[0],
    fieldChanges[0]
  )
  if (combinedFieldChanges.length === 0) {
    // no-op
    return []
  }
  else if (combinedFieldChanges.length === 1) {
    // combined
    const name = calculateStepName(combinedFieldChanges)
    const mergedStep = {
      id: previousStep.id,
      name,
      operations: [{
        type: 'edit' as const,
        fieldChanges: combinedFieldChanges,
        applied: true
      }]
    }
    return [mergedStep]
  }
  else {
    // did not combine
    const name = calculateStepName(fieldChanges)
    const newStep = {
      id: nanoid(),
      name,
      operations: [{
        type: 'edit' as const,
        fieldChanges,
        applied: true
      }]
    }
    return [previousStep, newStep]
  }
}

function calculateStepAndDispatch(
  dispatch: Dispatch,
  previousStep: Step,
  previousFormData: FormData,
  currentFormData: FormData
) {
  const steps = calculateEditSteps(
    previousStep,
    previousFormData,
    currentFormData
  )
  if (steps.length !== 1 || steps[0] !== previousStep) {
    dispatch(actions.replaceLastStep(steps))
  }
}

export const editHistoryMiddleware: Middleware = store => next => action => {
  const dispatch = store.dispatch

  const previousState = store.getState()
  const previousStep = previousState.steps.entities[previousState.steps.ids[previousState.currentStepIndex]]
  const previousFormData = previousState.formData
  const previousInitialized = previousState.initialized
  const previousIsNew = previousState.id === undefined

  const nextResult = next(action)

  const currentFormData = store.getState().formData

  if ((previousIsNew || previousInitialized) && !excludeActionTypes.includes(action.type)) {
    calculateStepAndDispatch(
      dispatch,
      previousStep,
      previousFormData,
      currentFormData
    )
  }

  return nextResult
}