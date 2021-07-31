import {
  makeStyles,
  createStyles,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
} from '@material-ui/core'
import { useAppDispatch, useAppSelector } from '../../store'
import { useIsExtraSmallScreen } from './useIsExtraSmallScreen'
import { columnStyles } from './columnStyles'
import {
  jobSetsPageToggleSelectAll,
  jobSetsPageToggleSort,
  jobSetsPageItemIdssOfPageSelector,
  jobSetsPageSelectedItemIdsSelector,
  jobSetsPageRowsPerPageSelector,
  jobSetsPageOrderSelector,
  jobSetsPageOrderBySelector,
} from './store'
import { JobSetRow } from './JobSetRow'

const useJobSetsTableStyles = makeStyles(theme => createStyles({
  table: {
    tableLayout: 'fixed',
  },
  fillerRow: {
    height: props => (props.dense ? 34.4 : 52.4) * props.emptyRows
  },
  ...columnStyles(theme)
}))

const JobSetsTableConnect = (Component) => {
  const JobSeJobSetsTableConnectComponent = ({ props }) => {
    const dispatch = useAppDispatch()
    const pageItemIds = useAppSelector(jobSetsPageItemIdssOfPageSelector)
    const rowsPerPage = useAppSelector(jobSetsPageRowsPerPageSelector)
    const selectedItemIds = useAppSelector(jobSetsPageSelectedItemIdsSelector)
    const order = useAppSelector(jobSetsPageOrderSelector)
    const orderBy = useAppSelector(jobSetsPageOrderBySelector)
    const isExtraSmallScreen = useIsExtraSmallScreen()

    return <Component
      dispatch={dispatch}
      dense={rowsPerPage > 10}
      showDescription={!isExtraSmallScreen}
      emptyRows={rowsPerPage - pageItemIds.length}
      pageItemIds={pageItemIds}
      selectedItemCount={selectedItemIds.length}
      order={order}
      orderBy={orderBy}
    />
  }
  return JobSeJobSetsTableConnectComponent
}

export const JobSetsTable = JobSetsTableConnect((props) => {
  const classes = useJobSetsTableStyles(props)
  const {
    dispatch,
    dense,
    showDescription,
    emptyRows,
    pageItemIds,
    selectedItemCount,
    order,
    orderBy
  } = props

  return (
    <>
      <Table
        className={classes.table}
        size={dense ? 'small' : 'medium'}
      >
        <TableHead>
          <TableRow>
            <TableCell padding='checkbox'>
              <Checkbox
                indeterminate={selectedItemCount > 0 && selectedItemCount < pageItemIds.length}
                checked={selectedItemCount > 0 && selectedItemCount === pageItemIds.length}
                onChange={() => dispatch(jobSetsPageToggleSelectAll())}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </TableCell>
            <TableCell
              padding='none'
              align='left'
              sortDirection={orderBy === 'id' ? order : 'asc'}
              className={classes.idColumn}
            >
              <TableSortLabel
                active={orderBy === 'id'}
                direction={orderBy === 'id' ? order : 'asc'}
                onClick={() => dispatch(jobSetsPageToggleSort('id'))}
              >
                Id
              </TableSortLabel>
            </TableCell>
            <TableCell
              align='left'
              sortDirection={orderBy === 'title' ? order : 'asc'}
              className={classes.titleColumn}
            >
              <TableSortLabel
                active={orderBy === 'title'}
                direction={orderBy === 'title' ? order : 'asc'}
                onClick={() => dispatch(jobSetsPageToggleSort('title'))}
              >
                Title
              </TableSortLabel>
            </TableCell>
            {showDescription ? (
              <TableCell
                align='left'
                sortDirection={orderBy === 'description' ? order : 'asc'}
                className={classes.descriptionColumn}
              >
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => dispatch(jobSetsPageToggleSort('description'))}
                >
                  Description
                </TableSortLabel>
              </TableCell>
            ) : null}
            <TableCell className={classes.actionsColumn}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pageItemIds.map(id => (
            <JobSetRow
              key={id}
              jobSetHeaderId={id}
              dense={dense}
              showDescription={showDescription}
            />
          ))}
          {emptyRows > 0 && (
            <TableRow className={classes.fillerRow}>
              <TableCell colSpan={5} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
})