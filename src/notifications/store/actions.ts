import { createAction, nanoid } from '@reduxjs/toolkit'
import type { NotificationSourceOptions } from './notificationsReducer'

export const addNotification = createAction(
  'notification/addNotification',
  (notificationSourceOptions: NotificationSourceOptions) => ({
    payload: {
      notificationSource: {
        ...notificationSourceOptions,
        id: nanoid()
      }
    }
  })
)

export const openSnackbar = createAction<string>('notification/openSnackbar')
export const closingSnackbar = createAction<string>('notification/closingSnackbar')
export const exitedSnackbar = createAction<string>('notification/exitedSnackbar')
export const skipSnackbar = createAction<string>('notification/skipSnackbar')
