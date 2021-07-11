import { createReducer } from '@reduxjs/toolkit'
import type { EntityState } from '@reduxjs/toolkit'
import { getJobSetsSucceeded } from './actions'
import { createCustomReducer } from '../../../utility'
import type { JobSetHeaderDto } from '../../../api'

type JobSetState = {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  jobColors: string | null;
  isAutoTimeOptions: boolean;
  timeOptions: string | null;
  isLocked: boolean;
  eTag: string | null;
  isLoading: boolean;
  loadFailedMessage: string | null;
  isUpdating: boolean;
  updateFailedMessage: string | null;
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

const jobSetsInitialState: EntityState<JobSetState> = {
  ids: [],
  entities: {}
}

export const jobSetsReducer = createReducer(jobSetsInitialState, (builder) => {
  builder
    .addCase(getJobSetsSucceeded, (state, action) => {
      const { payload: { jobSetHeaders } } = action

      const toRemoveIds = state.ids.filter(sId => !jobSetHeaders.some(jsh => jsh.id === sId))
      const hasRemoved = toRemoveIds.length > 0
      for (const removeId of toRemoveIds) {
        delete state.entities[removeId]
      }

      let hasCreated = false
      for (const jobSetHeader of jobSetHeaders) {
        if (!(jobSetHeader.id in state.entities)) {
          hasCreated = true
        }
        const newEntity = jobSetReducer(
          state.entities[jobSetHeader.id],
          action,
          jobSetHeader)
        state.entities[jobSetHeader.id] = newEntity
      }
      
      state.ids = hasCreated
        ? jobSetHeaders.map(jsh => jsh.id)
        : hasRemoved
          ? state.ids.filter((id) => id in state.entities)
          : state.ids
    })
})
