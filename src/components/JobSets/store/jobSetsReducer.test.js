import { jobSetsReducer } from "./jobSetsReducer"
import { getJobSetsSucceeded } from "./actions"

describe("getJobSetsSucceeded", () => {
  test("add to empty state", () => {
    const state = jobSetsReducer(undefined, { type: "@@nonExistingAction" })
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, versionToken: "1010" },
      { id: 11, title: "Eleven", isLocked: false, versionToken: "1111" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState.ids).toEqual([10, 11])
    expect(nextState.entities).toEqual({
      10: {
        id: 10,
        title: "Ten",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: false,
        versionToken: "1010",
        hasDetail: false,
      },
      11: {
        id: 11,
        title: "Eleven",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: false,
        versionToken: "1111",
        hasDetail: false,
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
  })

  test("cause no change", () => {
    let state = jobSetsReducer(undefined, { type: "@@nonExistingAction" })
    state = {
      ...state,
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1010",
        },
        11: {
          id: 11,
          title: "Eleven",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1111",
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, versionToken: "1010" },
      { id: 11, title: "Eleven", isLocked: false, versionToken: "1111" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState).toBe(state)
    expect(nextState.ids).toBe(state.ids)
    expect(nextState.entities).toBe(state.entities)
    expect(nextState.entities[10]).toBe(state.entities[10])
    expect(nextState.entities[11]).toBe(state.entities[11])
  })

  test("update", () => {
    let state = jobSetsReducer(undefined, { type: "@@nonExistingAction" })
    state = {
      ...state,
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1010",
          hasDetail: false,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1111",
          hasDetail: false,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, versionToken: "1010" },
      { id: 11, title: "Eleven", isLocked: true, versionToken: "9999" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState.ids).toEqual([10, 11])
    expect(nextState.entities).toEqual({
      10: {
        id: 10,
        title: "Ten",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: false,
        versionToken: "1010",
        hasDetail: false,
      },
      11: {
        id: 11,
        title: "Eleven",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: true,
        versionToken: "9999",
        hasDetail: false,
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[10]).toBe(state.entities[10])
    expect(nextState.entities[11]).not.toBe(state.entities[11])
  })

  test("delete", () => {
    let state = jobSetsReducer(undefined, { type: "@@nonExistingAction" })
    state = {
      ...state,
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1010",
          hasDetail: false,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1111",
          hasDetail: false,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 11, title: "Eleven", isLocked: false, versionToken: "1111" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState.ids).toEqual([11])
    expect(nextState.entities).toEqual({
      11: {
        id: 11,
        title: "Eleven",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: false,
        versionToken: "1111",
        hasDetail: false,
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[11]).toBe(state.entities[11])
  })

  test("insert, update and delete", () => {
    let state = jobSetsReducer(undefined, { type: "@@nonExistingAction" })
    state = {
      ...state,
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1010",
          hasDetail: false,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: undefined,
          content: undefined,
          jobColors: undefined,
          isAutoTimeOptions: false,
          timeOptions: undefined,
          isLocked: false,
          versionToken: "1111",
          hasDetail: false,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 11, title: "Eleven", isLocked: true, versionToken: "9999" },
      { id: 12, title: "Twelve", isLocked: false, versionToken: "1212" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState.ids).toEqual([11, 12])
    expect(nextState.entities).toEqual({
      11: {
        id: 11,
        title: "Eleven",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: true,
        versionToken: "9999",
        hasDetail: false,
      },
      12: {
        id: 12,
        title: "Twelve",
        description: undefined,
        content: undefined,
        jobColors: undefined,
        isAutoTimeOptions: false,
        timeOptions: undefined,
        isLocked: false,
        versionToken: "1212",
        hasDetail: false,
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[11]).not.toBe(state.entities[11])
  })
})