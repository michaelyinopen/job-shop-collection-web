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
// todo rename to takeLatest_latestGeneratorNumber
type ThunkLoadingTakeLatestState = {
  takeLatest_latestHandlerNumber: number
}
export function isTakeLatest(state): state is ThunkLoadingTakeLatestState {
  return (state as ThunkLoadingTakeLatestState)?.takeLatest_latestHandlerNumber !== undefined
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
  (
    loadingThunkAction: LoadingThunkAction<TState, TExtraThunkArg>
  ) => any

//#region Action
export type TakeType = "leading" | "every" | "latest"
export const defaultTakeType = "every" as const

export type LoadingThunkTakeLeadingOrEvery<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = {
    name: string,
    takeType?: "leading" | "every"
    thunk: <TAppDispatch>(
      dispatch: TAppDispatch, // do not know the type of dispatch, because there might be other middlewares
      getState: () => TState,
      extraArgument?: TExtraThunkArg,
    ) => any
  }

export type LoadingThunkTakeLatest<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = {
    name: string,
    takeType: "latest"
    thunk: <TAppDispatch>( // must be generator function
      dispatch: TAppDispatch, // do not know the type of dispatch, because there might be other middlewares
      getState: () => TState,
      extraArgument?: TExtraThunkArg,
    ) => Generator | AsyncGenerator
  }

// takeType: "leading" | "every" can have any kind of function as thunk
// takeType: "latest" must have generator function as thunk
// YThe generator function can only yield a function, promise, generator, array(of yieldable), or object(of yieldable)
export type LoadingThunkAction<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > =
  LoadingThunkTakeLatest<TState, TExtraThunkArg>
  | LoadingThunkTakeLeadingOrEvery<TState, TExtraThunkArg>

export function isLoadingThunkAction<
  TState extends StateWithReduxThunkLoading = StateWithReduxThunkLoading,
  TExtraThunkArg = unknown
>(action: any): action is LoadingThunkAction<TState, TExtraThunkArg> {
  const loadingThunk = action as LoadingThunkAction<TState, TExtraThunkArg>
  return loadingThunk
    && loadingThunk.name !== undefined
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