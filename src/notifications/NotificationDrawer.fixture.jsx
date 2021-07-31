import { useState } from 'react'
import {
  ReduxDecorator,
  ThemeDecorator,
  RouterDecorator,
} from '../__decorators__'
import { useAppDispatch } from '../store'
import { addNotification } from './store'
import { NotificationDrawer } from './NotificationDrawer'
import { Layout } from '../components/Layout'

const Decorator = ({ children }) => (
  <ReduxDecorator>
    <ThemeDecorator>
      <RouterDecorator>
        {children}
      </RouterDecorator>
    </ThemeDecorator>
  </ReduxDecorator>
)

// include Layout because the position relative to the AppBAr is important
// also because it has the button to open NotificationDrawer
const NotificationDrawerFixture = () => {
  const dispatch = useAppDispatch()
  const [num, setNum] = useState(1)
  return (
    <>
      <Layout>
        <div style={{ margin: 16 }}>
          <button style={{ margin: 16, fontSize: 32 }}
            onClick={() => {
              dispatch(addNotification({ summary: `Clicked ${num}` }))
              setNum(prev => prev + 1)
            }}
          >
            Add Notification {num}
          </button>
          <ol>
            <li>Click the button to add notifications.</li>
            <li>Click the notification icon on the top right, to open the Notification Drawer.</li>
          </ol>
          <p>
            The drawer shows the last (10) notifications. The app do not keep older notifications.
          </p>
          <p>
            Each notification is shown with a time span relative to the current time (the time that the drawer is opened).
            The tiam span is only refreshed if the drawer is closed and re-opened.
          </p>
          <p>
            Click away, click the cross button or press the Esc key to close the drawer.
          </p>
          <p>
            Not implenented: possible extension of showing more than summary, e.g. detail, or templated detail
          </p>
        </div>
      </Layout>
      <NotificationDrawer />
    </>
  )
}
export default <Decorator><NotificationDrawerFixture /></Decorator>