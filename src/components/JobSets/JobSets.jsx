import { useEffect } from 'react'
import { makeStyles, createStyles, Paper } from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  jobSetHeadersSelector,
} from '../../store'
import { PageContainer } from '../../styles'
import { ErrorBoundary } from '../ErrorBoundary'
import {
  jobSetsPageSetItems,
  jobSetsPageReset,
  jobSetsIsLoadingSelector,
} from './store'
import { useLoadJobSetsCallback } from './useLoadJobSetsCallback'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'
import { JobSetsTable } from './JobSetsTable'
import { JobSetsTablePagination } from './JobSetsTablePagination'

const useStyles = makeStyles(theme => createStyles({
  pageContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    }
  }
}))

export const JobSets = () => {
  const classes = useStyles()
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
    <ErrorBoundary>
      <PageContainer classes={{ pageContainer: classes.pageContainer }}>
        <Paper>
          <JobSetsToolbarTitle />
          <JobSetsTable />
          <JobSetsTablePagination />
        </Paper>
      </PageContainer>
    </ErrorBoundary>
  )
}