import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import { SuccessResult } from '../../../utility'
import type { AppDispatch, AppTakingThunkAction } from '../../../store'
import { getJobSetApiAsync } from '../../../api'
import { fetchedJobSet } from './actions'

/** 
 * Function that takes parameter id and returns the TakingThunkAction
 * @returns Promise of SuccessResult(undefined) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not complete because another takeLatest action was dispatched
 */
export const getJobSetTakingThunkAction = (id: number, isRefresh: boolean = false): AppTakingThunkAction => ({
  name: `getJobSet/${id}`,
  takeType: 'latest',
  thunk: function* (dispatch: AppDispatch) {
    const getJobSetResult: any = yield getJobSetApiAsync(id)
    if (getJobSetResult.kind === 'success') {
      dispatch(fetchedJobSet(getJobSetResult.success(), isRefresh))
    } else {
      return getJobSetResult
    }
    return new SuccessResult(undefined)
  }
})

export const getJobSetIsLoadingSelector = (id: number) => createIsLoadingSelector(`getJobSet/${id}`)