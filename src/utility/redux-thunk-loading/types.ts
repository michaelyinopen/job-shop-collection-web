import type { Middleware } from 'redux'

//#region State
type ThunkLoadingTakeLeadingState = {
  takeLeading_isLoading: true
}
export function isTakeLeading(state): state is ThunkLoadingTakeLeadingState {
  return (state as ThunkLoadingTakeLeadingState)?.takeLeading_isLoading !== undefined
}
type ThunkLoadingTakeEveryState = {
  takeEvery_loadingCount: number
}
export function isTakeEvery(state): state is ThunkLoadingTakeEveryState {
  return (state as ThunkLoadingTakeEveryState)?.takeEvery_loadingCount !== undefined
}
type ThunkLoadingTakeLatestState = {
  takeLatest_latestNumber: number
}
export function isTakeLatest(state): state is ThunkLoadingTakeLatestState {
  return (state as ThunkLoadingTakeLatestState)?.takeLatest_latestNumber !== undefined
}
type ThunkLoadingState = ThunkLoadingTakeLeadingState | ThunkLoadingTakeEveryState | ThunkLoadingTakeLatestState
export type ReduxThunkLoadingState = {
  [key: string]: ThunkLoadingState
}

export type StateWithReduxThunkLoading<TState = {}> = TState & {
  reduxThunkLoading: ReduxThunkLoadingState;
}
//#endregion State

export type LoadingThunkDispatch<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > =
  <TReturnType>(
    loadingThunkAction: LoadingThunkAction<TReturnType, TState, TExtraThunkArg>
  ) => TReturnType

//#region Action
export type TakeType = "leading" | "every" | "latest"

export type LoadingThunkTakeLeadingOrEvery<
  TReturnType,
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = {
    name: string,
    takeType: "leading" | "every"
    thunk: <TAppDispatch>(
      dispatch: TAppDispatch, // do not know the type of dispatch, because there might be other middlewares
      getState: () => TState,
      extraArgument?: TExtraThunkArg,
    ) => TReturnType
  }

export type LoadingThunkTakeLatest<
  TReturnType,
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = {
    name: string,
    takeType: "latest"
    thunk: <TAppDispatch>( // must be generator function
      dispatch: TAppDispatch, // do not know the type of dispatch, because there might be other middlewares
      getState: () => TState,
      extraArgument?: TExtraThunkArg,
    ) => Generator<unknown, TReturnType, unknown>
  }

// takeType: "leading" | "every" can have any kind of function as thunk
// takeType: "latest" must have generator function as thunk
export type LoadingThunkAction<
  TReturnType,
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > =
  LoadingThunkTakeLatest<TReturnType, TState, TExtraThunkArg>
  | LoadingThunkTakeLeadingOrEvery<TReturnType, TState, TExtraThunkArg>

export function isLoadingThunkAction<
  TReturnType = any,
  TState extends StateWithReduxThunkLoading = StateWithReduxThunkLoading,
  TExtraThunkArg = unknown
>(action: any): action is LoadingThunkAction<TReturnType, TState, TExtraThunkArg> {
  const loadingThunk = action as LoadingThunkAction<TReturnType, TState, TExtraThunkArg>
  return loadingThunk.name !== undefined
    && loadingThunk.takeType !== undefined
    && loadingThunk.thunk !== undefined
}
//#endregion Action

export type LoadingThunkMiddleware<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = Middleware<
    LoadingThunkDispatch<TState, TExtraThunkArg>,
    TState
  >