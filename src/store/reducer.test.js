// todo getjobsets will clear content of jobset
// actually check etag to clear or not change content
import { initialState } from './reducer';

test("initialState", () => {
  const expectedInitialState = {
    snackbar: {
      isOpen: false,
      message: undefined
    },
    getJobSetsIsLoading: false,
    getJobSetsFailedMessage: null,
    jobSets: {},
    deletingJobSets: {},
    currentJobSetId: null,
    jobSetEditor: {
      editStatus: {
        readOnly: true,
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null
      },
      editContentHistory: {
        past: [],
        present: {
          historyStepName: "initial",
          editContent: expect.anything()
        },
        future: []
      },
      savedContent: expect.anything()
    },
  };
  expect(initialState).toMatchObject(expectedInitialState);
});