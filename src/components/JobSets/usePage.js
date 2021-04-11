import { useReducer, useEffect } from 'react';
import { stableSort, getSorting } from './sort';

const actionTypes = {
  updateRows: "initialize-rows",
  requestSort: "request-sort",
  selectAll: "select-all",
  selectOne: "select-one",
  changePage: "change-page",
  changeRowsPerPage: "change-rows-per-page" // keeps the first row of previous render visible, therefore might change page
};

export const actionCreators = {
  updateRows: rows => ({
    type: actionTypes.updateRows,
    rows
  }),
  requestSort: property => ({
    type: actionTypes.requestSort,
    property
  }),
  selectAll: () => ({
    type: actionTypes.selectAll,
  }),
  selectOne: id => ({
    type: actionTypes.selectOne,
    id
  }),
  changePage: pageIndex => ({
    type: actionTypes.changePage,
    pageIndex
  }),
  changeRowsPerPage: rowsPerPage => ({
    type: actionTypes.changeRowsPerPage,
    rowsPerPage
  })
};

const rowsInitialState = [];
const orderInitialState = 'desc'; // 'desc' or 'asc'
const orderByInitialState = 'id';
const selectedInitialState = [];
const pageIndexInitialState = 0;
const rowsPerPageInitialState = 10;

const initialState = ({
  rows: rowsInitialState,
  order: orderInitialState,
  orderBy: orderByInitialState,
  selected: selectedInitialState,
  pageIndex: pageIndexInitialState,
  rowsPerPage: rowsPerPageInitialState
});

const reducer = (state, action) => {
  if (action.type === actionTypes.updateRows) {
    const { rows } = action;
    const sortedRows = stableSort(rows, getSorting(state.order, state.orderBy));
    const lastRowIndex = Math.max(rows.length - 1, 0);
    const maxPageIndex = Math.floor(lastRowIndex / state.rowsPerPage);
    const pageIndex = state.pageIndex > maxPageIndex ? maxPageIndex : state.pageIndex;
    const selected = state.selected.filter(s => rows.some(r => r.id === s));
    return {
      ...state,
      rows: sortedRows,
      pageIndex,
      selected: selected === state.selected ? state.selected : selected
    };
  }
  if (action.type === actionTypes.requestSort) {
    const { property } = action;
    const isPreviousDesc = state.orderBy === property && state.order === 'desc';
    const order = isPreviousDesc ? 'asc' : 'desc'
    const orderBy = property;
    const rows = stableSort(state.rows, getSorting(order, orderBy))
    return {
      ...state,
      rows,
      order,
      orderBy
    };
  }
  if (action.type === actionTypes.selectAll) {
    if (state.selected.length !== state.rows.length) { // from not-all-selected to all selected
      const selected = state.rows.map(r => r.id);
      return {
        ...state,
        selected
      };
    }
    // from all selected none selected
    if (state.rows.length === 0) {
      return state;
    }
    return {
      ...state,
      selected: []
    };
  }
  if (action.type === actionTypes.selectOne) {
    const { id } = action;
    const selectedSet = new Set(state.selected);
    if (selectedSet.has(id)) {
      selectedSet.delete(id);
    }
    else {
      selectedSet.add(id);
    }
    return {
      ...state,
      selected: [...selectedSet]
    };
  }
  if (action.type === actionTypes.changePage) {
    const { pageIndex } = action;
    if (state.pageIndex === pageIndex) {
      return state;
    }
    return {
      ...state,
      pageIndex
    };
  }
  if (action.type === actionTypes.changeRowsPerPage) {
    const { rowsPerPage } = action;
    if (state.rowsPerPage === rowsPerPage) {
      return state;
    }
    const firstRowIndexOfPreviousState = state.pageIndex * state.rowsPerPage;
    const pageIndex = Math.floor(firstRowIndexOfPreviousState / rowsPerPage);
    return {
      ...state,
      pageIndex,
      rowsPerPage
    };
  }
  return state;
};

const usePage = rows => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );
  useEffect(
    () => {
      dispatch(actionCreators.updateRows(rows))
    },
    [rows]
  );
  // maybe other props passed to usePage
  // maybe other useEffects to respond to changes of those props
  // e.g.focus a specific row after creation
  // e.g. keep sort and filters?
  return [state, dispatch]
};

export default usePage;