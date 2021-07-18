import {
  takeEvery_Add,
  takeEvery_Remove,
  takeLatest_Destroy,
  takeLatest_SetLatestHandlerNumber,
  takeLeading_End,
  takeLeading_Start
} from './actions'
import {
  createLatestExecutionNumberSelector,
  createIsLoadingSelector
} from './reducer'

import type { AnyAction, Dispatch } from 'redux'
import type {
  LoadingThunkAction,
  LoadingThunkTakeLatest,
  LoadingThunkTakeLeadingOrEvery,
  StateWithReduxThunkLoading,
  TakeType
} from './types'

const defaultTakeType = "every" as const

type RunTakeLeadingOrEveryArg<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = LoadingThunkTakeLeadingOrEvery<TState, TExtraThunkArg> & {
    dispatch: Dispatch<AnyAction>,
    getState: () => TState,
    extraArgument?: TExtraThunkArg
  }

async function runGenerator(generator: Generator): Promise<any> {
  let iteratorResult
  try {
    iteratorResult = generator.next()
    while (!iteratorResult.done) {
      let awaitValue: unknown
      let [hasAwaitError, awaitError]: [boolean, any] = [false, undefined]

      try {
        awaitValue = await iteratorResult.value
      }
      catch (e) {
        [hasAwaitError, awaitError] = [true, e]
      }
      if (hasAwaitError) {
        iteratorResult = generator.throw(awaitError)
      } else {
        iteratorResult = generator.next(awaitValue)
      }
    }
  }
  finally {
    return iteratorResult?.value
  }
}

export async function runTakeLeadingOrEvery<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(runTakeLatestArg: RunTakeLeadingOrEveryArg<TState, TExtraThunkArg>) {
  const takeType = runTakeLatestArg.takeType ?? defaultTakeType
  const {
    dispatch,
    getState,
    extraArgument,
    name,
    thunk
  } = runTakeLatestArg

  const isLoadingSelector = createIsLoadingSelector(name)
  const isLoading = isLoadingSelector(getState())

  if (takeType === "leading" && isLoading) {
    return
  } else if (takeType === "leading" && !isLoading) {
    dispatch(takeLeading_Start(name))
  } else if (takeType === "every") {
    dispatch(takeEvery_Add(name))
  }

  try {
    const thunkResult = thunk(dispatch, getState, extraArgument)
    if (isGenerator(thunkResult)) {
      return await runGenerator(thunkResult)
    } else {
      return await thunkResult
    }
  }
  finally {
    if (takeType === "leading") {
      dispatch(takeLeading_End(name))
    } else if (takeType === "every") {
      dispatch(takeEvery_Remove(name))
    }
  }
}

type RunTakeLatestArg<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
  > = LoadingThunkTakeLatest<TState, TExtraThunkArg> & {
    dispatch: Dispatch<AnyAction>,
    getState: () => TState,
    extraArgument?: TExtraThunkArg
  }

export async function runTakeLatest<
  TState extends StateWithReduxThunkLoading,
  TExtraThunkArg = undefined
>(runTakeLatestArg: RunTakeLatestArg<TState, TExtraThunkArg>) {
  const {
    dispatch,
    getState,
    extraArgument,
    name,
    thunk
  } = runTakeLatestArg

  const generator = thunk(dispatch, getState, extraArgument)

  const latestExecutionNumberSelector = createLatestExecutionNumberSelector(name)

  const executionNumber = function createNewExecutionNumber(): number {
    // returns 1, or state's executionNumber + 1
    const latestExecutionNumber = latestExecutionNumberSelector(getState())
    return (latestExecutionNumber ?? 0) + 1
  }()

  dispatch(takeLatest_SetLatestHandlerNumber(name, executionNumber))

  function getIsExecutionNumberLatest(): boolean {
    // captures executionNumber, latestExecutionNumberSelector, (name), and getState
    const latestExecutionNumber = latestExecutionNumberSelector(getState())
    return latestExecutionNumber === executionNumber
  }

  let iteratorResult
  try {
    iteratorResult = generator.next()
    while (!iteratorResult.done) {
      let awaitValue: unknown
      let [hasAwaitError, awaitError]: [boolean, any] = [false, undefined]

      try {
        awaitValue = await iteratorResult.value
      }
      catch (e) {
        [hasAwaitError, awaitError] = [true, e]
      }

      if (!getIsExecutionNumberLatest()) {
        iteratorResult = generator.return(undefined)
      } else if (hasAwaitError) {
        iteratorResult = generator.throw(awaitError)
      } else {
        iteratorResult = generator.next(awaitValue)
      }
    }
  }
  finally {
    if (getIsExecutionNumberLatest()) {
      dispatch(takeLatest_Destroy(name))
    }
    return iteratorResult?.value
  }
}

function isGenerator(obj) {
  return obj
    && 'function' == typeof obj.next
    && 'function' == typeof obj.throw
    && 'function' == typeof obj.return
}
