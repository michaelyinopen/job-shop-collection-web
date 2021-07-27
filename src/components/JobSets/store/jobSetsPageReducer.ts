import { createReducer, createSelector } from '@reduxjs/toolkit'
import {
  jobSetsPageSetItems,
  jobSetsPageToggleSort,
  jobSetsPageToggleSelectAll,
  jobSetsPageSelectOne,
  jobSetsPageUnSelectOne,
  jobSetsPageChangePage,
  jobSetsPageChangeRowsPerPage
} from './actions'
import type { JobSetHeader } from './jobSetsReducer'

export type JobSetPageOrderByProperty = 'id' | 'title' | 'description'

type JobSetsPageState = {
  items: JobSetHeader[];
  order: 'asc' | 'desc',
  orderBy: JobSetPageOrderByProperty,
  selectedItemIds: number[],
  pageIndex: number,
  rowsPerPage: number
}

const JobSetsPageInitialState: JobSetsPageState = {
  items: [],
  order: 'desc',
  orderBy: 'id',
  selectedItemIds: [],
  pageIndex: 0,
  rowsPerPage: 10
}

export const jobSetsPageReducer = createReducer(JobSetsPageInitialState, (builder) => {
  builder
    .addCase(jobSetsPageSetItems, (state, { payload }) => {
      // stable sort the items according to state.order and state.orderBy
      state.items = payload.items
        .map((element, index) => ({ element, index }))
        .sort((a, b) => {
          const ascendingSort = a.element[state.orderBy]! > b.element[state.orderBy]!
            ? 1
            : a.element[state.orderBy]! < b.element[state.orderBy]!
              ? -1
              : 0
          const unStableSort = state.order === 'asc' ? ascendingSort : -ascendingSort
          return unStableSort !== 0 ? unStableSort : a.index - b.index
        })
        .map(({ element }) => element)

      const maxPageIndex = Math.max(0, Math.ceil(state.items.length / state.rowsPerPage) - 1)
      state.pageIndex = state.pageIndex > maxPageIndex ? maxPageIndex : state.pageIndex
      if (payload.fixSelected && state.selectedItemIds.some(s => !state.items.some(r => r.id === s))) {
        state.selectedItemIds = state.selectedItemIds.filter(s => state.items.some(r => r.id === s))
      }
    })
    .addCase(jobSetsPageToggleSort, (state, { payload: { property } }) => {
      const isPreviousAsc = state.orderBy === property && state.order === 'asc'
      const isSortDesc = isPreviousAsc
      state.orderBy = property
      state.order = isSortDesc ? 'desc' : 'asc'
      // stable sort the items according to state.order and state.orderBy
      state.items = state.items
        .map((element, index) => ({ element, index }))
        .sort((a, b) => {
          const ascendingSort = a.element[state.orderBy]! > b.element[state.orderBy]!
            ? 1
            : a.element[state.orderBy]! < b.element[state.orderBy]!
              ? -1
              : 0
          const unStableSort = isSortDesc ? -ascendingSort : ascendingSort
          return unStableSort !== 0 ? unStableSort : a.index - b.index
        })
        .map(({ element }) => element)
    })
    .addCase(jobSetsPageToggleSelectAll, (state) => {
      if (state.selectedItemIds.length !== state.items.length) {
        // from not-all-selected to all selected
        state.selectedItemIds = state.items.map(r => r.id)
      }
      else {
        // from all selected none selected
        state.selectedItemIds.splice(0, state.selectedItemIds.length)
      }
    })
    .addCase(jobSetsPageSelectOne, (state, { payload: { id } }) => {
      if (!state.selectedItemIds.includes(id)) {
        state.selectedItemIds.push(id)
      }
    })
    .addCase(jobSetsPageUnSelectOne, (state, { payload: { id } }) => {
      var index = state.selectedItemIds.indexOf(id)
      if (index !== -1) {
        state.selectedItemIds.splice(index, 1)
      }
    })
    .addCase(jobSetsPageChangePage, (state, { payload: { pageIndex } }) => {
      state.pageIndex = pageIndex
    })
    .addCase(jobSetsPageChangeRowsPerPage, (state, { payload }) => {
      const firstRowIndexOfPreviousState = state.pageIndex * state.rowsPerPage
      state.pageIndex = Math.floor(firstRowIndexOfPreviousState / payload)
      state.rowsPerPage = payload
    })
})

export const jobSetsPageSelectedItemIdsSelector = (state: JobSetsPageState) => state.selectedItemIds
export const jobSetsPageRowsPerPageSelector = (state: JobSetsPageState) => state.rowsPerPage
export const jobSetsPagePageIndexSelector = (state: JobSetsPageState) => state.pageIndex
export const jobSetsPageOrderSelector = (state: JobSetsPageState) => state.order
export const jobSetsPageOrderBySelector = (state: JobSetsPageState) => state.orderBy
export const jobSetsPageItemsSelector = (state: JobSetsPageState) => state.items
export const jobSetsPageItemCountSelector = (state: JobSetsPageState) => state.items.length

export const jobSetsPageItemIdssOfPageSelector = createSelector(
  jobSetsPageItemsSelector,
  jobSetsPageRowsPerPageSelector,
  jobSetsPagePageIndexSelector,
  (items: JobSetHeader[], rowsPerPage: number, pageIndex: number) => {
    return items
      .slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage)
      .map(h => h.id)
  }
)

export const createJobSetsPageItemSelector = (id: number) => createSelector(
  jobSetsPageItemsSelector,
  (items: JobSetHeader[]) => items.find(h => h.id === id)
)