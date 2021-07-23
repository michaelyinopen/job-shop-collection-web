

import {
  configureStore,
  createImmutableStateInvariantMiddleware,
  createSerializableStateInvariantMiddleware,
} from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createReduxTakingThunkMiddleware } from '../'
import {
  reducer,
  actionTypes,
  api,
} from './testUtilities'

let store

beforeEach(() => {
  store = configureStore({
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
})

test('takeLatest can dispatch Generator function thunk', async () => {
  const takingThunkAction = {
    name: 'fetchTodos',
    takeType: 'every',
    thunk: function* (dispatch) {
      const newTodos = yield api.get_AB_oneSecond()
      dispatch({ type: actionTypes.todoSetAll, payload: newTodos })
    }
  }
  await store.dispatch(takingThunkAction)

  expect(store.getState().todo.items).toEqual(['Alfa', 'Bravo'])
})

// todo move the the one that is special for every
// test("default takeType is 'every'", async () => {
//   const takingThunkAction = {
//     name: 'fetchTodos',
//     thunk: async function (dispatch) {
//       const newTodos = await api.get_AB_oneSecond()
//       dispatch({ type: 'fetchTodoSuccess', todos: newTodos })
//     }
//   }
//   await store.dispatch(takingThunkAction)

//   expect(store.getState().todo.items).toEqual(['Alfa', 'Bravo'])
// })