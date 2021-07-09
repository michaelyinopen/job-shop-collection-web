import { produce, isDraft, isDraftable, freeze } from "immer"

// initial state does not need to be the same Type
// allow additional parameters
// also wrapped with immer's produce
// input state can be an immer draft
export function createReducer(initialState, handlers) {
  const frozenInitialState = freeze(initialState, true)
  return function reducer(state = frozenInitialState, action, ...args) {
    if (!handlers.hasOwnProperty(action.type)) {
      return state
    }

    if (isDraft(state)) {
      // If state is already a draft. It's safe to just pass the draft to the mutator.
      const result = handlers[action.type](state, action, ...args)

      if (typeof result === 'undefined') {
        return state
      }

      return result
    } else if (!isDraftable(state)) {
      // If state is not draftable (ex: a primitive, such as 0)
      // we will not wrap the reducer with produce.
      const result = handlers[action.type](state, action, ...args)

      if (typeof result === 'undefined') {
        if (state === null) {
          return state
        }
        throw Error(
          'A case reducer on a non-draftable value must not return undefined'
        )
      }

      return result
    } else {
      return produce(state, (draft) => {
        return handlers[action.type](draft, action, ...args)
      })
    }
  }
}