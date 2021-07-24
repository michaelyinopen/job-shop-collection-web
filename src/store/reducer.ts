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

//todo
export const jobSetsIsLoadingSelector = () => true
export const jobSetsFailedMessageSelector = createSelector(
  jobSetsSelector,
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