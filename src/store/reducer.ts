import type { PayloadAction } from '@reduxjs/toolkit'

type State = string

const initialState = "initial state"

export function reducer(
  state: State = initialState,
  action: PayloadAction
): State {
  return "store state"
}

export const stateSelector = (state: State) => state