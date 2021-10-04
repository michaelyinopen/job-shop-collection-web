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
} | {
  status: 'not found'
}

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
      description: data.description ?? null,
      content: data.content ?? null,
      jobColors: data.jobColors ?? null,
      isAutoTimeOptions: data.isAutoTimeOptions,
      timeOptions: data.timeOptions ?? null,
      isLocked: data.isLocked,
      versionToken: data.versionToken
    }
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Set. ${e instanceof Error ? e.message : ''}`))
  }
  return new SuccessResult(getJobSetResponse)
};

////////////////////////////////////
// type GetJobSetJsonResponse = {
//   status: 'ok',
//   data: GetJobSetResponse
// } | {
//   status: 'not found'
// }

// export type GetJobSetResponse = {
//   id: number,
//   title: string,
//   description?: string | null,
//   content?: string | null,
//   jobColors?: string | null,
//   isAutoTimeOptions: boolean,
//   timeOptions?: string | null,
//   isLocked: boolean
//   versionToken: string
// }


export const updateJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function updateJobSetApiAsync(id: number) {
  const url = template.parse(getJobSetUrlTemplate).expand({ id })
  let parsedResponse: GetJobSetResponse
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
    parsedResponse = {
      id: data.id,
      title: data.title,
      description: data.description,
      content: data.content ? JSON.parse(data.content) : undefined,
      jobColors: data.jobColors ? JSON.parse(data.jobColors) : undefined,
      isAutoTimeOptions: data.isAutoTimeOptions,
      timeOptions: data.timeOptions ? JSON.parse(data.timeOptions) : undefined,
      isLocked: data.isLocked,
      versionToken: data.versionToken
    }
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Set. ${e instanceof Error ? e.message : ''}`))
  }
  return new SuccessResult(parsedResponse)
};
///////////////////////////////
export const deleteJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function deleteJobSetApiAsync(id: number, eTag: string) {
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
