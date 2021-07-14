
import produce from 'immer'
import {
  takeLeading_Start,
  takeLeading_End,
  takeEvery_Add,
  takeEvery_Remove,
  takeLatest_Add,
  takeLatest_Destroy,
  reduxThunkLoadingActionTypes
} from './actions'

const reducerPropName = "@@redux-thunk-loading"
type ReduxThunkLoadingInState = {
  "@@redux-thunk-loading": ReduxThunkLoadingState
}
type StateWithReduxThunkLoading<State extends object>
  = State & ReduxThunkLoadingInState

type ThunkLoadingTakeLeadingState = {
  takeLeading_isLoading: true
}
function isTakeLeading(state): state is ThunkLoadingTakeLeadingState {
  return (state as ThunkLoadingTakeLeadingState).takeLeading_isLoading !== undefined
}

type ThunkLoadingTakeEveryState = {
  takeEvery_loadingCount: number
}
function isTakeEvery(state): state is ThunkLoadingTakeEveryState {
  return (state as ThunkLoadingTakeEveryState).takeEvery_loadingCount !== undefined
}

type ThunkLoadingTakeLatestState = {
  takeLatest_latestNumber: number
}
function isTakeLatest(state): state is ThunkLoadingTakeLatestState {
  return (state as ThunkLoadingTakeLatestState).takeLatest_latestNumber !== undefined
}

type ThunkLoadingState = ThunkLoadingTakeLeadingState | ThunkLoadingTakeEveryState | ThunkLoadingTakeLatestState

type ReduxThunkLoadingState = {
  [key: string]: ThunkLoadingState
}

const reduxThunkLoadingInitialState: ReduxThunkLoadingState = {}

function reduxThunkLoadingReducer(
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
      const target = draftState[name]
      if (isTakeLeading(target)) {
        target.takeLeading_isLoading = true
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
      if (isTakeEvery(target)) {
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
    else if (type === takeLatest_Add.type) {
      const target = draftState[name]
      if (isTakeLatest(target)) {
        target.takeLatest_latestNumber = target.takeLatest_latestNumber + 1
      }
    }
    else if (type === takeLatest_Destroy.type) {
      if (isTakeLatest(draftState[name])) {
        delete draftState[name]
      }
    }
  })
}

export function reduxThunkLoadingReduce<State extends object>(state: State, action: { type: string })
  : StateWithReduxThunkLoading<State> {
  const prevLoadingState = state[reducerPropName]
  const nextLoadingState = reduxThunkLoadingReducer(prevLoadingState, action)
  return prevLoadingState === nextLoadingState
    ? state as StateWithReduxThunkLoading<State>
    : Object.assign({}, state, { "@@redux-thunk-loading": nextLoadingState })
}