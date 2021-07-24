import {
  PageInLayoutDecorator,
  ThemeDecorator,
  RouterDecorator
} from '../__decorators__'
import { PageNotFound } from './PageNotFound'

export default (
  <ThemeDecorator>
    <RouterDecorator>

      <PageInLayoutDecorator>
        <PageNotFound />
      </PageInLayoutDecorator>
    </RouterDecorator>
  </ThemeDecorator>
)