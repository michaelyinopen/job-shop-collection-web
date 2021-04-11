import { useState, useCallback, useEffect } from 'react';
import useDebounced from './useDebounced';

//param1 = storeState
//param1 = setStoreState
//param2 = wait
//param3 = options? {leading, trailing, wait, maxWait, trailing, flushOnUnmount = false, cancelOnUnmount = true, pendingStateChange = true}
//returns [localValue, onChangeCallback]
// setStateCallback will update local state immidiately, but delay updating StoreState

const useDebouncedValue = (
  state,
  setState,
  wait,
  options
) =>{
  const [value, setValue] = useState(state);
  const [setValueDebouncedCallback, pendingState] = useDebounced(
    setState,
    wait,
    options
  );
  const onChangeCallback = useCallback(
    event => {
      setValueDebouncedCallback(event.target.value);
      setValue(event.target.value);
    },
    [setValueDebouncedCallback]
  );
  const isValueSameAsState = state === value;
  useEffect(
    () => {
      if (!pendingState && !isValueSameAsState) {
        setValue(state)
      }
    },
    [state, pendingState, isValueSameAsState]
  );
  return [value, onChangeCallback];
};

export default useDebouncedValue;

