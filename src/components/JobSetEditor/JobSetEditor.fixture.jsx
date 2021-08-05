import { rest } from 'msw'
import {
  MswDecorator,
  PageInLayoutDecorator,
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../../__decorators__'
import { JobSetEditor } from './JobSetEditor'

const handlers = [
  rest.get('/api/job-sets/:id', (req, res, ctx) => {
    const { id } = req.params
    if (id === '1') {
      return res(
        ctx.delay(),
        ctx.status(200),
        ctx.json({
          id: 1,
          title: "A Sample Job Set",
          description: "A Job Set contains the machines, jobs and procedures of a schedule.",
          content: "{\"machines\":[{\"id\":1,\"title\":\"M1\",\"description\":\"Machine 1\"},{\"id\":2,\"title\":\"M2\",\"description\":\"Machine 2\"},{\"id\":3,\"title\":\"M3\",\"description\":\"Machine 3\"},{\"id\":4,\"title\":\"M4\",\"description\":\"Machine 4\"}],\"jobs\":[{\"id\":1,\"procedures\":[{\"id\":1,\"jobId\":1,\"machineId\":1,\"sequence\":1,\"processingMilliseconds\":600000},{\"id\":2,\"jobId\":1,\"machineId\":2,\"sequence\":2,\"processingMilliseconds\":480000},{\"id\":3,\"jobId\":1,\"machineId\":3,\"sequence\":3,\"processingMilliseconds\":240000}]},{\"id\":2,\"procedures\":[{\"id\":4,\"jobId\":2,\"machineId\":2,\"sequence\":1,\"processingMilliseconds\":480000},{\"id\":5,\"jobId\":2,\"machineId\":1,\"sequence\":2,\"processingMilliseconds\":180000},{\"id\":6,\"jobId\":2,\"machineId\":4,\"sequence\":3,\"processingMilliseconds\":300000},{\"id\":7,\"jobId\":2,\"machineId\":3,\"sequence\":4,\"processingMilliseconds\":360000}]},{\"id\":3,\"procedures\":[{\"id\":8,\"jobId\":3,\"machineId\":1,\"sequence\":1,\"processingMilliseconds\":240000},{\"id\":9,\"jobId\":3,\"machineId\":2,\"sequence\":2,\"processingMilliseconds\":420000},{\"id\":10,\"jobId\":3,\"machineId\":4,\"sequence\":3,\"processingMilliseconds\":180000}]}]}", "jobColors": "[{\"id\":1,\"color\":\"#3cb44b\",\"textColor\":\"#000000\"},{\"id\":2,\"color\":\"#ffe119\",\"textColor\":\"#000000\"},{\"id\":3,\"color\":\"#4363d8\",\"textColor\":\"#ffffff\"}]",
          isAutoTimeOptions: true,
          timeOptions: "{\"referenceDate\":\"1970-01-01T00:00:00.000Z\",\"maxTime\":\"1970-01-01T00:58:00.000Z\",\"viewStartTime\":\"1970-01-01T00:00:00.000Z\",\"viewEndTime\":\"1970-01-01T00:58:00.000Z\",\"minViewDuration\":360000,\"maxViewDuration\":3480000}",
          isLocked: false,
          eTag: "AAAAAAAAB9E="
        }),
      )
    }
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

export default <Decorator><JobSetEditor id={1} edit={false} /></Decorator>