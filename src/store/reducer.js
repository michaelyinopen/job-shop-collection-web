import { combineReducers } from 'redux';
import createReducer from '../functions/createReducer';
import {
  showSnackbar,
  closeSnackbar,

  getJobSetsBegin,
  getJobSetsSucceed,
  getJobSetsFailed,

  deleteJobSetBegin,
  deleteJobSetSucceed,
  deleteJobSetFailed,
  clearDeletingJobSets,

  getJobSetBegin,
  getJobSetSucceed,
  getJobSetFailed,

  createJobSetSucceed,

  updateJobSetBegin,
  updateJobSetSucceed,
  updateJobSetFailed,
} from './actionTypes';
import {
  jobSetEditorReducer,
  jobSetEditorInit,
} from '../components/JobSet';
import updateObject from '../functions/updateObject';
import updateKeyInObject from '../functions/updateKeyInObject';
import reduceReducers from 'reduce-reducers';
import currentJobSetAdjustReducer from './currentJobSetAdjustReducer';
import { setCurrentJobSetId } from './actionTypes';

const snackbarInitialState = {
  isOpen: false,
  message: undefined
};
const snackbar = createReducer(
  snackbarInitialState,
  {
    [showSnackbar]: (_state, { message }) => ({ isOpen: true, message }),
    [closeSnackbar]: (_state, _action) => ({ isOpen: false, message: undefined }),
  }
);

const getJobSetsIsLoadingInitialState = false;
const getJobSetsIsLoading = createReducer(
  getJobSetsIsLoadingInitialState,
  {
    [getJobSetsBegin]: (_state, _action) => true,
    [getJobSetsSucceed]: (_state, _action) => false,
    [getJobSetsFailed]: (_state, _action) => false,
  }
);

const getJobSetsFailedMessageInitialState = null;
const getJobSetsFailedMessage = createReducer(
  getJobSetsFailedMessageInitialState,
  {
    [getJobSetsBegin]: (_state, _action) => null,
    [getJobSetsSucceed]: (_state, _action) => null,
    [getJobSetsFailed]: (_state, { failedMessage }) => failedMessage,
  }
);

const jobSetInitialState = {
  id: undefined,
  title: undefined,
  description: undefined,
  content: undefined,
  jobColors: undefined,
  isAutoTimeOptions: undefined,
  timeOptions: undefined,
  isLocked: false,
  eTag: undefined,
  isLoading: false,
  loadFailedMessage: null,
  isUpdating: false,
  updateFailedMessage: null,
};
const jobSet = createReducer(
  jobSetInitialState,
  {
    [getJobSetsSucceed]: (state, _action, jobSetFromAction) => ({
      ...state,
      id: jobSetFromAction.id,
      title: jobSetFromAction.title,
      description: jobSetFromAction.description,
      isLocked: jobSetFromAction.isLocked,
      eTag: jobSetFromAction.eTag
    }),
    [getJobSetBegin]: (state, action) => updateObject(state, { id: action.id, isLoading: true, loadFailedMessage: null }),
    [getJobSetSucceed]: (state, action) => updateObject(
      state,
      {
        id: action.id,
        title: action.title,
        description: action.description,
        content: action.content,
        jobColors: action.jobColors,
        isAutoTimeOptions: action.isAutoTimeOptions,
        timeOptions: action.timeOptions,
        isLocked: action.isLocked,
        eTag: action.eTag,
        isLoading: false,
        loadFailedMessage: null
      }
    ),
    [getJobSetFailed]: (state, action) => updateObject(state, { id: action.id, isLoading: false, loadFailedMessage: action.failedMessage }),
    [createJobSetSucceed]: (state, action) => updateObject(
      state,
      {
        id: action.id,
        title: action.title,
        description: action.description,
        content: action.content,
        jobColors: action.jobColors,
        isAutoTimeOptions: action.isAutoTimeOptions,
        timeOptions: action.timeOptions,
        isLocked: action.isLocked,
        eTag: action.eTag,
      }
    ),
    [updateJobSetBegin]: (state, action) => updateObject(state, { id: action.id, isUpdating: true, updateFailedMessage: null }),
    [updateJobSetSucceed]: (state, action) => updateObject(
      state,
      {
        id: action.id,
        title: action.title,
        description: action.description,
        content: action.content,
        jobColors: action.jobColors,
        isAutoTimeOptions: action.isAutoTimeOptions,
        timeOptions: action.timeOptions,
        isLocked: action.isLocked,
        eTag: action.eTag,
        isUpdating: false,
        updateFailedMessage: null
      }
    ),
    [updateJobSetFailed]: (state, action) => updateObject(state, { id: action.id, isUpdating: false, updateFailedMessage: action.failedMessage }),
  }
);

