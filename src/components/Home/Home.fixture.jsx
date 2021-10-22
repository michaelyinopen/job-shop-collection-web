import {
  PageInLayoutDecorator,
  ThemeDecorator,
  RouterDecorator
} from '../../__decorators__'
import { Home } from './Home'

export default (
  <ThemeDecorator>
    <RouterDecorator>
      <PageInLayoutDecorator>
        <Home />
      </PageInLayoutDecorator>
    </RouterDecorator>
  </ThemeDecorator>
)