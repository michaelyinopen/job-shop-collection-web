import { useState, useRef, useEffect } from 'react'
import throttle from 'lodash/throttle'
import {
  ClickAwayListener,
  Tooltip,
  IconButton,
  Popper,
  Grow,
  Paper,
} from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { JobOptions } from './JobOptions'

export const JobOptionsButton = ({ id }) => {
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
        <Tooltip title='Job options' placement="right-end">
          <IconButton
            onClick={(event) => {
              setAnchorEl(anchorEl ? null : event.currentTarget)
            }}
          >
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
        <Popper
          open={Boolean(anchorEl)}
          onClose={() => { setAnchorEl(null) }}
          anchorEl={anchorEl}
          placement='bottom-start'
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'top' }}
            >
              <Paper>
                <JobOptions id={id} />
              </Paper>
            </Grow >
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  )
}