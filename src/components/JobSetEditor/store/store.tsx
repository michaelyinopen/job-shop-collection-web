import { createContext } from 'react'
import {
  configureStore,
} from '@reduxjs/toolkit'
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

const jobSetEditorContext = createContext<any>(null)

export const useJobSetEditorDispatch = createDispatchHook(jobSetEditorContext)
export const useJobSetEditorSelector = createSelectorHook<JobSetEditorState>(jobSetEditorContext)

const jobSetEditorStore = configureStore({
  reducer: jobSetEditorReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(editHistoryMiddleware)
    .concat(autoTimeOptionsMiddleware)
    .concat(validationMiddleware),
  devTools: { name: 'editor' }
})

export function JobSetEditorProvider({ children }) {
  return (
    <Provider context={jobSetEditorContext} store={jobSetEditorStore}>
      {children}
    </Provider>
  )
}