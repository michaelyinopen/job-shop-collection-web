import { useEffect } from "react"
import { useAppDispatch, useAppSelector, jobSetHeadersSelector } from '../../store'
import {
  getJobSetsTakingThunkAction,
  jobSetsPageSetItems,
  jobSetsPageReset,
} from './store'

import { JobSetsPageContainer } from './JobSetsPageContainer'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSetsTakingThunkAction)
  }, [dispatch])

  const jobSetHeaders = useAppSelector(jobSetHeadersSelector)
  useEffect(() => {
    dispatch(jobSetsPageSetItems(jobSetHeaders))
    return () => dispatch(jobSetsPageReset())
  }, [dispatch, jobSetHeaders])

  return (
    <JobSetsPageContainer>
      <JobSetsToolbarTitle />
      <div>{JSON.stringify(jobSetHeaders)}</div>
    </JobSetsPageContainer>
  )
}