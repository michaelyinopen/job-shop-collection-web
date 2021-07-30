import { useEffect } from 'react'
import { matchPath } from 'react-router'
import { useLocation } from 'react-router-dom'
import {
  Snackbar,
} from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  currentSnackbarNotificationSelector,
} from '../store'
import {
  openSnackbar,
  closingSnackbar,
  exitedSnackbar,
  skipSnackbar,
} from './store'

export const AppSnackbar = () => {
  const currentNotification = useAppSelector(currentSnackbarNotificationSelector)
  const dispatch = useAppDispatch()

  const location = useLocation()
  useEffect(() => {
    if (!currentNotification) {
      return
    }
    if (currentNotification.status === 'pending') {
      const matchesPath = !currentNotification.matchPath || matchPath(location.pathname, {
        path: currentNotification.matchPath,
        exact: true
      })
      if (matchesPath) {
        dispatch(openSnackbar(currentNotification.id))
      } else {
        dispatch(skipSnackbar(currentNotification.id))
      }
    }
  }, [currentNotification, location.pathname, dispatch])

  if (!currentNotification) {
    return null
  }
  return (
    <Snackbar
      key={currentNotification.id}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={currentNotification.status === 'open'}
      autoHideDuration={6000}
      onClose={(_e, reason) => {
        if (reason !== 'clickaway') {
          dispatch(closingSnackbar(currentNotification.id))
        }
      }}
      onExited={() => {
        dispatch(exitedSnackbar(currentNotification.id))
      }}
      message={currentNotification.summary}
    />
  )
}