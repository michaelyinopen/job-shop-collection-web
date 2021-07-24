
import { Provider } from 'react-redux'
import { store } from '../store'

export const ReduxDecorator = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}