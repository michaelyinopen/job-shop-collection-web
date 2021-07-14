
import { isLoadingThunkAction } from './types'
import type {
  LoadingThunkMiddlewareWithExtraArgument
} from './types'
import { loadingCo } from './loadingCo'

const createReduxThunkLoading = extraArgument => store => next => action => {
  if (isLoadingThunkAction(action)) {
    return loadingCo({
      store,
      action
    })
  }
  return next(action)
}

const reduxThunkLoadingWithOutType: LoadingThunkMiddlewareWithExtraArgument = createReduxThunkLoading()
reduxThunkLoadingWithOutType.withExtraArgument = createReduxThunkLoading

const reduxThunkLoading: LoadingThunkMiddlewareWithExtraArgument = reduxThunkLoadingWithOutType

export { reduxThunkLoading }