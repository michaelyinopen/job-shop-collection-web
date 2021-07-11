
import { createAction } from '@reduxjs/toolkit'
import type { JobSetHeaderDto } from '../../../api'

export const getJobSetsStarted = createAction('jobSets/getJobSetsStarted')

export const getJobSetsSucceeded = createAction(
  'jobSets/getJobSetsSucceeded',
  (jobSetHeaders: JobSetHeaderDto[]) => ({
    payload: {
      jobSetHeaders
    }
  })
)

export const getJobSetsFailed = createAction(
  'jobSets/getJobSetsFailed',
  (failedMessage: string) => ({
    payload: {
      failedMessage
    }
  })
)