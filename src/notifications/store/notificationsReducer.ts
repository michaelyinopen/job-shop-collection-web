import { createReducer } from '@reduxjs/toolkit'
import {
  openSnackbar,
  closingSnackbar,
  exitedSnackbar,
  skipSnackbar,
  addNotification,
} from './actions'

export type NotificationSimpleSource = {
  id: string,
  matchPath?: string,
  summary: string,
  /*detail?: string,*/
}
export type NotificationTemplateSource = {
  id: string,
  matchPath?: string,
  summary: string,
  detailTemplateKey: string,
  detailTemplateParameters?: object,
}
export type NotificationSource = NotificationSimpleSource /*| NotificationTemplateSource*/
export type NotificationSourceOptions = Omit<NotificationSource, 'id'>

type SnackbarStatus = 'pending' | 'open' | 'closing' | 'exited' | 'skipped'
type NotificationState = {
  id: string,
  status: SnackbarStatus,
  matchPath?: string,
  summary: string,
  detail?: string
  detailTemplateKey?: string, // indicates if notification is templated or not
  detailTemplateParameters?: object,
}
type NotificationsState = NotificationState[]

const initialState: NotificationsState = []
export const notificationsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addNotification, (state, { payload }) => {
      state.push({
        ...payload.notificationSource,
        status: 'pending'
      })
    })
    .addCase(openSnackbar, (state, { payload: id }) => {
      const notificationItem = state.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'open'
      }
    })
    .addCase(closingSnackbar, (state, { payload: id }) => {
      const notificationItem = state.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'closing'
      }
    })
    .addCase(exitedSnackbar, (state, { payload: id }) => {
      const notificationItem = state.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'exited'
      }
    })
    .addCase(skipSnackbar, (state, { payload: id }) => {
      const notificationItem = state.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'skipped'
      }
    })
})

export const currentSnackbarNotificationSelector = (state: NotificationsState) =>
  state.find(n => ['pending', 'open', 'closing'].includes(n.status))