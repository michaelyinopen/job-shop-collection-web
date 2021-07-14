import { loadingCo } from './loadingCo'

type TakeType = "leading" | "every" | "latest"

type LoadingThunkTakeLeadingOrEvery = {
  name: string,
  takeType: "leading" | "every"
  thunk: () => void // any function
}

type LoadingThunkTakeLatest = {
  name: string,
  takeType: "latest"
  thunk: () => Generator // must be generator function
}

type LoadingThunk = LoadingThunkTakeLatest | LoadingThunkTakeLeadingOrEvery

function isLoadingThunk(action): action is LoadingThunk {
  const loadingThunk = action as LoadingThunk
  return loadingThunk.name !== undefined
    && loadingThunk.takeType !== undefined
    && loadingThunk.thunk !== undefined
}

const handleAction = async ({ thunk, name, takeType }, store, dispatch) => {
  if (name) {
    dispatch({ type: SHOW, payload: { name } })

    return loadingCol({
      action: { thunk, name, takeType },
      store,
      callback: () => {
        dispatch({ type: HIDE, payload: { name } })
      },
    })
  }
  return loadingCol({
    action: { thunk },
    store,
    callback: () => {
      dispatch({ type: HIDE, payload: { name } })
    },
  })
}

export const reduxThunkLoading = store => next => async (action, config = {}) => {
  const { dispatch } = store
  if (action && typeof action === 'function') {
    const { name, takeType } = config
    return handleAction({ name, takeType, thunk: action }, store, dispatch)
  }
  if (action && action.thunk && !action.type) {
    // action: { name, thunk, takeType }

    return handleAction(action, store, dispatch)
  }
  next(action);
}