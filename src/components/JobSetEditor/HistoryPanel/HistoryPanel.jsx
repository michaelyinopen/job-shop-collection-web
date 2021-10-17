import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import {
  useJobSetEditorDispatch,
  undo,
  redo,
  openHistoryPanel,
  closeHistoryPanel,
  useJobSetEditorSelector,
  canUndoSelector,
  canRedoSelector,
  isHistoryPanelOpenSelector,
} from '../store'

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
    color: theme.palette.text.secondary
  },
  flex: {
    display: 'flex'
  },
  separator: {
    flexGrow: 1
  },
  step: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  undoneStep: {
    borderLeft: `${theme.spacing(1)}px dotted ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    opacity: 0.5,
  },
  currentStep: {
    borderLeft: `${theme.spacing(1)}px solid ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  }
}))

export const historyPanelWidth = 200

export const HistoryPanel = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <Paper square classes={{ root: classes.root }}>
      <div className={classes.content}>
        <div className={classes.flex}>
          <Typography variant='h6' className={classes.historyTitle}>
            History
          </Typography>
          <div className={classes.separator} />
          <Button
            className={classes.button}
            color="inherit"
            onClick={() => { editorDispatch(closeHistoryPanel()) }}
          >
            <CloseIcon />
          </Button>
        </div>
        <Divider />
        <List disablePadding dense>
          <ListItem
            button
            divider
            disableGutters
            className={classes.undoneStep}
            onClick={() => { }}
          >
            <ListItemText primary={'Edit maximum view duration'} />
          </ListItem>
          <ListItem
            button
            divider
            disableGutters
            className={classes.currentStep}
            onClick={() => { }}
          >
            <ListItemText primary={'Edit minimum view duration'} />
          </ListItem>
          <ListItem
            button
            divider
            disableGutters
            className={classes.step}
            onClick={() => { }}
          >
            <ListItemText primary={'Edit minimum view duration'} />
          </ListItem>
        </List>
      </div>
    </Paper >
  )
}