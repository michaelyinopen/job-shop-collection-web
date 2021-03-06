import {
  jobSetsSelector,
  jobSetsPageSelector,
  notificationsSelector,
} from './reducer'
import {
  getJobSetsSelectors,
  getJobSetsPageSelectors
} from '../components/JobSets'
import {
  getNotificationsSelectors,
} from '../notifications'

export const {
  jobSetHeadersSelector,
  createJobSetSelector,
  createJobSetIsLockedSelector,
} = getJobSetsSelectors(jobSetsSelector)

export const {
  jobSetsPageSelectedItemIdsSelector,
  jobSetsPageRowsPerPageSelector,
  jobSetsPagePageIndexSelector,
  jobSetsPageOrderSelector,
  jobSetsPageOrderBySelector,
  jobSetsPageItemsSelector,
  jobSetsPageItemIdssOfPageSelector,
  createJobSetsPageItemSelector,
  createItemIsSelectedSelector,
} = getJobSetsPageSelectors(jobSetsPageSelector)

export const {
  allNotificationsSelector,
  currentSnackbarNotificationSelector,
  haveQueuedNotificationsSelector,
  isNotificationDrawerOpenSelector,
} = getNotificationsSelectors(notificationsSelector)
