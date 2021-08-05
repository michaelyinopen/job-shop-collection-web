import React from 'react'
import { createStore } from 'redux'
import {
  Provider,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import { jobSetEditorReducer } from './jobSetEditorReducer'

const JobSetEditorContext = React.createContext(null)

export const useJobSetEditorDispatch = createDispatchHook(JobSetEditorContext)
export const useJobSetEditorSelector = createSelectorHook(JobSetEditorContext)

const jobSetEditorStore = createStore(jobSetEditorReducer)

export function JobSetEditorProvider({ children }) {
  return (
    <Provider context={JobSetEditorContext} store={jobSetEditorStore}>
      {children}
    </Provider>
  )
}