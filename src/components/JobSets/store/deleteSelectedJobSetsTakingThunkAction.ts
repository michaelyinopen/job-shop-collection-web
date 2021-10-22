import { createIsLoadingSelector } from '../../../utility/redux-taking-thunk'
import { SuccessResult } from '../../../utility'
import { jobSetsPageSelectedItemIdsSelector } from '../../../store'
import type { AppDispatch, AppTakingThunkAction, RootState } from '../../../store'
import { deleteJobSetTakingThunkAction } from './deleteJobSetTakingThunkAction'

const pluralizJobSets = (count: number) => count === 1 ? `${count} Job Set` : `${count} Job Sets`

/**
 * @returns Promise of SuccessResult(undefined) if completed successfully; or
 * Promise of FailureResult(Failure) if error; or
 * Promise of undefined if did not execute because another delete is in progress
 */
export const deleteSelectedJobSetsTakingThunkAction: AppTakingThunkAction = {
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
      ? `Successfully deleted ${pluralizJobSets(successfulCount)}`
      : !successfulCount && failedCount
        ? `Failed to deleted ${pluralizJobSets(failedCount)}`
        : `Successfully deleted ${pluralizJobSets(successfulCount)} but failed to delete ${pluralizJobSets(failedCount)}`
    return new SuccessResult(deleteResult)
  }
}

export const deleteSelectedJobSetsIsLoadingSelector = createIsLoadingSelector('deleteMultipleJobSets')