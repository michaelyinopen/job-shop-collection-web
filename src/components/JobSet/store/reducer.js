import { combineReducers } from 'redux';
import undoable from 'redux-undo';
import editContentReducer, { editContentInit } from './editContentReducer';
import editStatusReducer, { editStatusInit } from './editStatusReducer';
import { jobSetEditorUpdatingActionsTypes } from '../../../store/currentJobSetAdjustReducer';
import { setCurrentJobSetId } from '../../../store/actionTypes';
import updateObject from '../../../functions/updateObject';
import reduceReducers from 'reduce-reducers';
import { setReadOnly } from './actionTypes';

const savedContentAdjustReducer = (state, action, jobSet) => {
  if (!jobSetEditorUpdatingActionsTypes.includes(action.type) || !jobSet) {
    return state;
  }
  const savedContent = state.editContentHistory.present.editContent;
  return updateObject(state, { savedContent });
};

const savedContentInitialState = null;
const savedContent = (state = savedContentInitialState) => state;

const distinctContent = (_action, currentContentState, previousContentState) => {
  return currentContentState !== previousContentState;
};

const distinctState = (action, currentState, previousState) => {
  if (!currentState || !previousState) {
    return true;
  }
  return distinctContent(action, currentState.editContent, previousState.editContent);
};

const historyStepNameInitialState = "initial";
const historyStepNameEnhancer = (reducer, init) => (state, action, ...rest) => {
  const previousState = state && state.editContent ? state.editContent : init;
  const currentState = reducer(previousState, action, ...rest);
  if (distinctContent(action, currentState, previousState) || action.type === setCurrentJobSetId) {
    return {
      editContent: currentState,
      historyStepName: action && action.type ? action.type : "action without type",
    }
  }
  return state;
};

const loadSaveContentAdjustReducer = (state, action) => {
  if (action.type !== setReadOnly || action.isReadOnly !== true || !state.savedContent) {
    return state;
  }
  const newEditContentHistory = undoable(
    historyStepNameEnhancer(
      () => state.savedContent,
      editContentInit()
    )
  )(state.editContentHistory, action)
  return updateObject(state, { editContentHistory: newEditContentHistory });
};

const initEditContentHistory = contentPresent => ({
  past: [],
  present: contentPresent,
  future: []
});

export const init = ({
  readOnly,
  jobSet,
} = {}) => {
  const initialEditContent = editContentInit(jobSet);
  return {
    editStatus: editStatusInit(readOnly),
    editContentHistory: initEditContentHistory({
      historyStepName: historyStepNameInitialState,
      editContent: initialEditContent
    }),
    savedContent: initialEditContent,
  };
};

const reducer = (state, action, ...rest) => reduceReducers(
  combineReducers({
    editStatus: editStatusReducer,
    editContentHistory: undoable(
      (state, action) => historyStepNameEnhancer(
        editContentReducer,
        editContentInit()
      )(state, action, ...rest),// bypass combineReducers and undoable to pass in ...rest
      {
        filter: distinctState,
        initTypes: [setCurrentJobSetId]
      }
    ),
    savedContent,
  }),
  savedContentAdjustReducer,
  loadSaveContentAdjustReducer
)(state, action, ...rest);

export const editStatusSelector = state => state.editStatus;
export const editContentSelector = state => state.editContentHistory.editContent;// todo change

export default reducer;