import { combineReducers } from 'redux'
import { reduxTakingThunkReducer } from '../'

export const actionTypes = {
  todoSetAll: "todoSetAll", // payload is an array of string
  todoAppend: "todoAppend", // payload is a string
  todoSetAllError: "todoSetAllError", // payload is null or a string
  todoAppendError: "todoAppendError", // payload is null or a string
}

const todoInitialState = {
  items: [],
  setAllError: null,
  appendError: null
}
const todoReducer = (state = todoInitialState as any, action) => {
  if (action.type === actionTypes.todoSetAll) {
    return {
      ...state,
      items: [...action.payload],
      setAllError: null,
    }
  } else if (action.type === actionTypes.todoSetAll) {
    return {
      ...state,
      items: [...state.items, action.payload],
      todoAppendError: null,
    }
  } else if (action.type === actionTypes.todoSetAllError) {
    return {
      ...state,
      setAllError: action.payload,
    }
  } else if (action.type === actionTypes.todoAppendError) {
    return {
      ...state,
      appendError: action.payload,
    }
  }
  return state
}

export const reducer = combineReducers({
  todo: todoReducer,
  reduxTakingThunk: reduxTakingThunkReducer
})

async function get_AB_oneSecond(){
  const ms = 1000
  await new Promise(resolve => setTimeout(resolve, ms))
  return ['Alfa', 'Bravo']
}

async function get_AB_twoSecond(){
  const ms = 2000
  await new Promise(resolve => setTimeout(resolve, ms))
  return ['Alfa', 'Bravo']
}

async function get_BCD_oneSecond(){
  const ms = 1000
  await new Promise(resolve => setTimeout(resolve, ms))
  return ['Bravo', 'Charlie', 'Delta']
}

async function get_BCD_twoSecond(){
  const ms = 2000
  await new Promise(resolve => setTimeout(resolve, ms))
  return ['Bravo', 'Charlie', 'Delta']
}

export const api = {
  get_AB_oneSecond,
  get_AB_twoSecond,
  get_BCD_oneSecond,
  get_BCD_twoSecond
}