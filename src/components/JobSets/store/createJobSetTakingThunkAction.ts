import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import type { AppDispatch, AppTakingThunkAction } from '../../../store'
import { createJobSetApiAsync } from '../../../api'
import type { CreateJobSetRequest } from '../../../api'
import { fetchedJobSet } from './actions'

/** 
 * @returns Promise of SuccessResult(GetJobSetResponse) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not executed because another takeLeading action was already dispatched
 */
export const createJobSetTakingThunkAction = (
  jobSet: CreateJobSetRequest,
  creationToken: string
): AppTakingThunkAction => ({
  name: `createJobSet/${creationToken}`,
  takeType: 'leading',
  thunk: function* (dispatch: AppDispatch) {
    const createJobSetResult: any = yield createJobSetApiAsync(jobSet)
    if (createJobSetResult.kind === 'success') {
      dispatch(fetchedJobSet(createJobSetResult.success()))
      return createJobSetResult
    } else {
      return createJobSetResult
    }
  }
})

export const createJobSetIsLoadingSelector = (creationToken: string) =>
  createIsLoadingSelector(`createJobSet/${creationToken}`)