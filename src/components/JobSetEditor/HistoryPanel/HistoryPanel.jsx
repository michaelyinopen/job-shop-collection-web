import { TransitionGroup } from 'react-transition-group'
import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
  Button,
  Typography,
  List,
  Collapse,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import {
  useJobSetEditorDispatch,
  closeHistoryPanel,
  useJobSetEditorSelector,
  stepIdsSelector,
} from '../store'
import { StepItem } from './StepItem'

const useStyles = makeStyles(theme => createStyles({
  root: {
    overflow: 'hidden',
    backgroundColor: theme.palette.grey[100],
    height: '100%',
  },
  content: {
    width: 200,
    overflow: 'auto',
    height: 'calc(100vh - 64px)',
    [theme.breakpoints.down('xs')]: {
      height: '100%',
    }
  },
  historyTitle: {
    margin: theme.spacing(1),
  },
  flex: {
    display: 'flex'
  },
  separator: {
    flexGrow: 1
  }
}))

export const historyPanelWidth = 200

export const HistoryPanel = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const stepIds = useJobSetEditorSelector(stepIdsSelector)
  return (
    <Paper square classes={{ root: classes.root }}>
      <div className={classes.content}>
        <div className={classes.flex}>
          <Typography variant='h6' className={classes.historyTitle}>
            History
          </Typography>
          <div className={classes.separator} />
          <Button
            onClick={() => { editorDispatch(closeHistoryPanel()) }}
          >
            <CloseIcon />
          </Button>
        </div>
        <Divider />
        <List disablePadding dense>
          <TransitionGroup>
            {stepIds.map(sId => (
              <Collapse key={sId}>
                <StepItem key={sId} id={sId} />
              </Collapse>
            ))}
          </TransitionGroup>
        </List>
      </div>
    </Paper >
  )
}