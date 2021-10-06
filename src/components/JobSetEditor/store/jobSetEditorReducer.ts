import {
  combineReducers,
  createReducer,
} from '@reduxjs/toolkit'
import {
  resetJobSetEditor,
  setJobSetEditorId,
  setJobSetEditorIsEdit,
  loadedJobSet,
  failedToLoadJobSet,
  setJobSetFromAppStore,
} from './actions'
import type { AppStoreJobSetDetail } from './actions'
import { formDataReducer } from './formDataReducer'
import { appStoreJobSet_To_FormData, mergeUninitializedJobSet } from './utility'

type JobSetEditorControlState = {
  id?: number
  isEdit: boolean
  loaded: boolean
  setFromAppStore: boolean
  failedToLoad: boolean
  jobSet: any //todo
}

const jobSetEditorControlInitialState: JobSetEditorControlState = {
  id: undefined,
  isEdit: false,
  loaded: false,
  setFromAppStore: false,
  failedToLoad: false,
  jobSet: undefined, //todo
}

const jobSetEditorControlReducer = createReducer(jobSetEditorControlInitialState, (builder) => {
  builder
    .addCase(resetJobSetEditor, (state) => {
      state.id = undefined
      state.isEdit = false
      state.loaded = false
      state.setFromAppStore = false
      state.failedToLoad = false
    })
    .addCase(setJobSetEditorId, (state, { payload: id }) => {
      state.id = id
    })
    .addCase(setJobSetEditorIsEdit, (state, { payload: isEdit }) => {
      state.isEdit = isEdit
    })
    .addCase(loadedJobSet, (state) => {
      state.loaded = true
      state.failedToLoad = false
    })
    .addCase(failedToLoadJobSet, (state) => {
      state.loaded = false
      state.failedToLoad = true
    })
    .addCase(setJobSetFromAppStore, (state, { payload: jobSet }) => {
      if (!state.loaded) {
        return
      }
      // todo implement
      // state.jobSet = jobSet //todo remove
    })
})

export const jobSetEditorReducer = combineReducers({
  control: jobSetEditorControlReducer,
  formData: formDataReducer,
  touched: touchedReducer,
})

export const jobSetsEditorIsEditSelector = (state: JobSetEditorState) => state.control.isEdit
export const jobSetsEditorLoadedSelector = (state: JobSetEditorState) => state.control.loaded
export const jobSetsEditorFailedToLoadSelector = (state: JobSetEditorState) => state.control.failedToLoad
export const jobSetsEditorJobSetSelector = (state: JobSetEditorState) => state //todo

export const jobSetsEditorFormDataSelector = (state: JobSetEditorState) => state.formData
export const jobSetsEditorTouchedSelector = (state: JobSetEditorState) => state.touched

////////////////////////////////////////////////////////////////////

type Step = any // todo

export type JobSetEditorState = {
  id?: number
  isLocked: boolean
  isEdit: boolean
  hasDetail: boolean
  loadStatus: 'not loaded' | 'loaded' | 'failed'
  initialized: boolean
  formData: FormDataState
  touched: TouchedState
  steps: Step[],
  currentStepIndex: number,
  versions: {
    versionToken: string,
    formData: FormDataState
  }[],
}

//#region FormDataState
export type FormDataState = {
  title: string
  description: string
  machines: {
    ids: string[],
    entities: {
      [id: string]: MachineState
    }
  }
  jobs: {
    ids: string[],
    entities: {
      [id: string]: JobState
    }
  }
  jobColors: {
    ids: string[],
    entities: {
      [id: string]: JobColorState
    }
  }
  isAutoTimeOptions: boolean
  autoTimeOptions?: TimeOptionsState
  manualTimeOptions: TimeOptionsState
}

export type MachineState = {
  id: string
  title: string
  description: string
}

export type JobState = {
  id: string
  title: string
  procedures: {
    ids: string[],
    entities: {
      [id: string]: ProcedureState
    }
  }
}

export type ProcedureState = {
  id: string
  jobId: string
  machineId: string | null
  processingTimeMs: number
}

export type JobColorState = {
  jobId: string
  color: string
  textColor: string
}

export type TimeOptionsState = {
  maxTimeMs: number
  viewStartTimeMs: number
  viewEndTimeMs: number
  minViewDurationMs: number
  maxViewDurationMs: number
}
//#endregion FormDataState

export type TimeOptions = TimeOptionsState

export type TouchedState = {
  //todo follow formData shape
}

const formDataInitialState: FormDataState = {
  title: '',
  description: '',
  machines: {
    ids: [],
    entities: {}
  },
  jobs: {
    ids: [],
    entities: {}
  },
  jobColors: {
    ids: [],
    entities: {}
  },
  isAutoTimeOptions: true,
  autoTimeOptions: undefined,
  manualTimeOptions: {
    maxTimeMs: 0,
    viewStartTimeMs: 0,
    viewEndTimeMs: 0,
    minViewDurationMs: 0,
    maxViewDurationMs: 0,
  }
}

const jobSetEditorInitialState: JobSetEditorState = {
  id: undefined,
  isLocked: false,
  isEdit: false,
  hasDetail: false,
  loadStatus: 'not loaded',
  initialized: false,
  formData: formDataInitialState,
  touched: {},
  steps: [{ name: 'initial', operations: [] }],
  currentStepIndex: 0,
  versions: [],
}

const jobSetEditorReducer = createReducer(jobSetEditorInitialState, (builder) => {
  builder
    .addCase(resetJobSetEditor, (state) => {
      state.id = undefined
      return jobSetEditorInitialState
    })
    .addCase(setJobSetEditorId, (state, { payload: id }) => {
      state.id = id
    })
    .addCase(setJobSetEditorIsEdit, (state, { payload: isEdit }) => {
      state.isEdit = isEdit
    })
    .addCase(loadedJobSet, (state) => {
      state.loadStatus = 'loaded'
    })
    .addCase(failedToLoadJobSet, (state) => {
      state.loadStatus = 'failed'
    })
    .addCase(setJobSetFromAppStore, (state, action) => {
      const { payload: { jobSet, loaded } } = action
      if (!state.initialized) {
        const newState = mergeUninitializedJobSet(
          jobSet,
          jobSetEditorInitialState,
          state
        ) ?? state
        if (loaded) {
          // if loaded, it is garunteed that (activity && activity.hasDetail) === true
          newState.initialized = true
          newState.versions = [
            {
              versionToken: jobSet!.versionToken,
              formData: newState.formData
            }
          ]
        }
        return newState
      }
      //state.initialized === true
      if (!jobSet
        || jobSet.versionToken === state.versions[state.versions.length - 1].versionToken
        || !jobSet.hasDetail) {
        return
      }
      // const refreshedStep = calculateRefreshedStep(
      //   state.versions[state.versions.length - 1].formData,
      //   state.formData,
      //   activity
      // )
      // if (refreshedStep) {
      //   state.formData = redoStep(refreshedStep, state.formData)
      //   state.steps.splice(state.currentStepIndex + 1)
      //   state.steps.push(refreshedStep)
      //   state.currentStepIndex = state.steps.length - 1
      //   for (const step of state.steps.filter(s => s.saveStatus)) {
      //     step.saveStatus = undefined
      //   }
      // }
      state.versions.push({
        versionToken: jobSet.versionToken,
        formData: state.formData
      })
    })
})