import { createReducer, createSelector } from '@reduxjs/toolkit'
import { compareDesc, parseISO } from 'date-fns'
import {
  openSnackbar,
  closingSnackbar,
  exitedSnackbar,
  skipSnackbar,
  addNotification,
  openDrawer,
  closeDrawer,
} from './actions'

export type NotificationSource = {
  id: string,
  matchPath?: string,
  summary: string,
  dateTimeIso: string,
  detail?: string,
  detailTemplateKey?: string, // indicates if notification is templated or not, mutually exclusive with detail
  detailTemplateParameters?: object,
}
export type NotificationSourceOptions = Omit<NotificationSource, 'id' | 'dateTimeIso'>

type SnackbarStatus = 'pending' | 'open' | 'closing' | 'exited' | 'skipped'
type NotificationState = {
  id: string,
  status: SnackbarStatus,
  matchPath?: string,
  summary: string,
  dateTimeIso: string,
  detail?: string
  detailTemplateKey?: string, // indicates if notification is templated or not, mutually exclusive with detail
  detailTemplateParameters?: object,
}
type NotificationsState = {
  isDrawerOpen: boolean,
  items: NotificationState[]
}

const initialState: NotificationsState = {
  isDrawerOpen: false,
  items: []
}
const keepNotificationCount = 10
export const notificationsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addNotification, (state, { payload }) => {
      state.items.push({
        id: payload.id,
        matchPath: payload.matchPath,
        summary: payload.summary,
        dateTimeIso: payload.dateTimeIso,
        detail: payload.detail,
        detailTemplateKey: payload.detailTemplateKey,
        detailTemplateParameters: payload.detailTemplateParameters,
        status: 'pending'
      })
      if (state.items.length > keepNotificationCount) {
        state.items.shift()
      }
    })
    .addCase(openSnackbar, (state, { payload: id }) => {
      const notificationItem = state.items.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'open'
      }
    })
    .addCase(closingSnackbar, (state, { payload: id }) => {
      const notificationItem = state.items.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'closing'
      }
    })
    .addCase(exitedSnackbar, (state, { payload: id }) => {
      const notificationItem = state.items.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'exited'
      }
    })
    .addCase(skipSnackbar, (state, { payload: id }) => {
      const notificationItem = state.items.find(n => n.id === id)
      if (notificationItem) {
        notificationItem.status = 'skipped'
      }
    })
    .addCase(openDrawer, (state, { payload: id }) => {
      state.isDrawerOpen = true
    })
    .addCase(closeDrawer, (state, { payload: id }) => {
      state.isDrawerOpen = false
    })
})

export const notificationItemsSelector = (state: NotificationsState) => state.items

export const allNotificationsSelector = createSelector(
  notificationItemsSelector,
  items => [...items]
    .sort((a, b) => compareDesc(parseISO(a.dateTimeIso), parseISO(b.dateTimeIso)))
)

export const currentSnackbarNotificationSelector = createSelector(
  notificationItemsSelector,
  items => items.find(n => ['pending', 'open', 'closing'].includes(n.status))
)

export const haveQueuedNotificationsSelector = createSelector(
  notificationItemsSelector,
  items => items.filter(n => ['pending', 'open', 'closing'].includes(n.status)).length > 1
)

export const isNotificationDrawerOpenSelector = (state: NotificationsState) => state.isDrawerOpen