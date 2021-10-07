import React from 'react'
import { createStore } from 'redux'
import {
  Provider,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import { jobSetEditorReducer } from './jobSetEditorReducer'
import type { JobSetEditorState } from './jobSetEditorReducer'

const jobSetEditorContext = React.createContext<any>(null)

export const useJobSetEditorDispatch = createDispatchHook(jobSetEditorContext)
export const useJobSetEditorSelector = createSelectorHook<JobSetEditorState>(jobSetEditorContext)

const jobSetEditorStore = createStore(jobSetEditorReducer)

export function JobSetEditorProvider({ children }) {
  return (
    <Provider context={jobSetEditorContext} store={jobSetEditorStore}>
      {children}
    </Provider>
  )
}