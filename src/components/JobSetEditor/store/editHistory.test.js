import { nanoid } from 'nanoid'
import {
  configureStore,
} from '@reduxjs/toolkit'
import { jobSetEditorReducer } from './jobSetEditorReducer'
import { editHistoryMiddleware } from './editHistory'
import { autoTimeOptionsMiddleware } from './autoTimeOptionsMiddleware'
import { validationMiddleware } from './validation'
import * as actions from './actions'

// mock nanoid to return incrementing integer string, starting from 1
// nanoid are used by action creaters
// in tests comment the nanoid value
jest.mock('nanoid', () => ({
  nanoid: jest.fn()
}))

beforeEach(() => {
  let currentNanoId = 0
  nanoid.mockImplementation(() => {
    currentNanoId = currentNanoId + 1
    return String(currentNanoId)
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Verify that nanoid mock works', () => {
  test('nanoid mock outputs incrementing integer string, starting with "1"', () => {
    const firstId = nanoid()
    expect(firstId).toBe("1")
    const secondId = nanoid()
    expect(secondId).toBe("2")
  })
  test('nanoid mock resets', () => {
    const firstId = nanoid()
    expect(firstId).toBe("1")
    const secondId = nanoid()
    expect(secondId).toBe("2")
  })
  test('module that imports nanoid uses the mock', () => {
    const jobAction = actions.createJob()
    expect(jobAction.payload.id).toBe("1")
  })
})

describe('Edit Title', () => {
  const createLoadedEditorStore = () => {
    const jobSetEditorStore = configureStore({
      reducer: jobSetEditorReducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat(editHistoryMiddleware)
        .concat(autoTimeOptionsMiddleware)
        .concat(validationMiddleware)
    })

    jobSetEditorStore.dispatch(actions.setJobSetEditorId(1))
    jobSetEditorStore.dispatch(actions.setJobSetEditorIsEdit(true))
    jobSetEditorStore.dispatch(actions.loadedJobSet())

    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore(
      {
        id: 1,
        title: 'A Sample Job Set',
        description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '1',
        hasDetail: true
      },
      true
    ))
    return jobSetEditorStore
  }
  test('Edit', () => {
    const jobSetEditorStore = createLoadedEditorStore()

    // act
    jobSetEditorStore.dispatch(actions.setTitle('Title edited')) // stepId: 1

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Title edited')
    expect(actualState.steps).toEqual({
      ids: ['initial', '1'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Title edited'
                }
              ],
              applied: true
            }
          ]
        },
      }
    })
  })
  test('Combine Edits', () => {
    const jobSetEditorStore = createLoadedEditorStore()

    // act
    jobSetEditorStore.dispatch(actions.setTitle('Title edited 1')) // stepId: 1
    jobSetEditorStore.dispatch(actions.setTitle('Title edited 2')) // stepId: 1 (combined)
    jobSetEditorStore.dispatch(actions.setDescription('Description edited in between')) // stepId: 2
    jobSetEditorStore.dispatch(actions.setTitle('Title edited 3')) // stepId: 3

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Title edited 3')
    expect(actualState.steps).toEqual({
      ids: ['initial', '1', '2', '3'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Title edited 2'
                }
              ],
              applied: true
            }
          ]
        },
        '2': {
          id: '2',
          name: 'Edit description',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/description',
                  previousValue: 'A Job Set contains the machines, jobs and procedures of a schedule.',
                  newValue: 'Description edited in between'
                }
              ],
              applied: true
            }
          ]
        },
        '3': {
          id: '3',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'Title edited 2',
                  newValue: 'Title edited 3'
                }
              ],
              applied: true
            }
          ]
        },
      }
    })
  })
  test('Undo Redo', () => {
    const jobSetEditorStore = createLoadedEditorStore()
    jobSetEditorStore.dispatch(actions.setTitle('Title edited')) // stepId: 1

    // act Undo
    jobSetEditorStore.dispatch(actions.undo())

    // assert Undo
    const actualUndoState = jobSetEditorStore.getState()
    expect(actualUndoState.formData.title).toEqual('A Sample Job Set')
    expect(actualUndoState.steps).toEqual({
      ids: ['initial', '1'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Title edited'
                }
              ],
              applied: true
            }
          ]
        },
      }
    })
    expect(actualUndoState.currentStepIndex).toBe(0)

    // act Redo
    jobSetEditorStore.dispatch(actions.redo())

    // assert Redo
    const actualRedoState = jobSetEditorStore.getState()
    expect(actualRedoState.formData.title).toEqual('Title edited')
    expect(actualRedoState.steps).toEqual({
      ids: ['initial', '1'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Title edited'
                }
              ],
              applied: true
            }
          ]
        },
      }
    })
    expect(actualRedoState.currentStepIndex).toBe(1)
  })
  test('Refreshed local edit', () => {
    // Will created refreshed step with unapplied reverse local operation
    const jobSetEditorStore = createLoadedEditorStore()
    jobSetEditorStore.dispatch(actions.setTitle('Local edited')) // stepId: 1

    // act
    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
      {
        id: 1,
        title: 'A Sample Job Set',
        description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '1',
        hasDetail: true
      },
      true
    ))

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Local edited')
    expect(actualState.steps).toEqual({
      ids: ['initial', '1', '2'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Local edited'
                }
              ],
              applied: true
            }
          ]
        },
        '2': {
          id: '2',
          name: 'Refreshed',
          versionToken: "1",
          mergeBehaviour: "merge",
          operations: [
            {
              type: "reverse local",
              fieldChanges: [
                {
                  path: "/title",
                  previousValue: "Local edited",
                  newValue: "A Sample Job Set",
                },
              ],
              applied: false,
            },
          ],
        },
      }
    })
    expect(actualState.lastVersion?.versionToken).toEqual('1')
  })
  test('Refreshed remote edit', () => {
    const jobSetEditorStore = createLoadedEditorStore()

    // act
    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
      {
        id: 1,
        title: 'Remote edited',
        description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '2',
        hasDetail: true
      },
      true
    ))

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Remote edited')
    expect(actualState.steps).toEqual({
      ids: ['initial', '1'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Refreshed',
          versionToken: "2",
          mergeBehaviour: 'discard local changes',
          operations: [
            {
              type: "merge",
              fieldChanges: [
                {
                  path: "/title",
                  previousValue: "A Sample Job Set",
                  newValue: "Remote edited",
                },
              ],
              applied: true,
            },
          ],
        },
      }
    })
    expect(actualState.currentStepIndex).toBe(1)
    expect(actualState.lastVersion?.versionToken).toEqual('2')
  })
  test('Refreshed remote edit merge with local edit', () => {
    // Refreshed will merge local and remote changes if there are no conflicts
    const jobSetEditorStore = createLoadedEditorStore()
    jobSetEditorStore.dispatch(actions.setTitle('Local edited title')) // stepId: 1

    // act
    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
      {
        id: 1,
        title: 'A Sample Job Set',
        description: 'Remote edited description',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '2',
        hasDetail: true
      },
      true
    ))

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Local edited title')
    expect(actualState.formData.description).toEqual("Remote edited description")
    expect(actualState.steps).toEqual({
      ids: ['initial', '1', '2'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Local edited title'
                }
              ],
              applied: true
            }
          ]
        },
        '2': {
          id: '2',
          name: 'Refreshed',
          versionToken: "2",
          mergeBehaviour: "merge",
          operations: [
            {
              type: "reverse local",
              fieldChanges: [
                {
                  path: "/title",
                  previousValue: "Local edited title",
                  newValue: "A Sample Job Set",
                },
              ],
              applied: false,
            },
            {
              type: "merge",
              fieldChanges: [
                {
                  path: "/description",
                  previousValue: "A Job Set contains the machines, jobs and procedures of a schedule.",
                  newValue: "Remote edited description",
                },
              ],
              applied: true,
            },
          ],
        },
      }
    })
    expect(actualState.currentStepIndex).toBe(2)
    expect(actualState.lastVersion?.versionToken).toEqual('2')
  })
  test('Discard local changes', () => {
    const jobSetEditorStore = createLoadedEditorStore()
    jobSetEditorStore.dispatch(actions.setTitle('Local edited title')) // stepId: 1
    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
      {
        id: 1,
        title: 'A Sample Job Set',
        description: 'Remote edited description',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '2',
        hasDetail: true
      },
      true
    ))
    // act
    jobSetEditorStore.dispatch(actions.setMergeBehaviourDiscardLocal('2'))

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('A Sample Job Set')
    expect(actualState.formData.description).toEqual("Remote edited description")
    expect(actualState.steps).toEqual({
      ids: ['initial', '1', '2'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Local edited title'
                }
              ],
              applied: true
            }
          ]
        },
        '2': {
          id: '2',
          name: 'Refreshed',
          versionToken: "2",
          mergeBehaviour: "discard local changes",
          operations: [
            {
              type: "reverse local",
              fieldChanges: [
                {
                  path: "/title",
                  previousValue: "Local edited title",
                  newValue: "A Sample Job Set",
                },
              ],
              applied: true,
            },
            {
              type: "merge",
              fieldChanges: [
                {
                  path: "/description",
                  previousValue: "A Job Set contains the machines, jobs and procedures of a schedule.",
                  newValue: "Remote edited description",
                },
              ],
              applied: true,
            },
          ],
        },
      }
    })
    expect(actualState.currentStepIndex).toBe(2)
    expect(actualState.lastVersion?.versionToken).toEqual('2')

    // act Undo
    jobSetEditorStore.dispatch(actions.undo())

    // assert Undo
    const actualUndoState = jobSetEditorStore.getState()
    expect(actualUndoState.formData.title).toEqual('Local edited title')
    expect(actualUndoState.formData.description).toEqual("A Job Set contains the machines, jobs and procedures of a schedule.")
    expect(actualUndoState.currentStepIndex).toBe(1)

    // act Redo
    jobSetEditorStore.dispatch(actions.redo())

    // assert Redo
    const actualRedoState = jobSetEditorStore.getState()
    expect(actualRedoState.formData.title).toEqual('A Sample Job Set')
    expect(actualRedoState.formData.description).toEqual('Remote edited description')
    expect(actualRedoState.currentStepIndex).toBe(2)
  })
  test('Refreshed local and remote same update', () => {
    // will not create any new step
    const jobSetEditorStore = createLoadedEditorStore()
    jobSetEditorStore.dispatch(actions.setTitle('Title edited')) // stepId: 1

    // act
    jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
      {
        id: 1,
        title: 'Title edited',
        description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
        content: JSON.stringify({
          machines: [],
          jobs: []
        }),
        jobColors: JSON.stringify({}),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 0,
          viewStartTimeMs: 0,
          viewEndTimeMs: 0,
          minViewDurationMs: 0,
          maxViewDurationMs: 0
        }),
        isLocked: false,
        versionToken: '2',
        hasDetail: true
      },
      true
    ))

    // assert
    const actualState = jobSetEditorStore.getState()
    expect(actualState.formData.title).toEqual('Title edited')
    expect(actualState.steps).toEqual({
      ids: ['initial', '1'],
      items: {
        'initial': {
          id: 'initial',
          name: 'initial',
          operations: []
        },
        '1': {
          id: '1',
          name: 'Edit title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Sample Job Set',
                  newValue: 'Title edited'
                }
              ],
              applied: true
            }
          ]
        }
      }
    })
    expect(actualState.lastVersion?.versionToken).toEqual('2')
  })
  //describe('Refreshed local and remote conflicting edit',()=>{
  //  test('Conflict', () => {
    // test('Unapply re-apply undo redo',
    // test('Conflict has related change'
})