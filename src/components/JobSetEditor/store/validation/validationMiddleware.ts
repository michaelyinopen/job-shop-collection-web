import type { Middleware, Dispatch } from 'redux'
import throttle from 'lodash/throttle'
import { middlewareSetValidationErrors } from '../actions'
import type {
  FormDataState,
} from '../jobSetEditorReducer'
import { validateFormData } from './validateFormData'


function validateAndDispatch(
  dispatch: Dispatch,
  currentFormData: FormDataState
) {
  const validationErrors = validateFormData(currentFormData)
  dispatch(middlewareSetValidationErrors(validationErrors))
}

const validateAndDispatchThrottled = throttle(
  validateAndDispatch,
  16,
  {
    leading: true,
    trailing: true
  }
)

export const validationMiddleware: Middleware = store => next => action => {
  const dispatch = store.dispatch

  const previousState = store.getState()
  const previousFormData: FormDataState = previousState.formData

  const nextResult = next(action)

  const currentState = store.getState()
  const currentIsNew = currentState.id === undefined
  const currentIsEdit = currentState.isEdit
  const currentFormData: FormDataState = currentState.formData
  const currentInitialized = currentState.initialized

  if ((currentIsNew || currentInitialized)
    && currentIsEdit
    && previousFormData !== currentFormData
  ) {
    validateAndDispatchThrottled(dispatch, currentFormData)
  }

  return nextResult
}