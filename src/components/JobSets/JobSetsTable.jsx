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
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageItemIdssOfPageSelector,
  jobSetsPageSelectedItemIdsSelector,
  jobSetsPageRowsPerPageSelector,
  jobSetsPageItemCountSelector,
  jobSetsPageOrderSelector,
  jobSetsPageOrderBySelector,
} from '../../store'
import { useIsExtraSmallScreen } from './useIsExtraSmallScreen'
import { columnStyles } from './columnStyles'
import {
  jobSetsPageToggleSelectAll,
  jobSetsPageToggleSort,
} from './store'
import { JobSetRow } from './JobSetRow'

const useJobSetsTableStyles = makeStyles(theme => createStyles({
  table: {
    tableLayout: 'fixed',
  },
  fillerRow: {
    height: props => (props.dense ? 31 : 49) * props.emptyRows
  },
  ...columnStyles(theme)
}))

const JobSetsTableConnect = (Component) => {
  const JobSeJobSetsTableConnectComponent = ({ props }) => {
    const dispatch = useAppDispatch()
    const pageItemIds = useAppSelector(jobSetsPageItemIdssOfPageSelector)
    const rowsPerPage = useAppSelector(jobSetsPageRowsPerPageSelector)
    const selectedItemIds = useAppSelector(jobSetsPageSelectedItemIdsSelector)
    const selectedItemCount = selectedItemIds.length
    const itemCount = useAppSelector(jobSetsPageItemCountSelector)
    const order = useAppSelector(jobSetsPageOrderSelector)
    const orderBy = useAppSelector(jobSetsPageOrderBySelector)
    const dense = rowsPerPage > 10
    const isExtraSmallScreen = useIsExtraSmallScreen()
    const showDescription = !isExtraSmallScreen

    return <Component
      dispatch={dispatch}
      dense={dense}
      showDescription={showDescription}
      emptyRows={0}
      pageItemIds={pageItemIds}
      itemCount={itemCount}
      selectedItemCount={selectedItemCount}
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
    itemCount,
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
                indeterminate={selectedItemCount > 0 && selectedItemCount < itemCount}
                checked={selectedItemCount > 0 && selectedItemCount === itemCount}
                onChange={() => dispatch(jobSetsPageToggleSelectAll())}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </TableCell>
            <TableCell
              padding='none'
              align='left'
              sortDirection={orderBy === 'id' ? order : false}
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
              sortDirection={orderBy === 'title' ? order : false}
              className={classes.titleColumn}
            >
              <TableSortLabel
                active={orderBy === 'title'}
                direction={order}
                onClick={() => dispatch(jobSetsPageToggleSort('title'))}
              >
                Title
              </TableSortLabel>
            </TableCell>
            {showDescription ? (
              <TableCell
                align='left'
                sortDirection={orderBy === 'description' ? order : false}
                className={classes.descriptionColumn}
              >
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={order}
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