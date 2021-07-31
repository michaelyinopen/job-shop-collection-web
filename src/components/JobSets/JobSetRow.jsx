
import { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { generatePath } from 'react-router'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Checkbox,
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ForwardIcon from '@material-ui/icons/Forward'
import EditIcon from '@material-ui/icons/Edit'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { preventDefaultPropagation } from '../../utility'
import { routePaths } from '../../route'
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

/**
 * jobSetHeaderId must be kept the same
 * use key=jobSetHeaderId to be sure
 */
export const JobSetRow = (props) => {
  const classes = useJobSetRowStyles(props)
  const {
    jobSetHeaderId: id,
    dense,
    showDescription,
  } = props

  const dispatch = useAppDispatch()
  const jobSetsPageItemSelector = useRef(createJobSetsPageItemSelector(id)).current
  const jobSetHeader = useAppSelector(jobSetsPageItemSelector)
  const itemIsSelectedSelector = useRef(createItemIsSelectedSelector(id)).current
  const isItemSelected = useAppSelector(itemIsSelectedSelector)

  const { push } = useHistory()
  const viewJobSetCallback = useRef(e => {
    e.stopPropagation()
    e.preventDefault()
    push(generatePath(routePaths.jobSet, { id }))
  }).current
  const openInNewTabCallback = useRef(e => {
    e.stopPropagation()
    e.preventDefault()
    const win = window.open(generatePath(routePaths.jobSet, { id }), '_blank')
    win.focus()
  }).current
  const editJobSetCallback = useRef(e => {
    e.stopPropagation()
    e.preventDefault()
    push(generatePath(routePaths.jobSet, { id, edit: "edit" }))
  }).current

  const [menuPosition, setMenuPosition] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [anchorReference, setAnchorReference] = useState('none')
  const menuOpen = Boolean(anchorEl) || Boolean(menuPosition)

  const onMoreActionButtonClick = useRef(e => {
    e.stopPropagation()
    e.preventDefault()
    setAnchorReference('anchorEl')
    setAnchorEl(e.currentTarget)
    setMenuPosition(null)
  }).current
  const onContextMenu = useRef(e => {
    e.stopPropagation()
    e.preventDefault()
    const cursorPositon = { top: e.pageY, left: e.pageX }
    setAnchorReference('anchorPosition')
    setMenuPosition(cursorPositon)
    setAnchorEl(null)
  }).current
  const handleCloseContextMenu = useRef(() => {
    setAnchorReference('none')
    setMenuPosition(null)
    setAnchorEl(null)
  }).current

  if (!jobSetHeader) {
    return
  }
  return (
    <TableRow
      className={clsx({ [classes.rowWithMenu]: menuOpen })}
      hover
      onClick={viewJobSetCallback}
      onContextMenu={onContextMenu}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      selected={isItemSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          onClick={() => isItemSelected
            ? dispatch(jobSetsPageUnselectOne(id))
            : dispatch(jobSetsPageSelectOne(id))}
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
          <IconButton
            onClick={onMoreActionButtonClick}
            onContextMenu={preventDefaultPropagation}
            size={dense ? 'small' : 'medium'}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
      </TableCell>
      <Menu
        anchorReference={anchorReference}
        anchorEl={anchorEl}
        anchorPosition={menuPosition}
        keepMounted
        open={menuOpen}
        onClose={handleCloseContextMenu}
        onClick={preventDefaultPropagation}
      >
        <MenuItem onClick={viewJobSetCallback} onContextMenu={preventDefaultPropagation}>
          <ListItemIcon>
            <ForwardIcon />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem
          onClick={editJobSetCallback}
          onContextMenu={preventDefaultPropagation}
          disabled={jobSetHeader.isLocked}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={openInNewTabCallback} onContextMenu={preventDefaultPropagation}>
          <ListItemIcon>
            <OpenInNewIcon />
          </ListItemIcon>
          Open in new tab
        </MenuItem>
        {/* todo add delete here */}
      </Menu>
      {/* todo indicate locked */}
    </TableRow >
  )
}