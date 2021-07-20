# redux-taking-thunk

## Motivation
Get the loading state of a promise thunk.
## Setup
1. Add the reducer
```
import { combineReducers } from 'redux'
import { reduxTakingThunkReducer } from '../utility/redux-taking-thunk'

export const reducer = combineReducers({
  other: otherReducer,
  reduxTakingThunk: reduxTakingThunkReducer
})
```

2. Add the middleware
```
// without Redux Toolkit
import { createStore, applyMiddleware } from 'redux'
import { reducer } from './reducer'
import { reduxTakingThunk } from '../utility/redux-taking-thunk'

export const store = createStore(reducer, undefined, applyMiddleware(logger))
```
```
// with Redux Toolkit
import { configureStore } from '@reduxjs/toolkit'
import { reducer } from './reducer'
import { reduxTakingThunk } from '../utility/redux-taking-thunk'

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(reduxTakingThunk()),
})
```
```
// extraArgument
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(reduxTakingThunk("some extra argument passed to thunk")),
})
```

> Note about `redux-thunk`\
> The `redux-taking-thunk` middleware only handles the dispatch of a `TakingTypeAction`, and does not handle dispatch of a function, therefore does not interfere with `redux-thunk`.

## Dispatch API
Adds a `dispatch` overload that accepts a `TakingTypeAction` object as parameter and returns a Promise.

```
dispatch(a: TakingThunkAction) => Promise<any>
```

```
const takingThunkAction = {
  name: 'fetchTodos',
  takeType: 'latest'
  thunk: function*(dispatch){
    try {
      const response = yield fetch('http://example.com/todos.json')
      dispatch({type: 'fetchTodoSuccess', todos: response.json()})
    } catch(e) {
      dispatch({type: 'fetchTodoError', error: 'failed to fetch todos'})
    }
  }
}
dispatch(takingThunkAction)
```

### `TakingTypeAction` Properties
- `name`\
identifies the action, used to get the loading state
- `takeType`\
'every'(default), 'leading', or 'latest'
- `thunk`\
a function

### `takeType`
// Mixed takeType will take leading
#### `takeType` isLoading

### `thunk`
`thunk` can be
- a normal function (but no need to use this library),
- a function that returns a promise(async function),
- a generator function, or
- an async generator function

`thunk` Parameters
- `dispatch`
- `getState`
- `extraArgument` the argument passed in the middleware

### `thunk` return value
- If the `thunk` is a generator function or an async generator function, and the execution did not finish (because another `takeLatest` action with same name is dispatched), `dispatch` will return a resolved Promise with value undefined.

- If `thunk`'s return value is a promise, `dispatch` will return a promise with the same resolved or rejected value.

- If `thunk`'s return value is not a promise, `dispatch` will return a promise with the same resolved or rejected value.

### `dispatch` Return value
This `dispatch` overload returns a Promise. (see [thunk return value](#thunk-return-value))\
E.g. call `then` on the returned Promise.
```
dispatch(takingThunkAction).then(() => alert('got todos!!'))
```

## `createIsLoadingSelector` API
`createIsLoadingSelector` creates a selector function of the loading state(see [takeType isLoading](#takeType-isLoading)) of the actions identified by `name`.
```
import { createIsLoadingSelector } from '../utility/redux-taking-thunk'

const isLoadingSelector = createIsLoadingSelector(name)
const isLoading = isLoadingSelector(state)
```

## With Typescript and Redux Toolkit
Type benefits when used with Typescript and Redux Toolkit.
- Type hint of the `dispatch` overload
```
// in store.ts
export type AppDispatch = typeof store.dispatch

// in component
  const dispatch = useAppDispatch()
  dispatch(
```
- Type safety when adding middleware, if you forgot to add the reducer
```
// in store.ts
export const store = configureStore({
  reducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(reduxThunkLoading()),
  // eslint errors: ... The types returned by 'slice(...)' are incompatible between these types....
})
```

## Depenedencies
- immer
- redux

## Credit
Original inspiration comes from [redux-thunk-loading](https://github.com/jeffery021121/redux-thunk-loading).