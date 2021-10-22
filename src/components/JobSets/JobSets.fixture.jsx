import { rest } from 'msw'
import {
  MswDecorator,
  PageInLayoutDecorator,
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../../__decorators__'
import { JobSets } from './JobSets'

const persistentBackendMock = (() => {
  let data = [
    { "id": 4, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 5, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 6, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 7, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 8, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 9, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 10, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 11, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 12, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 13, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 14, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 15, "title": "Will fail to delete", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 16, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 17, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 18, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 19, "title": "locked", "description": null, "isLocked": true, "versionToken": "AAAAAAAAD6E=" },
    { "id": 20, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 21, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 3, "title": "N test", "description": null, "isLocked": false, "versionToken": "AAAAAAAAD6E=" },
    { "id": 2, "title": "Another Sample", "description": "Source https://developers.google.com/optimization/scheduling/job_shop", "isLocked": false, "versionToken": "AAAAAAAAC7k=" },
    { "id": 1, "title": "A Sample Job Set", "description": "A Job Set contains the machines, jobs and procedures of a schedule.", "isLocked": false, "versionToken": "AAAAAAAAB9E=" }
  ]
  const getData = () => {
    return data
  }
  const deleteById = (id) => {
    data = data.filter(d => d.id !== parseInt(id))
  }
  return {
    getData,
    deleteById
  }
})()

const handlers = [
  rest.get('/api/job-sets', (_req, res, ctx) => {
    const data = persistentBackendMock.getData()
    return res(
      ctx.delay(),
      ctx.status(200),
      ctx.json({
        "data": data
      }),
    )
  }),
  rest.delete('/api/job-sets/:id', (req, res, ctx) => {
    const { id } = req.params
    if (id === '15') {
      return res(
        ctx.delay(),
        ctx.status(400)
      )
    }
    persistentBackendMock.deleteById(id)
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