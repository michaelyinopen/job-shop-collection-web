import {
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator
} from '../../__decorators__'
import { Layout } from './Layout'

export default (
  <ReduxDecorator>
    <ThemeDecorator>
      <RouterDecorator>
        <Layout>
          <div
            style={{
              height: '100%',
              background: 'repeating-conic-gradient(#9E9E9E 0% 25%, transparent 0% 50%) 50% / 20px 20px'
            }}
          />
        </Layout>
      </RouterDecorator>
    </ThemeDecorator>
  </ReduxDecorator>
)