import { createReducer, createSelector } from '@reduxjs/toolkit'
import { backwardCompose } from '../../../utility'
import {
  resetJobSetEditor,
  setJobSetEditorId,
  setJobSetEditorIsEdit,
  loadedJobSet,
  failedToLoadJobSet,
  setJobSetFromAppStore,
} from './actions'

type JobSetEditorState = {
  id?: number
  isEdit: boolean
  loaded: boolean
  setFromAppStore: boolean
  failedToLoad: boolean
  jobSet: any //todo
}

const jobSetEditorInitialState: JobSetEditorState = {
  id: undefined,
  isEdit: false,
  loaded: false,
  setFromAppStore: false,
  failedToLoad: false,
  jobSet: undefined,//todo
}

export const jobSetEditorReducer = createReducer(jobSetEditorInitialState, (builder) => {
  builder
    .addCase(resetJobSetEditor, (state) => {
      state.id = undefined
      state.isEdit = false
      state.loaded = false
      state.setFromAppStore = false
      state.failedToLoad = false
    })
    .addCase(setJobSetEditorId, (state, { payload: id }) => {
      state.id = id
    })
    .addCase(setJobSetEditorIsEdit, (state, { payload: isEdit }) => {
      state.isEdit = isEdit
    })
    .addCase(loadedJobSet, (state) => {
      state.loaded = true
      state.failedToLoad = false
    })
    .addCase(failedToLoadJobSet, (state) => {
      state.loaded = false
      state.failedToLoad = true
    })
    .addCase(setJobSetFromAppStore, (state, { payload: jobSet }) => {
      if (!state.loaded){
        return
      }
      state.jobSet = jobSet //todo remove
    })
})

export const jobSetsEditorIsEditSelector = (state: JobSetEditorState) => state.isEdit
export const jobSetsEditorLoadedSelector = (state: JobSetEditorState) => state.loaded
export const jobSetsEditorFailedToLoadSelector = (state: JobSetEditorState) => state.failedToLoad
export const jobSetsEditorJobSetSelector = (state: JobSetEditorState) => state.jobSet //todo
