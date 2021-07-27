import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Checkbox,
  TableRow,
  TableCell,
  Typography,
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
} from '../../store'
import { columnStyles } from './columnStyles'
import { useRef } from 'react'

const useJobSetRowStyles = makeStyles(theme => createStyles({
  rowWithMenu: {
    backgroundColor: theme.palette.grey[200]
  },
  // descriptionCell: {
  //   maxWidth: '700px',
  // },
  actionsFlexbox: {
    display: 'flex',
    justifyContent: 'space-evenly',
    maxWidth: '96px'
  },
  // buttonSuccess: {
  //   backgroundColor: green[500],
  // },
  // buttonFailed: {
  //   backgroundColor: red[500],
  // },
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
  const { current: jobSetsPageItemSelector } = useRef(createJobSetsPageItemSelector(jobSetHeaderId))
  const jobSetHeader = useAppSelector(jobSetsPageItemSelector)
  //todo
  const menuOpen = false
  const viewJobSetCallback = () => { }
  const onContextMenu = () => { }
  const isItemSelected = false
  const onSelect = () => { }
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
          onClick={onSelect}
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