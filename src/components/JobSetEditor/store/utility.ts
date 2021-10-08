import type { Draft } from "immer"
import { CreateJobSetRequest, UpdateJobSetRequest } from "../../../api"
import type { AppStoreJobSet, AppStoreJobSetDetail } from "./actions"
import type {
  JobSetEditorState,
  FormDataState,
  TimeOptions,
  JobColorState,
} from "./jobSetEditorReducer"

export type AppStoreJobSetContent = {
  machines: {
    id: string
    sequence: number
    title: string
    description: string
  }[],
  jobs: {
    id: string
    sequence: number
    title: string
    procedures: {
      id: string
      sequence: number
      jobId: string
      machineId: string | null
      processingTimeMs: number
    }[]
  }[]
}

export function appStoreJobSet_To_FormData(
  jobSet: AppStoreJobSetDetail
): FormDataState {
  const timeOptions: TimeOptions = JSON.parse(jobSet.timeOptions)
  const jobColors: { [id: string]: JobColorState } = JSON.parse(jobSet.jobColors)
  const content: AppStoreJobSetContent = JSON.parse(jobSet.content)
  return {
    title: jobSet.title,
    description: jobSet.description ?? '',
    machines: {
      ids: [...content.machines]
        .sort((a, b) => a.sequence - b.sequence)
        .map(m => m.id),
      entities: Object.fromEntries(content.machines.map(m => [
        m.id,
        {
          id: m.id,
          title: m.title,
          description: m.description
        }
      ]))
    },
    jobs: {
      ids: [...content.jobs]
        .sort((a, b) => a.sequence - b.sequence)
        .map(j => j.id),
      entities: Object.fromEntries(content.jobs.map(j => [
        j.id,
        {
          id: j.id,
          title: j.title,
          procedures: {
            ids: [...j.procedures]
              .sort((a, b) => a.sequence - b.sequence)
              .map(p => p.id),
            entities: Object.fromEntries(j.procedures.map(p => [
              p.id,
              {
                id: p.id,
                jobId: p.jobId,
                machineId: p.machineId ?? null,
                processingTimeMs: p.processingTimeMs
              }
            ]))
          },
        }
      ]))
    },
    jobColors: {
      ids: Object.keys(jobColors),
      entities: {
        ...jobColors
      }
    },
    isAutoTimeOptions: jobSet.isAutoTimeOptions,
    autoTimeOptions: undefined,
    manualTimeOptions: {
      maxTimeMs: timeOptions.maxTimeMs,
      viewStartTimeMs: timeOptions.viewStartTimeMs,
      viewEndTimeMs: timeOptions.viewEndTimeMs,
      minViewDurationMs: timeOptions.minViewDurationMs,
      maxViewDurationMs: timeOptions.maxViewDurationMs,
    }
  }
}

export function mergeUninitializedJobSet(
  jobSet: AppStoreJobSet | undefined,
  jobSetEditorInitialState: JobSetEditorState,
  state: Draft<JobSetEditorState>
): JobSetEditorState | void {
  if (!jobSet) {
    return jobSetEditorInitialState
  }
  state.isLocked = jobSet.isLocked
  state.hasDetail = jobSet.hasDetail

  if (jobSet.hasDetail) {
    state.formData = appStoreJobSet_To_FormData(jobSet)
  }
  else {
    state.formData.title = jobSet.title
    state.formData.description = jobSet.description ?? ''
    state.formData.title = jobSet.title
    state.formData.machines = jobSetEditorInitialState.formData.machines
    state.formData.jobs = jobSetEditorInitialState.formData.jobs
    state.formData.jobColors = jobSetEditorInitialState.formData.jobColors
    state.formData.isAutoTimeOptions = jobSetEditorInitialState.formData.isAutoTimeOptions
    state.formData.manualTimeOptions = jobSetEditorInitialState.formData.manualTimeOptions
  }
}


export function formData_To_CreateJobSetRequest(
  formData: FormDataState
): CreateJobSetRequest {
  const machines = formData.machines.ids.map((mId, index) => {
    const machine = formData.machines.entities[mId]
    return {
      id: machine.id,
      sequence: index + 1,
      title: machine.title,
      description: machine.description
    }
  })
  const jobs = formData.jobs.ids.map((jId, jIndex) => {
    const job = formData.jobs.entities[jId]
    const procedures = job.procedures.ids.map((pId, pIndex) => {
      const procedure = job.procedures.entities[pId]
      return {
        id: procedure.id,
        sequence: pIndex + 1,
        jobId: procedure.jobId,
        machineId: procedure.machineId ?? null,
        processingTimeMs: procedure.processingTimeMs,
      }
    })
    return {
      id: job.id,
      sequence: jIndex + 1,
      title: job.title,
      procedures
    }
  })
  const content = JSON.stringify({
    machines,
    jobs
  })
  return {
    title: formData.title,
    description: formData.description,
    content,
    jobColors: JSON.stringify(formData.jobColors.entities),
    isAutoTimeOptions: formData.isAutoTimeOptions,
    timeOptions: formData.isAutoTimeOptions
      ? JSON.stringify(formData.autoTimeOptions)
      : JSON.stringify(formData.manualTimeOptions),
  }
}

export function formData_To_UpdateJobSetRequest(
  id: number,
  versionToken: string,
  formData: FormDataState
): UpdateJobSetRequest {
  return {
    id,
    versionToken,
    ...formData_To_CreateJobSetRequest(formData)
  }
}