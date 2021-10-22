import {
  PageInLayoutDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../__decorators__'
import { About } from './About'

export default (
  <ThemeDecorator>
    <RouterDecorator>
      <PageInLayoutDecorator>
        <About />
      </PageInLayoutDecorator>
    </RouterDecorator>
  </ThemeDecorator>
)