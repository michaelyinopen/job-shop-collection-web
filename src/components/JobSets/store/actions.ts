
import { createAction } from '@reduxjs/toolkit'
import type { JobSetHeaderDto } from '../../../api'
import type { JobSetHeader } from './jobSetsReducer'
import type { JobSerPageOrderByProperty } from './jobSetsPageReducer'

export const getJobSetsStarted = createAction('jobSets/getJobSetsStarted')

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
export const setItems = createAction<JobSetHeader[]>('jobSetsPage/setItems')
export const toggleSort = createAction(
  'jobSetsPage/toggleSort',
  (property: JobSerPageOrderByProperty) => ({ payload: { property } })
)
export const selectAll = createAction('jobSetsPage/selectAll')
export const selectOne = createAction(
  'jobSetsPage/selectOne',
  (id: number) => ({ payload: { id } })
)
export const unSelectOne = createAction(
  'jobSetsPage/unSelectOne',
  (id: number) => ({ payload: { id } })
)
export const changePage = createAction(
  'jobSetsPage/changePage',
  (pageIndex: number) => ({ payload: { pageIndex } })
)
export const changeRowsPerPage = createAction<number>('jobSetsPage/changeRowsPerPage')
//#endregion jobSetsPage