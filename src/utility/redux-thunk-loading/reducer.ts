
import produce from 'immer'
import {
  takeLeading_Start,
  takeLeading_End,
  takeEvery_Add,
  takeEvery_Remove,
  takeLatest_SetLatestNumber,
  takeLatest_Destroy,
  reduxThunkLoadingActionTypes
} from './actions'
import {
  isTakeLeading,
  isTakeEvery,
  isTakeLatest,
} from './types'
import type {
  ReduxThunkLoadingState,
  StateWithReduxThunkLoading
} from './types'

const reduxThunkLoadingInitialState: ReduxThunkLoadingState = {}

/**
 * Add to root reducer with combineReducers
 * The key MUST be reduxThunkLoading
 */
export function reduxThunkLoadingReducer(
  state = reduxThunkLoadingInitialState,
  action: { type: string }
) {
  const { type } = action
  if (!reduxThunkLoadingActionTypes.includes(type)) {
    return state
  }
  const { payload: { name } } = action as any
  return produce(state, draftState => {
    // takeLeading
    if (type === takeLeading_Start.type) {
      if (draftState[name] === undefined) {
        draftState[name] = { takeLeading_isLoading: true }
      }
    }
    else if (type === takeLeading_End.type) {
      if (isTakeLeading(draftState[name])) {
        delete draftState[name]
      }
    }

    // takeEvery
    else if (type === takeEvery_Add.type) {
      const target = draftState[name]
      if (draftState[name] === undefined) {
        draftState[name] = { takeEvery_loadingCount: 1 }
      }
      else if (isTakeEvery(target)) {
        target.takeEvery_loadingCount = target.takeEvery_loadingCount + 1
      }
    }
    else if (type === takeEvery_Remove.type) {
      const target = draftState[name]
      if (isTakeEvery(target)) {
        const newCount = target.takeEvery_loadingCount - 1
        if (newCount > 0) {
          target.takeEvery_loadingCount = newCount
        } else {
          delete draftState[name]
        }
      }
    }

    // takeLatest
    else if (type === takeLatest_SetLatestNumber.type) {
      const { payload: { latestNumber } } = action as ReturnType<typeof takeLatest_SetLatestNumber>
      const target = draftState[name]
      if (draftState[name] === undefined) {
        draftState[name] = { takeLatest_latestHandlerNumber: latestNumber }
      }
      if (isTakeLatest(target)) {
        target.takeLatest_latestHandlerNumber = latestNumber
      }
    }
    else if (type === takeLatest_Destroy.type) {
      if (isTakeLatest(draftState[name])) {
        delete draftState[name]
      }
    }
  })
}

export const createIsLoadingSelector = (name: string) => (state: StateWithReduxThunkLoading) => {
  return state.reduxThunkLoading[name] !== undefined
}

export const createLatestExecutionNumberSelector = (name: string) => (state: StateWithReduxThunkLoading) => {
  const target = state.reduxThunkLoading[name]
  return isTakeLatest(target)
    ? target.takeLatest_latestHandlerNumber
    : undefined
}