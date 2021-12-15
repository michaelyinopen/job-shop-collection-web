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

describe.skip('Edit Title', () => {
  const createLoadedAppStore = () => {
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
    const activityEditorStore = createLoadedAppStore()

    // act
    activityEditorStore.dispatch(actions.setTitle('Title edited'))

    // assert
    const actualState = activityEditorStore.getState()
    expect(actualState.formData.title).toEqual('Title edited')
    expect(actualState.steps).toEqual({
      ids: ['1', '2'],
      items: {
        '1': {
          name: 'initial',
          operations: []
        },
        '2': {
          name: 'Edit Title',
          operations: [
            {
              type: 'edit',
              fieldChanges: [
                {
                  path: '/title',
                  previousValue: 'A Job Set contains the machines, jobs and procedures of a schedule.',
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
})