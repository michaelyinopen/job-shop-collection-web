import { useEffect } from 'react'
import { Paper } from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  jobSetHeadersSelector,
} from '../../store'
import { JobSetsPageContainer } from '../../styles'
import {
  jobSetsPageSetItems,
  jobSetsPageReset,
  jobSetsIsLoadingSelector,
} from './store'
import { useLoadJobSetsCallback } from './useLoadJobSetsCallback'
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
      <Paper>
        <JobSetsToolbarTitle />
        <JobSetsTable />
        <JobSetsTablePagination />
      </Paper>
    </JobSetsPageContainer>
  )
}