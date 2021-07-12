import { useEffect } from "react"
import { useAppDispatch, useAppSelector, jobSetIdsSelector } from '../../store'
import { getJobSets } from './store'

import { JobSetsPageContainer } from './JobSetPageContainer'


export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSets())
  }, [dispatch])
  const jobSetIds = useAppSelector(jobSetIdsSelector)
  return (
    <JobSetsPageContainer>
      <h1>JobSets Page</h1>
      <div>{JSON.stringify(jobSetIds)}</div>
    </JobSetsPageContainer>
  )
}