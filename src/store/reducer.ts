import { combineReducers, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

import * as fromJobSets from '../components/JobSets'

export const reducer = combineReducers({
  jobSets: fromJobSets.jobSetsReducer,
  jobSetsMeta: fromJobSets.jobSetsMetaReducer,
  jobSetsPage: fromJobSets.jobSetsPageReducer
})

export const jobSetIdsSelector = createSelector(
  (state: RootState) => state.jobSets,
  fromJobSets.jobSetIdsSelector
)

export const jobSetHeadersSelector = createSelector(
  (state: RootState) => state.jobSets,
  fromJobSets.jobSetHeadersSelector
)

export const jobSetsIsLoadingSelector = createSelector(
  (state: RootState) => state.jobSetsMeta,
  fromJobSets.jobSetsIsLoadingSelector
)

export const jobSetsPageSelector = (state: RootState) => state.jobSetsPage