import {
  makeStyles,
  createStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory'
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
    display: 'flex'
  }
}))

export const HistoryButtons = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const canUndo = useJobSetEditorSelector(canUndoSelector)
  const canRedo = useJobSetEditorSelector(canRedoSelector)
  const isHistoryPanelOpen = useJobSetEditorSelector(isHistoryPanelOpenSelector)
  return (
    <div className={classes.root}>
      <Tooltip
        title={isHistoryPanelOpen ? 'Close history panel' : 'History'}
        placement="bottom-end"
      >
        <IconButton
          onClick={() => {
            if (isHistoryPanelOpen) {
              editorDispatch(closeHistoryPanel())
            } else {
              editorDispatch(openHistoryPanel())
            }
          }}
        >
          <ChangeHistoryIcon />
        </IconButton>
      </Tooltip>
      <IconButton
        disabled={canUndo}
        onClick={() => {
          editorDispatch(undo())
        }}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        disabled={canRedo}
        onClick={() => {
          editorDispatch(redo())
        }}
      >
        <RedoIcon />
      </IconButton>
    </div>
  )
}