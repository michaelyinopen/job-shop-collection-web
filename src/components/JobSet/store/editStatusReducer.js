import createReducer from '../../../functions/createReducer';
import { setReadOnly } from './actionTypes';
import {
  createJobSetBegin,
  createJobSetSucceed,
  createJobSetFailed,
  setCurrentJobSetId,
} from '../../../store/actionTypes';
import updateObject from '../../../functions/updateObject';

export const editStatusInit = (readOnly = true) => ({
  readOnly,
  isCreating: false,
  creatingId: null,
  createFailedMessage: null,
  createdId: null,
});

const editStatus = createReducer(
  editStatusInit(),
  {
    [setReadOnly]: (state, action) => updateObject(state, { readOnly: action.isReadOnly }),
    [setCurrentJobSetId]: (state, { id }) => {
      if (id === state.creatingId) {
        return state;
      }
      return updateObject(state, {
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      });
    },
    [createJobSetBegin]: (state, { creatingId }) => updateObject(state, {
      isCreating: true,
      creatingId: creatingId,
      createFailedMessage: null,
      createdId: null,
    }),
    [createJobSetSucceed]: (state, { creatingId, id }) => {
      if (creatingId !== state.creatingId) {
        return state;
      }
      return updateObject(state, {
        isCreating: false,
        createFailedMessage: null,
        createdId: id,
      });
    },
    [createJobSetFailed]: (state, { creatingId, failedMessage }) => {
      if (creatingId !== state.creatingId) {
        return state;
      }
      return updateObject(state, {
        isCreating: false,
        createFailedMessage: failedMessage,
        createdId: null,
      });
    },
  }
);

export default editStatus;