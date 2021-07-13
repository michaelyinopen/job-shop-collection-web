import { CircularProgress, makeStyles } from '@material-ui/core'
import type { ReactNode, FunctionComponent } from 'react'

const useStyles = makeStyles(() => ({
  wrapper: {
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    zIndex: 1,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    pointerEvents: 'none'
  }
}))

type ProgressOverlayProps = {
  isLoading: boolean,
  children?: ReactNode
}

export const ProgressOverlay: FunctionComponent<ProgressOverlayProps> = ({
  isLoading,
  children
}) => {
  const classes = useStyles()
  return (
    <div className={classes.wrapper}>
      {children}
      {isLoading ? <div className={classes.progress}><CircularProgress /></div> : null}
    </div>
  )
}