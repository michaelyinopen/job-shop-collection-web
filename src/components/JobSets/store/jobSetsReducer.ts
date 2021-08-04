import { createReducer, createSelector } from '@reduxjs/toolkit'
import type { EntityState, EntityId, Dictionary } from '@reduxjs/toolkit'
import { createCustomReducer, backwardCompose } from '../../../utility'
import type { GetJobSetResponse, JobSetHeaderDto } from '../../../api'
import {
  getJobSetsSucceeded,
  getNextJobSetsSucceeded,
  getJobSetSucceeded,
  deleteJobSetSucceeded,
} from './actions'

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
}

const jobSetReducer = createCustomReducer(jobSetInitialState, {
  [getJobSetsSucceeded.type]: (state, _action, jobSetHeaderFromAction: JobSetHeaderDto) => {
    state.id = jobSetHeaderFromAction.id
    state.title = jobSetHeaderFromAction.title ?? null
    state.description = jobSetHeaderFromAction.description ?? null
    state.isLocked = jobSetHeaderFromAction.isLocked
    state.eTag = jobSetHeaderFromAction.eTag ?? null
  },
  [getNextJobSetsSucceeded.type]: (state, _action, jobSetHeaderFromAction: JobSetHeaderDto) => {
    state.id = jobSetHeaderFromAction.id
    state.title = jobSetHeaderFromAction.title ?? null
    state.description = jobSetHeaderFromAction.description ?? null
    state.isLocked = jobSetHeaderFromAction.isLocked
    state.eTag = jobSetHeaderFromAction.eTag ?? null
  },
  [getJobSetSucceeded.type]: (state, action) => {
    const jobSet: GetJobSetResponse = action.payload
    state.id = jobSet.id
    state.title = jobSet.title ?? null
    state.description = jobSet.description ?? null
    state.content = jobSet.content ?? null
    state.jobColors = jobSet.jobColors ?? null
    state.isAutoTimeOptions = jobSet.isAutoTimeOptions
    state.timeOptions = jobSet.timeOptions ?? null
    state.isLocked = jobSet.isLocked
    state.eTag = jobSet.eTag ?? null
  }
})

type JobSetsState = EntityState<JobSetState>

const jobSetsInitialState: JobSetsState = {
  ids: [],
  entities: {},
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
    .addCase(getNextJobSetsSucceeded, (state, action) => {
      const { payload: { jobSetHeaders } } = action

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
        ? [...state.ids, ...jobSetHeaders.map(jsh => jsh.id)]
        : state.ids
    })
    .addCase(deleteJobSetSucceeded, (state, { payload: id }) => {
      const index = state.ids.findIndex(sId => sId === id)
      if (index !== -1) {
        state.ids.splice(index, 1)
        delete state.entities[id]
      }
    })
    .addCase(getJobSetSucceeded, (state, action) => {
      const { payload: jobSet } = action
      const index = state.ids.findIndex(sId => sId === jobSet.id)
      if (index === -1) {
        state.ids.push(jobSet.id)
      }
      state.entities[jobSet.id] = jobSetReducer(
        state.entities[jobSet.id],
        action)
    })
})

export type JobSetHeader = {
  id: number,
  title?: string,
  description?: string,
  isLocked: boolean,
  eTag?: string
}

export const getJobSetsSelectors = (jobSetsSelector: (rootState: any) => JobSetsState) => {
  const jobSetIdsSelector = backwardCompose(
    jobSetsSelector,
    (state: JobSetsState) => state.ids
  )
  const jobSetEntitiesSelector = backwardCompose(
    jobSetsSelector,
    (state: JobSetsState) => state.entities
  )
  const jobSetHeadersSelector = createSelector(
    jobSetIdsSelector,
    jobSetEntitiesSelector,
    (ids: EntityId[], entities: Dictionary<JobSetState>) => {
      return ids.map((id: EntityId) => {
        const entity = entities[id]!
        return {
          id: entity.id,
          title: entity.title,
          description: entity.description,
          isLocked: entity.isLocked,
          eTag: entity.eTag,
        }
      })
    }
  )
  const createJobSetSelector = (id: number) => backwardCompose(
    jobSetEntitiesSelector,
    (entities: Dictionary<JobSetState>) => entities[id]
  )
  return {
    jobSetHeadersSelector,
    createJobSetSelector,
  }
}