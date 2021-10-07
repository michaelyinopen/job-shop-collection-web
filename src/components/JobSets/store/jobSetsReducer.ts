import { createReducer, createSelector } from '@reduxjs/toolkit'
import type { EntityState, EntityId, Dictionary } from '@reduxjs/toolkit'
import { createCustomReducer, backwardCompose } from '../../../utility'
import type { GetJobSetResponse, JobSetHeaderDto } from '../../../api'
import {
  getJobSetsSucceeded,
  getNextJobSetsSucceeded,
  fetchedJobSet,
  deleteJobSetSucceeded,
} from './actions'

type JobSetState = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  jobColors?: string;
  isAutoTimeOptions: boolean;
  timeOptions?: string;
  isLocked: boolean;
  versionToken: string;
  // hasDetail === false if never getJobSet(with content)
  // or getJobSets returned with versionToken different from last getJobSet(with content)
  hasDetail: boolean;
}

const jobSetInitialState: Partial<JobSetState> = {
  id: undefined,
  title: undefined,
  description: undefined,
  content: undefined,
  jobColors: undefined,
  isAutoTimeOptions: false,
  timeOptions: undefined,
  isLocked: undefined,
  versionToken: undefined,
  hasDetail: false,
}

const jobSetReducer = createCustomReducer(jobSetInitialState, {
  [getJobSetsSucceeded.type]: (state, _action, jobSetHeaderFromAction: JobSetHeaderDto) => {
    state.id = jobSetHeaderFromAction.id
    state.title = jobSetHeaderFromAction.title
    state.description = jobSetHeaderFromAction.description ?? undefined
    state.isLocked = jobSetHeaderFromAction.isLocked
    if (state.hasDetail && state.versionToken !== jobSetHeaderFromAction.versionToken) {
      state.hasDetail = false
      state.content = jobSetInitialState.content
      state.jobColors = jobSetInitialState.jobColors
      state.isAutoTimeOptions = jobSetInitialState.isAutoTimeOptions
      state.timeOptions = jobSetInitialState.timeOptions
    }
    state.versionToken = jobSetHeaderFromAction.versionToken
  },
  [getNextJobSetsSucceeded.type]: (state, _action, jobSetHeaderFromAction: JobSetHeaderDto) => {
    state.id = jobSetHeaderFromAction.id
    state.title = jobSetHeaderFromAction.title
    state.description = jobSetHeaderFromAction.description ?? undefined
    state.isLocked = jobSetHeaderFromAction.isLocked
    if (state.hasDetail && state.versionToken !== jobSetHeaderFromAction.versionToken) {
      state.hasDetail = false
      state.content = jobSetInitialState.content
      state.jobColors = jobSetInitialState.jobColors
      state.isAutoTimeOptions = jobSetInitialState.isAutoTimeOptions
      state.timeOptions = jobSetInitialState.timeOptions
    }
    state.versionToken = jobSetHeaderFromAction.versionToken
  },
  [fetchedJobSet.type]: (state, action) => {
    const jobSet: GetJobSetResponse = action.payload
    state.id = jobSet.id
    state.title = jobSet.title
    state.description = jobSet.description ?? undefined
    state.content = jobSet.content ?? undefined
    state.jobColors = jobSet.jobColors ?? undefined
    state.isAutoTimeOptions = jobSet.isAutoTimeOptions
    state.timeOptions = jobSet.timeOptions ?? undefined
    state.isLocked = jobSet.isLocked
    state.versionToken = jobSet.versionToken
    state.hasDetail = true
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
    .addCase(fetchedJobSet, (state, action) => {
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
  versionToken: string
}

export type JobSetDetail = JobSetState

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
          versionToken: entity.versionToken,
        }
      })
    }
  )
  const createJobSetSelector = (id?: number) => backwardCompose(
    jobSetEntitiesSelector,
    (entities: Dictionary<JobSetState>) => id !== undefined ? entities[id] as JobSetDetail : undefined
  )
  return {
    jobSetHeadersSelector,
    createJobSetSelector,
  }
}