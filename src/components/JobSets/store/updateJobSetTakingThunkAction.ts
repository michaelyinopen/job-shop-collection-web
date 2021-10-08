import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import type { AppDispatch, AppTakingThunkAction } from '../../../store'
import { updateJobSetApiAsync } from '../../../api'
import type { UpdateJobSetRequest } from '../../../api'
import { fetchedJobSet } from './actions'

/** 
 * @returns Promise of SuccessResult(GetJobSetResponse) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not complete because another takeLatest action was dispatched
 */
export const updateJobSetTakingThunkAction = (
  id: number,
  jobSet: UpdateJobSetRequest
): AppTakingThunkAction => ({
  name: `updateJobSet/${id}`,
  takeType: 'latest',
  thunk: function* (dispatch: AppDispatch) {
    const updateJobSetResult: any = yield updateJobSetApiAsync(id, jobSet)
    if (updateJobSetResult.kind === 'success') {
      const updatedJobSet = updateJobSetResult.success()
      dispatch(fetchedJobSet(updatedJobSet))
    } else if (updateJobSetResult.failure().failureType === 'version condition failed'
      || updateJobSetResult.failure().failureType === 'forbidden because locked') {
      const savedJobSet = updateJobSetResult.failure().savedJobSet
      dispatch(fetchedJobSet(savedJobSet))
    }
    return updateJobSetResult
  }
})

export const updateJobSetIsLoadingSelector = (id: number) =>
  createIsLoadingSelector(`updateJobSet/${id}`)