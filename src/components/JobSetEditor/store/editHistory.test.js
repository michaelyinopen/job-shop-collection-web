import { nanoid } from 'nanoid'
import {
  configureStore,
} from '@reduxjs/toolkit'
import { jobSetEditorReducer } from './jobSetEditorReducer'
import {
  editHistoryMiddleware,
  conflictHasRelatedChanges,
} from './editHistory'
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
  test('mockReturnValueOnce to replace mocked impleemntation once', () => {
    const firstId = nanoid()
    expect(firstId).toBe("1")
    nanoid.mockReturnValueOnce('kN0_Jo47lPQjjo5VL2XbF')
    const mocekdOnceId = nanoid()
    expect(mocekdOnceId).toBe('kN0_Jo47lPQjjo5VL2XbF')
    const secondId = nanoid()
    expect(secondId).toBe("2")
  })
  test('module that imports nanoid uses the mock', () => {
    const jobAction = actions.createJob()
    expect(jobAction.payload.id).toBe("1")
  })
})

describe('Text field change: Edit Title', () => {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
      entities: {
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
  describe('Refreshed local and remote conflicting edits', () => {
    test('Conflict', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setTitle('Local edited title')) // stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
        {
          id: 1,
          title: 'Remote edited title',
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
      expect(actualState.formData.title).toEqual('Remote edited title')
      expect(actualState.steps).toEqual({
        ids: ['initial', '1', '2'],
        entities: {
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
                type: "conflict",
                fieldChanges: [
                  {
                    path: "/title",
                    previousValue: "Local edited title",
                    newValue: "Remote edited title",
                  },
                ],
                conflictName: 'Edit title',
                conflictApplied: true,
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualState.currentStepIndex).toBe(2)
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    test('Unapply re-apply undo redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setTitle('Local edited title')) // stepId: 1
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
        {
          id: 1,
          title: 'Remote edited title',
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

      // unapply
      jobSetEditorStore.dispatch(actions.unApplyConflict('2', 0))
      const unapplyState = jobSetEditorStore.getState()
      expect(unapplyState.formData.title).toEqual('Local edited title')
      expect(unapplyState.currentStepIndex).toBe(2)

      // undo unapply
      jobSetEditorStore.dispatch(actions.undo())
      const undoUnapplyState = jobSetEditorStore.getState()
      expect(undoUnapplyState.formData.title).toEqual('Local edited title')
      expect(undoUnapplyState.currentStepIndex).toBe(1)

      // redo unapply
      jobSetEditorStore.dispatch(actions.redo())
      const redoUnapplyState = jobSetEditorStore.getState()
      expect(redoUnapplyState.formData.title).toEqual('Local edited title')
      expect(redoUnapplyState.currentStepIndex).toBe(2)

      // reapply
      jobSetEditorStore.dispatch(actions.applyConflict('2', 0))
      const reapplyState = jobSetEditorStore.getState()
      expect(reapplyState.formData.title).toEqual('Remote edited title')
      expect(reapplyState.currentStepIndex).toBe(2)

      // undo reapply
      jobSetEditorStore.dispatch(actions.undo())
      const undoReapplyState = jobSetEditorStore.getState()
      expect(undoReapplyState.formData.title).toEqual('Local edited title')
      expect(undoReapplyState.currentStepIndex).toBe(1)

      // redo reapply
      jobSetEditorStore.dispatch(actions.redo())
      const redoReapplyState = jobSetEditorStore.getState()
      expect(redoReapplyState.formData.title).toEqual('Remote edited title')
      expect(redoReapplyState.currentStepIndex).toBe(2)
    })
    test('Conflict has related change', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setTitle('Local edited title')) // stepId: 1
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
        {
          id: 1,
          title: 'Remote edited title',
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
      const conflictStepId = '2'
      const conflictStepIndex = 2
      const conflictIndex = 0

      // edit
      jobSetEditorStore.dispatch(actions.setTitle('Title edited after refreshed')) // stepId: 3
      const editState = jobSetEditorStore.getState()
      const editConflictOperation = editState.steps.entities[conflictStepId].operations
        .filter(op => op.type === 'conflict')[conflictIndex]
      const editHasRelatedChanges = (() => {
        const postConflictSteps = editState.steps.ids
          .slice(
            conflictStepIndex + 1,
            editState.currentStepIndex + 1
          )
          .map(id => editState.steps.entities[id])
        for (const step of postConflictSteps) {
          const conflictHasRelatedChangesWithStep = conflictHasRelatedChanges(editConflictOperation, step)
          if (conflictHasRelatedChangesWithStep) {
            return true
          }
        }
        return false
      })()
      expect(editHasRelatedChanges).toBe(true)

      // undo edit
      jobSetEditorStore.dispatch(actions.undo())
      const undoEditState = jobSetEditorStore.getState()
      const undoEditConflictOperation = editState.steps.entities[conflictStepId].operations
        .filter(op => op.type === 'conflict')[conflictIndex]
      const undoEditHasRelatedChanges = (() => {
        const postConflictSteps = undoEditState.steps.ids
          .slice(
            conflictStepIndex + 1,
            undoEditState.currentStepIndex + 1
          )
          .map(id => undoEditState.steps.entities[id])
        for (const step of postConflictSteps) {
          const conflictHasRelatedChangesWithStep = conflictHasRelatedChanges(undoEditConflictOperation, step)
          if (conflictHasRelatedChangesWithStep) {
            return true
          }
        }
        return false
      })()
      expect(undoEditHasRelatedChanges).toBe(false)
    })
  })
})

describe('Collection: Machines', () => {
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
          machines: [
            {
              id: "HsDzur1T_YKl5ODHTeMIx",
              sequence: 1,
              title: "M1",
              description: "Machine 1"
            },
            {
              id: "2lqxJoUnwFKXvSJjntmCY",
              sequence: 2,
              title: "M2",
              description: "Machine 2"
            },
            {
              id: "XOPjM1xFGbStEP6UUrmvE",
              sequence: 3,
              title: "M3",
              description: "Machine 3"
            },
            {
              id: "_o8e68TiHD78pAJ6jDzBR",
              sequence: 4,
              title: "M4",
              description: "Machine 4"
            }],
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
  // describe Add item: add machine
  describe('Item field change', () => {
    test('Edit Machine Title', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
      expect(actualState.steps).toEqual({
        ids: ['initial', '1'],
        entities: {
          'initial': {
            id: 'initial',
            name: 'initial',
            operations: []
          },
          '1': {
            id: '1',
            name: 'Edit machine title',
            operations: [
              {
                type: 'edit',
                fieldChanges: [
                  {
                    path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY/title',
                    previousValue: 'M2',
                    newValue: 'M2 edited'
                  }
                ],
                applied: true
              }
            ]
          },
        }
      })
    })
    // combine
    // undo redo
    // Local Edit
    // Remote Edit
    // Same Edits
    // Conflicting Edits
    // - Unapply Reapply Undo/redo
    // - Related change + Undo
  })
  // move machine
  // remove machine
  // mixed conflicts
})