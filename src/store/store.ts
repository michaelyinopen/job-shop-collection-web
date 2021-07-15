import { configureStore } from '@reduxjs/toolkit'
import { reducer } from './reducer'
import { reduxThunkLoading } from '../utility/redux-thunk-loading'

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(reduxThunkLoading()),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>