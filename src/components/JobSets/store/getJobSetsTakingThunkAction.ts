import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import { SuccessResult } from '../../../utility'
import type { AppDispatch, AppTakingThunkAction } from '../../../store'
import { getJobSetsApiAsync } from '../../../api'
import {
  getJobSetsSucceeded,
  getNextJobSetsSucceeded
} from './actions'

/** @returns Promise of SuccessResult(undefined) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not complete because another takeLatest action was dispatched
 */
export const getJobSetsTakingThunkAction: AppTakingThunkAction = {
  name: 'getJobSets',
  takeType: 'latest',
  thunk: function* (dispatch: AppDispatch) {
    const getJobSetsResult: any = yield getJobSetsApiAsync()
    if (getJobSetsResult.kind === 'success') {
      dispatch(getJobSetsSucceeded(getJobSetsResult.success().data))
    } else {
      return getJobSetsResult
    }

    let pageToken: number | undefined = getJobSetsResult.success().nextPageToken
    while (pageToken !== undefined) {
      const getNextJobSetsResult: any = yield getJobSetsApiAsync(pageToken)
      if (getNextJobSetsResult.kind === 'success') {
        dispatch(getNextJobSetsSucceeded(getNextJobSetsResult.success().data))
        const nextPageToken = getNextJobSetsResult.success().nextPageToken
        if (pageToken === nextPageToken) {
          return new SuccessResult(undefined)
        }
        pageToken = nextPageToken
      } else {
        //kind === 'failure'
        return getJobSetsResult
      }
    }
    return new SuccessResult(undefined)
  }
}

export const jobSetsIsLoadingSelector = createIsLoadingSelector('getJobSets')