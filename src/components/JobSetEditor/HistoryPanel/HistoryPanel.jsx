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
          <ListItem button ick={() => { }}>
            <ListItemText primary={'Edit maximum view duration'} />
          </ListItem>
          <Divider light />
          <ListItem button Click={() => { }}>
            <ListItemText primary={'Edit minimum view duration'} />
          </ListItem>
          <Divider light />
          <ListItem button Click={() => { }}>
            <ListItemText primary={'Edit minimum view duration'} />
          </ListItem>
          <Divider light />
        </List>
      </div>
    </Paper >
  )
}