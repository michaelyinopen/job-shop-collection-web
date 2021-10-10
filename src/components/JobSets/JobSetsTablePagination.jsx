import {
  TablePagination,
} from '@material-ui/core'
import { useIsExtraSmallScreen } from './useIsExtraSmallScreen'
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageRowsPerPageSelector,
  jobSetsPageItemsSelector,
  jobSetsPagePageIndexSelector,
} from '../../store'
import {
  jobSetsPageChangePage,
  jobSetsPageChangeRowsPerPage,
} from './store'

export const JobSetsTablePagination = () => {
  const isExtraSmallScreen = useIsExtraSmallScreen()

  const dispatch = useAppDispatch()
  const rowsPerPage = useAppSelector(jobSetsPageRowsPerPageSelector)
  const items = useAppSelector(jobSetsPageItemsSelector)
  const count = items.length
  const pageIndex = useAppSelector(jobSetsPagePageIndexSelector)

  return (
    <TablePagination
      rowsPerPageOptions={!isExtraSmallScreen ? [5, 10, 15, 20] : [rowsPerPage]}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={pageIndex}
      backIconButtonProps={{
        'aria-label': 'previous page',
      }}
      nextIconButtonProps={{
        'aria-label': 'next page',
      }}
      onChangePage={(e, newPageIndex) => dispatch(jobSetsPageChangePage(newPageIndex))}
      onChangeRowsPerPage={e => dispatch(jobSetsPageChangeRowsPerPage(parseInt(e.target.value) ?? 10))}
    />
  )
}