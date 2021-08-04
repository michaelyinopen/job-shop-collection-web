import { createReducer, createSelector } from '@reduxjs/toolkit'

type JobSetEditorState = {
  id?: number;
}

const JobSetEditorInitialState: JobSetEditorState = {
  id: undefined
}

export const jobSetEditorReducer = createReducer(JobSetEditorInitialState, {

})