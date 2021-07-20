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

export const store = createStore(reducer, undefined, applyMiddleware(reduxTakingThunk()))
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
In case of a newly dispatched `TakingTypeAction`:

If store's state of the `name` is not "loading", the `thunk` will execute and store's state will be "loading".

If store's state of the `name` is "loading", see table:


| takeType | `thunk` returns a value | `thunk` returns a Promsie | `thunk` returns a Generator or Async Generator |
| --- | --- | --- | --- |
| leading | Does not execute | :star:Does not execute | :star:Does not execute |
| every | Executes and increments state's counter.<br/>As the function returns immidiately, decrements state's counter | :star:Executes and increments state's counter.<br/>After the promise resolves or rejects, decrements state's counter | Executes and increments state's counter.<br/>After the generator returns, decrements state's counter |
| latest | Does not allow | Does not allow | :star:Executes and changes state's executionId.<br/>By changing the executionId, all other running generators will be discontinued(will not call next()) |

:star:: recommended use case

> if `takeType` does not match the store state, the `thunk` will not be executed.

#### `takeType` "loading"
| takeType | |
| --- | --- |
| leading | The leading promise is not resolved/rejected; or<br/>The leading generator is not finished.
| every | Not all promises are resolved/rejected; or<br/> Not all generators are finished
| latest | The latest generator is not finished (does not care about other generators)

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
`createIsLoadingSelector` creates a selector function of the loading state(see [takeType loading](#takeType-loading)) of the actions identified by `name`.
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
- nanoid

## Credit
Original inspiration comes from [redux-thunk-loading](https://github.com/jeffery021121/redux-thunk-loading).