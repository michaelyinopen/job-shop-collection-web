import { createEntityAdapter } from "@reduxjs/toolkit"

type FruitTransportState = {
  id: string,
  fruit?: string,
  transport?: string,
}

const fruitTransportAdapter = createEntityAdapter<FruitTransportState>()

test("createEntityAdapter's upsertOne does not remove missing properties", () => {
  let state = fruitTransportAdapter.getInitialState()
  state = fruitTransportAdapter.addOne(state, { id: "1", fruit: "apple", transport: "car" })
  state = fruitTransportAdapter.upsertOne(state, { id: "1", fruit: "banana" })
  expect(state).toEqual({ entities: { "1": { id: "1", fruit: "banana", transport: "car" } }, ids: ["1"] })
})

test("createEntityAdapter's upsertOne can set property to undefined", () => {
  let state = fruitTransportAdapter.getInitialState()
  state = fruitTransportAdapter.addOne(state, { id: "1", fruit: "apple", transport: "car" })
  state = fruitTransportAdapter.upsertOne(state, { id: "1", fruit: "banana", transport: undefined })
  expect(state).toEqual({ entities: { "1": { id: "1", fruit: "banana", transport: undefined } }, ids: ["1"] })
})