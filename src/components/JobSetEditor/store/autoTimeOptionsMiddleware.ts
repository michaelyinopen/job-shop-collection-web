import type { Middleware, Dispatch } from 'redux'
import throttle from 'lodash/throttle'
import { middlewareCalculatedAutoTimeOptions } from './actions'
import type {
  FormDataState,
  JobState,
  TimeOptionsState
} from './jobSetEditorReducer'
import {
  shallowEqualObjects,
} from '../../../utility'

function calculateAutoTimeOptions(jobEntities: {
  [id: string]: JobState
}): TimeOptionsState {
  const processingTimes = Object.values(jobEntities)
    .flatMap(j => Object.values(j.procedures.entities))
    .map(p => p.processingTimeMs)
    .filter(t => t !== 0)
  const sum = processingTimes.reduce((a, b) => a + b, 0)
  const sumOfMinTwo = processingTimes
    .sort((a, b) => a - b) // does not use processing times later, so mutate here is fine
    .slice(0, 2)
    .reduce((a, b) => a + b, 0)
  return {
    maxTimeMs: sum,
    viewStartTimeMs: 0,
    viewEndTimeMs: sum,
    minViewDurationMs: sumOfMinTwo,
    maxViewDurationMs: sum,
  }
}

function calculateAndDispatch(
  dispatch: Dispatch,
  currentAutoTimeOptions: TimeOptionsState | undefined,
  jobEntities: {
    [id: string]: JobState
  }
) {
  const newTimeOptions = calculateAutoTimeOptions(jobEntities)
  if (!shallowEqualObjects(newTimeOptions, currentAutoTimeOptions)) {
    dispatch(middlewareCalculatedAutoTimeOptions(newTimeOptions))
  }
}

const calculateAndDispatchThrottled = throttle(
  calculateAndDispatch,
  16,
  {
    leading: true,
    trailing: true
  }
)

export const autoTimeOptionsMiddleware: Middleware = store => next => action => {
  const dispatch = store.dispatch

  const previousState = store.getState()
  const previousFormData: FormDataState = previousState.formData

  const nextResult = next(action)

  const currentState = store.getState()
  const currentIsNew = currentState.id === undefined
  const currentFormData: FormDataState = currentState.formData
  const currentInitialized = currentState.initialized

  if ((currentIsNew || currentInitialized)
    && (previousFormData.jobs !== currentFormData.jobs || !previousFormData.isAutoTimeOptions)
    && currentFormData.isAutoTimeOptions
  ) {
    calculateAndDispatchThrottled(
      dispatch,
      currentFormData.autoTimeOptions,
      currentFormData.jobs.entities
    )
  }
  return nextResult
}