import { useState } from 'react'
import {
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../__decorators__'
import { useAppDispatch } from '../store'
import { addNotification } from './store'
import { AppSnackbar } from './AppSnackbar'

const Decorator = ({ children }) => (
  <ReduxDecorator>
    <ThemeDecorator>
      <RouterDecorator>
        {children}
      </RouterDecorator>
    </ThemeDecorator>
  </ReduxDecorator>
)

const AppSnackbarFixture = () => {
  const dispatch = useAppDispatch()
  const [num, setNum] = useState(1)
  return (
    <div style={{ margin: 16 }}>
      <button style={{ margin: 16, fontSize: 32 }}
        onClick={() => {
          dispatch(addNotification({ summary: `Clicked ${num}` }))
          setNum(prev => prev + 1)
        }}
      >
        Add Notification {num}
      </button>
      <p>
        Click the button to add notifications.
      </p>
      <p>
        Adding a notification will open the snackbar. The snackbar will close after (6) seconds.
      </p>
      <p>
        Adding a new notification when the snackbar is opened will close the previous notification immidiately, and open the new one.
      </p>
      <AppSnackbar />
    </div>
  )
}
export default <Decorator><AppSnackbarFixture /></Decorator>