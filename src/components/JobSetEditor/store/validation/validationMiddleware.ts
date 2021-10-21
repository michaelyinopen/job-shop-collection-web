import type { Middleware } from 'redux'
import { middlewareSetValidationErrors } from '../actions'
import type {
  FormDataState,
} from '../jobSetEditorReducer'
import { validateFormData } from './validateFormData'

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
    // throttle if performance is a problem
    const validationErrors = validateFormData(currentFormData)
    dispatch(middlewareSetValidationErrors(validationErrors))
  }

  return nextResult
}