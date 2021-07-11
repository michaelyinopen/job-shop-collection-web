import { jobSetsReducer } from "./jobSetsReducer"
import { getJobSetsSucceeded } from "./actions"

describe("getJobSetsSucceeded", () => {
  test("add to empty state", () => {
    let state = {
      ids: [],
      entities: {}
    }
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, eTag: "1010" },
      { id: 11, title: "Eleven", isLocked: false, eTag: "1111" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState).toEqual({
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
  })

  test("cause no change", () => {
    let state = {
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, eTag: "1010" },
      { id: 11, title: "Eleven", isLocked: false, eTag: "1111" }
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
    let state = {
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 10, title: "Ten", isLocked: false, eTag: "1010" },
      { id: 11, title: "Eleven", isLocked: true, eTag: "9999" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState).toEqual({
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: true,
          eTag: "9999",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[10]).toBe(state.entities[10])
    expect(nextState.entities[11]).not.toBe(state.entities[11])
  })

  test("delete", () => {
    let state = {
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 11, title: "Eleven", isLocked: false, eTag: "1111" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState).toEqual({
      ids: [11],
      entities: {
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[11]).toBe(state.entities[11])
  })

  test("insert, update and delete", () => {
    let state = {
      ids: [10, 11],
      entities: {
        10: {
          id: 10,
          title: "Ten",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1010",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1111",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    }
    const action = getJobSetsSucceeded([
      { id: 11, title: "Eleven", isLocked: true, eTag: "9999" },
      { id: 12, title: "Twelve", isLocked: false, eTag: "1212" }
    ])
    // act
    const nextState = jobSetsReducer(state, action)
    expect(nextState).toEqual({
      ids: [11, 12],
      entities: {
        11: {
          id: 11,
          title: "Eleven",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: true,
          eTag: "9999",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        },
        12: {
          id: 12,
          title: "Twelve",
          description: null,
          content: null,
          jobColors: null,
          isAutoTimeOptions: false,
          timeOptions: null,
          isLocked: false,
          eTag: "1212",
          isLoading: false,
          loadFailedMessage: null,
          isUpdating: false,
          updateFailedMessage: null,
        }
      }
    })
    expect(nextState).not.toBe(state)
    expect(nextState.ids).not.toBe(state.ids)
    expect(nextState.entities).not.toBe(state.entities)
    expect(nextState.entities[11]).not.toBe(state.entities[11])
  })
})