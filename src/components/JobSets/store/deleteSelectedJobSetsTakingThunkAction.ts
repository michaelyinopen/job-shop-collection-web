import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import { SuccessResult } from '../../../utility'
import { jobSetsPageSelectedItemIdsSelector } from '../../../store'
import type { AppDispatch, AppTakingThunkAction, RootState } from '../../../store'
import { deleteJobSetTakingThunkAction } from './deleteJobSetTakingThunkAction'

/**
 * Function that takes argument id, and creates the TakingThunkAction
 * @returns Promise of SuccessResult(undefined) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not execute because another delete is in progress
 */
export const deleteSelectedJobSetsTakingThunkAction = (ids: number[]): AppTakingThunkAction => {
  return {
    name: 'deleteMultipleJobSets',
    takeType: 'leading',
    thunk: async function (dispatch: AppDispatch, getState: () => RootState) {
      const ids = jobSetsPageSelectedItemIdsSelector(getState())
      const deleteJobSetPromises = ids.map((id: number) =>
        dispatch(deleteJobSetTakingThunkAction(id))
      )
      const results = await Promise.all(deleteJobSetPromises)

      const successfulCount = results.filter(r => r && r.kind === 'success').length
      const failedCount = results.filter(r => !r || r.kind !== 'success').length

      const deleteResult = successfulCount && !failedCount
        ? `Successfully deleted ${successfulCount} Job Sets`
        : !successfulCount && failedCount
          ? `Failed to deleted ${failedCount} Job Sets`
          : `Successfully deleted ${successfulCount} Job Sets but failed to delete ${failedCount} Job Sets`
      return new SuccessResult(deleteResult)
    }
  }
}

export const deleteSelectedJobSetsIsLoadingSelector = createIsLoadingSelector('deleteMultipleJobSets')