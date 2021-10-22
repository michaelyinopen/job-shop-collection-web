import { createAction, nanoid } from '@reduxjs/toolkit'
import type { NotificationSourceOptions } from './notificationsReducer'
import { formatISO } from 'date-fns'

export const addNotification = createAction(
  'notification/addNotification',
  (notificationSourceOptions: NotificationSourceOptions) => ({
    payload: {
      ...notificationSourceOptions,
      id: nanoid(),
      dateTimeIso: formatISO(new Date())
    }
  })
)

export const openSnackbar = createAction<string>('notification/openSnackbar')
export const closingSnackbar = createAction<string>('notification/closingSnackbar')
export const exitedSnackbar = createAction<string>('notification/exitedSnackbar')
export const skipSnackbar = createAction<string>('notification/skipSnackbar')

export const openDrawer = createAction('notification/openDrawer')
export const closeDrawer = createAction('notification/closeDrawer')
