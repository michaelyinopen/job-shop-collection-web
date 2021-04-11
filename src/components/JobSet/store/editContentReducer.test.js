import editContentReducer, { editContentInit } from './editContentReducer';
import {
  setJobSet,
  addMachine,
  removeMachine,
  deleteJob,
  createProcedure,
  moveProcedure,
  deleteProcedure,
  changeJobColor,
  createJob,
  setIsAutoTimeOptions,
} from './actionCreators';
import { jobSetEditorUpdatingActionsTypes } from '../../../store/currentJobSetAdjustReducer';
jest.mock('../../../store/currentJobSetAdjustReducer', () => ({
  jobSetEditorUpdatingActionsTypes: ["jobSetEditorUpdatingAction"]
}))

const initialState = {
  title: null,
  description: null,
  machines:
  {
    [1]: { "id": 1, title: "M1", description: "Machine 1" },
    [2]: { "id": 2, title: "M2", description: "Machine 2" },
    [3]: { "id": 3, title: "M3", description: "Machine 3" },
    [4]: { "id": 4, title: "M4", description: "Machine 4" }
  },
  jobs: {
    [1]: { "id": 1 },
    [2]: { "id": 2 },
    [3]: { "id": 3 },
  },
  procedures: {
    [1]: { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 600000 },
    [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
    [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 240000 },
    [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
    [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 2, "processingMilliseconds": 180000 },
    [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
    [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 },
    [8]: { "id": 8, "jobId": 3, "machineId": 1, "sequence": 1, "processingMilliseconds": 240000 },
    [9]: { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
    [10]: { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
  },
  isAutoTimeOptions: true,
  timeOptions: {
    referenceDate: new Date(0), // minTime === referenceDate
    maxTime: new Date(3480000),
    viewStartTime: new Date(0),
    viewEndTime: new Date(3480000),
    minViewDuration: 360000,
    maxViewDuration: 3480000
  },
  jobColors: {
    [1]: { "id": 1, color: '#3cb44b', textColor: '#000000' },
    [2]: { "id": 2, color: '#ffe119', textColor: '#000000' },
    [3]: { "id": 3, color: '#4363d8', textColor: '#ffffff' },
  }
};

test("init function produces initial state", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = true;
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    jobColors
  });

  expect(resultState).toEqual(initialState);
});

test("init function with default timeOptions and jobColors", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];

  const resultState = editContentInit({
    machines,
    jobs
  });

  expect(resultState).toEqual(initialState);
});

test("reducer does not change state with empty action", () => {
  const state = { ...initialState };
  const emptyAction = { type: '' };
  const newState = editContentReducer(state, emptyAction);
  expect(newState).toBe(state);
});

test("init function with all defaults", () => {
  const resultState = editContentInit();

  expect(resultState).toEqual({
    title: null,
    description: null,
    machines: {},
    jobs: {},
    procedures: {},
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0),
      maxTime: new Date(0),
      viewStartTime: new Date(0),
      viewEndTime: new Date(0),
      minViewDuration: 0,
      maxViewDuration: 0
    },
    jobColors: {}
  });
});

