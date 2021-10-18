import {
  makeStyles,
  createStyles,
  Tooltip,
  Button,
} from '@material-ui/core'
import UpIcon from '@material-ui/icons/ArrowDropUp'
import DownIcon from '@material-ui/icons/ArrowDropDown'
import {
  useJobSetEditorSelector,
  canProcedureMoveUpSelector,
  canProcedureMoveDownSelector,
  procedureIndexSelector,
  useJobSetEditorDispatch,
  moveProcedure,
} from '../store'

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
  const editorDispatch = useJobSetEditorDispatch()
  const canMoveUp = useJobSetEditorSelector(canProcedureMoveUpSelector(jobId, id))
  const canMoveDown = useJobSetEditorSelector(canProcedureMoveDownSelector(jobId, id))
  const currentIndex = useJobSetEditorSelector(procedureIndexSelector(jobId, id))
  return (
    <div className={classes.root}>
      {canMoveUp && (
        <div className={classes.up}>
          <Tooltip title={`Move up`}>
            <div className={classes.buttonWrapper}>
              <Button
                className={classes.button}
                onClick={() => {
                  editorDispatch(moveProcedure(jobId, id, currentIndex - 1))
                }}
              >
                <UpIcon className={classes.icon} />
              </Button>
            </div>
          </Tooltip>
        </div>
      )}
      {canMoveDown && (
        <div className={classes.down}>
          <Tooltip title={`Move down`}>
            <Button
              className={classes.button}
              onClick={() => {
                editorDispatch(moveProcedure(jobId, id, currentIndex + 1))
              }}
            >
              <DownIcon className={classes.icon} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}