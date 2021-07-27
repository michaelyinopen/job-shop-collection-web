import { useEffect } from "react"
import { useAppDispatch, useAppSelector, jobSetHeadersSelector } from '../../store'
import {
  getJobSetsTakingThunkAction,
  jobSetsPageSetItems,
  jobSetsPageReset,
  jobSetsIsLoadingSelector
} from './store'

import { JobSetsPageContainer } from './JobSetsPageContainer'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'
import { JobSetsTable } from './JobSetsTable'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSetsTakingThunkAction)
  }, [dispatch])

  const isLoading = useAppSelector(jobSetsIsLoadingSelector)
  const jobSetHeaders = useAppSelector(jobSetHeadersSelector)
  useEffect(() => {
    dispatch(jobSetsPageSetItems(jobSetHeaders, !isLoading))
    return () => dispatch(jobSetsPageReset())
  }, [dispatch, isLoading, jobSetHeaders])

  return (
    <JobSetsPageContainer>
      <JobSetsToolbarTitle />
      <JobSetsTable />
      {/*<JobSetsTablePagination>*/}
    </JobSetsPageContainer>
  )
}