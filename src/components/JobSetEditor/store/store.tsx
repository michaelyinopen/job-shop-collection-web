import React from 'react'
import { createStore } from 'redux'
import {
  Provider,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import { jobSetEditorReducer } from './jobSetEditorReducer'

const jobSetEditorContext = React.createContext<any>(null)

export const useJobSetEditorDispatch = createDispatchHook(jobSetEditorContext)
export const useJobSetEditorSelector = createSelectorHook(jobSetEditorContext)

const jobSetEditorStore = createStore(jobSetEditorReducer)

export type JobSetEditorState = ReturnType<typeof jobSetEditorStore.getState>

export function JobSetEditorProvider({ children }) {
  return (
    <Provider context={jobSetEditorContext} store={jobSetEditorStore}>
      {children}
    </Provider>
  )
}