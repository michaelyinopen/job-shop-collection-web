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
      ctx.delay(),
      ctx.status(200),
      ctx.json({
        "data": [
          { "id": 4, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 5, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 6, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 7, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 8, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 9, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 10, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 11, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 12, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 13, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 14, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 15, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 16, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 17, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 18, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 19, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 20, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 21, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 3, "title": "N test", "description": null, "isLocked": false, "eTag": "AAAAAAAAD6E=" },
          { "id": 2, "title": "Another Sample", "description": "Source https://developers.google.com/optimization/scheduling/job_shop", "isLocked": false, "eTag": "AAAAAAAAC7k=" },
          { "id": 1, "title": "A Sample Job Set", "description": "A Job Set contains the machines, jobs and procedures of a schedule.", "isLocked": false, "eTag": "AAAAAAAAB9E=" }
        ]
      }),
    )
  }),
  rest.delete('/api/job-sets/:id', (_req, res, ctx) => {
    return res(
      ctx.delay(),
      ctx.status(200)
    )
  }),
]

const Decorator = ({ children }) => (
  <MswDecorator handlers={handlers}>
    <ReduxDecorator>
      <ThemeDecorator>
        <RouterDecorator>
          <PageInLayoutDecorator>
            {children}
          </PageInLayoutDecorator>
        </RouterDecorator>
      </ThemeDecorator>
    </ReduxDecorator>
  </MswDecorator>
)

export default <Decorator><JobSets /></Decorator>