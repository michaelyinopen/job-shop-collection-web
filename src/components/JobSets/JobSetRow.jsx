
import { useRef, useState, useMemo } from 'react'
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
import {
  MoreVert as MoreVertIcon,
  Forward as ForwardIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
} from '@material-ui/icons'
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

export const JobSetRow = (props) => {
  const classes = useJobSetRowStyles(props)
  const {
    jobSetHeaderId: id,
    dense,
    showDescription,
  } = props

  const dispatch = useAppDispatch()
  const { current: jobSetsPageItemSelector } = useRef(createJobSetsPageItemSelector(id))
  const jobSetHeader = useAppSelector(jobSetsPageItemSelector)
  const { current: itemIsSelectedSelector } = useRef(createItemIsSelectedSelector(id))
  const isItemSelected = useAppSelector(itemIsSelectedSelector)
  //todo

  const { push } = useHistory()
  const [viewJobSetCallback, editJobSetCallback, openInNewTabCallback] = useMemo(
    () => {
      const path = generatePath(routePaths.jobSet, { id })
      const openInNewTabCallback = e => {
        e.stopPropagation()
        const win = window.open(path, '_blank')
        win.focus()
      }
      const viewCallback = e => {
        e.stopPropagation()
        push(path)
      }
      const editPath = generatePath(routePaths.jobSet, { id, edit: "edit" })
      const editCallback = e => {
        e.stopPropagation()
        e.preventDefault()
        push(editPath)
      }
      return [viewCallback, editCallback, openInNewTabCallback]
    },
    [push, id]
  )

  const [menuPosition, setMenuPosition] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [anchorReference, setAnchorReference] = useState('none')
  const menuOpen = Boolean(anchorEl) || Boolean(menuPosition)

  const onMoreActionButtonClick = event => {
    event.stopPropagation()
    event.preventDefault()
    setAnchorReference('anchorEl')
    setAnchorEl(event.currentTarget)
    setMenuPosition(null)
  }
  const onContextMenu = event => {
    event.stopPropagation()
    event.preventDefault()
    const cursorPositon = { top: event.pageY, left: event.pageX }
    setAnchorReference('anchorPosition')
    setMenuPosition(cursorPositon)
    setAnchorEl(null)
  }

  const handleCloseContextMenu = () => {
    setAnchorReference('none')
    setMenuPosition(null)
    setAnchorEl(null)
  }

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