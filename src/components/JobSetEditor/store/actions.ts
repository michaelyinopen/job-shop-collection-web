import { createAction } from '@reduxjs/toolkit'
import type { JobSetDetail } from '../../JobSets'

export const resetJobSetEditor = createAction('jobSetEditor/resetJobSetEditor')
export const setJobSetEditorId = createAction<number>('jobSetEditor/setJobSetEditorId')
export const setJobSetEditorIsEdit = createAction<boolean>('jobSetEditor/setJobSetEditorIsEdit')
export const loadedJobSet = createAction('jobSetEditor/loadedJobSet')
export const failedToLoadJobSet = createAction('jobSetEditor/failedToLoadJobSet')

export const setJobSetFromAppStore = createAction(
  'jobSetEditor/setJobSetFromAppStore',
  (jobSet: JobSetDetail | undefined) => ({
    payload: {
      jobSet
    }
  })
)

export const changeTitle = createAction<string>('jobSetEditor/changeTitle')
export const focusTitle = createAction('jobSetEditor/focusTitle')

export const changeDescription = createAction<string>('jobSetEditor/changeDescription')
export const focusDescription = createAction('jobSetEditor/focusDescription')