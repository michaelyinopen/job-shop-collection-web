import { createAction } from '@reduxjs/toolkit'
import type {
  JobSetHeaderDto,
  GetJobSetResponse,
} from '../../../api'
import type { JobSetHeader } from './jobSetsReducer'
import type { JobSetPageOrderByProperty } from './jobSetsPageReducer'

export const getJobSetsSucceeded = createAction(
  'jobSets/getJobSetsSucceeded',
  (jobSetHeaders: JobSetHeaderDto[]) => ({
    payload: {
      jobSetHeaders
    }
  })
)

// only adds and not remove
export const getNextJobSetsSucceeded = createAction(
  'jobSets/getNextJobSetsSucceeded',
  (jobSetHeaders: JobSetHeaderDto[]) => ({
    payload: {
      jobSetHeaders
    }
  })
)

export const fetchedJobSet = createAction(
  'jobSets/fetchedJobSet',
  (getJobSetResponse: GetJobSetResponse, isRefresh: boolean = false) => ({
    payload: {
      getJobSetResponse,
      isRefresh
    }
  })
)

export const deleteJobSetSucceeded = createAction<number>('jobSets/deleteJobSetSucceeded')

//#region jobSetsPage
export const jobSetsPageSetItems = createAction(
  'jobSetsPage/setItems',
  (items: JobSetHeader[], fixSelected?: boolean) => ({
    payload: {
      items,
      fixSelected
    }
  })
)
export const jobSetsPageToggleSort = createAction(
  'jobSetsPage/toggleSort',
  (property: JobSetPageOrderByProperty) => ({ payload: { property } })
)
export const jobSetsPageToggleSelectAll = createAction('jobSetsPage/toggleSelectAll')
export const jobSetsPageSelectOne = createAction(
  'jobSetsPage/selectOne',
  (id: number) => ({ payload: { id } })
)
export const jobSetsPageUnselectOne = createAction(
  'jobSetsPage/unselectOne',
  (id: number) => ({ payload: { id } })
)
export const jobSetsPageChangePage = createAction(
  'jobSetsPage/changePage',
  (pageIndex: number) => ({ payload: { pageIndex } })
)
export const jobSetsPageChangeRowsPerPage = createAction<number>('jobSetsPage/changeRowsPerPage')
export const jobSetsPageReset = createAction('jobSetsPage/reset')
//#endregion jobSetsPage