import { useEffect } from "react"
import { useAppDispatch, useAppSelector, jobSetHeadersSelector } from '../../store'
import { getJobSets, setItems } from './store'

import { JobSetsPageContainer } from './JobSetPageContainer'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSets())
  }, [dispatch])

  const jobSetHeaders = useAppSelector(jobSetHeadersSelector)
  useEffect(() => {
    dispatch(setItems(jobSetHeaders))
    dispatch()
  }, [dispatch, jobSetHeaders])

  return (
    <JobSetsPageContainer>
      <JobSetsToolbarTitle />
      <div>{JSON.stringify(jobSetHeaders)}</div>
    </JobSetsPageContainer>
  )
}