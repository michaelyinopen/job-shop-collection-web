import { createReducer, createEntityAdapter } from '@reduxjs/toolkit'
import {
  getJobSetsStarted,
  getJobSetsSucceeded,
  getJobSetsFailed
} from './actions'
import { createCustomReducer } from '../../../utility'
import type { JobSetHeaderDto } from '../../../api'

//#region JobSetsMeta
type JobSetsMetaState = {
  isLoading: boolean,
  loadFailedMessage: string | null,
  deletingJobSetIds: string[],
}
const jobSetMetaInitialState: JobSetsMetaState = {
  isLoading: false,
  loadFailedMessage: null,
  deletingJobSetIds: []
}

// concurrency problem (if a second getJobSetsSucceeded is sent before the first returns, etc.)
// temporary solution: in the redux-thunk, abort if state isLoading === true
const jobSetMetaReducer = createReducer(jobSetMetaInitialState, (builder) => {
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
//#endregion JobSetsMeta

//#region JobSets
type JobSetState = {
  id: number,
  title: string,
  description: string | null,
  content: string | null,
  jobColors: string | null,
  isAutoTimeOptions: boolean,
  timeOptions: string | null,
  isLocked: boolean,
  eTag: string | null,
  isLoading: boolean,
  loadFailedMessage: string | null,
  isUpdating: boolean,
  updateFailedMessage: string | null,
}

const jobSetInitialState: Partial<JobSetState> = {
  id: undefined,
  title: undefined,
  description: null,
  content: null,
  jobColors: null,
  isAutoTimeOptions: false,
  timeOptions: null,
  isLocked: undefined,
  eTag: undefined,
  isLoading: false,
  loadFailedMessage: null,
  isUpdating: false,
  updateFailedMessage: null,
}

const jobSetReducer = createCustomReducer(jobSetInitialState, {
  [getJobSetsSucceeded.type]: (state, _action, jobSetHeaderFromAction: JobSetHeaderDto) => {
    state.id = jobSetHeaderFromAction.id
    state.title = jobSetHeaderFromAction.title ?? null
    state.description = jobSetHeaderFromAction.description ?? null
    state.isLocked = jobSetHeaderFromAction.isLocked
    state.eTag = jobSetHeaderFromAction.eTag ?? null
  }
})

const jobSetsAdapter = createEntityAdapter<JobSetState>()

const jobSetsReducer = createReducer(jobSetsAdapter.getInitialState(), (builder) => {
  builder
    .addCase(getJobSetsSucceeded, (state, action) => {
      const { payload: { jobSetHeaders } } = action
      const toRemoveIds = state.ids.filter(sId => jobSetHeaders.some(jsh => jsh.id === sId))
      jobSetsAdapter.removeMany(state, toRemoveIds)

      const toMergeJobSets: JobSetState[] = jobSetHeaders.map(jsh => {
        // do not need previous state, because upsertMany will merge with previous
        return jobSetReducer(undefined, action, jsh)
      })
      jobSetsAdapter.upsertMany(state, toMergeJobSets)
    })
})
//#region JobSets