import { editContentInit } from "../components/JobSet/store/editContentReducer";
import { getNewJobSetId } from "../functions/newJobSetId";

import reducer from '../store/reducer';
import {
  setCurrentJobSetId,
  createJobSetBegin,
  createJobSetSucceed,
  updateJobSetBegin,
  updateJobSetSucceed,

  getJobSetBegin,
  getJobSetSucceed,
} from "../store/actionCreators";
import {
  setReadOnly,
  setTitle,
  setDescription,
  addMachine,
  createJob,
  createProcedure,
  updateProcedure,
  updateMachineTitle,
  updateMachineDescription,
} from '../components/JobSet/store/actionCreators';


const editContentInitialState = editContentInit();
const initialState = {
  snackbar: {
    isOpen: false,
    message: undefined
  },
  getJobSetsIsLoading: false,
  getJobSetsFailedMessage: null,
  jobSets: {
    [1]: {
      id: 1,
      title: "First",
      description: "The first job set",
      content: undefined,
      jobColors: undefined,
      isAutoTimeOptions: undefined,
      timeOptions: undefined,
      eTag: "AAAAAAAAs7E=",
      isLoading: false,
      loadFailedMessage: null,
      isUpdating: false,
      updateFailedMessage: null,
    },
    [2]: {
      id: 2,
      title: "Second",
      description: "The second job set",
      content: undefined,
      jobColors: undefined,
      isAutoTimeOptions: undefined,
      timeOptions: undefined,
      eTag: "AAAAAAAApBI=",
      isLoading: false,
      loadFailedMessage: null,
      isUpdating: false,
      updateFailedMessage: null,
    }
  },
  deletingJobSets: {},
  currentJobSetId: null,
  jobSetEditor: {
    editStatus: {
      readOnly: true,
      isCreating: false,
      creatingId: null,
      createFailedMessage: null,
      createdId: null,
    },
    editContentHistory: {
      past: [],
      present: {
        historyStepName: "initial",
        editContent: editContentInitialState
      },
      future: []
    },
    savedContent: editContentInitialState
  },
};

