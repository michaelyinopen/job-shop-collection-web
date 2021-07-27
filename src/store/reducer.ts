import { combineReducers, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

import * as fromJobSets from '../components/JobSets'
import { reduxTakingThunkReducer } from '../utility/redux-taking-thunk'

export const reducer = combineReducers({
  jobSets: fromJobSets.jobSetsReducer,
  jobSetsPage: fromJobSets.jobSetsPageReducer,
  reduxTakingThunk: reduxTakingThunkReducer
})

const jobSetsSelector = (state: RootState) => state.jobSets
export const jobSetIdsSelector = createSelector(
  jobSetsSelector,
  fromJobSets.jobSetIdsSelector
)
export const jobSetHeadersSelector = createSelector(
  jobSetsSelector,
  fromJobSets.jobSetHeadersSelector
)

export const jobSetsFailedMessageSelector = createSelector(
  jobSetsSelector,
  fromJobSets.jobSetsFailedMessageSelector
)

const jobSetsPageSelector = (state: RootState) => state.jobSetsPage
export const jobSetsPageSelectedItemIdsSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageSelectedItemIdsSelector
)
export const jobSetsPageRowsPerPageSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageRowsPerPageSelector
)
export const jobSetsPagePageIndexSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPagePageIndexSelector
)
export const jobSetsPageOrderSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageOrderSelector
)
export const jobSetsPageOrderBySelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageOrderBySelector
)
export const jobSetsPageItemsSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageItemsSelector
)
export const jobSetsPageItemCountSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageItemCountSelector
)
export const jobSetsPageItemIdssOfPageSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageItemIdssOfPageSelector
)
export const createJobSetsPageItemSelector = (id: number) => createSelector(
  jobSetsPageSelector,
  fromJobSets.createJobSetsPageItemSelector(id)
)
