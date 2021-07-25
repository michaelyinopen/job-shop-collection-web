import { rest } from 'msw'
import {
  MswDecorator,
  PageInLayoutDecorator,
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../../__decorators__'
import { JobSets } from './JobSets'

const handlers = [
  rest.get('/api/job-sets', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        "data": [
          { "id": 3, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 2, "title": "Another Sample", "description": "Source https://developers.google.com/optimization/scheduling/job_shop", "isLocked": false, "eTag": "AAAAAAAAC7k=" },
          { "id": 1, "title": "A Sample Job Set", "description": "A Job Set contains the machines, jobs and procedures of a schedule.", "isLocked": false, "eTag": "AAAAAAAAB9E=" }
        ]
      }),
    )
  }),
]

// singleton register
// worker.resetHandlers

export default (
  <MswDecorator handlers={handlers}>
    <ReduxDecorator>
      <ThemeDecorator>
        <RouterDecorator>
          <PageInLayoutDecorator>
            <JobSets />
          </PageInLayoutDecorator>
        </RouterDecorator>
      </ThemeDecorator>
    </ReduxDecorator>
  </MswDecorator>
)