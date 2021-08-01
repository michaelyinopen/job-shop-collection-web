import { useEffect } from "react"
import {
  useAppDispatch,
  useAppSelector,
  jobSetHeadersSelector,
} from '../../store'
import {
  jobSetsPageSetItems,
  jobSetsPageReset,
  jobSetsIsLoadingSelector,
} from './store'
import { useLoadJobSetsCallback } from './useLoadJobSetsCallback'
import { JobSetsPageContainer } from './JobSetsPageContainer'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'
import { JobSetsTable } from './JobSetsTable'
import { JobSetsTablePagination } from './JobSetsTablePagination'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  const loadJobSetsCallback = useLoadJobSetsCallback()
  useEffect(() => {
    loadJobSetsCallback()
  }, [loadJobSetsCallback])

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
      <JobSetsTablePagination />
    </JobSetsPageContainer>
  )
}