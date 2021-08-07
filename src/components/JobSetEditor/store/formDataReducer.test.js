import {
  createJob,
  createProcedure,
} from './actions'
import {
  formDataReducer
} from './formDataReducer'

describe('procedure actions', () => {
  test('create procedure', () => {
    let state = formDataReducer(undefined, { type: 'non-exsiting' })
    state = formDataReducer(state, createJob())
    state = formDataReducer(state, createJob())
    const jobId = 2

    //act
    const actualState = formDataReducer(state, createProcedure(jobId))

    expect(actualState.procedures).toEqual({
      ids: [1],
      entities: {
        1: {
          id: 1,
          jobId: 2,
          machineId: null,
          sequence: 1,
          processingTimeMs: 0
        }
      }
    })
  })
})