import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
import {
  getJobSetsTakingThunkAction,
  jobSetsPageSetItems,
  jobSetsPageReset,
  jobSetsIsLoadingSelector,
  jobSetHeadersSelector
} from './store'

import { JobSetsPageContainer } from './JobSetsPageContainer'
import { JobSetsToolbarTitle } from './JobSetsToolbarTitle'
import { JobSetsTable } from './JobSetsTable'
import { JobSetsTablePagination } from './JobSetsTablePagination'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSetsTakingThunkAction)
      .then(result => {
        if (result?.kind === 'failure') {
          dispatch(addNotification({
            summary: "Load Job Sets Failed",
            matchPath: routePaths.jobSets
          }))
        }
      })
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
      <JobSetsTablePagination />
    </JobSetsPageContainer>
  )
}