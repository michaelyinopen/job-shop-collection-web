import { useState, useRef, useEffect } from 'react'
import { useHistory, generatePath } from 'react-router-dom'
import throttle from 'lodash/throttle'
import {
  makeStyles,
  createStyles,
  ClickAwayListener,
  IconButton,
  Popper,
  Grow,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
} from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import DeleteIcon from '@material-ui/icons/Delete'
import { ProgressOverlay } from '../../../styles'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetIsLockedSelector
} from '../../../store'
import { addNotification } from '../../../notifications'
import { routePaths } from '../../../route'
import {
  deleteJobSetTakingThunkAction,
  createDeleteJobSetIsLoadingSelector,
} from '../../JobSets'

const DeleteJobSetMenuItem = ({ id }) => {
  const dispatch = useAppDispatch()
  const history = useHistory()
  const isDeleting = useAppSelector(createDeleteJobSetIsLoadingSelector(id))
  const isLocked = useAppSelector(createJobSetIsLockedSelector(id))
  const deleteJobSetRowCallback = useRef(() => {
    dispatch(deleteJobSetTakingThunkAction(id))
      .then(result => {
        if (result?.kind === 'success') {
          history.push(routePaths.jobSets)
          dispatch(addNotification({
            summary: `Deleted Job Set #${id}`,
            matchPath: routePaths.jobSets
          }))
        } else if (result?.kind === 'failure') {
          dispatch(addNotification({
            summary: `Failed to delete Job Set #${id}`,
            matchPath: generatePath(routePaths.jobSetEditor, { id })
          }))
        }
      })
      .catch(() => {
        dispatch(addNotification({
          summary: `Failed to delete Job Set #${id}`,
          matchPath: generatePath(routePaths.jobSetEditor, { id })
        }))
      })
  }, [dispatch]).current

  return (
    <ProgressOverlay isLoading={isDeleting}>
      <MenuItem onClick={deleteJobSetRowCallback} disabled={isDeleting | isLocked}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        Delete
      </MenuItem>
    </ProgressOverlay >
  )
}

const useMoreOptionsStyles = makeStyles(theme => createStyles({
  transformOriginTop: {
    transformOrigin: 'top'
  },
  popper: {
    zIndex: theme.zIndex.appBar - 2,
  },
  popperPaper: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

export const MoreOptions = ({ id }) => {
  const classes = useMoreOptionsStyles()
  const [anchorEl, setAnchorEl] = useState(null)

  const throttledClosePopper = useRef(
    throttle(
      () => { setAnchorEl(null) },
      1000,
      { leading: false, trailing: true }
    )
  ).current

  useEffect(() => {
    // cancel if unmount
    return () => throttledClosePopper.cancel?.()
  }, [throttledClosePopper])

  return (
    <ClickAwayListener
      onClickAway={() => {
        setAnchorEl(null)
        throttledClosePopper.cancel?.()
      }}
    >
      <div
        ref={anchorEl}
        onMouseEnter={e => { throttledClosePopper.cancel?.() }}
        onMouseLeave={e => { throttledClosePopper() }}
      >
        <IconButton
          onClick={(event) => {
            setAnchorEl(anchorEl ? null : event.currentTarget)
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Popper
          open={Boolean(anchorEl)}
          onClose={() => { setAnchorEl(null) }}
          anchorEl={anchorEl}
          placement='bottom-start'
          transition
          className={classes.popper}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              className={classes.transformOriginTop}
            >
              <Paper classes={{ root: classes.popperPaper }}>
                <MenuList>
                  <DeleteJobSetMenuItem id={id} />
                </MenuList>
              </Paper>
            </Grow >
          )}
        </Popper>
      </div>
    </ClickAwayListener >
  )
}