test("setJobSet", () => {
  let state = editContentInit();
  const extraParameter = {
    title: null,
    description: null,
    machines: [
      { "id": 1, title: "M1", description: "Machine 1" },
      { "id": 2, title: "M2", description: "Machine 2" },
      { "id": 3, title: "M3", description: "Machine 3" },
      { "id": 4, title: "M4", description: "Machine 4" }
    ],
    jobs: [
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
    ],
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(3480000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(3480000),
      minViewDuration: 360000,
      maxViewDuration: 3480000
    },
    jobColors: [
      { "id": 1, color: '#3cb44b', textColor: '#000000' },
      { "id": 2, color: '#ffe119', textColor: '#000000' },
      { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    ],
  };
  const action = {
    type: jobSetEditorUpdatingActionsTypes[0]
  };
  state = editContentReducer(state, action, extraParameter);
  expect(state).toEqual(initialState);
});

test("setJobSet ca use string time", () => {
  let state = editContentInit();
  const extraParameter = {
    title: null,
    description: null,
    machines: [
      { "id": 1, title: "M1", description: "Machine 1" },
      { "id": 2, title: "M2", description: "Machine 2" },
      { "id": 3, title: "M3", description: "Machine 3" },
      { "id": 4, title: "M4", description: "Machine 4" }
    ],
    jobs: [
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
    ],
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: "1970-01-01T00:00:00.000Z", // minTime === referenceDate
      maxTime: "1970-01-01T00:58:00.000Z",
      viewStartTime:"1970-01-01T00:00:00.000Z",
      viewEndTime: "1970-01-01T00:58:00.000Z",
      minViewDuration: 360000,
      maxViewDuration: 3480000
    },
    jobColors: [
      { "id": 1, color: '#3cb44b', textColor: '#000000' },
      { "id": 2, color: '#ffe119', textColor: '#000000' },
      { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    ],
  };
  const action = {
    type: jobSetEditorUpdatingActionsTypes[0]
  };
  state = editContentReducer(state, action, extraParameter);
  expect(state).toEqual(initialState);
});

test("setJobSet with same information will not update state", () => {
  let state = initialState;
  const extraParameter = {
    title: null,
    description: null,
    machines: [
      { "id": 1, title: "M1", description: "Machine 1" },
      { "id": 2, title: "M2", description: "Machine 2" },
      { "id": 3, title: "M3", description: "Machine 3" },
      { "id": 4, title: "M4", description: "Machine 4" }
    ],
    jobs: [
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
    ],
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(3480000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(3480000),
      minViewDuration: 360000,
      maxViewDuration: 3480000
    },
    jobColors: [
      { "id": 1, color: '#3cb44b', textColor: '#000000' },
      { "id": 2, color: '#ffe119', textColor: '#000000' },
      { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    ],
  };
  const action = {
    type: jobSetEditorUpdatingActionsTypes[0]
  };
  state = editContentReducer(state, action, extraParameter);
  expect(state).toBe(initialState);
});

test("setJobSet without third parameter will not update", () => {
  let state = initialState;
  const action = {
    type: jobSetEditorUpdatingActionsTypes[0]
  };
  state = editContentReducer(state, action);
  expect(state).toBe(initialState);
});

test("addMachine action", () => {
  const state = { ...initialState };
  const addMachineAction = addMachine();
  const resultState = editContentReducer(state, addMachineAction);
  expect(resultState).toEqual({
    ...initialState,
    machines: {
      ...initialState.machines,
      [5]: { id: 5, title: 'M5', description: 'Machine 5' }
    }
  });
});

test("removeMachine action unsets procedures", () => {
  const state = { ...initialState };
  const removeMachineAction = removeMachine(1);
  const resultState = editContentReducer(state, removeMachineAction);
  expect(resultState).toEqual({
    title: null,
    description: null,
    machines:
    {
      [2]: { "id": 2, title: "M2", description: "Machine 2" },
      [3]: { "id": 3, title: "M3", description: "Machine 3" },
      [4]: { "id": 4, title: "M4", description: "Machine 4" }
    },
    jobs: {
      [1]: { "id": 1 },
      [2]: { "id": 2 },
      [3]: { "id": 3 },
    },
    procedures: {
      [1]: { "id": 1, "jobId": 1, "machineId": undefined, "sequence": 1, "processingMilliseconds": 600000 },
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 240000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
      [5]: { "id": 5, "jobId": 2, "machineId": undefined, "sequence": 2, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 },
      [8]: { "id": 8, "jobId": 3, "machineId": undefined, "sequence": 1, "processingMilliseconds": 240000 },
      [9]: { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
      [10]: { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(3480000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(3480000),
      minViewDuration: 360000,
      maxViewDuration: 3480000
    },
    jobColors: {
      [1]: { "id": 1, color: '#3cb44b', textColor: '#000000' },
      [2]: { "id": 2, color: '#ffe119', textColor: '#000000' },
      [3]: { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    }
  });
});

test("deleteJob action", () => {
  // deletes procedures
  const state = { ...initialState };
  const deleteJobAction = deleteJob(1);
  const resultState = editContentReducer(state, deleteJobAction);
  expect(resultState).toEqual({
    title: null,
    description: null,
    machines:
    {
      [1]: { "id": 1, title: "M1", description: "Machine 1" },
      [2]: { "id": 2, title: "M2", description: "Machine 2" },
      [3]: { "id": 3, title: "M3", description: "Machine 3" },
      [4]: { "id": 4, title: "M4", description: "Machine 4" }
    },
    jobs: {
      [2]: { "id": 2 },
      [3]: { "id": 3 },
    },
    procedures: {
      [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 2, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 1, "sequence": 1, "processingMilliseconds": 240000 },
      [9]: { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
      [10]: { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(2160000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(2160000),
      minViewDuration: 360000,
      maxViewDuration: 2160000
    },
    jobColors: {
      [2]: { "id": 2, color: '#ffe119', textColor: '#000000' },
      [3]: { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    }
  });
});

test("createProcedure action", () => {
  const state = { ...initialState };
  const jobId = 1;
  const createProcedureAction = createProcedure(jobId);
  const resultState = editContentReducer(state, createProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [11]: { "id": 11, "jobId": jobId, "machineId": undefined, "sequence": 4, "processingMilliseconds": undefined }
    }
  });
});

test("moveProcedure action moves from the beginning to second", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(4, 2);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
    }
  });
});

test("moveProcedure action moves from the second to the beginning", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(5, 1);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
    }
  });
});