describe("Create New JobSet", () => {
  const newJobSetId = getNewJobSetId();
  const expectedStartCreateNewJobSetEditorContentState = {
    title: null,
    description: null,
    machines: {},
    jobs: {},
    procedures: {},
    jobColors: {},
    isAutoTimeOptions: true,
    timeOptions: {
      "referenceDate": new Date("1970-01-01T00:00:00.000Z"),
      "maxTime": new Date("1970-01-01T00:00:00.000Z"),
      "viewStartTime": new Date("1970-01-01T00:00:00.000Z"),
      "viewEndTime": new Date("1970-01-01T00:00:00.000Z"),
      "minViewDuration": 0,
      "maxViewDuration": 0,
    }
  };
  const expectedStartCreateNewState = {
    ...initialState,
    currentJobSetId: newJobSetId, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: false, // * modified 
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null
      },
      editContentHistory: { // * modified 
        past: [],
        present: {
          editContent: expectedStartCreateNewJobSetEditorContentState,
          historyStepName: "initial",
        },
        future: []
      },
      savedContent: expectedStartCreateNewJobSetEditorContentState // * modified 
    },
  };
  test("Start Create New", () => {
    let state = initialState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(newJobSetId);
    state = reducer(state, setCurrentJobSetIdAction);
    const setEditAction = setReadOnly(false);
    state = reducer(state, setEditAction);
    expect(state).toMatchObject(expectedStartCreateNewState);
  });
  const expectedEditNewJobSetEditorContentTitleState = {
    ...expectedStartCreateNewJobSetEditorContentState,
    title: "Test Start Create new JobSet"
  };
  const expectedEditNewJobSetEditorContentDescriptionState = {
    ...expectedEditNewJobSetEditorContentTitleState,
    description: "A sample JobSet for testing the scenario Start Create new JobSet"
  };
  const expectedEditNewState = {
    ...expectedStartCreateNewState,
    jobSetEditor: {
      ...expectedStartCreateNewState.jobSetEditor,
      editContentHistory: {
        past: [
          {
            editContent: expectedStartCreateNewJobSetEditorContentState,
            historyStepName: "initial",
          },
          {
            editContent: expectedEditNewJobSetEditorContentTitleState,
            historyStepName: "SET_TITLE",
          }
        ],
        present: {
          editContent: expectedEditNewJobSetEditorContentDescriptionState,
          historyStepName: "SET_DESCRIPTION",
        },
        future: []
      },
    }
  };
  test("Edit New", () => {
    let state = expectedStartCreateNewState;
    const setTitleAction = setTitle("Test Start Create new JobSet");
    state = reducer(state, setTitleAction);
    const setDescriptionAction = setDescription("A sample JobSet for testing the scenario Start Create new JobSet");
    state = reducer(state, setDescriptionAction);
    expect(state).toMatchObject(expectedEditNewState);
  });
  const expectedCreateNewCreatingState = {
    ...expectedEditNewState,
    jobSetEditor: {
      ...expectedEditNewState.jobSetEditor,
      editStatus: {
        readOnly: false,
        isCreating: true, // * modified 
        creatingId: newJobSetId,// * modified 
        createFailedMessage: null,
        createdId: null
      },
    },
  };
  test("Create New Creating", () => {
    let state = expectedEditNewState;
    const createJobSetBeginAction = createJobSetBegin(newJobSetId);
    state = reducer(state, createJobSetBeginAction);
    expect(state).toMatchObject(expectedCreateNewCreatingState);
  });
  const createdJobSet = {
    id: 3,
    title: "Test Start Create new JobSet",
    description: "A sample JobSet for testing the scenario Start Create new JobSet",
    content: '{"machines":[],"jobs":[]}',
    jobColors: "[]",
    isAutoTimeOptions: true,
    timeOptions: '{"referenceDate":"1970-01-01T00:00:00.000Z",' +
      '"maxTime":"1970-01-01T00:00:00.000Z",' +
      '"viewStartTime":"1970-01-01T00:00:00.000Z",' +
      '"viewEndTime":"1970-01-01T00:00:00.000Z",' +
      '"minViewDuration":0,' +
      '"maxViewDuration":0}',
    eTag: "AAAAAAABIRE=",
  };
  const expectedCreateNewCreatedState = {
    ...expectedCreateNewCreatingState,
    jobSets: {
      ...expectedCreateNewCreatingState.jobSets,
      [3]: {
        ...createdJobSet,
        content: {
          "machines": [],
          "jobs": []
        },
        jobColors: [],
        timeOptions: {
          "referenceDate": "1970-01-01T00:00:00.000Z",
          "maxTime": "1970-01-01T00:00:00.000Z",
          "viewStartTime": "1970-01-01T00:00:00.000Z",
          "viewEndTime": "1970-01-01T00:00:00.000Z",
          "minViewDuration": 0,
          "maxViewDuration": 0
        },
        isLoading: false,
        loadFailedMessage: null,
        isUpdating: false,
        updateFailedMessage: null,
      }
    },
    jobSetEditor: {
      ...expectedCreateNewCreatingState.jobSetEditor,
      editStatus: {
        readOnly: false,
        isCreating: false, // * modified 
        creatingId: newJobSetId, // * do not care 
        createFailedMessage: null,
        createdId: 3 // * modified 
      },
      // * savedContent not modified
    },
  };
  test("Create New Created", () => {
    let state = expectedCreateNewCreatingState;
    const createJobSetSucceedAction = createJobSetSucceed(newJobSetId, 3, createdJobSet);
    state = reducer(state, createJobSetSucceedAction);
    expect(state).toMatchObject(expectedCreateNewCreatedState);
  });
  const expectedCreateNewUpdatedCurrentJobSetIdState = {
    ...expectedCreateNewCreatedState,
    currentJobSetId: 3, // * modified 
    jobSetEditor: { // * modified
      editStatus: {
        readOnly: false,
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: {
          historyStepName: "setCurrentJobSetId",
          editContent: expectedEditNewJobSetEditorContentDescriptionState
        },
        future: []
      },
      savedContent: expectedEditNewJobSetEditorContentDescriptionState
    }
  };
  test("Create New UpdatedCurrentJobSetId", () => {
    let state = expectedCreateNewCreatedState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(3);
    state = reducer(state, setCurrentJobSetIdAction);
    expect(state).toMatchObject(expectedCreateNewUpdatedCurrentJobSetIdState);
  });
  const expectedEditCreatedJobSetEditorContentAddMachineState = {
    ...expectedEditNewJobSetEditorContentDescriptionState,
    machines: { [1]: { id: 1, title: 'M1', description: 'Machine 1' } }
  };
  const expectedEditCreatedJobSetEditorContentCreateJobState = {
    ...expectedEditCreatedJobSetEditorContentAddMachineState,
    jobs: { [1]: { id: 1 } },
    jobColors: { [1]: { id: 1, color: "#3cb44b", textColor: "#000000" } },
  };
  const expectedEditCreatedJobSetEditorContentCreateProcedureState = {
    ...expectedEditCreatedJobSetEditorContentCreateJobState,
    procedures: { [1]: { id: 1, jobId: 1, machineId: undefined, sequence: 1, processingMilliseconds: undefined } }
  };
  const expectedEditCreatedJobSetEditorContentUpdateProcedureState = {
    ...expectedEditCreatedJobSetEditorContentCreateProcedureState,
    procedures: { [1]: { id: 1, jobId: 1, machineId: 1, sequence: 1, processingMilliseconds: 300000 } },
    timeOptions: {
      referenceDate: new Date(0),
      maxTime: new Date(300000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(300000),
      minViewDuration: 300000,
      maxViewDuration: 300000,
    }
  };
  const expectedEditCreatedState = {
    ...expectedCreateNewUpdatedCurrentJobSetIdState,
    jobSetEditor: {
      ...expectedCreateNewUpdatedCurrentJobSetIdState.jobSetEditor,
      editContentHistory: {
        past: [
          {
            historyStepName: "setCurrentJobSetId",
            editContent: expectedEditNewJobSetEditorContentDescriptionState
          },
          {
            historyStepName: "ADD_MACHINE",
            editContent: expectedEditCreatedJobSetEditorContentAddMachineState
          },
          {
            historyStepName: "CREATE_JOB",
            editContent: expectedEditCreatedJobSetEditorContentCreateJobState
          },
          {
            historyStepName: "CREATE_PROCEDURE",
            editContent: expectedEditCreatedJobSetEditorContentCreateProcedureState
          }
        ],
        present: {
          historyStepName: "UPDATE_PROCEDURE",
          editContent: expectedEditCreatedJobSetEditorContentUpdateProcedureState
        },
        future: []
      },
    }
  };
  test("Edit Created", () => {
    let state = expectedCreateNewUpdatedCurrentJobSetIdState;
    const addMachineAction = addMachine();
    state = reducer(state, addMachineAction);
    const createJobAction = createJob();
    state = reducer(state, createJobAction);
    const createProcedureAction = createProcedure(1);
    state = reducer(state, createProcedureAction);
    const updateProcedureAction = updateProcedure(1, { id: 1, machineId: 1, processingMilliseconds: 300000 });
    state = reducer(state, updateProcedureAction);
    expect(state).toMatchObject(expectedEditCreatedState);
  });
  const expectedSaveEditBeginState = {
    ...expectedEditCreatedState,
    jobSets: {
      ...expectedEditCreatedState.jobSets,
      [3]: {
        ...expectedEditCreatedState.jobSets[3],
        isUpdating: true
      }
    }
  };
  test("Save Edit Begin", () => {
    let state = expectedEditCreatedState;
    const updateJobSetBeginAction = updateJobSetBegin(3);
    state = reducer(state, updateJobSetBeginAction);
    expect(state).toMatchObject(expectedSaveEditBeginState);
  });
  const editedJobSet =
  {
    title: "Test Start Create new JobSet",
    description: "A sample JobSet for testing the scenario Start Create new JobSet",
    content: '{' +
      '"machines": [{ "id": 1, "title": "M1", "description": "Machine 1" }],' +
      '"jobs": [{ "id": 1, "procedures": [{ "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 300000 }] }]' +
      '}',
    jobColors: '[{ "id": 1, "color": "#3cb44b", "textColor": "#000000" }]',
    isAutoTimeOptions: true,
    timeOptions: '{"referenceDate":"1970-01-01T00:00:00.000Z",' +
      '"maxTime":"1970-01-01T00:05:00.000Z",' +
      '"viewStartTime":"1970-01-01T00:00:00.000Z",' +
      '"viewEndTime":"1970-01-01T00:05:00.000Z",' +
      '"minViewDuration":300000,' +
      '"maxViewDuration":300000}',
    eTag: "AAAAAAABQFw=",
  };
  const expectedSavedEditState = {
    ...expectedEditCreatedState,
    jobSets: {
      ...expectedEditCreatedState.jobSets,
      [3]: {
        ...expectedEditCreatedState.jobSets[3],
        title: "Test Start Create new JobSet",
        description: "A sample JobSet for testing the scenario Start Create new JobSet",
        content: {
          "machines": [{ "id": 1, "title": "M1", "description": "Machine 1" }],
          "jobs": [{ "id": 1, "procedures": [{ "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 300000 }] }]
        },
        jobColors: [{ "id": 1, "color": "#3cb44b", "textColor": "#000000" }],
        isAutoTimeOptions: true,
        timeOptions: {
          "referenceDate": "1970-01-01T00:00:00.000Z",
          "maxTime": "1970-01-01T00:05:00.000Z",
          "viewStartTime": "1970-01-01T00:00:00.000Z",
          "viewEndTime": "1970-01-01T00:05:00.000Z",
          "minViewDuration": 300000,
          "maxViewDuration": 300000
        },
        eTag: "AAAAAAABQFw=",
        isUpdating: false
      }
    },
    jobSetEditor: {
      ...expectedEditCreatedState.jobSetEditor,
      savedContent: expectedEditCreatedJobSetEditorContentUpdateProcedureState
    }
  };
  test("Saved Edit", () => {
    let state = expectedEditCreatedState;
    const updateJobSetSucceedAction = updateJobSetSucceed(3, editedJobSet);
    state = reducer(state, updateJobSetSucceedAction);
    expect(state).toMatchObject(expectedSavedEditState);
  });
});

describe("Read Only jobSet", () => {
  const expectedJobSetEditorContentState = {
    ...editContentInitialState,
    title: "Second",
    description: "The second job set",
  };
  const expectedStartReadingJobSetState = {
    ...initialState,
    currentJobSetId: 2, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: true,
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: { // * modified
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditorContentState
        },
        future: []
      },
      savedContent: expectedJobSetEditorContentState // * modified
    }
  };
  test("Start Editing JobSet", () => {
    let state = initialState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(2);
    state = reducer(state, setCurrentJobSetIdAction);
    expect(state).toMatchObject(expectedStartReadingJobSetState);
  });
  const expectedGetJobSetBeginState = {
    ...expectedStartReadingJobSetState,
    jobSets: {
      ...expectedStartReadingJobSetState.jobSets,
      [2]: {
        ...expectedStartReadingJobSetState.jobSets[2],
        isLoading: true
      }
    }
  };
  test("Get JobSet Begin", () => {
    let state = expectedStartReadingJobSetState;
    const getJobSetBeginAction = getJobSetBegin(2);
    state = reducer(state, getJobSetBeginAction);
    expect(state).toMatchObject(expectedGetJobSetBeginState);
  });
  const expectedJobSetEditorContentGottenState = {
    title: "Second",
    description: "The second job set",
    machines: {
      [1]: { id: 1, title: "Machine 1", description: undefined },
      [2]: { id: 2, title: "Machine 2", description: undefined },
      [3]: { id: 3, title: "Machine 3", description: undefined },
    },
    jobs: {
      [1]: { id: 1 },
      [2]: { id: 2 },
      [3]: { id: 3 },
    },
    procedures: {
      [1]: { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 },
      [7]: { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }
    },
    jobColors: {
      [1]: { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
      [2]: { "id": 2, "color": "#ffe119", "textColor": "#000000" },
      [3]: { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      "referenceDate": new Date(0),
      "maxTime": new Date(1260000),
      "viewStartTime": new Date(0),
      "viewEndTime": new Date(1260000),
      "minViewDuration": 180000,
      "maxViewDuration": 1260000,
    }
  };
  const expectedGetJobSetSucceedState = {
    ...expectedGetJobSetBeginState,
    jobSets: {
      ...expectedGetJobSetBeginState.jobSets,
      [2]: {
        ...expectedGetJobSetBeginState.jobSets[2],
        isLoading: false,
        title: "Second",
        description: "The second job set",
        content: {
          "machines": [{ "id": 1, "title": "Machine 1" }, { "id": 2, "title": "Machine 2" }, { "id": 3, "title": "Machine 3" }],
          "jobs": [{
            "id": 1, "procedures": [
              { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
              { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
              { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }]
          },
          {
            "id": 2, "procedures": [
              { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
              { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
              { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }]
          },
          {
            "id": 3, "procedures": [
              { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
              { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }]
          }]
        },
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    },
    jobSetEditor: { // * modified
      ...expectedGetJobSetBeginState.jobSetEditor,
      editContentHistory: {
        past: [{
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditorContentState
        }],
        present: {
          historyStepName: "getJobSetSucceed",
          editContent: expectedJobSetEditorContentGottenState
        },
        future: []
      },
      savedContent: expectedJobSetEditorContentGottenState
    }
  };
  test("Get JobSet Succeed", () => {
    let state = expectedGetJobSetBeginState;
    const getJobSetSucceedAction = getJobSetSucceed(
      2,
      {
        title: "Second",
        description: "The second job set",
        content: '{"machines":[{"id":1,"title":"Machine 1"},{"id":2,"title":"Machine 2"},{"id":3,"title":"Machine 3"}],' +
          '"jobs":[{"id":1,"procedures":[' +
          '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
          '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
          '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
          '{"id":2,"procedures":[' +
          '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
          '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
          '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
          '{"id":3,"procedures":[' +
          '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
          '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    );
    state = reducer(state, getJobSetSucceedAction);
    expect(state).toMatchObject(expectedGetJobSetSucceedState);
  });
});

describe("Edit Existing JobSetHeader", () => {
  const expectedJobSetEditorContentState = {
    ...editContentInitialState,
    title: "Second",
    description: "The second job set",
  };
  const expectedStartEditingJobSetState = {
    ...initialState,
    currentJobSetId: 2, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: false, // * modified
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: { // * modified
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditorContentState
        },
        future: []
      },
      savedContent: expectedJobSetEditorContentState // * modified
    }
  };
  test("Start Editing JobSet", () => {
    let state = initialState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(2);
    state = reducer(state, setCurrentJobSetIdAction);
    const setReadOnlyAction = setReadOnly(false);
    state = reducer(state, setReadOnlyAction);
    expect(state).toMatchObject(expectedStartEditingJobSetState);
  });
  const expectedGetJobSetBeginState = {
    ...expectedStartEditingJobSetState,
    jobSets: {
      ...expectedStartEditingJobSetState.jobSets,
      [2]: {
        ...expectedStartEditingJobSetState.jobSets[2],
        isLoading: true
      }
    }
  };
  test("Get JobSet Begin", () => {
    let state = expectedStartEditingJobSetState;
    const getJobSetBeginAction = getJobSetBegin(2);
    state = reducer(state, getJobSetBeginAction);
    expect(state).toMatchObject(expectedGetJobSetBeginState);
  });
  const expectedJobSetEditorContentGottenState = {
    title: "Second",
    description: "The second job set",
    machines: {
      [1]: { id: 1, title: "Machine 1", description: undefined },
      [2]: { id: 2, title: "Machine 2", description: undefined },
      [3]: { id: 3, title: "Machine 3", description: undefined },
    },
    jobs: {
      [1]: { id: 1 },
      [2]: { id: 2 },
      [3]: { id: 3 },
    },
    procedures: {
      [1]: { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 },
      [7]: { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }
    },
    jobColors: {
      [1]: { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
      [2]: { "id": 2, "color": "#ffe119", "textColor": "#000000" },
      [3]: { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      "referenceDate": new Date(0),
      "maxTime": new Date(1260000),
      "viewStartTime": new Date(0),
      "viewEndTime": new Date(1260000),
      "minViewDuration": 180000,
      "maxViewDuration": 1260000,
    }
  };
  const expectedGetJobSetSucceedState = {
    ...expectedGetJobSetBeginState,
    jobSets: {
      ...expectedGetJobSetBeginState.jobSets,
      [2]: {
        ...expectedGetJobSetBeginState.jobSets[2],
        isLoading: false,
        title: "Second",
        description: "The second job set",
        content: {
          "machines": [{ "id": 1, "title": "Machine 1" }, { "id": 2, "title": "Machine 2" }, { "id": 3, "title": "Machine 3" }],
          "jobs": [{
            "id": 1, "procedures": [
              { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
              { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
              { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }]
          },
          {
            "id": 2, "procedures": [
              { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
              { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
              { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }]
          },
          {
            "id": 3, "procedures": [
              { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
              { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }]
          }]
        },
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    },
    jobSetEditor: { // * modified
      ...expectedGetJobSetBeginState.jobSetEditor,
      editContentHistory: {
        past: [{
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditorContentState
        }],
        present: {
          historyStepName: "getJobSetSucceed",
          editContent: expectedJobSetEditorContentGottenState
        },
        future: []
      },
      savedContent: expectedJobSetEditorContentGottenState
    }
  };
  test("Get JobSet Succeed", () => {
    let state = expectedGetJobSetBeginState;
    const getJobSetSucceedAction = getJobSetSucceed(
      2,
      {
        title: "Second",
        description: "The second job set",
        content: '{"machines":[{"id":1,"title":"Machine 1"},{"id":2,"title":"Machine 2"},{"id":3,"title":"Machine 3"}],' +
          '"jobs":[{"id":1,"procedures":[' +
          '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
          '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
          '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
          '{"id":2,"procedures":[' +
          '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
          '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
          '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
          '{"id":3,"procedures":[' +
          '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
          '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    );
    state = reducer(state, getJobSetSucceedAction);
    expect(state).toMatchObject(expectedGetJobSetSucceedState);
  });
  const expectedJobSetEditorContentEditedState = {
    ...expectedJobSetEditorContentGottenState,
    machines: {
      [1]: { id: 1, title: "M1", description: "Machine 1" },
      [2]: { id: 2, title: "M2", description: "Machine 2" },
      [3]: { id: 3, title: "M3", description: "Machine 3" },
    }
  };
  const expectedEditJobSetState = {
    ...expectedGetJobSetSucceedState,
    jobSetEditor: { // * modified
      ...expectedGetJobSetSucceedState.jobSetEditor,
      editContentHistory: {
        past: [
          {
            historyStepName: "setCurrentJobSetId",
            editContent: expectedJobSetEditorContentState
          },
          {
            historyStepName: "getJobSetSucceed",
            editContent: expectedJobSetEditorContentGottenState
          },
          {
            historyStepName: "UPDATE_MACHINE_TITLE",
            editContent: {
              ...expectedJobSetEditorContentGottenState,
              machines: {
                [1]: { id: 1, title: "M1", description: undefined },
                [2]: { id: 2, title: "Machine 2", description: undefined },
                [3]: { id: 3, title: "Machine 3", description: undefined },
              }
            }
          },
          {
            historyStepName: "UPDATE_MACHINE_DESCRIPTION",
            editContent: {
              ...expectedJobSetEditorContentGottenState,
              machines: {
                [1]: { id: 1, title: "M1", description: "Machine 1" },
                [2]: { id: 2, title: "Machine 2", description: undefined },
                [3]: { id: 3, title: "Machine 3", description: undefined },
              }
            }
          },
          {
            historyStepName: "UPDATE_MACHINE_TITLE",
            editContent: {
              ...expectedJobSetEditorContentGottenState,
              machines: {
                [1]: { id: 1, title: "M1", description: "Machine 1" },
                [2]: { id: 2, title: "M2", description: undefined },
                [3]: { id: 3, title: "Machine 3", description: undefined },
              }
            }
          },
          {
            historyStepName: "UPDATE_MACHINE_DESCRIPTION",
            editContent: {
              ...expectedJobSetEditorContentGottenState,
              machines: {
                [1]: { id: 1, title: "M1", description: "Machine 1" },
                [2]: { id: 2, title: "M2", description: "Machine 2" },
                [3]: { id: 3, title: "Machine 3", description: undefined },
              }
            }
          },
          {
            historyStepName: "UPDATE_MACHINE_TITLE",
            editContent: {
              ...expectedJobSetEditorContentGottenState,
              machines: {
                [1]: { id: 1, title: "M1", description: "Machine 1" },
                [2]: { id: 2, title: "M2", description: "Machine 2" },
                [3]: { id: 3, title: "M3", description: undefined },
              }
            }
          }
        ],
        present: {
          historyStepName: "UPDATE_MACHINE_DESCRIPTION",
          editContent: expectedJobSetEditorContentEditedState
        },
        future: []
      },
    }
  };
  test("Edit JobSet", () => {
    let state = expectedGetJobSetSucceedState;
    const updateMachineTitleAction1 = updateMachineTitle(1, "M1");
    const updateMachineTitleAction2 = updateMachineTitle(2, "M2");
    const updateMachineTitleAction3 = updateMachineTitle(3, "M3");
    const updateMachineDescriptionAction1 = updateMachineDescription(1, "Machine 1");
    const updateMachineDescriptionAction2 = updateMachineDescription(2, "Machine 2");
    const updateMachineDescriptionAction3 = updateMachineDescription(3, "Machine 3");
    state = reducer(state, updateMachineTitleAction1);
    state = reducer(state, updateMachineDescriptionAction1);
    state = reducer(state, updateMachineTitleAction2);
    state = reducer(state, updateMachineDescriptionAction2);
    state = reducer(state, updateMachineTitleAction3);
    state = reducer(state, updateMachineDescriptionAction3);
    expect(state).toMatchObject(expectedEditJobSetState);
  });
  const expectedSaveEditedJobSetBeginState = {
    ...expectedEditJobSetState,
    jobSets: {
      ...expectedEditJobSetState.jobSets,
      [2]: {
        ...expectedEditJobSetState.jobSets[2],
        isUpdating: true // * modified
      }
    }
  };
  test("Save Edited JobSet Begin", () => {
    let state = expectedEditJobSetState;
    const updateJobSetBegintAction = updateJobSetBegin(2);
    state = reducer(state, updateJobSetBegintAction);
    expect(state).toMatchObject(expectedSaveEditedJobSetBeginState);
  });
  const expectedSaveEditedJobSetSucceedState = {
    ...expectedSaveEditedJobSetBeginState,
    jobSets: {
      ...expectedSaveEditedJobSetBeginState.jobSets,
      [2]: {
        ...expectedSaveEditedJobSetBeginState.jobSets[2],
        isUpdating: false,
        title: "Second",
        description: "The second job set",
        content: {
          "machines": [
            { "id": 1, "title": "M1", "description": "Machine 1" },
            { "id": 2, "title": "M2", "description": "Machine 2" },
            { "id": 3, "title": "M3", "description": "Machine 3" }
          ],
          "jobs": [{
            "id": 1, "procedures": [
              { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
              { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
              { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }]
          },
          {
            "id": 2, "procedures": [
              { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
              { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
              { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }]
          },
          {
            "id": 3, "procedures": [
              { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
              { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }]
          }]
        },
        jobColors: [
          { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
          { "id": 2, "color": "#ffe119", "textColor": "#000000" },
          { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
        ],
        isAutoTimeOptions: true,
        timeOptions: {
          "referenceDate": "1970-01-01T00:00:00.000Z",
          "maxTime": "1970-01-01T00:21:00.000Z",
          "viewStartTime": "1970-01-01T00:00:00.000Z",
          "viewEndTime": "1970-01-01T00:21:00.000Z",
          "minViewDuration": 180000,
          "maxViewDuration": 1260000
        },
        eTag: "AAAAAAABbzE=",
      }
    },
    jobSetEditor: {
      ...expectedSaveEditedJobSetBeginState.jobSetEditor,
      savedContent: expectedJobSetEditorContentEditedState
    }
  };
  test("Save Edited JobSet Succeed", () => {
    let state = expectedSaveEditedJobSetBeginState;
    const updateJobSetSucceedAction = updateJobSetSucceed(2, {
      title: "Second",
      description: "The second job set",
      content: '{"machines":[' +
        '{"id":1,"title":"M1","description":"Machine 1"},' +
        '{"id":2,"title":"M2","description":"Machine 2"},' +
        '{"id":3,"title":"M3","description":"Machine 3"}],' +
        '"jobs":[{"id":1,"procedures":[' +
        '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
        '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
        '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
        '{"id":2,"procedures":[' +
        '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
        '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
        '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
        '{"id":3,"procedures":[' +
        '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
        '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
      jobColors: '[' +
        '{"id":1,"color":"#3cb44b","textColor":"#000000"},' +
        '{"id":2,"color":"#ffe119","textColor":"#000000"},' +
        '{"id":3,"color":"#4363d8","textColor":"#ffffff"}' +
        ']',
      isAutoTimeOptions: true,
      timeOptions: '{' +
        '"referenceDate":"1970-01-01T00:00:00.000Z",' +
        '"maxTime":"1970-01-01T00:21:00.000Z",' +
        '"viewStartTime":"1970-01-01T00:00:00.000Z",' +
        '"viewEndTime":"1970-01-01T00:21:00.000Z",' +
        '"minViewDuration":180000,' +
        '"maxViewDuration":1260000' +
        '}',
      eTag: "AAAAAAABbzE=",
    });
    state = reducer(state, updateJobSetSucceedAction);
    expect(state).toMatchObject(expectedSaveEditedJobSetSucceedState);
  });
});

describe("Edit Existing JobSet Full", () => {
  const initialEditExistingJobSetFullState = {
    ...initialState,
    jobSets: {
      ...initialState.jobSets,
      [2]: {
        ...initialState.jobSets[2],
        title: "Second",
        description: "The second job set",
        content: {
          "machines": [
            { "id": 1, "title": "M1", "description": "Machine 1" },
            { "id": 2, "title": "M2", "description": "Machine 2" },
            { "id": 3, "title": "M3", "description": "Machine 3" }
          ],
          "jobs": [{
            "id": 1, "procedures": [
              { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
              { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
              { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }]
          },
          {
            "id": 2, "procedures": [
              { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
              { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
              { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }]
          },
          {
            "id": 3, "procedures": [
              { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
              { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }]
          }]
        },
        jobColors: [
          { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
          { "id": 2, "color": "#ffe119", "textColor": "#000000" },
          { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
        ],
        isAutoTimeOptions: true,
        timeOptions: {
          "referenceDate": "1970-01-01T00:00:00.000Z",
          "maxTime": "1970-01-01T00:21:00.000Z",
          "viewStartTime": "1970-01-01T00:00:00.000Z",
          "viewEndTime": "1970-01-01T00:21:00.000Z",
          "minViewDuration": 180000,
          "maxViewDuration": 1260000
        },
        eTag: "AAAAAAABbzE=",
      }
    }
  };
  const expectedStartEditingJobSetEditorContentState = {
    title: "Second",
    description: "The second job set",
    machines: {
      [1]: { id: 1, title: "M1", description: "Machine 1" },
      [2]: { id: 2, title: "M2", description: "Machine 2" },
      [3]: { id: 3, title: "M3", description: "Machine 3" },
    },
    jobs: {
      [1]: { id: 1 },
      [2]: { id: 2 },
      [3]: { id: 3 },
    },
    procedures: {
      [1]: { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 },
      [7]: { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }
    },
    jobColors: {
      [1]: { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
      [2]: { "id": 2, "color": "#ffe119", "textColor": "#000000" },
      [3]: { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      "referenceDate": new Date(0),
      "maxTime": new Date(1260000),
      "viewStartTime": new Date(0),
      "viewEndTime": new Date(1260000),
      "minViewDuration": 180000,
      "maxViewDuration": 1260000,
    }
  };
  const expectedStartEditingJobSetState = {
    ...initialEditExistingJobSetFullState,
    currentJobSetId: 2, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: false, // * modified
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: { // * modified
          historyStepName: "setCurrentJobSetId",
          editContent: expectedStartEditingJobSetEditorContentState
        },
        future: []
      },
      savedContent: expectedStartEditingJobSetEditorContentState // * modified
    }
  };
  test("Start Editing JobSet", () => {
    let state = initialEditExistingJobSetFullState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(2);
    state = reducer(state, setCurrentJobSetIdAction);
    const setReadOnlyAction = setReadOnly(false);
    state = reducer(state, setReadOnlyAction);
    expect(state).toMatchObject(expectedStartEditingJobSetState);
  });
  const expectedGetJobSetBeginState = {
    ...expectedStartEditingJobSetState,
    jobSets: {
      ...expectedStartEditingJobSetState.jobSets,
      [2]: {
        ...expectedStartEditingJobSetState.jobSets[2],
        isLoading: true
      }
    }
  };
  test("Get JobSet Begin", () => {
    let state = expectedStartEditingJobSetState;
    const getJobSetBeginAction = getJobSetBegin(2);
    state = reducer(state, getJobSetBeginAction);
    expect(state).toMatchObject(expectedGetJobSetBeginState);
  });
  const expectedGetJobSetSucceedState = {
    ...expectedGetJobSetBeginState,
    jobSets: {
      ...expectedGetJobSetBeginState.jobSets,
      [2]: {
        ...expectedGetJobSetBeginState.jobSets[2],
        isLoading: false,
      }
    }
  };
  test("Get JobSet Succeed", () => {
    let state = expectedGetJobSetBeginState;
    const getJobSetSucceedAction = getJobSetSucceed(2, {
      title: "Second",
      description: "The second job set",
      content: '{"machines":[' +
        '{"id":1,"title":"M1","description":"Machine 1"},' +
        '{"id":2,"title":"M2","description":"Machine 2"},' +
        '{"id":3,"title":"M3","description":"Machine 3"}],' +
        '"jobs":[{"id":1,"procedures":[' +
        '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
        '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
        '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
        '{"id":2,"procedures":[' +
        '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
        '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
        '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
        '{"id":3,"procedures":[' +
        '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
        '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
      jobColors: '[' +
        '{"id":1,"color":"#3cb44b","textColor":"#000000"},' +
        '{"id":2,"color":"#ffe119","textColor":"#000000"},' +
        '{"id":3,"color":"#4363d8","textColor":"#ffffff"}' +
        ']',
      isAutoTimeOptions: true,
      timeOptions: '{' +
        '"referenceDate":"1970-01-01T00:00:00.000Z",' +
        '"maxTime":"1970-01-01T00:21:00.000Z",' +
        '"viewStartTime":"1970-01-01T00:00:00.000Z",' +
        '"viewEndTime":"1970-01-01T00:21:00.000Z",' +
        '"minViewDuration":180000,' +
        '"maxViewDuration":1260000' +
        '}',
      eTag: "AAAAAAABbzE=",
    });
    state = reducer(state, getJobSetSucceedAction);
    expect(state).toMatchObject(expectedGetJobSetSucceedState);
  });
  const expectedJobSetEditorContentEditedState = {
    ...expectedStartEditingJobSetEditorContentState,
    description: "The second job set edited",
  };
  const expectedEditJobSetState = {
    ...expectedGetJobSetSucceedState,
    jobSetEditor: { // * modified
      ...expectedGetJobSetSucceedState.jobSetEditor,
      editContentHistory: {
        past: [
          {
            historyStepName: "setCurrentJobSetId",
            editContent: expectedStartEditingJobSetEditorContentState
          }
        ],
        present: {
          historyStepName: "SET_DESCRIPTION",
          editContent: expectedJobSetEditorContentEditedState
        },
        future: []
      },
    }
  };
  test("Edit JobSet", () => {
    let state = expectedGetJobSetSucceedState;
    const setDescriptionAction = setDescription("The second job set edited");
    state = reducer(state, setDescriptionAction);
    expect(state).toMatchObject(expectedEditJobSetState);
  });
  const expectedSaveEditedJobSetBeginState = {
    ...expectedEditJobSetState,
    jobSets: {
      ...expectedEditJobSetState.jobSets,
      [2]: {
        ...expectedEditJobSetState.jobSets[2],
        isUpdating: true // * modified
      }
    }
  };
  test("Save Edited JobSet Begin", () => {
    let state = expectedEditJobSetState;
    const updateJobSetBegintAction = updateJobSetBegin(2);
    state = reducer(state, updateJobSetBegintAction);
    expect(state).toMatchObject(expectedSaveEditedJobSetBeginState);
  });
  const expectedSaveEditedJobSetSucceedState = {
    ...expectedSaveEditedJobSetBeginState,
    jobSets: {
      ...expectedSaveEditedJobSetBeginState.jobSets,
      [2]: {
        ...expectedSaveEditedJobSetBeginState.jobSets[2],
        isUpdating: false,
        description: "The second job set edited", // * modified
        eTag: "AAAAAAABbzF=", // * modified
      }
    },
    jobSetEditor: {
      ...expectedSaveEditedJobSetBeginState.jobSetEditor,
      savedContent: expectedJobSetEditorContentEditedState
    }
  };
  test("Save Edited JobSet Succeed", () => {
    let state = expectedSaveEditedJobSetBeginState;
    const updateJobSetSucceedAction = updateJobSetSucceed(2, {
      title: "Second",
      description: "The second job set edited",
      content: '{"machines":[' +
        '{"id":1,"title":"M1","description":"Machine 1"},' +
        '{"id":2,"title":"M2","description":"Machine 2"},' +
        '{"id":3,"title":"M3","description":"Machine 3"}],' +
        '"jobs":[{"id":1,"procedures":[' +
        '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
        '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
        '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
        '{"id":2,"procedures":[' +
        '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
        '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
        '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
        '{"id":3,"procedures":[' +
        '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
        '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
      jobColors: '[' +
        '{"id":1,"color":"#3cb44b","textColor":"#000000"},' +
        '{"id":2,"color":"#ffe119","textColor":"#000000"},' +
        '{"id":3,"color":"#4363d8","textColor":"#ffffff"}' +
        ']',
      isAutoTimeOptions: true,
      timeOptions: '{' +
        '"referenceDate":"1970-01-01T00:00:00.000Z",' +
        '"maxTime":"1970-01-01T00:21:00.000Z",' +
        '"viewStartTime":"1970-01-01T00:00:00.000Z",' +
        '"viewEndTime":"1970-01-01T00:21:00.000Z",' +
        '"minViewDuration":180000,' +
        '"maxViewDuration":1260000' +
        '}',
      eTag: "AAAAAAABbzF=", // * modified
    });
    state = reducer(state, updateJobSetSucceedAction);
    expect(state).toMatchObject(expectedSaveEditedJobSetSucceedState);
  });
});

describe("Change Current JobSet", () => {
  const expectedJobSetEditor1ContentState = {
    ...editContentInitialState,
    title: "First",
    description: "The first job set",
  };
  const expectedStartEditing1JobSetState = {
    ...initialState,
    currentJobSetId: 1, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: false, // * modified
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: { // * modified
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditor1ContentState
        },
        future: []
      },
      savedContent: expectedJobSetEditor1ContentState // * modified
    }
  };
  test("Start Editing JobSet 1", () => {
    let state = initialState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(1);
    state = reducer(state, setCurrentJobSetIdAction);
    const setReadOnlyAction = setReadOnly(false);
    state = reducer(state, setReadOnlyAction);
    expect(state).toMatchObject(expectedStartEditing1JobSetState);
  });
  const expectedGetJobSet1BeginState = {
    ...expectedStartEditing1JobSetState,
    jobSets: {
      ...expectedStartEditing1JobSetState.jobSets,
      [1]: {
        ...expectedStartEditing1JobSetState.jobSets[1],
        isLoading: true
      }
    }
  };
  test("Get JobSet 1 Begin", () => {
    let state = expectedStartEditing1JobSetState;
    const getJobSetBeginAction = getJobSetBegin(1);
    state = reducer(state, getJobSetBeginAction);
    expect(state).toMatchObject(expectedGetJobSet1BeginState);
  });
  const expectedJobSetEditor2ContentState = {
    ...editContentInitialState,
    title: "Second",
    description: "The second job set",
  };
  const expectedStartEditing2JobSetState = {
    ...expectedGetJobSet1BeginState,
    currentJobSetId: 2, // * modified 
    jobSetEditor: {
      editStatus: {
        readOnly: false, // * modified
        isCreating: false,
        creatingId: null,
        createFailedMessage: null,
        createdId: null,
      },
      editContentHistory: {
        past: [],
        present: { // * modified
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditor2ContentState
        },
        future: []
      },
      savedContent: expectedJobSetEditor2ContentState // * modified
    }
  };
  test("Start Editing JobSet 2", () => {
    let state = expectedGetJobSet1BeginState;
    const setCurrentJobSetIdAction = setCurrentJobSetId(2);
    state = reducer(state, setCurrentJobSetIdAction);
    const setReadOnlyAction = setReadOnly(false);
    state = reducer(state, setReadOnlyAction);
    expect(state).toMatchObject(expectedStartEditing2JobSetState);
  });
  const expectedGetJobSet2BeginState = {
    ...expectedStartEditing2JobSetState,
    jobSets: {
      ...expectedStartEditing2JobSetState.jobSets,
      [2]: {
        ...expectedStartEditing2JobSetState.jobSets[2],
        isLoading: true
      }
    }
  };
  test("Get JobSet 2 Begin", () => {
    let state = expectedStartEditing2JobSetState;
    const getJobSetBeginAction = getJobSetBegin(2);
    state = reducer(state, getJobSetBeginAction);
    expect(state).toMatchObject(expectedGetJobSet2BeginState);
  });

  const expectedGetJobSet1SucceedState = {
    ...expectedGetJobSet2BeginState,
    jobSets: {
      ...expectedGetJobSet2BeginState.jobSets,
      [1]: {
        ...expectedGetJobSet2BeginState.jobSets[1],
        isLoading: false,
        title: "First",
        description: "The first job set",
        content: {
          "machines": [{ "id": 1, "title": "M1" }, { "id": 2, "title": "M2" }, { "id": 3, "title": "M3" }, { "id": 4, "title": "M4" }],
          "jobs": [
            {
              "id": 1,
              "procedures": [
                { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 600000 },
                { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
                { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 240000 }
              ]
            },
            {
              "id": 2,
              "procedures": [
                { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
                { "id": 5, "jobId": 2, "machineId": 1, "sequence": 2, "processingMilliseconds": 180000 },
                { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
                { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 }
              ]
            },
            {
              "id": 3,
              "procedures": [
                { "id": 8, "jobId": 3, "machineId": 1, "sequence": 1, "processingMilliseconds": 240000 },
                { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
                { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
              ]
            }
          ]
        },
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAAs7E=",
      }
    }
  };
  test("Get JobSet 1 Succeed", () => {
    let state = expectedGetJobSet2BeginState;
    const getJobSetSucceedAction = getJobSetSucceed(
      1,
      {
        title: "First",
        description: "The first job set",
        content: '{"machines":[{"id":1,"title":"M1"},{"id":2,"title":"M2"},{"id":3,"title":"M3"},{"id":4,"title":"M4"}],' +
          '"jobs":[{"id":1,"procedures":[' +
          '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":600000},' +
          '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":480000},' +
          '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":240000}]},' +
          '{"id":2,"procedures":[' +
          '{"id":4,"jobId":2,"machineId":2,"sequence":1,"processingMilliseconds":480000},' +
          '{"id":5,"jobId":2,"machineId":1,"sequence":2,"processingMilliseconds":180000},' +
          '{"id":6,"jobId":2,"machineId":4,"sequence":3,"processingMilliseconds":300000},' +
          '{"id":7,"jobId":2,"machineId":3,"sequence":4,"processingMilliseconds":360000}]},' +
          '{"id":3,"procedures":[' +
          '{"id":8,"jobId":3,"machineId":1,"sequence":1,"processingMilliseconds":240000},' +
          '{"id":9,"jobId":3,"machineId":2,"sequence":2,"processingMilliseconds":420000},' +
          '{"id":10,"jobId":3,"machineId":4,"sequence":3,"processingMilliseconds":180000}]}]}',
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAAs7E=",
      }
    );
    state = reducer(state, getJobSetSucceedAction);
    expect(state).toMatchObject(expectedGetJobSet1SucceedState);
  });
  const expectedGetSucceedJobSetEditor2ContentState = {
    title: "Second",
    description: "The second job set",
    machines: {
      [1]: { id: 1, title: "Machine 1", description: undefined },
      [2]: { id: 2, title: "Machine 2", description: undefined },
      [3]: { id: 3, title: "Machine 3", description: undefined },
    },
    jobs: {
      [1]: { id: 1 },
      [2]: { id: 2 },
      [3]: { id: 3 },
    },
    procedures: {
      [1]: { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 },
      [7]: { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }
    },
    jobColors: {
      [1]: { "id": 1, "color": "#3cb44b", "textColor": "#000000" },
      [2]: { "id": 2, "color": "#ffe119", "textColor": "#000000" },
      [3]: { "id": 3, "color": "#4363d8", "textColor": "#ffffff" }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      "referenceDate": new Date(0),
      "maxTime": new Date(1260000),
      "viewStartTime": new Date(0),
      "viewEndTime": new Date(1260000),
      "minViewDuration": 180000,
      "maxViewDuration": 1260000,
    }
  };
  const expectedGetJobSet2SucceedState = {
    ...expectedGetJobSet1SucceedState,
    jobSets: {
      ...expectedGetJobSet1SucceedState.jobSets,
      [2]: {
        ...expectedGetJobSet1SucceedState.jobSets[2],
        isLoading: false,
        title: "Second",
        description: "The second job set",
        content: {
          "machines": [{ "id": 1, "title": "Machine 1" }, { "id": 2, "title": "Machine 2" }, { "id": 3, "title": "Machine 3" }],
          "jobs": [{
            "id": 1, "procedures": [
              { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
              { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
              { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }]
          },
          {
            "id": 2, "procedures": [
              { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
              { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
              { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }]
          },
          {
            "id": 3, "procedures": [
              { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
              { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }]
          }]
        },
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    },
    jobSetEditor: { // * modified
      ...expectedGetJobSet1SucceedState.jobSetEditor,
      editContentHistory: {
        past: [{
          historyStepName: "setCurrentJobSetId",
          editContent: expectedJobSetEditor2ContentState
        }],
        present: {
          historyStepName: "getJobSetSucceed",
          editContent: expectedGetSucceedJobSetEditor2ContentState
        },
        future: []
      },
      savedContent: expectedGetSucceedJobSetEditor2ContentState
    }
  };
  test("Get JobSet 2 Succeed", () => {
    let state = expectedGetJobSet1SucceedState;
    const getJobSetSucceedAction = getJobSetSucceed(
      2,
      {
        title: "Second",
        description: "The second job set",
        content: '{"machines":[{"id":1,"title":"Machine 1"},{"id":2,"title":"Machine 2"},{"id":3,"title":"Machine 3"}],' +
          '"jobs":[{"id":1,"procedures":[' +
          '{"id":1,"jobId":1,"machineId":1,"sequence":1,"processingMilliseconds":180000},' +
          '{"id":2,"jobId":1,"machineId":2,"sequence":2,"processingMilliseconds":120000},' +
          '{"id":3,"jobId":1,"machineId":3,"sequence":3,"processingMilliseconds":120000}]},' +
          '{"id":2,"procedures":[' +
          '{"id":4,"jobId":2,"machineId":1,"sequence":1,"processingMilliseconds":120000},' +
          '{"id":5,"jobId":2,"machineId":3,"sequence":2,"processingMilliseconds":60000},' +
          '{"id":6,"jobId":2,"machineId":2,"sequence":3,"processingMilliseconds":240000}]},' +
          '{"id":3,"procedures":[' +
          '{"id":7,"jobId":3,"machineId":2,"sequence":1,"processingMilliseconds":240000},' +
          '{"id":8,"jobId":3,"machineId":3,"sequence":2,"processingMilliseconds":180000}]}]}',
        jobColors: null,
        isAutoTimeOptions: true,
        timeOptions: null,
        eTag: "AAAAAAAApBI=",
      }
    );
    state = reducer(state, getJobSetSucceedAction);
    expect(state).toMatchObject(expectedGetJobSet2SucceedState);
  });
});