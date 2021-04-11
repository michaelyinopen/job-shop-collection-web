import React, { useReducer } from 'react';
import reducer, { initialState } from '../store/reducer';
import JobShopCollectionDispatchContext from './JobShopCollectionDispatchContext';
import JobShopCollectionStateContext from './JobShopCollectionStateContext';
import JobShopCollectionMainStateContext from './JobShopCollectionMainStateContext';
import { useJobShopCollectionMain } from '../store/useSelectors';

const JobShopCollection = ({
  children
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mainState = useJobShopCollectionMain(state);
  return (
    <JobShopCollectionDispatchContext.Provider value={dispatch}>
      <JobShopCollectionStateContext.Provider value={state}>
        <JobShopCollectionMainStateContext.Provider value={mainState}>
          {children}
        </JobShopCollectionMainStateContext.Provider>
      </JobShopCollectionStateContext.Provider>
    </JobShopCollectionDispatchContext.Provider>
  );
};

export default JobShopCollection;