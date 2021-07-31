import { createReducer, createSelector } from '@reduxjs/toolkit'
import { backwardCompose } from '../../../utility'
import { jobSetsPageSelector } from '../../../store'
import {
  jobSetsPageSetItems,
  jobSetsPageToggleSort,
  jobSetsPageToggleSelectAll,
  jobSetsPageSelectOne,
  jobSetsPageUnselectOne,
  jobSetsPageChangePage,
  jobSetsPageChangeRowsPerPage
} from './actions'
import type { JobSetHeader } from './jobSetsReducer'

export type JobSetPageOrderByProperty = 'id' | 'title' | 'description'

type JobSetsPageState = {
  items: JobSetHeader[];
  order: 'asc' | 'desc',
  orderBy: JobSetPageOrderByProperty,
  selectedItemIds: number[], // can only select current page items
  pageIndex: number,
  rowsPerPage: number
}

const jobSetsPageInitialState: JobSetsPageState = {
  items: [],
  order: 'desc',
  orderBy: 'id',
  selectedItemIds: [],
  pageIndex: 0,
  rowsPerPage: 10
}

export const jobSetsPageReducer = createReducer(jobSetsPageInitialState, (builder) => {
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

      if (payload.fixSelected) {
        const maxPageIndex = Math.max(0, Math.ceil(state.items.length / state.rowsPerPage) - 1)
        state.pageIndex = state.pageIndex > maxPageIndex ? maxPageIndex : state.pageIndex
        const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
        const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
        const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
        if (state.selectedItemIds.some(s => !itemsOfPage.some(r => r.id === s))) {
          state.selectedItemIds = state.selectedItemIds.filter(s => itemsOfPage.some(r => r.id === s))
        }
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
        .sort((aTuple, bTuple) => {
          const a = aTuple.element[state.orderBy]
          const b = bTuple.element[state.orderBy]

          const ascendingSort =
            !(a || b) ? 0 // both undefined
              : !a ? -1 // a undefined
                : !b ? 1 // b undefined
                  : a > b ? 1
                    : a < b ? -1
                      : 0
          const unStableSort = isSortDesc ? -ascendingSort : ascendingSort
          return unStableSort !== 0 ? unStableSort : aTuple.index - bTuple.index
        })
        .map(({ element }) => element)
      const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
      const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
      const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
      if (state.selectedItemIds.some(s => !itemsOfPage.some(r => r.id === s))) {
        state.selectedItemIds = state.selectedItemIds.filter(s => itemsOfPage.some(r => r.id === s))
      }
    })
    .addCase(jobSetsPageToggleSelectAll, (state) => {
      const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
      const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
      const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
      if (state.selectedItemIds.length !== itemsOfPage.length) {
        // from not-all-selected to all selected
        state.selectedItemIds = itemsOfPage.map(r => r.id)
      }
      else {
        // from all selected to none selected
        state.selectedItemIds.splice(0, state.selectedItemIds.length)
      }
    })
    .addCase(jobSetsPageSelectOne, (state, { payload: { id } }) => {
      const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
      const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
      const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
      if (!state.selectedItemIds.includes(id) && itemsOfPage.some(r => r.id === id)) {
        state.selectedItemIds.push(id)
      }
    })
    .addCase(jobSetsPageUnselectOne, (state, { payload: { id } }) => {
      var index = state.selectedItemIds.indexOf(id)
      if (index !== -1) {
        state.selectedItemIds.splice(index, 1)
      }
    })
    .addCase(jobSetsPageChangePage, (state, { payload: { pageIndex } }) => {
      state.pageIndex = pageIndex
      // fix selected
      const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
      const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
      const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
      if (state.selectedItemIds.some(s => !itemsOfPage.some(r => r.id === s))) {
        state.selectedItemIds = state.selectedItemIds.filter(s => itemsOfPage.some(r => r.id === s))
      }
    })
    .addCase(jobSetsPageChangeRowsPerPage, (state, { payload }) => {
      const firstRowIndexOfPreviousState = state.pageIndex * state.rowsPerPage
      state.pageIndex = Math.floor(firstRowIndexOfPreviousState / payload)
      state.rowsPerPage = payload
      const startItemIndexOfPage = state.pageIndex * state.rowsPerPage
      const endItemIndexOfPage = state.pageIndex * state.rowsPerPage + state.rowsPerPage
      const itemsOfPage = state.items.slice(startItemIndexOfPage, endItemIndexOfPage)
      if (state.selectedItemIds.some(s => !itemsOfPage.some(r => r.id === s))) {
        state.selectedItemIds = state.selectedItemIds.filter(s => itemsOfPage.some(r => r.id === s))
      }
    })
})

export const jobSetsPageSelectedItemIdsSelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.selectedItemIds
)
export const jobSetsPageRowsPerPageSelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.rowsPerPage
)
export const jobSetsPagePageIndexSelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.pageIndex
)
export const jobSetsPageOrderSelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.order
)
export const jobSetsPageOrderBySelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.orderBy
)
export const jobSetsPageItemsSelector = backwardCompose(
  jobSetsPageSelector,
  (state: JobSetsPageState) => state.items
)
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
export const createItemIsSelectedSelector = (id: number) => createSelector(
  jobSetsPageSelectedItemIdsSelector,
  (selectedItemIds: number[]) => selectedItemIds.includes(id)
)