test("moveProcedure action moves to the end", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(6, 4);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 4, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 3, "processingMilliseconds": 360000 },
    }
  });
});

test("moveProcedure action moves from the end", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(7, 3);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 4, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 3, "processingMilliseconds": 360000 },
    }
  });
});

test("moveProcedure action moves in the middle", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(5, 3);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 3, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 2, "processingMilliseconds": 300000 },
    }
  });
});

test("moveProcedure action works when skiping order", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(5, 4);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 4, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 2, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 3, "processingMilliseconds": 360000 },
    }
  });
});

test("moveProcedure action works when skiping order reverse", () => {
  const state = { ...initialState };
  const moveProcedureAction = moveProcedure(7, 2);
  const resultState = editContentReducer(state, moveProcedureAction);
  expect(resultState).toEqual({
    ...initialState,
    procedures: {
      ...initialState.procedures,
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 3, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 4, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 360000 },
    }
  });
});

test("deleteProcedure action", () => {
  // re-orders other procedures 
  const state = { ...initialState };
  const deleteProcedureAction = deleteProcedure(1);
  const resultState = editContentReducer(state, deleteProcedureAction);
  expect(resultState).toEqual({
    title: null,
    description: null,
    machines:
    {
      [1]: { "id": 1, title: "M1", description: "Machine 1" },
      [2]: { "id": 2, title: "M2", description: "Machine 2" },
      [3]: { "id": 3, title: "M3", description: "Machine 3" },
      [4]: { "id": 4, title: "M4", description: "Machine 4" }
    },
    jobs: {
      [1]: { "id": 1 },
      [2]: { "id": 2 },
      [3]: { "id": 3 },
    },
    procedures: {
      [2]: { "id": 2, "jobId": 1, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
      [3]: { "id": 3, "jobId": 1, "machineId": 3, "sequence": 2, "processingMilliseconds": 240000 },
      [4]: { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
      [5]: { "id": 5, "jobId": 2, "machineId": 1, "sequence": 2, "processingMilliseconds": 180000 },
      [6]: { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
      [7]: { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 },
      [8]: { "id": 8, "jobId": 3, "machineId": 1, "sequence": 1, "processingMilliseconds": 240000 },
      [9]: { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
      [10]: { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
    },
    isAutoTimeOptions: true,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(2880000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(2880000),
      minViewDuration: 360000,
      maxViewDuration: 2880000
    },
    jobColors: {
      [1]: { "id": 1, color: '#3cb44b', textColor: '#000000' },
      [2]: { "id": 2, color: '#ffe119', textColor: '#000000' },
      [3]: { "id": 3, color: '#4363d8', textColor: '#ffffff' },
    }
  });
});

test("init function with auto time options overrides provided", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = true;
  const timeOptions = {
    referenceDate: new Date(0), // minTime === referenceDate
    maxTime: new Date(5000000),
    viewStartTime: new Date(0),
    viewEndTime: new Date(3500000),
    minViewDuration: 400000,
    maxViewDuration: 3500000
  };
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  });

  expect(resultState).toEqual(initialState);
});

test("init function with manual time options uses provided options", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = false;
  const timeOptions = {
    referenceDate: new Date(0), // minTime === referenceDate
    maxTime: new Date(5000000),
    viewStartTime: new Date(0),
    viewEndTime: new Date(3500000),
    minViewDuration: 400000,
    maxViewDuration: 3500000
  };
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  });

  expect(resultState).toEqual({
    ...initialState,
    isAutoTimeOptions: false,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(5000000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(3500000),
      minViewDuration: 400000,
      maxViewDuration: 3500000
    }
  });
});

test("changing isAutoTimeOptions to true will re-calculate", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = false;
  const timeOptions = {
    referenceDate: new Date(0), // minTime === referenceDate
    maxTime: new Date(5000000),
    viewStartTime: new Date(0),
    viewEndTime: new Date(3500000),
    minViewDuration: 400000,
    maxViewDuration: 3500000
  };
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const intermediateState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  });

  const setIsAutoTimeOptionsAction = setIsAutoTimeOptions(true);
  const resultState = editContentReducer(intermediateState, setIsAutoTimeOptionsAction);

  expect(resultState).toEqual(initialState);
});

