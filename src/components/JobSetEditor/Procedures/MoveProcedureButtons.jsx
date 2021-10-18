import {
  makeStyles,
  createStyles,
  Tooltip,
  Button,
} from '@material-ui/core'
import UpIcon from '@material-ui/icons/ArrowDropUp'
import DownIcon from '@material-ui/icons/ArrowDropDown'

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'grid',
    gridTemplate: '"up" 1fr "down" 1fr / auto',
  },
  up: {
    gridArea: 'up',
  },
  down: {
    gridArea: 'down',
  },
  button: {
    padding: 0,
    overflow: 'hidden',
  },
  icon: {
    filter: 'drop-shadow(0 0 2px white)',
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    boxShadow: "0 0 10px 10px rgba(255, 255, 255, 0.12)",
  }
}))

export const MoveProcedureButtons = ({
  jobId,
  id
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.up}>
        <Tooltip title={`Move up`}>
          <div className={classes.buttonWrapper}>
            <Button
              className={classes.button}
            >
              <UpIcon className={classes.icon} />
            </Button>
          </div>
        </Tooltip>
      </div>
      <div className={classes.down}>
        <Tooltip title={`Move down`}>
          <Button
            className={classes.button}
          >
            <DownIcon className={classes.icon} />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}