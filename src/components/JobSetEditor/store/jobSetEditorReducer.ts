import {
  combineReducers,
  createReducer,
} from '@reduxjs/toolkit'
import type { JobSetEditorState } from './store'
import {
  resetJobSetEditor,
  setJobSetEditorId,
  setJobSetEditorIsEdit,
  loadedJobSet,
  failedToLoadJobSet,
  setJobSetFromAppStore,
} from './actions'
import { formDataReducer } from './formDataReducer'
import { touchedReducer } from './touchedReducer'

type JobSetEditorControlState = {
  id?: number
  isEdit: boolean
  loaded: boolean
  setFromAppStore: boolean
  failedToLoad: boolean
  jobSet: any //todo
}

const jobSetEditorControlInitialState: JobSetEditorControlState = {
  id: undefined,
  isEdit: false,
  loaded: false,
  setFromAppStore: false,
  failedToLoad: false,
  jobSet: undefined, //todo
}

const jobSetEditorControlReducer = createReducer(jobSetEditorControlInitialState, (builder) => {
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
      if (!state.loaded) {
        return
      }
      // todo implement
      // state.jobSet = jobSet //todo remove
    })
})

export const jobSetEditorReducer = combineReducers({
  control: jobSetEditorControlReducer,
  formData: formDataReducer,
  touched: touchedReducer,
})

export const jobSetsEditorIsEditSelector = (state: JobSetEditorState) => state.control.isEdit
export const jobSetsEditorLoadedSelector = (state: JobSetEditorState) => state.control.loaded
export const jobSetsEditorFailedToLoadSelector = (state: JobSetEditorState) => state.control.failedToLoad
export const jobSetsEditorJobSetSelector = (state: JobSetEditorState) => state //todo

export const jobSetsEditorFormDataSelector = (state: JobSetEditorState) => state.formData
export const jobSetsEditorTouchedSelector = (state: JobSetEditorState) => state.touched
