import { createReducer } from '@reduxjs/toolkit'
import {
  setItems,
  toggleSort,
  selectAll,
  selectOne,
  unSelectOne,
  changePage,
  changeRowsPerPage
} from './actions'
import type { JobSetHeader } from './jobSetsReducer'

export type JobSerPageOrderByProperty = 'id' | 'title' | 'description'

type JobSetsPageState = {
  items: JobSetHeader[];
  order: 'asc' | 'desc',
  orderBy: JobSerPageOrderByProperty,
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
    .addCase(setItems, (state, { payload }) => {
      // stable sort the items according to state.order and state.orderBy
      state.items = payload
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
      if (state.selectedItemIds.some(s => !state.items.some(r => r.id === s))) {
        state.selectedItemIds = state.selectedItemIds.filter(s => state.items.some(r => r.id === s))
      }
    })
    .addCase(toggleSort, (state, { payload: { property } }) => {
      const isPreviousDesc = state.orderBy === property && state.order === 'desc'
      const isSortAsc = isPreviousDesc
      state.orderBy = property
      state.order = isSortAsc ? 'asc' : 'desc'
      // stable sort the items according to state.order and state.orderBy
      state.items = state.items
        .map((element, index) => ({ element, index }))
        .sort((a, b) => {
          const ascendingSort = a.element[state.orderBy]! > b.element[state.orderBy]!
            ? 1
            : a.element[state.orderBy]! < b.element[state.orderBy]!
              ? -1
              : 0
          const unStableSort = isSortAsc ? ascendingSort : -ascendingSort
          return unStableSort !== 0 ? unStableSort : a.index - b.index
        })
        .map(({ element }) => element)
    })
    .addCase(selectAll, (state) => {
      if (state.selectedItemIds.length !== state.items.length) {
        state.selectedItemIds = state.items.map(r => r.id)
      }
    })
    .addCase(selectOne, (state, { payload: { id } }) => {
      if (!state.selectedItemIds.includes(id)) {
        state.selectedItemIds.push(id)
      }
    })
    .addCase(unSelectOne, (state, { payload: { id } }) => {
      var index = state.selectedItemIds.indexOf(id)
      if (index !== -1) {
        state.selectedItemIds.splice(index, 1)
      }
    })
    .addCase(changePage, (state, { payload: { pageIndex } }) => {
      state.pageIndex = pageIndex
    })
    .addCase(changeRowsPerPage, (state, { payload }) => {
      const firstRowIndexOfPreviousState = state.pageIndex * state.rowsPerPage
      state.pageIndex = Math.floor(firstRowIndexOfPreviousState / payload)
      state.rowsPerPage = payload
    })
})