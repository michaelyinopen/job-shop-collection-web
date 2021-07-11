import { createEntityAdapter } from "@reduxjs/toolkit"
import { produce } from 'immer'

type FruitTransportState = {
  id: number,
  fruit?: string,
  transport?: string,
}

// Not use createEntityAdapter
// because createEntityAdapter's updateOne/ upsertOne always creates a new entity
// (merge properties from original object and new object)
// I want the updateOne to keep the orginal object reference, if the result object is unchanged.
describe.skip("createEntityAdapter", () => {
  const fruitTransportAdapter = createEntityAdapter<FruitTransportState>()
  test("createEntityAdapter's upsertOne does not remove missing properties", () => {
    let state = fruitTransportAdapter.getInitialState()
    state = fruitTransportAdapter.addOne(state, { id: 1, fruit: "apple", transport: "car" })
    // act
    const nextState = produce(state, draft => {
      fruitTransportAdapter.upsertOne(draft, { id: 1, fruit: "banana" })
    })
    expect(nextState).toEqual({ entities: { 1: { id: 1, fruit: "banana", transport: "car" } }, ids: [1] })
  })

  test("createEntityAdapter's upsertOne can set property to undefined", () => {
    let state = fruitTransportAdapter.getInitialState()
    state = fruitTransportAdapter.addOne(state, { id: 1, fruit: "apple", transport: "car" })
    // act
    const nextState = produce(state, draft => {
      fruitTransportAdapter.upsertOne(draft, { id: 1, fruit: "banana", transport: undefined })
    })
    expect(nextState).toEqual({ entities: { 1: { id: 1, fruit: "banana", transport: undefined } }, ids: [1] })
  })

  test("createEntityAdapter's upsertOne keeps reference if all entities are unchanged", () => {
    let state = fruitTransportAdapter.getInitialState()
    state = fruitTransportAdapter.addOne(state, { id: 1, fruit: "apple", transport: "car" })
    // action
    const nextState = produce(state, draft => {
      fruitTransportAdapter.upsertOne(draft, { id: 1, fruit: "apple", transport: "car" })
    })
    // expect(nextState).toBe(state)
    expect(state === nextState).toBeTruthy()
  })

  test("createEntityAdapter's upsertOne updates state and entity reference if changed", () => {
    const appleCar = { id: 1, fruit: "apple", transport: "car" }
    const cherryPlane = { id: 2, fruit: "cherry", transport: "plane" }
    let state = fruitTransportAdapter.getInitialState()
    state = fruitTransportAdapter.addMany(state, [appleCar, cherryPlane])
    // action
    // action
    const nextState = produce(state, draft => {
      fruitTransportAdapter.upsertOne(draft, { id: 1, fruit: "banana", transport: undefined })
    })
    expect(nextState).not.toBe(state)
    expect(nextState.entities[1]).not.toBe(appleCar)
    expect(nextState.entities[2]).toBe(cherryPlane)
  })
})