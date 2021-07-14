import { combineReducers, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

import * as fromJobSets from '../components/JobSets'
import { reduxThunkLoadingReducer } from '../utility/redux-thunk-loading/reducer' //todo fix

export const reducer = combineReducers({
  jobSets: fromJobSets.jobSetsReducer,
  jobSetsMeta: fromJobSets.jobSetsMetaReducer,
  jobSetsPage: fromJobSets.jobSetsPageReducer,
  reduxThunkLoading: reduxThunkLoadingReducer
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
export const jobSetsFailedMessageSelector = createSelector(
  jobSetsMetaSelector,
  fromJobSets.jobSetsFailedMessageSelector
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