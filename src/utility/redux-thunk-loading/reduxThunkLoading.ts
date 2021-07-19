import { isLoadingThunkAction } from './types'
import type {
  StateWithReduxThunkLoading,
  LoadingThunkMiddleware,
} from './types'
import { run } from './run'

export const reduxThunkLoading = <
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(extraArgument?: TExtraThunkArg): LoadingThunkMiddleware<TState, TExtraThunkArg> => store => next => action => {
  if (isLoadingThunkAction(action)) {
    return run({
      dispatch: store.dispatch,
      getState: store.getState,
      name: action.name,
      takeType: action.takeType,
      thunk: action.thunk,
      extraArgument
    })
  }
  return next(action)
}