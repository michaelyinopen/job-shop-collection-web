import template from 'url-template'
import { OkResult, FailureResult } from '../utility'
import type { Result, Failure } from '../utility'

const API_URL = process.env.REACT_APP_API_URL ?? ""

class ApiFailure implements Failure{
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
  const response = await fetch(url)
  if (!response.ok) {
    return new FailureResult(new ApiFailure(response.statusText))
  }
  let responseBody
  try {
    responseBody = await response.json()
  }
  catch (e) {
    return new FailureResult(new ApiFailure(`Wrong api response format. ${e.message}`))
  }
  if (!responseBody.data) {
    return new FailureResult(new ApiFailure("Missing data field in api response."))
  }
  return new OkResult(responseBody as GetJobSetsResponse)
}