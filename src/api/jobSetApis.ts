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
  title?: string,
  description?: string,
  isLocked: boolean
  eTag?: string
}

type GetJobSetsResponse = {
  data: JobSetHeaderDto[],
  nextPageToken?: number
}

export const getJobSetsUrlTemplate = `${API_URL}/api/job-sets{?pageToken}`
export async function getJobSetsApiAsync(pageToken?: number): Promise<Result<GetJobSetsResponse, ApiFailure>> {
  const url = template.parse(getJobSetsUrlTemplate).expand({ pageToken })
  let responseBody
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
    responseBody = await response.json()
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Error when getting Job Sets. ${e.message}`))
  }
  if (!responseBody.data) {
    return new FailureResult(new ApiFailure("Missing data field in api response."))
  }
  return new SuccessResult(responseBody as GetJobSetsResponse)
}

export const deleteJobSetUrlTemplate = `${API_URL}/api/job-sets/{id}`
export async function deleteJobSetApiAsync(id: number, eTag: string) {
  const url = template.parse(deleteJobSetUrlTemplate).expand({ id })
  try {
    const response = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          "If-Match": eTag
        }
      }
    )
    if (!response.ok) {
      return new FailureResult(new ApiFailure(response.statusText))
    }
  } catch (e) {
    return new FailureResult(new ApiFailure(`Error when deleting Job Set id:${id}. ${e.message}`))
  }
  return new SuccessResult(undefined)
}