const jobSetsInitialState = {}
const jobSets = createReducer(
  jobSetsInitialState,
  {
    [getJobSetsSucceed]: (state, action) => {
      return action.jobSets.reduce((newState, js) => {
        const oldJobSet = state[js.id];
        if (oldJobSet && oldJobSet.eTag === js.eTag) {
          newState[js.id] = oldJobSet;
        }
        else {
          newState[js.id] = jobSet(undefined, action, js);
        }
        return newState;
      }, {});
    },
    [getJobSetBegin]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [getJobSetSucceed]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [getJobSetFailed]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [createJobSetSucceed]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [updateJobSetBegin]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [updateJobSetSucceed]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
    [updateJobSetFailed]: (state, action) => updateKeyInObject(state, action.id, js => jobSet(js, action)),
  }
);

const deletingJobSetInitialState = {
  id: undefined,
  succeed: false,
  failed: false,
};
const deletingJobSet = createReducer(
  deletingJobSetInitialState,
  {
    [deleteJobSetBegin]: (state, { id }) => ({
      ...state,
      id
    }),
    [deleteJobSetSucceed]: (state, _action) => {
      if (state.succeed && !state.failed) {
        return state;
      }
      return {
        ...state,
        succeed: true,
        failed: false,
      };
    },
    [deleteJobSetFailed]: (state, { id }) => {
      if (!state.succeed && state.failed) {
        return state;
      }
      return {
        ...state,
        succeed: false,
        failed: true,
      };
    }
  }
);

const deletingJobSetsInitialState = {};
const deletingJobSets = createReducer(
  deletingJobSetsInitialState,
  {
    [deleteJobSetBegin]: (state, action) => {
      const { id } = action;
      return Object.assign({}, state, {
        [id]: deletingJobSet(undefined, action)
      });
    },
    [deleteJobSetSucceed]: (state, action) => {
      const { id, clear } = action;
      if (clear) {
        const { [id]: _id, ...restState } = state;
        return restState;
      }
      const element = state[id];
      const updatedElement = deletingJobSet(element, action);
      if (element === updatedElement) {
        return state;
      }
      return Object.assign({}, state, {
        [id]: updatedElement
      });
    },
    [deleteJobSetFailed]: (state, action) => {
      const { id, clear } = action;
      if (clear) {
        const { [id]: undefiend, ...restState } = state;
        return restState;
      }
      const element = state[id];
      const updatedElement = deletingJobSet(element, action);
      if (element === updatedElement) {
        return state;
      }
      return Object.assign({}, state, {
        [id]: updatedElement
      });
    },
    [clearDeletingJobSets]: (_state, _action) => deletingJobSetsInitialState,
  }
);

const currentJobSetIdInitialState = null;
const currentJobSetId = createReducer(
  currentJobSetIdInitialState,
  {
    [setCurrentJobSetId]: (_state, action) => action.id,
  }
);

export const initialState = {
  snackbar: snackbarInitialState,
  getJobSetsIsLoading: getJobSetsIsLoadingInitialState,
  getJobSetsFailedMessage: getJobSetsFailedMessageInitialState,
  jobSets: jobSetsInitialState,
  deletingJobSets: deletingJobSetsInitialState,
  currentJobSetId: currentJobSetIdInitialState,
  jobSetEditor: jobSetEditorInit(),
};

const reducer = reduceReducers(
  combineReducers({
    snackbar,
    getJobSetsIsLoading,
    getJobSetsFailedMessage,
    jobSets,
    deletingJobSets,
    currentJobSetId,
    jobSetEditor: jobSetEditorReducer,
  }),
  currentJobSetAdjustReducer
);

export default reducer;