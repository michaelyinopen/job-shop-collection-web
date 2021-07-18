import { isLoadingThunkAction } from './types'
import type {
  StateWithReduxThunkLoading,
  LoadingThunkMiddleware,
} from './types'
import { loadingCo } from './loadingCo'

let createReduxThunkLoading = <
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(extraArgument?: TExtraThunkArg): LoadingThunkMiddleware<TState, TExtraThunkArg> => store => next => action => {
  if (isLoadingThunkAction(action)) {
    return loadingCo(
      action.thunk,{
      dispatch: store.dispatch,
      getState: store.getState,
      name: action.name,
      takeType: action.takeType,
      extraArgument
    })
  }
  return next(action)
}

export const reduxThunkLoading =
  Object.assign(createReduxThunkLoading, { withExtraArgument: createReduxThunkLoading })