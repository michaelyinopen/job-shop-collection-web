import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import { FailureResult, SuccessResult } from '../../../utility'
import { createJobSetSelector } from '../../../store'
import type { AppDispatch, AppTakingThunkAction, RootState } from '../../../store'
import { deleteJobSetApiAsync } from '../../../api'
import { deleteJobSetSucceeded } from './actions'

/**
 * Function that takes argument id, and creates the TakingThunkAction
 * @returns Promise of SuccessResult(undefined) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not execute because another delete is in progress
 */
export const deleteJobSetTakingThunkAction = (id: number): AppTakingThunkAction => {
  const jobSetSelector = createJobSetSelector(id)
  return {
    name: `deleteJobSet/${id}`,
    takeType: 'leading',
    thunk: async function (dispatch: AppDispatch, getState: () => RootState) {
      const jobSet = jobSetSelector(getState())
      const eTag = jobSet?.eTag
      if (!eTag) {
        return new FailureResult({ failureType: 'Unsupported Operation', errorMesage: `Job Set id: ${id} is out of sync or already deleted.` })
      }
      if (jobSet?.isLocked) {
        return new FailureResult({ failureType: 'Unsupported Operation', errorMesage: `Job Set id: ${id} is locked and cannot be deleted, please unlock first.` })
      }
      const deleteJobSetResult: any = await deleteJobSetApiAsync(id, eTag)
      if (deleteJobSetResult.kind === 'success') {
        dispatch(deleteJobSetSucceeded(id))
        return new SuccessResult(undefined)
      } else {
        //kind === 'failure'
        return deleteJobSetResult
      }
    }
  }
}

export const createDeleteJobSetIsLoadingSelector = (id: number) => createIsLoadingSelector(`deleteJobSet/${id}`)