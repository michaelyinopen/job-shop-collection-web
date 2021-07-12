import { combineReducers, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

import * as fromJobSets from '../components/JobSets'

export const reducer = combineReducers({
  jobSets: fromJobSets.jobSetsReducer,
  jobSetsMeta: fromJobSets.jobSetsMetaReducer,
  jobSetsPage: fromJobSets.jobSetsPageReducer
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

const jobSetsMetaSelector = (state: RootState) => state.jobSetsMeta
export const jobSetsIsLoadingSelector = createSelector(
  jobSetsMetaSelector,
  fromJobSets.jobSetsIsLoadingSelector
)

const jobSetsPageSelector = (state: RootState) => state.jobSetsPage
export const jobSetsPageHasSelectedSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageHasSelectedSelector
)
export const jobSetsPageSelectedItemIdsSelector = createSelector(
  jobSetsPageSelector,
  fromJobSets.jobSetsPageSelectedItemIdsSelector
)