test("init function with manual time options fills undefined time options", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = false;
  const timeOptions = {
    referenceDate: new Date(0), // minTime === referenceDate
    maxTime: new Date(5000000),
    viewStartTime: new Date(0),
    viewEndTime: new Date(3500000),
    maxViewDuration: 3500000
  };
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  });

  expect(resultState).toEqual({
    ...initialState,
    isAutoTimeOptions: false,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate
      maxTime: new Date(5000000),
      viewStartTime: new Date(0),
      viewEndTime: new Date(3500000),
      minViewDuration: 360000, // this minViewDuration is not provided, and generated during init
      maxViewDuration: 3500000
    }
  });
});

test("init function with manual time options uses provided options to fill undefined time options", () => {
  // maxTime > minViewDuration > sumOfProcessingTime is provided, others undefined
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = false;
  const timeOptions = {
    maxTime: new Date(5000000),
  };
  const jobColors = [
    { id: 1, color: '#3cb44b', textColor: '#000000' },
    { id: 2, color: '#ffe119', textColor: '#000000' },
    { id: 3, color: '#4363d8', textColor: '#ffffff' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    timeOptions,
    jobColors
  });

  expect(resultState).toEqual({
    ...initialState,
    isAutoTimeOptions: false,
    timeOptions: {
      referenceDate: new Date(0), // minTime === referenceDate // generated during init
      maxTime: new Date(5000000),
      viewStartTime: new Date(0), // generated during init
      viewEndTime: new Date(5000000), // generated during init, depending on provided maxTime
      minViewDuration: 360000, // generated during init
      maxViewDuration: 5000000 // generated during init, depending on provided maxTime
    }
  });
});

test("changeJobColor action", () => {
  const state = { ...initialState };
  const changeJobColorAction = changeJobColor(1);
  const resultState = editContentReducer(state, changeJobColorAction);
  expect(resultState).toEqual({
    ...initialState,
    jobColors: {
      ...initialState.jobColors,
      [1]: { id: 1, color: '#f58231', textColor: '#000000' }
    }
  });
});

test("changeJobColor action 2", () => {
  const state = { ...initialState };
  const changeJobColorAction = changeJobColor(1);
  const intermediateState = editContentReducer(state, changeJobColorAction);
  const resultState = editContentReducer(intermediateState, changeJobColorAction);
  expect(resultState).toEqual({
    ...initialState,
    jobColors: {
      ...initialState.jobColors,
      [1]: { id: 1, color: '#911eb4', textColor: '#ffffff' }
    }
  });
});

test("init function fills empty job color", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = true;

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions
  });

  expect(resultState).toEqual(initialState);
});

test("init function uses provided job colors and fills missing", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = true;
  const jobColors = [
    { id: 3, color: '#eeeeee', textColor: '#111111' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    jobColors
  });

  expect(resultState).toEqual({
    ...initialState,
    jobColors: {
      ...initialState.jobColors,
      [3]: { id: 3, color: '#eeeeee', textColor: '#111111' }
    }
  });
});

test("init function skips provided job colors that does not have job", () => {
  const machines = [
    { "id": 1, title: "M1", description: "Machine 1" },
    { "id": 2, title: "M2", description: "Machine 2" },
    { "id": 3, title: "M3", description: "Machine 3" },
    { "id": 4, title: "M4", description: "Machine 4" }
  ];
  const jobs = [
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
    },
  ];
  const isAutoTimeOptions = true;
  const jobColors = [
    { id: 3, color: '#eeeeee', textColor: '#111111' },
  ];

  const resultState = editContentInit({
    machines,
    jobs,
    isAutoTimeOptions,
    jobColors
  });

  expect(resultState).toEqual({
    ...initialState,
    jobColors: {
      ...initialState.jobColors,
      [3]: { id: 3, color: '#eeeeee', textColor: '#111111' }
    }
  });
});

test("adding job will have a corresponding job color", () => {
  const state = { ...initialState };
  const createJobAction = createJob();
  const resultState = editContentReducer(state, createJobAction);
  expect(resultState).toMatchObject({
    jobColors: expect.objectContaining({
      [4]: { id: 4, color: '#f58231', textColor: '#000000' }
    })
  });
});

test("removing job will remove the corresponding job color", () => {
  const state = { ...initialState };
  const deleteJobAction = deleteJob(1);
  const resultState = editContentReducer(state, deleteJobAction);
  expect(resultState).toMatchObject({
    jobColors: expect.not.objectContaining({
      [1]: expect.anything()
    })
  });
});
