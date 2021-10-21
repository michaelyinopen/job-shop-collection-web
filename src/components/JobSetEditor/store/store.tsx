import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import {
  Provider,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import { jobSetEditorReducer } from './jobSetEditorReducer'
import type { JobSetEditorState } from './jobSetEditorReducer'
import { editHistoryMiddleware } from './editHistory'
import { autoTimeOptionsMiddleware } from './autoTimeOptionsMiddleware'
import { validationMiddleware } from './validation'

const jobSetEditorContext = React.createContext<any>(null)

export const useJobSetEditorDispatch = createDispatchHook(jobSetEditorContext)
export const useJobSetEditorSelector = createSelectorHook<JobSetEditorState>(jobSetEditorContext)

const jobSetEditorStore = createStore(
  jobSetEditorReducer,
  applyMiddleware(
    editHistoryMiddleware,
    autoTimeOptionsMiddleware,
    validationMiddleware,
  )
)

export function JobSetEditorProvider({ children }) {
  return (
    <Provider context={jobSetEditorContext} store={jobSetEditorStore}>
      {children}
    </Provider>
  )
}