
import { createAction } from '@reduxjs/toolkit'
import type { JobSetHeaderDto } from '../../../api'
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

export const getJobSetsFailed = createAction(
  'jobSets/getJobSetsFailed',
  (failedMessage: string) => ({
    payload: {
      failedMessage
    }
  })
)

//#region jobSetsPage
export const jobSetsPageSetItems = createAction<JobSetHeader[]>('jobSetsPage/setItems')
export const jobSetsPageToggleSort = createAction(
  'jobSetsPage/toggleSort',
  (property: JobSetPageOrderByProperty) => ({ payload: { property } })
)
export const jobSetsPageSelectAll = createAction('jobSetsPage/selectAll')
export const jobSetsPageSelectOne = createAction(
  'jobSetsPage/selectOne',
  (id: number) => ({ payload: { id } })
)
export const jobSetsPageUnSelectOne = createAction(
  'jobSetsPage/unSelectOne',
  (id: number) => ({ payload: { id } })
)
export const jobSetsPageChangePage = createAction(
  'jobSetsPage/changePage',
  (pageIndex: number) => ({ payload: { pageIndex } })
)
export const jobSetsPageChangeRowsPerPage = createAction<number>('jobSetsPage/changeRowsPerPage')
export const jobSetsPageReset = createAction('jobSetsPage/reset')
//#endregion jobSetsPage