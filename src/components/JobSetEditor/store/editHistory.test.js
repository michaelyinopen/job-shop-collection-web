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
  test('mockReturnValueOnce to replace mocked implementation once', () => {
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
  test('Local edit', () => {
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
  test('Remote edit', () => {
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
  test('Remote edit merge with local edit', () => {
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
  test('Local and remote same update', () => {
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
  describe('Local and remote conflicting edits', () => {
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
  describe('Local unchanged', () => {
    test('Remote delete', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
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
            mergeBehaviour: "discard local changes",
            operations: [
              {
                type: "merge",
                fieldChanges: [
                  {
                    path: "/machines/ids",
                    collectionChange: {
                      type: 'remove',
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      index: 1,
                    }
                  },
                  {
                    path: "/machines/entities/2lqxJoUnwFKXvSJjntmCY",
                    previousValue:
                    {
                      id: "2lqxJoUnwFKXvSJjntmCY",
                      title: "M2",
                      description: "Machine 2"
                    },
                    newValue: undefined
                  },
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    test('Remote delete: Undo Redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualUndoState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toEqual({
        id: '2lqxJoUnwFKXvSJjntmCY',
        title: 'M2',
        description: 'Machine 2',
      })
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualRedoState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
    test('Remote update', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                id: '2lqxJoUnwFKXvSJjntmCY',
                sequence: 2,
                title: 'M2 edited',
                description: 'Machine 2',
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
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

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
            name: 'Refreshed',
            versionToken: "2",
            mergeBehaviour: "discard local changes",
            operations: [
              {
                type: "merge",
                fieldChanges: [
                  {
                    path: "/machines/entities/2lqxJoUnwFKXvSJjntmCY/title",
                    previousValue: 'M2',
                    newValue: 'M2 edited'
                  },
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    test('Remote update: Undo Redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                id: '2lqxJoUnwFKXvSJjntmCY',
                sequence: 2,
                title: 'M2 edited',
                description: 'Machine 2',
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
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2')
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
    test('Remote create', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                id: '2lqxJoUnwFKXvSJjntmCY',
                sequence: 2,
                title: 'M2',
                description: 'Machine 2',
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
              },
              {
                id: 'CMWE6KrIXXmkmkkz0dp5A',
                sequence: 5,
                title: 'M5',
                description: 'Machine 5',
              }
            ],
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
      expect(actualState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        'CMWE6KrIXXmkmkkz0dp5A',  // machine 5
      ])
      expect(actualState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toEqual({
        id: 'CMWE6KrIXXmkmkkz0dp5A',
        title: 'M5',
        description: 'Machine 5',
      })
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
            mergeBehaviour: "discard local changes",
            operations: [
              {
                type: "merge",
                fieldChanges: [
                  {
                    path: "/machines/ids",
                    collectionChange: {
                      type: 'add',
                      id: 'CMWE6KrIXXmkmkkz0dp5A',
                      position: {
                        index: 3,
                        subindex: 0
                      }
                    }
                  },
                  {
                    path: "/machines/entities/CMWE6KrIXXmkmkkz0dp5A",
                    previousValue: undefined,
                    newValue: {
                      id: 'CMWE6KrIXXmkmkkz0dp5A',
                      title: 'M5',
                      description: 'Machine 5',
                    }
                  },
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    test('Remote create: Undo Redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                id: '2lqxJoUnwFKXvSJjntmCY',
                sequence: 2,
                title: 'M2',
                description: 'Machine 2',
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
              },
              {
                id: 'CMWE6KrIXXmkmkkz0dp5A',
                sequence: 5,
                title: 'M5',
                description: 'Machine 5',
              }
            ],
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

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualUndoState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toBeUndefined()
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        'CMWE6KrIXXmkmkkz0dp5A',  // machine 5
      ])
      expect(actualRedoState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toEqual({
        id: 'CMWE6KrIXXmkmkkz0dp5A',
        title: 'M5',
        description: 'Machine 5',
      })
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
  })
  describe('Delete item: remove machine', () => {
    test('Remove Machine', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
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
            name: 'Remove machine',
            operations: [
              {
                type: 'edit',
                fieldChanges: [
                  {
                    path: '/machines/ids',
                    collectionChange: {
                      type: 'remove',
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      index: 1,
                    }
                  },
                  {
                    path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY',
                    previousValue: {
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      title: 'M2',
                      description: 'Machine 2',
                    },
                    newValue: undefined,
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
      jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualUndoState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toEqual({
        id: '2lqxJoUnwFKXvSJjntmCY',
        title: 'M2',
        description: 'Machine 2',
      })
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualRedoState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
    test('Local delete', () => {
      // Will created refreshed step with unapplied reverse local operation
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
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
            name: 'Remove machine',
            operations: [
              {
                type: 'edit',
                fieldChanges: [
                  {
                    path: '/machines/ids',
                    collectionChange: {
                      type: 'remove',
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      index: 1,
                    }
                  },
                  {
                    path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY',
                    previousValue: {
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      title: 'M2',
                      description: 'Machine 2',
                    },
                    newValue: undefined,
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
                    path: '/machines/ids',
                    collectionChange: {
                      type: 'add',
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      position: {
                        index: 0,
                        subindex: 0
                      }
                    }
                  },
                  {
                    path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY',
                    previousValue: undefined,
                    newValue: {
                      id: '2lqxJoUnwFKXvSJjntmCY',
                      title: 'M2',
                      description: 'Machine 2',
                    },
                  }
                ],
                applied: false,
              },
            ],
          },
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('1')
    })
    describe('Local delete, remote update (Confict)', () => {
      test('Confict', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 Edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(actualState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toEqual({
          id: '2lqxJoUnwFKXvSJjntmCY',
          title: 'M2 Edited',
          description: 'Machine 2',
        })
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
              name: 'Remove machine',
              operations: [
                {
                  type: 'edit',
                  fieldChanges: [
                    {
                      path: '/machines/ids',
                      collectionChange: {
                        type: 'remove',
                        id: '2lqxJoUnwFKXvSJjntmCY',
                        index: 1,
                      }
                    },
                    {
                      path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY',
                      previousValue: {
                        id: '2lqxJoUnwFKXvSJjntmCY',
                        title: 'M2',
                        description: 'Machine 2',
                      },
                      newValue: undefined,
                    }
                  ],
                  applied: true
                }
              ]
            },
            '2': {
              id: '2',
              name: 'Refreshed',
              versionToken: '2',
              mergeBehaviour: "merge",
              operations: [
                {
                  type: "conflict",
                  fieldChanges: [
                    {
                      path: '/machines/ids',
                      collectionChange: {
                        type: 'add',
                        id: '2lqxJoUnwFKXvSJjntmCY',
                        position: {
                          index: 0,
                          subindex: 0
                        }
                      }
                    },
                    {
                      path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY',
                      previousValue: undefined,
                      newValue: {
                        id: '2lqxJoUnwFKXvSJjntmCY',
                        title: 'M2 Edited',
                        description: 'Machine 2',
                      },
                    }
                  ],
                  applied: true,
                  conflictName: "Reverse remove machine",
                  conflictApplied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Unapply re-apply undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 Edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // unapply
        jobSetEditorStore.dispatch(actions.unApplyConflict('2', 0))
        const unapplyState = jobSetEditorStore.getState()
        expect(unapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(unapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(unapplyState.currentStepIndex).toBe(2)

        // undo unapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoUnapplyState = jobSetEditorStore.getState()
        expect(undoUnapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(undoUnapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(undoUnapplyState.currentStepIndex).toBe(1)

        // redo unapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoUnapplyState = jobSetEditorStore.getState()
        expect(redoUnapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(redoUnapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(redoUnapplyState.currentStepIndex).toBe(2)

        // reapply
        jobSetEditorStore.dispatch(actions.applyConflict('2', 0))
        const reapplyState = jobSetEditorStore.getState()
        expect(reapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(reapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toEqual({
          id: '2lqxJoUnwFKXvSJjntmCY',
          title: 'M2 Edited',
          description: 'Machine 2',
        })
        expect(reapplyState.currentStepIndex).toBe(2)

        // undo reapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoReapplyState = jobSetEditorStore.getState()
        expect(undoReapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(undoReapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(undoReapplyState.currentStepIndex).toBe(1)

        // redo reapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoReapplyState = jobSetEditorStore.getState()
        expect(redoReapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        ])
        expect(redoReapplyState.formData.machines.entities?.['2lqxJoUnwFKXvSJjntmCY']).toEqual({
          id: '2lqxJoUnwFKXvSJjntmCY',
          title: 'M2 Edited',
          description: 'Machine 2',
        })
        expect(redoReapplyState.currentStepIndex).toBe(2)
      })
      test('Conflict has related change: Delete', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 Edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0

        // edit
        jobSetEditorStore.dispatch(actions.removeMachine("2lqxJoUnwFKXvSJjntmCY")) // machine 2, stepId: 3
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
      test('Conflict has related change: Update', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.removeMachine('2lqxJoUnwFKXvSJjntmCY')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 Edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0

        // edit
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited after refreshed')) // machine 2, stepId: 3
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
  describe('Update item: Set Machine Title', () => {
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
    test('Combine Edits', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited 1')) // machine 2, stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited 2')) // machine 2, stepId: 2

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited 2')
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
                    newValue: 'M2 edited 2'
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
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2')
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
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
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
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
    test('Local update', () => {
      // Will created refreshed step with unapplied reverse local operation
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
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
                    path: "/machines/entities/2lqxJoUnwFKXvSJjntmCY/title",
                    previousValue: "M2 edited",
                    newValue: "M2",
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
    describe('Local update, remote delete (Confict)', () => {
      test('Confict', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(actualState.formData.machines.entities['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
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
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'remove',
                        id: '2lqxJoUnwFKXvSJjntmCY',
                        index: 1,
                      }
                    },
                    {
                      path: "/machines/entities/2lqxJoUnwFKXvSJjntmCY",
                      previousValue:
                      {
                        id: "2lqxJoUnwFKXvSJjntmCY",
                        title: "M2 edited",
                        description: "Machine 2"
                      },
                      newValue: undefined
                    },
                  ],
                  applied: true,
                  conflictName: "Remove machine",
                  conflictApplied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Unapply re-apply undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // unapply
        jobSetEditorStore.dispatch(actions.unApplyConflict('2', 0))
        const unapplyState = jobSetEditorStore.getState()
        expect(unapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(unapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
        expect(unapplyState.currentStepIndex).toBe(2)

        // undo unapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoUnapplyState = jobSetEditorStore.getState()
        expect(undoUnapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(undoUnapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
        expect(undoUnapplyState.currentStepIndex).toBe(1)

        // redo unapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoUnapplyState = jobSetEditorStore.getState()
        expect(redoUnapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(redoUnapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
        expect(redoUnapplyState.currentStepIndex).toBe(2)

        // reapply
        jobSetEditorStore.dispatch(actions.applyConflict('2', 0))
        const reapplyState = jobSetEditorStore.getState()
        expect(reapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(reapplyState.formData.machines.entities['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(reapplyState.currentStepIndex).toBe(2)

        // undo reapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoReapplyState = jobSetEditorStore.getState()
        expect(undoReapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          '2lqxJoUnwFKXvSJjntmCY',  // machine 2
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(undoReapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 edited')
        expect(undoReapplyState.currentStepIndex).toBe(1)

        // redo reapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoReapplyState = jobSetEditorStore.getState()
        expect(redoReapplyState.formData.machines.ids).toEqual([
          'HsDzur1T_YKl5ODHTeMIx',  // machine 1
          'XOPjM1xFGbStEP6UUrmvE',  // machine 3
          '_o8e68TiHD78pAJ6jDzBR'   // machine 4
        ])
        expect(redoReapplyState.formData.machines.entities['2lqxJoUnwFKXvSJjntmCY']).toBeUndefined()
        expect(redoReapplyState.currentStepIndex).toBe(2)
      })
      test('Conflict has related change: Delete', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0
        jobSetEditorStore.dispatch(actions.unApplyConflict(conflictStepId, 0))

        // edit
        jobSetEditorStore.dispatch(actions.removeMachine("2lqxJoUnwFKXvSJjntmCY")) // machine 2, stepId: 3
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
      test('Conflict has related change: Update', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0
        jobSetEditorStore.dispatch(actions.unApplyConflict(conflictStepId, 0))

        // edit
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited after refreshed')) // machine 2, stepId: 3
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
    describe('Conflicting updates', () => {
      test('Confict', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 local edited')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 remote edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 remote edited')
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
              name: 'Edit machine title',
              operations: [
                {
                  type: 'edit',
                  fieldChanges: [
                    {
                      path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY/title',
                      previousValue: 'M2',
                      newValue: 'M2 local edited'
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
                      path: '/machines/entities/2lqxJoUnwFKXvSJjntmCY/title',
                      previousValue: 'M2 local edited',
                      newValue: 'M2 remote edited'
                    }
                  ],
                  applied: true,
                  conflictName: "Edit machine title",
                  conflictApplied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Unapply re-apply undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 local edited')) // machine 2, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 remote edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // unapply
        jobSetEditorStore.dispatch(actions.unApplyConflict('2', 0))
        const unapplyState = jobSetEditorStore.getState()
        expect(unapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 local edited')
        expect(unapplyState.currentStepIndex).toBe(2)

        // undo unapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoUnapplyState = jobSetEditorStore.getState()
        expect(undoUnapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 local edited')
        expect(undoUnapplyState.currentStepIndex).toBe(1)

        // redo unapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoUnapplyState = jobSetEditorStore.getState()
        expect(redoUnapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 local edited')
        expect(redoUnapplyState.currentStepIndex).toBe(2)

        // reapply
        jobSetEditorStore.dispatch(actions.applyConflict('2', 0))
        const reapplyState = jobSetEditorStore.getState()
        expect(reapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 remote edited')
        expect(reapplyState.currentStepIndex).toBe(2)

        // undo reapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoReapplyState = jobSetEditorStore.getState()
        expect(redoUnapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 local edited')
        expect(undoReapplyState.currentStepIndex).toBe(1)

        // redo reapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoReapplyState = jobSetEditorStore.getState()
        expect(reapplyState.formData.machines.entities["2lqxJoUnwFKXvSJjntmCY"].title).toEqual('M2 remote edited')
        expect(redoReapplyState.currentStepIndex).toBe(2)
      })
      test('Conflict has related change: Delete', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 local edited')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 remote edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0

        // edit
        jobSetEditorStore.dispatch(actions.removeMachine("2lqxJoUnwFKXvSJjntmCY")) // machine 2, stepId: 3
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
      test('Conflict has related change: Update', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 local edited')) // machine 2, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                  title: "M2 remote edited",
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
            versionToken: '2',
            hasDetail: true
          },
          true
        ))
        const conflictStepId = '2'
        const conflictStepIndex = 2
        const conflictIndex = 0

        // edit
        jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited after refreshed')) // machine 2, stepId: 3
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
    test('Local and remote same update', () => {
      // will not create any new step
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setMachineTitle("2lqxJoUnwFKXvSJjntmCY", 'M2 edited')) // machine 2, stepId: 1

      // act
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
                title: "M2 edited",
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
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

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
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
  })
  describe('Create item: add machine', () => {
    test('Add Machine', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      nanoid.mockReturnValueOnce('CMWE6KrIXXmkmkkz0dp5A')
      jobSetEditorStore.dispatch(actions.addMachine()) // machine 5, stepId: 1

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        'CMWE6KrIXXmkmkkz0dp5A',  // machine 5
      ])
      expect(actualState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toEqual({
        id: 'CMWE6KrIXXmkmkkz0dp5A',
        title: 'M5',
        description: 'Machine 5',
      })
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
            name: 'Add machine',
            operations: [
              {
                type: 'edit',
                fieldChanges: [
                  {
                    path: '/machines/ids',
                    collectionChange: {
                      type: 'add',
                      id: 'CMWE6KrIXXmkmkkz0dp5A',
                      position: {
                        index: 3,
                        subindex: 0
                      }
                    }
                  },
                  {
                    path: '/machines/entities/CMWE6KrIXXmkmkkz0dp5A',
                    previousValue: undefined,
                    newValue: {
                      id: 'CMWE6KrIXXmkmkkz0dp5A',
                      title: 'M5',
                      description: 'Machine 5',
                    }
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
      nanoid.mockReturnValueOnce('CMWE6KrIXXmkmkkz0dp5A')
      jobSetEditorStore.dispatch(actions.addMachine()) // machine 5, stepId: 1

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
      ])
      expect(actualUndoState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toBeUndefined()
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.machines.ids).toEqual([
        'HsDzur1T_YKl5ODHTeMIx',  // machine 1
        '2lqxJoUnwFKXvSJjntmCY',  // machine 2
        'XOPjM1xFGbStEP6UUrmvE',  // machine 3
        '_o8e68TiHD78pAJ6jDzBR',  // machine 4
        'CMWE6KrIXXmkmkkz0dp5A',  // machine 5
      ])
      expect(actualRedoState.formData.machines.entities?.['CMWE6KrIXXmkmkkz0dp5A']).toEqual({
        id: 'CMWE6KrIXXmkmkkz0dp5A',
        title: 'M5',
        description: 'Machine 5',
      })
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
  })
})

describe('Collection move: Procedures', () => {
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
            }
          ],
          jobs: [
            {
              id: 'qfDwuWBUIygzXlR0-1mLY',
              sequence: 1,
              title: '1',
              procedures: [
                {
                  id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                  sequence: 1,
                  jobId: 'qfDwuWBUIygzXlR0-1mLY',
                  machineId: undefined,
                  processingTimeMs: 60000
                },
                {
                  id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                  sequence: 2,
                  jobId: 'qfDwuWBUIygzXlR0-1mLY',
                  machineId: undefined,
                  processingTimeMs: 120000
                },
                {
                  id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                  sequence: 3,
                  jobId: 'qfDwuWBUIygzXlR0-1mLY',
                  machineId: undefined,
                  processingTimeMs: 180000
                }
              ]
            }
          ]
        }),
        jobColors: JSON.stringify({
          'qfDwuWBUIygzXlR0-1mLY': {
            jobId: 'qfDwuWBUIygzXlR0-1mLY',
            color: '#3cb44b',
            textColor: '"#000000'
          }
        }),
        isAutoTimeOptions: true,
        timeOptions: JSON.stringify({
          maxTimeMs: 360000,
          viewStartTimeMs: 0,
          viewEndTimeMs: 360000,
          minViewDurationMs: 120000,
          maxViewDurationMs: 360000
        }),
        isLocked: false,
        versionToken: '1',
        hasDetail: true
      },
      true
    ))
    return jobSetEditorStore
  }
  describe('Local unchanged, remote move', () => {
    test('Refreshed', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
              }
            ],
            jobs: [
              {
                id: 'qfDwuWBUIygzXlR0-1mLY',
                sequence: 1,
                title: '1',
                procedures: [
                  {
                    id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                    sequence: 1,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 60000
                  },
                  {
                    id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                    sequence: 2,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 180000
                  },
                  {
                    id: 'eC7QzG8rqQuTq6hCXCRq2',
                    sequence: 3,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY', // 2 minute
                    machineId: undefined,
                    processingTimeMs: 120000
                  }
                ]
              }
            ]
          }),
          jobColors: JSON.stringify({
            'qfDwuWBUIygzXlR0-1mLY': {
              jobId: 'qfDwuWBUIygzXlR0-1mLY',
              color: '#3cb44b',
              textColor: '"#000000'
            }
          }),
          isAutoTimeOptions: true,
          timeOptions: JSON.stringify({
            maxTimeMs: 360000,
            viewStartTimeMs: 0,
            viewEndTimeMs: 360000,
            minViewDurationMs: 120000,
            maxViewDurationMs: 360000
          }),
          isLocked: false,
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
      ])
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
            mergeBehaviour: "discard local changes",
            operations: [
              {
                type: "merge",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    test('Undo Redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
              }
            ],
            jobs: [
              {
                id: 'qfDwuWBUIygzXlR0-1mLY',
                sequence: 1,
                title: '1',
                procedures: [
                  {
                    id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                    sequence: 1,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 60000
                  },
                  {
                    id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                    sequence: 2,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 180000
                  },
                  {
                    id: 'eC7QzG8rqQuTq6hCXCRq2',
                    sequence: 3,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY', // 2 minute
                    machineId: undefined,
                    processingTimeMs: 120000
                  }
                ]
              }
            ]
          }),
          jobColors: JSON.stringify({
            'qfDwuWBUIygzXlR0-1mLY': {
              jobId: 'qfDwuWBUIygzXlR0-1mLY',
              color: '#3cb44b',
              textColor: '"#000000'
            }
          }),
          isAutoTimeOptions: true,
          timeOptions: JSON.stringify({
            maxTimeMs: 360000,
            viewStartTimeMs: 0,
            viewEndTimeMs: 360000,
            minViewDurationMs: 120000,
            maxViewDurationMs: 360000
          }),
          isLocked: false,
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
      ])
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
  })
  describe('Move', () => {
    test('Edit', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          },
        }
      })
    })
    test('Combine Edits', () => {
      const jobSetEditorStore = createLoadedEditorStore()

      // act
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'RnU82Aa3wlL_n_MsE1l1K', 1)) // 3 minute to index 1, stepId: 2

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          },
        }
      })
    })
    test('Undo Redo', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

      // act Undo
      jobSetEditorStore.dispatch(actions.undo())

      // assert Undo
      const actualUndoState = jobSetEditorStore.getState()
      expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualUndoState.currentStepIndex).toBe(0)

      // act Redo
      jobSetEditorStore.dispatch(actions.redo())

      // assert Redo
      const actualRedoState = jobSetEditorStore.getState()
      expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          },
        }
      })
      expect(actualRedoState.currentStepIndex).toBe(1)
    })
    test('Local Move', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
              }
            ],
            jobs: [
              {
                id: 'qfDwuWBUIygzXlR0-1mLY',
                sequence: 1,
                title: '1',
                procedures: [
                  {
                    id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                    sequence: 1,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 60000
                  },
                  {
                    id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                    sequence: 2,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 120000
                  },
                  {
                    id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                    sequence: 3,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 180000
                  }
                ]
              }
            ]
          }),
          jobColors: JSON.stringify({
            'qfDwuWBUIygzXlR0-1mLY': {
              jobId: 'qfDwuWBUIygzXlR0-1mLY',
              color: '#3cb44b',
              textColor: '"#000000'
            }
          }),
          isAutoTimeOptions: true,
          timeOptions: JSON.stringify({
            maxTimeMs: 360000,
            viewStartTimeMs: 0,
            viewEndTimeMs: 360000,
            minViewDurationMs: 120000,
            maxViewDurationMs: 360000
          }),
          isLocked: false,
          versionToken: '1',
          hasDetail: true
        },
        true
      ))

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
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
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
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
    describe('Local Move: remove delete', () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    }
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
            }),
            isLocked: false,
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        ])
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
              name: 'Move procedures',
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                        newValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                      }
                    }
                  ],
                  applied: true,
                },
              ],
            },
            '2': {
              id: '2',
              name: 'Refreshed',
              versionToken: "2",
              mergeBehaviour: "merge",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'remove',
                        id: 'RnU82Aa3wlL_n_MsE1l1K',
                        index: 2
                      }
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/RnU82Aa3wlL_n_MsE1l1K",
                      previousValue: {
                        id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                        jobId: 'qfDwuWBUIygzXlR0-1mLY',
                        machineId: null,
                        processingTimeMs: 180000
                      },
                      newValue: undefined,
                    },
                  ],
                  applied: true,
                },
                {
                  type: "reverse local",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        ],
                        newValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        ],
                      }
                    },
                  ],
                  applied: false,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    }
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
            }),
            isLocked: false,
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.entities['RnU82Aa3wlL_n_MsE1l1K']).toEqual({
          id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
          jobId: 'qfDwuWBUIygzXlR0-1mLY',
          machineId: null,
          processingTimeMs: 180000
        })
        expect(actualUndoState.currentStepIndex).toBe(1)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        ])
        expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.entities['RnU82Aa3wlL_n_MsE1l1K']).toBeUndefined()
        expect(actualRedoState.currentStepIndex).toBe(2)
      })
    })
    describe('Conflicting moves', () => {
      test('Confict', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 180000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 3,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
            }),
            isLocked: false,
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        ])
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
              name: 'Move procedures',
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                        newValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                      }
                    }
                  ],
                  applied: true,
                },
              ],
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
                      path: '/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids',
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                        newValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        ]
                      }
                    }
                  ],
                  applied: true,
                  conflictName: "Move procedures",
                  conflictApplied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Unapply re-apply undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 180000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 3,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
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
        expect(unapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(unapplyState.currentStepIndex).toBe(2)

        // undo unapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoUnapplyState = jobSetEditorStore.getState()
        expect(undoUnapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(undoUnapplyState.currentStepIndex).toBe(1)

        // redo unapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoUnapplyState = jobSetEditorStore.getState()
        expect(redoUnapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(redoUnapplyState.currentStepIndex).toBe(2)

        // reapply
        jobSetEditorStore.dispatch(actions.applyConflict('2', 0))
        const reapplyState = jobSetEditorStore.getState()
        expect(reapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        ])
        expect(reapplyState.currentStepIndex).toBe(2)

        // undo reapply
        jobSetEditorStore.dispatch(actions.undo())
        const undoReapplyState = jobSetEditorStore.getState()
        expect(undoReapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(undoReapplyState.currentStepIndex).toBe(1)

        // redo reapply
        jobSetEditorStore.dispatch(actions.redo())
        const redoReapplyState = jobSetEditorStore.getState()
        expect(redoReapplyState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        ])
        expect(redoReapplyState.currentStepIndex).toBe(2)
      })
    })
    test('Local and remote same update', () => {
      const jobSetEditorStore = createLoadedEditorStore()
      jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

      // act
      jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
              }
            ],
            jobs: [
              {
                id: 'qfDwuWBUIygzXlR0-1mLY',
                sequence: 1,
                title: '1',
                procedures: [
                  {
                    id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                    sequence: 1,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 120000
                  },
                  {
                    id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                    sequence: 2,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 60000
                  },
                  {
                    id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                    sequence: 3,
                    jobId: 'qfDwuWBUIygzXlR0-1mLY',
                    machineId: undefined,
                    processingTimeMs: 180000
                  }
                ]
              }
            ]
          }),
          jobColors: JSON.stringify({
            'qfDwuWBUIygzXlR0-1mLY': {
              jobId: 'qfDwuWBUIygzXlR0-1mLY',
              color: '#3cb44b',
              textColor: '"#000000'
            }
          }),
          isAutoTimeOptions: true,
          timeOptions: JSON.stringify({
            maxTimeMs: 360000,
            viewStartTimeMs: 0,
            viewEndTimeMs: 360000,
            minViewDurationMs: 120000,
            maxViewDurationMs: 360000
          }),
          isLocked: false,
          versionToken: '2',
          hasDetail: true
        },
        true
      ))

      // assert
      const actualState = jobSetEditorStore.getState()
      expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
      ])
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
            name: 'Move procedures',
            operations: [
              {
                type: "edit",
                fieldChanges: [
                  {
                    path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                    collectionChange: {
                      type: 'move',
                      previousValue: [
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                      newValue: [
                        'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                        'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                        'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                      ],
                    }
                  }
                ],
                applied: true,
              },
            ],
          }
        }
      })
      expect(actualState.lastVersion?.versionToken).toEqual('2')
    })
    describe('Local Move: remove update', () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    },
                    {
                      id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                      sequence: 3,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'HsDzur1T_YKl5ODHTeMIx',
                      processingTimeMs: 180000
                    }
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
            }),
            isLocked: false,
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 1 minute
        ])
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
              name: 'Move procedures',
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                        newValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                      }
                    }
                  ],
                  applied: true,
                },
              ],
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
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/ids",
                      collectionChange: {
                        type: 'move',
                        previousValue: [
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                        newValue: [
                          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
                          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
                          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
                        ],
                      }
                    },
                  ],
                  applied: false,
                },
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/RnU82Aa3wlL_n_MsE1l1K/machineId",
                      previousValue: null,
                      newValue: 'HsDzur1T_YKl5ODHTeMIx'
                    },
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo redo', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    },
                    {
                      id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                      sequence: 3,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'HsDzur1T_YKl5ODHTeMIx',
                      processingTimeMs: 180000
                    }
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
            }),
            isLocked: false,
            versionToken: '2',
            hasDetail: true
          },
          true
        ))

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(actualUndoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.entities['RnU82Aa3wlL_n_MsE1l1K']).toEqual({
          id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
          jobId: 'qfDwuWBUIygzXlR0-1mLY',
          machineId: null,
          processingTimeMs: 180000
        })
        expect(actualUndoState.currentStepIndex).toBe(1)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.ids).toEqual([
          'eC7QzG8rqQuTq6hCXCRq2',  // 2 minute
          'xni5aW_j9EI2FQXx80UYz',  // 1 minute
          'RnU82Aa3wlL_n_MsE1l1K',  // 3 minute
        ])
        expect(actualRedoState.formData.jobs.entities['qfDwuWBUIygzXlR0-1mLY'].procedures.entities['RnU82Aa3wlL_n_MsE1l1K']).toEqual({
          id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
          jobId: 'qfDwuWBUIygzXlR0-1mLY',
          machineId: 'HsDzur1T_YKl5ODHTeMIx',
          processingTimeMs: 180000
        })
        expect(actualRedoState.currentStepIndex).toBe(2)
      })
    })
    describe('Collection changes are related: add, delete, move', () => {
      // all collection.ids changes are related to conflicts that involves collection.ids
      // Not all combinations are tested for brevity
      test('add is a related change of move conflict', () => {
        const jobSetEditorStore = createLoadedEditorStore()
        jobSetEditorStore.dispatch(actions.moveProcedure('qfDwuWBUIygzXlR0-1mLY', 'eC7QzG8rqQuTq6hCXCRq2', 0)) // 2 minute to index 0, stepId: 1
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 2
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
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz', // 1 minute
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 60000
                    },
                    {
                      id: 'RnU82Aa3wlL_n_MsE1l1K', // 3 minute
                      sequence: 2,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 180000
                    },
                    {
                      id: 'eC7QzG8rqQuTq6hCXCRq2', // 2 minute
                      sequence: 3,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 120000
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
            isAutoTimeOptions: true,
            timeOptions: JSON.stringify({
              maxTimeMs: 360000,
              viewStartTimeMs: 0,
              viewEndTimeMs: 360000,
              minViewDurationMs: 120000,
              maxViewDurationMs: 360000
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

        // add procedure
        nanoid.mockReturnValueOnce('T8jp5WdcjB0cw9ME6GY0B')
        jobSetEditorStore.dispatch(actions.createProcedure("qfDwuWBUIygzXlR0-1mLY")) // stepId: 3
        const addState = jobSetEditorStore.getState()
        const editConflictOperation = addState.steps.entities[conflictStepId].operations
          .filter(op => op.type === 'conflict')[conflictIndex]
        const editHasRelatedChanges = (() => {
          const postConflictSteps = addState.steps.ids
            .slice(
              conflictStepIndex + 1,
              addState.currentStepIndex + 1
            )
            .map(id => addState.steps.entities[id])
          for (const step of postConflictSteps) {
            const conflictHasRelatedChangesWithStep = conflictHasRelatedChanges(editConflictOperation, step)
            if (conflictHasRelatedChangesWithStep) {
              return true
            }
          }
          return false
        })()
        expect(editHasRelatedChanges).toBe(true)

        // undo add
        jobSetEditorStore.dispatch(actions.undo())
        const undoAddState = jobSetEditorStore.getState()
        const undoEditConflictOperation = addState.steps.entities[conflictStepId].operations
          .filter(op => op.type === 'conflict')[conflictIndex]
        const undoEditHasRelatedChanges = (() => {
          const postConflictSteps = undoAddState.steps.ids
            .slice(
              conflictStepIndex + 1,
              undoAddState.currentStepIndex + 1
            )
            .map(id => undoAddState.steps.entities[id])
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
})

describe('Procedure MachineId', () => {
  const createLoadedEditorStore = (setProcedureMachine) => {
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
              id: "KkrjXxkjBXRq6-FRtWKgu",
              sequence: 2,
              title: "M2",
              description: "Machine 2"
            },
            {
              id: "mor1EkwJJ-90n7TwAZoz4",
              sequence: 3,
              title: "M3",
              description: "Machine 3"
            }
          ],
          jobs: [
            {
              id: 'qfDwuWBUIygzXlR0-1mLY',
              sequence: 1,
              title: '1',
              procedures: [
                {
                  id: 'xni5aW_j9EI2FQXx80UYz',
                  sequence: 1,
                  jobId: 'qfDwuWBUIygzXlR0-1mLY',
                  machineId: setProcedureMachine ? "HsDzur1T_YKl5ODHTeMIx" : null,
                  processingTimeMs: 0
                },
              ]
            }
          ]
        }),
        jobColors: JSON.stringify({
          'qfDwuWBUIygzXlR0-1mLY': {
            jobId: 'qfDwuWBUIygzXlR0-1mLY',
            color: '#3cb44b',
            textColor: '"#000000'
          }
        }),
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
  describe('Local Edits', () => {
    describe("Set procedure's machine", () => {
      test('Edit', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)

        // act
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'KkrjXxkjBXRq6-FRtWKgu' // machine 2
        )) // stepId: 1

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
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
              name: "Edit procedure's machine",
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: null,
                      newValue: 'KkrjXxkjBXRq6-FRtWKgu',
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'KkrjXxkjBXRq6-FRtWKgu' // machine 2
        )) // stepId: 1

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Change Procedure's machine to another machine", () => {
      test('Edit', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'KkrjXxkjBXRq6-FRtWKgu' // machine 2
        )) // stepId: 1

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
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
              name: "Edit procedure's machine",
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
      })
      test('Combine Edits', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'KkrjXxkjBXRq6-FRtWKgu' // machine 2
        )) // stepId: 1

        // act
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'mor1EkwJJ-90n7TwAZoz4' // machine 3
        )) // stepId: 1

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('mor1EkwJJ-90n7TwAZoz4') // machine 3
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
              name: "Edit procedure's machine",
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'mor1EkwJJ-90n7TwAZoz4', // machine 3
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          'KkrjXxkjBXRq6-FRtWKgu' // machine 2
        )) // stepId: 1

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Cleared Procedure's machine", () => {
      test('Edit', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          null
        )) // stepId: 1

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
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
              name: "Edit procedure's machine",
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setProcedureMachineId(
          'qfDwuWBUIygzXlR0-1mLY',
          'xni5aW_j9EI2FQXx80UYz',
          null
        )) // stepId: 1

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Remove machine, clearing procedure's machine", () => {
      test('Edit', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.removeMachine('HsDzur1T_YKl5ODHTeMIx')) // machine 1,  stepId: 1

        // assert
        const actualState = jobSetEditorStore.getState()
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
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
              name: "Remove machine",
              operations: [
                {
                  type: "edit",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'remove',
                        id: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                        index: 0,
                      }
                    },
                    {
                      path: "/machines/entities/HsDzur1T_YKl5ODHTeMIx",
                      previousValue: {
                        id: 'HsDzur1T_YKl5ODHTeMIx',
                        title: 'M1',
                        description: 'Machine 1',
                      },
                      newValue: undefined
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.removeMachine('HsDzur1T_YKl5ODHTeMIx')) // machine 1,  stepId: 1

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
  })
  describe('Refreshed Remote Edits', () => {
    describe("Cleared Procedure's machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Remove machine, clearing procedure's machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'remove',
                        id: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                        index: 0,
                      }
                    },
                    {
                      path: "/machines/entities/HsDzur1T_YKl5ODHTeMIx",
                      previousValue: {
                        id: 'HsDzur1T_YKl5ODHTeMIx',
                        title: 'M1',
                        description: 'Machine 1',
                      },
                      newValue: undefined
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: undefined,
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Change Procedure's machine to another machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Remove machine, clearing procedure's machine, and set procedure to another existing machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'remove',
                        id: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                        index: 0,
                      }
                    },
                    {
                      path: "/machines/entities/HsDzur1T_YKl5ODHTeMIx",
                      previousValue: {
                        id: 'HsDzur1T_YKl5ODHTeMIx',
                        title: 'M1',
                        description: 'Machine 1',
                      },
                      newValue: undefined
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'KkrjXxkjBXRq6-FRtWKgu', // machine 3
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Remove machine, clearing procedure's machine, and set procedure to a newly added machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 1,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 2,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 3,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'remove',
                        id: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                        index: 0,
                      }
                    },
                    {
                      path: "/machines/entities/HsDzur1T_YKl5ODHTeMIx",
                      previousValue: {
                        id: 'HsDzur1T_YKl5ODHTeMIx',
                        title: 'M1',
                        description: 'Machine 1',
                      },
                      newValue: undefined
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null
                    }
                  ],
                  applied: true,
                },
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'add',
                        id: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                        position: {
                          index: 2,
                          subindex: 0
                        }
                      }
                    },
                    {
                      path: "/machines/entities/TWhdHb8qdBhjXdk5OLstP",
                      previousValue: undefined,
                      newValue: {
                        id: 'TWhdHb8qdBhjXdk5OLstP',
                        title: 'M4',
                        description: 'Machine 4',
                      }
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
          {
            id: 1,
            title: 'A Sample Job Set',
            description: 'A Job Set contains the machines, jobs and procedures of a schedule.',
            content: JSON.stringify({
              machines: [
                {
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 1,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 2,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 3,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Change procedure machine to a newly added machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 4,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: null,
                    }
                  ],
                  applied: true,
                },
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'add',
                        id: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                        position: {
                          index: 2,
                          subindex: 0
                        }
                      }
                    },
                    {
                      path: "/machines/entities/TWhdHb8qdBhjXdk5OLstP",
                      previousValue: undefined,
                      newValue: {
                        id: 'TWhdHb8qdBhjXdk5OLstP',
                        title: 'M4',
                        description: 'Machine 4',
                      }
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: 'HsDzur1T_YKl5ODHTeMIx', // machine 1
                      newValue: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(true)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 4,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('HsDzur1T_YKl5ODHTeMIx') // machine 1
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Set procedure machine to a an existing machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: null,
                      newValue: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                }
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'KkrjXxkjBXRq6-FRtWKgu', // machine 2
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('KkrjXxkjBXRq6-FRtWKgu') // machine 2
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
    describe("Set procedure machine to a newly added machine", () => {
      test('Refreshed', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)

        // act
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 4,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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
        expect(actualState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
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
              mergeBehaviour: "discard local changes",
              operations: [
                {
                  type: "merge",
                  fieldChanges: [
                    {
                      path: "/machines/ids",
                      collectionChange: {
                        type: 'add',
                        id: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                        position: {
                          index: 2,
                          subindex: 0
                        }
                      }
                    },
                    {
                      path: "/machines/entities/TWhdHb8qdBhjXdk5OLstP",
                      previousValue: undefined,
                      newValue: {
                        id: 'TWhdHb8qdBhjXdk5OLstP',
                        title: 'M4',
                        description: 'Machine 4',
                      }
                    },
                    {
                      path: "/jobs/entities/qfDwuWBUIygzXlR0-1mLY/procedures/entities/xni5aW_j9EI2FQXx80UYz/machineId",
                      previousValue: null,
                      newValue: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                    }
                  ],
                  applied: true,
                },
              ],
            },
          }
        })
        expect(actualState.lastVersion?.versionToken).toEqual('2')
      })
      test('Undo Redo', () => {
        const jobSetEditorStore = createLoadedEditorStore(false)
        jobSetEditorStore.dispatch(actions.setJobSetFromAppStore( // stepId: 1
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
                  id: "KkrjXxkjBXRq6-FRtWKgu",
                  sequence: 2,
                  title: "M2",
                  description: "Machine 2"
                },
                {
                  id: "mor1EkwJJ-90n7TwAZoz4",
                  sequence: 3,
                  title: "M3",
                  description: "Machine 3"
                },
                {
                  id: "TWhdHb8qdBhjXdk5OLstP",
                  sequence: 4,
                  title: "M4",
                  description: "Machine 4"
                },
              ],
              jobs: [
                {
                  id: 'qfDwuWBUIygzXlR0-1mLY',
                  sequence: 1,
                  title: '1',
                  procedures: [
                    {
                      id: 'xni5aW_j9EI2FQXx80UYz',
                      sequence: 1,
                      jobId: 'qfDwuWBUIygzXlR0-1mLY',
                      machineId: 'TWhdHb8qdBhjXdk5OLstP', // machine 4
                      processingTimeMs: 0
                    },
                  ]
                }
              ]
            }),
            jobColors: JSON.stringify({
              'qfDwuWBUIygzXlR0-1mLY': {
                jobId: 'qfDwuWBUIygzXlR0-1mLY',
                color: '#3cb44b',
                textColor: '"#000000'
              }
            }),
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

        // act Undo
        jobSetEditorStore.dispatch(actions.undo())

        // assert Undo
        const actualUndoState = jobSetEditorStore.getState()
        expect(actualUndoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toBeNull()
        expect(actualUndoState.currentStepIndex).toBe(0)

        // act Redo
        jobSetEditorStore.dispatch(actions.redo())

        // assert Redo
        const actualRedoState = jobSetEditorStore.getState()
        expect(actualRedoState.formData
          .jobs.entities['qfDwuWBUIygzXlR0-1mLY']
          .procedures.entities['xni5aW_j9EI2FQXx80UYz']
          .machineId
        ).toEqual('TWhdHb8qdBhjXdk5OLstP') // machine 4
        expect(actualRedoState.currentStepIndex).toBe(1)
      })
    })
  })
})

// Todo:
// Jobs and JobColors

// Collection: Job update includes procedure edits
// related change Job update includes procedure edits