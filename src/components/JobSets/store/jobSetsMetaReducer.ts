import { createReducer } from '@reduxjs/toolkit'
import {
  getJobSetsStarted,
  getJobSetsSucceeded,
  getJobSetsFailed
} from './actions'

type JobSetsMetaState = {
  isLoading: boolean,
  loadFailedMessage: string | null,
  deletingJobSetIds: string[],
}
const jobSetsMetaInitialState: JobSetsMetaState = {
  isLoading: false,
  loadFailedMessage: null,
  deletingJobSetIds: []
}

// concurrency problem (if a second getJobSetsSucceeded is sent before the first returns, etc.)
// temporary solution: in the redux-thunk, abort if state isLoading === true
export const jobSetsMetaReducer = createReducer(jobSetsMetaInitialState, (builder) => {
  builder
    .addCase(getJobSetsStarted, (state) => {
      state.isLoading = true
      state.loadFailedMessage = null
    })
    .addCase(getJobSetsSucceeded, (state, action) => {
      state.isLoading = false
      state.loadFailedMessage = null
    })
    .addCase(getJobSetsFailed, (state, action) => {
      state.isLoading = false
      state.loadFailedMessage = action.payload.failedMessage
    })
})
