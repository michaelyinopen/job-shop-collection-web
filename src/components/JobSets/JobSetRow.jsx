
import { useRef } from 'react'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Checkbox,
  TableRow,
  TableCell,
  IconButton,
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon,
} from '@material-ui/icons'
import { preventDefaultPropagation } from '../../utility'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetsPageItemSelector,
  createItemIsSelectedSelector,
} from '../../store'
import { columnStyles } from './columnStyles'
import {
  jobSetsPageSelectOne,
  jobSetsPageUnselectOne,
} from './store'

const useJobSetRowStyles = makeStyles(theme => createStyles({
  rowWithMenu: {
    backgroundColor: theme.palette.grey[200]
  },
  actionsFlexbox: {
    display: 'flex',
    justifyContent: 'space-evenly',
    maxWidth: '96px'
  },
  textCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ...columnStyles(theme)
}))

export const JobSetRow = (props) => {
  const classes = useJobSetRowStyles(props)
  const {
    jobSetHeaderId,
    dense,
    showDescription,
  } = props

  const dispatch = useAppDispatch()
  const { current: jobSetsPageItemSelector } = useRef(createJobSetsPageItemSelector(jobSetHeaderId))
  const jobSetHeader = useAppSelector(jobSetsPageItemSelector)
  const { current: itemIsSelectedSelector } = useRef(createItemIsSelectedSelector(jobSetHeaderId))
  const isItemSelected = useAppSelector(itemIsSelectedSelector)
  //todo
  const menuOpen = false
  const viewJobSetCallback = () => { }
  const onContextMenu = () => { }
  const onMoreActionButtonClick = () => { }

  if (!jobSetHeader) {
    return
  }

  return (
    <TableRow
      className={clsx({ [classes.rowWithMenu]: menuOpen })}
      hover
      onClick={viewJobSetCallback}
      onContextMenu={onContextMenu} // TODO replace with custom context menu, also stop propagation on buttons
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      selected={isItemSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          onClick={() => isItemSelected
            ? dispatch(jobSetsPageUnselectOne(jobSetHeaderId))
            : dispatch(jobSetsPageSelectOne(jobSetHeaderId))}
          onContextMenu={preventDefaultPropagation}
        />
      </TableCell>
      <TableCell component="th" scope="row" padding="none" className={classes.idColumn}>
        {jobSetHeader.id}
      </TableCell>
      <TableCell align="left" padding="none" className={classes.titleColumn}>
        <div className={classes.textCell}>
          {jobSetHeader.title}
        </div>
      </TableCell>
      {showDescription ? (
        <TableCell align="left" padding="none" className={classes.descriptionColumn}>
          <div className={classes.textCell}>
            {jobSetHeader.description}
          </div>
        </TableCell>
      ) : null
      }
      <TableCell align="left" padding="none" className={classes.actionsColumn}>
        <div className={classes.actionsFlexbox}>
          {/* <RowDeleteButtonContainer
            id={id}
            jobSetHeader={jobSetHeader}
            dense={dense}
            reloadCallback={reloadCallback}
          />*/}
          <IconButton
            onClick={onMoreActionButtonClick}
            onContextMenu={preventDefaultPropagation}
            size={dense ? 'small' : 'medium'}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
      </TableCell>
      {/* <RowMoreActionsMenu
        viewJobSetCallback={viewJobSetCallback}
        editJobSetCallback={editJobSetCallback}
        openInNewTabCallback={openInNewTabCallback}
        anchorReference={anchorReference}
        anchorEl={anchorEl}
        anchorPosition={menuPosition}
        open={menuOpen}
        handleClose={handleCloseContextMenu}
        isLocked={isLocked}
      /> */}
    </TableRow >
  )
}