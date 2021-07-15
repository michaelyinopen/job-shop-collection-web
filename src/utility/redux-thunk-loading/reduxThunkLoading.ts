import { isLoadingThunkAction } from './types'
import type {
  StateWithReduxThunkLoading,
  LoadingThunkMiddleware,
} from './types'
import { loadingCo } from './loadingCo'

const createReduxThunkLoading = <
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(extraArgument?: TExtraThunkArg): LoadingThunkMiddleware<TState, TExtraThunkArg> => store => next => action => {
  if (isLoadingThunkAction(action)) {
    return loadingCo({
      store,
      action,
      extraArgument
    })
  }
  return next(action)
}

export const reduxThunkLoading =
  Object.assign({}, createReduxThunkLoading, { withExtraArgument: createReduxThunkLoading })