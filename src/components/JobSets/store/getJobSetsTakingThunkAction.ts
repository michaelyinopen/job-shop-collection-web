import type { AppDispatch, AppTakingThunkAction } from "../../../store"
import { getJobSetsApiAsync } from "../../../api"
import {
  getJobSetsSucceeded,
  getJobSetsFailed
} from "./actions"
import { createIsLoadingSelector } from "../../../utility/redux-taking-thunk"

// todo use page token to fetch more than once
export const getJobSetsTakingThunkAction: AppTakingThunkAction = {
  name: 'getJobSets',
  takeType: 'latest',
  thunk: function* (dispatch: AppDispatch) {
    const getJobSetsResult: any = yield getJobSetsApiAsync()
    if (getJobSetsResult.kind === "success") {
      dispatch(getJobSetsSucceeded(getJobSetsResult.success().data))
    } else {
      dispatch(getJobSetsFailed(getJobSetsResult.failure().errorMesage))
    }
  }
}

export const jobSetsIsLoadingSelector = createIsLoadingSelector('getJobSets')