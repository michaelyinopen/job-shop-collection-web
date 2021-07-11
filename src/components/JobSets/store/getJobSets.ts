import { jobSetsIsLoadingSelector } from "../../../store"
import type { AppDispatch, RootState } from "../../../store"
import {
  getJobSetsStarted,
  getJobSetsSucceeded,
  getJobSetsFailed
} from "./actions"
import { getJobSetsApiAsync } from "../../../api"

// todo use page token to fetch more than once
export function getJobSets() {
  return async function getJobSetsThunk(dispatch: AppDispatch, getState: () => RootState) {
    const jobSetsIsLoading = jobSetsIsLoadingSelector(getState())
    if (jobSetsIsLoading) {
      return
    }
    dispatch(getJobSetsStarted())
    const getJobSetsResult = await getJobSetsApiAsync()
    if (getJobSetsResult.kind === "success") {
      dispatch(getJobSetsSucceeded(getJobSetsResult.success().data))
    } else {
      dispatch(getJobSetsFailed(getJobSetsResult.failure().errorMesage))
    }
  }
}