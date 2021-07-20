import { configureStore } from '@reduxjs/toolkit'
import { reducer } from './reducer'
import { reduxTakingThunk } from '../utility/redux-taking-thunk'

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(reduxTakingThunk()),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>