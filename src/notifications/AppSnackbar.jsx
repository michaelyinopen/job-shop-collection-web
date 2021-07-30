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
  haveQueuedNotificationsSelector,
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

  // skip notification if current path does not match
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

  // start closing snackbar immidiately if there are more notifications queued
  const haveQueued = useAppSelector(haveQueuedNotificationsSelector)
  useEffect(() => {
    if (!currentNotification) {
      return
    }
    if (haveQueued) {
      dispatch(closingSnackbar(currentNotification.id))
      // dispatch exitedSnackbar in case the Snackbar for an id is never rendered
      setTimeout(() => dispatch(exitedSnackbar(currentNotification.id)), 300)
    }
  }, [currentNotification, haveQueued, dispatch])

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