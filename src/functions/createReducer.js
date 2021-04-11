
export default function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action, ...args) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action, ...args);
    } else {
      return state;
    }
  };
}