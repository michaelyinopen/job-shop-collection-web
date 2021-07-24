
import {
  configureStore,
  createImmutableStateInvariantMiddleware,
  createSerializableStateInvariantMiddleware,
} from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createReduxTakingThunkMiddleware } from '../utility/redux-taking-thunk'
import type { TakingThunkAction } from '../utility/redux-taking-thunk'
import { reducer } from './reducer'

export const store = configureStore({
  reducer,
  middleware: process.env.NODE_ENV !== 'production'
    ? [
      thunkMiddleware,
      createReduxTakingThunkMiddleware(),
      createImmutableStateInvariantMiddleware(),
      createSerializableStateInvariantMiddleware()
    ]
    : [
      thunkMiddleware,
      createReduxTakingThunkMiddleware(),
    ],
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppTakingThunkAction = TakingThunkAction<RootState>