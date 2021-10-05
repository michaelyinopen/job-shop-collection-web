import template from 'url-template'
import { SuccessResult, FailureResult } from '../utility'
import type { Result, Failure } from '../utility'

const API_URL = process.env.REACT_APP_API_URL ?? ""

export class ApiFailure implements Failure {
  failureType: "API Failure"
  errorMesage: string
  constructor(errorMesage: string) {
    this.failureType = "API Failure"
    this.errorMesage = errorMesage
  }
}

export type JobSetHeaderDto = {
  id: number,
  title: string,
  description?: string | null,
  isLocked: boolean
  versionToken: string
}

type GetJobSetsResponse = {
  data: JobSetHeaderDto[],
  nextPageToken?: number
}

export const getJobSetsUrlTemplate = `${API_URL}/api/job-sets{?pageToken}`
export async function getJobSetsApiAsync(pageToken?: number): Promise<Result<GetJobSetsResponse, ApiFailure>> {
  const url = template.parse(getJobSetsUrlTemplate).expand({ pageToken })
  let responseBody: GetJobSetsResponse
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
    responseBody = await response.json()
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Sets. ${e instanceof Error ? e.message : ''}`))
  }
  if (!responseBody.data) {
    return new FailureResult(new ApiFailure("Missing data field in api response."))
  }
  return new SuccessResult(responseBody)
}

type GetJobSetJsonResponse = {
  status: 'ok',
  data: GetJobSetResponse
} | { status: 'not found' }

export type GetJobSetResponse = {
  id: number,
  title: string,
  description?: string | null,
  content?: string | null,
  jobColors?: string | null,
  isAutoTimeOptions: boolean,
  timeOptions?: string | null,
  isLocked: boolean
  versionToken: string
}

export const getJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function getJobSetApiAsync(id: number) {
  const url = template.parse(getJobSetUrlTemplate).expand({ id })
  let getJobSetResponse: GetJobSetResponse
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
    let responseBody: GetJobSetJsonResponse = await response.json()
    if (responseBody.status === 'not found') {
      return new FailureResult(new ApiFailure('not found'))
    }
    const { data } = responseBody
    getJobSetResponse = {
      id: data.id,
      title: data.title,
      description: data.description,
      content: data.content,
      jobColors: data.jobColors,
      isAutoTimeOptions: data.isAutoTimeOptions,
      timeOptions: data.timeOptions,
      isLocked: data.isLocked,
      versionToken: data.versionToken
    }
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Set. ${e instanceof Error ? e.message : ''}`))
  }
  return new SuccessResult(getJobSetResponse)
};

export type CreateJobSetRequest = {
  title: string,
  description?: string | null,
  content?: string | null,
  jobColors?: string | null,
  isAutoTimeOptions: boolean,
  timeOptions?: string | null,
}

export const createJobSetUrlTemplate = `${API_URL}/api/job-sets`
export async function createJobSetApiAsync(jobSet: CreateJobSetRequest) {
  try {
    const response = await fetch(
      createJobSetUrlTemplate,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobSet)
      })
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
    let responseBody: GetJobSetResponse = await response.json()
    const createJobSetResponse = {
      id: responseBody.id,
      title: responseBody.title,
      description: responseBody.description,
      content: responseBody.content,
      jobColors: responseBody.jobColors,
      isAutoTimeOptions: responseBody.isAutoTimeOptions,
      timeOptions: responseBody.timeOptions,
      isLocked: responseBody.isLocked,
      versionToken: responseBody.versionToken
    }
    return new SuccessResult(createJobSetResponse)
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Set. ${e instanceof Error ? e.message : ''}`))
  }
}

export type UpdateJobSetRequest = {
  id: number,
  title: string,
  description?: string | null,
  content?: string | null,
  jobColors?: string | null,
  isAutoTimeOptions: boolean,
  timeOptions?: string | null,
  versionToken: string
}

type UpdateJobSetJsonResponse = {
  status: 'done',
  updatedJobSet: GetJobSetResponse
} | {
  status: 'version condition failed',
  savedJobSet: GetJobSetResponse
} | { status: 'not found' }
  | { status: 'forbidden because locked' }

export const updateJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function updateJobSetApiAsync(id: number, jobSet: UpdateJobSetRequest) {
  const url = template.parse(updateJobSetUrlTemplate).expand({ id })
  try {
    const response = await fetch(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobSet)
      })
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
    let responseBody: UpdateJobSetJsonResponse = await response.json()
    if (responseBody.status === 'not found') {
      return new FailureResult({
        failureType: 'not found',
      })
    }
    if (responseBody.status === 'forbidden because locked') {
      return new FailureResult({
        failureType: 'forbidden because locked',
      })
    }
    if (responseBody.status === 'version condition failed') {
      return new FailureResult({
        failureType: 'version condition failed',
        savedJobSet: responseBody.savedJobSet
      })
    }
    if (responseBody.status === 'done') {
      const updatedJobSet = responseBody.updatedJobSet
      return new SuccessResult({
        id: updatedJobSet.id,
        title: updatedJobSet.title,
        description: updatedJobSet.description,
        content: updatedJobSet.content,
        jobColors: updatedJobSet.jobColors,
        isAutoTimeOptions: updatedJobSet.isAutoTimeOptions,
        timeOptions: updatedJobSet.timeOptions,
        isLocked: updatedJobSet.isLocked,
        versionToken: updatedJobSet.versionToken
      })
    }
    return new FailureResult(new ApiFailure('Unknown status in response body'))
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Set. ${e instanceof Error ? e.message : ''}`))
  }
}

export const deleteJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function deleteJobSetApiAsync(id: number) {
  const url = template.parse(deleteJobSetUrlTemplate).expand({ id })
  try {
    const response = await fetch(
      url,
      { method: "DELETE" }
    )
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
  } catch (e) {
    return new FailureResult(new ApiFailure(`Error when deleting Job Set id:${id}. ${e instanceof Error ? e.message : ''}`))
  }
  return new SuccessResult(undefined)
}
