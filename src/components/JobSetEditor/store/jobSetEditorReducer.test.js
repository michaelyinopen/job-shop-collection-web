import {
  createJob,
  createProcedure,
} from './actions'
import {
  jobSetEditorReducer
} from './jobSetEditorReducer'

test('create job and procedure', () => {
  let state = jobSetEditorReducer(undefined, { type: 'non-exsiting' })
  const createJobAction1 = createJob()
  const jobId1 = createJobAction1.payload.id
  const createJobAction2 = createJob()
  const jobId2 = createJobAction2.payload.id
  const createjob2ProcedureAction = createProcedure(jobId2)
  const job2ProcedureId = createjob2ProcedureAction.payload.id

  state = jobSetEditorReducer(state, createJobAction1)
  state = jobSetEditorReducer(state, createJobAction2)
  const actualState = jobSetEditorReducer(state, createjob2ProcedureAction)

  expect(actualState.formData.jobs).toEqual({
    ids: [jobId1, jobId2],
    entities: {
      [jobId1]: {
        id: jobId1,
        title: '1',
        procedures: {
          ids: [],
          entities: {}
        }
      },
      [jobId2]: {
        id: jobId2,
        title: '2',
        procedures: {
          ids: [job2ProcedureId],
          entities: {
            [job2ProcedureId]: {
              id: job2ProcedureId,
              jobId: jobId2,
              machineId: null,
              processingTimeMs: 0
            }
          }
        }
      }
    }
  })
})