
import {
  makeStyles,
  createStyles,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from '@material-ui/core'
import SyncIcon from '@material-ui/icons/Sync'
import { ProgressOverlay } from '../../../styles'
import {
  useAppSelector,
  useAppDispatch,
} from '../../../store'
import { addNotification } from '../../../notifications'
import {
  getJobSetIsLoadingSelector,
  getJobSetTakingThunkAction,
} from '../../JobSets/store'
import {
  useJobSetEditorSelector,
  jobSetsEditorIdSelector,
  fieldEditableSelector,
  jobSetsEditorLoadStatusSelector,
  jobSetsEditorInitializedSelector,
  jobSetsEditorIsLockedSelector,
  useJobSetEditorDispatch,
  loadedJobSet,
} from '../store'
import { HistoryButtons } from './HistoryButtons'
import { SaveJobSetButton } from './SaveJobSetButton'
import { EditReadonly } from './EditReadonly'
import { MoreOptions } from './MoreOptions'

export const jobSetEditorTitleBarHeight = 64

const RefreshJobSetButton = ({ id }) => {
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
  const initialized = useJobSetEditorSelector(jobSetsEditorInitializedSelector)

  const thunkLoading = useAppSelector(getJobSetIsLoadingSelector(id))

  const isLoading = thunkLoading || (!initialized && loadStatus !== 'failed')

  if (id === undefined) {
    return null
  }
  return (
    <ProgressOverlay
      isLoading={isLoading}
    >
      <Tooltip title='Refresh' placement="bottom-end">
        <IconButton
          onClick={() => {
            dispatch(getJobSetTakingThunkAction(id, true))
              .then(result => {
                if (result?.kind === 'success') {
                  editorDispatch(loadedJobSet())
                }
                else if (result?.kind === 'failure') {
                  dispatch(addNotification({
                    summary: `Failed to get Job Set #${id}`
                  }))
                }
              })
              .catch(() => {
                dispatch(addNotification({
                  summary: `Failed to get Job Set #${id}`
                }))
              })
          }}
        >
          <SyncIcon />
        </IconButton>
      </Tooltip>
    </ProgressOverlay>
  )
}

const useStyles = makeStyles(theme => createStyles({
  toolbar: {
    position: "sticky",
    top: 0,
    display: "flex",
    flexWrap: "wrap",
    zIndex: theme.zIndex.appBar - 2,
    backgroundColor: theme.palette.background.default,
    boxShadow: "0px 6px 4px -6px rgba(0,0,0,0.75)",
    paddingRight: theme.spacing(2),
  },
  allActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap-reverse",
  },
  grouped: {
    display: "flex",
    alignItems: "center",
  },
  readonlyText: {
    color: theme.palette.text.hint,
    fontStyle: 'italic',
    margin: theme.spacing(1),
  },
  separator: { flexGrow: 1 },
}))

export const JobSetEditorTitleBar = () => {
  const classes = useStyles()

  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const isLocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)

  return (
    <Toolbar className={classes.toolbar} disableGutters>
      <Typography variant="h4">
        {id !== undefined ? `Job Set #${id}` : 'New Job Set'}
      </Typography>
      <RefreshJobSetButton id={id} />
      <div className={classes.separator} />
      <div className={classes.allActions}>
        <div className={classes.grouped}>
          {!editable && <Typography variant='h6' className={classes.readonlyText}>(read-only)</Typography>}
          {isLocked && <Typography variant='h6' className={classes.readonlyText}>(locked)</Typography>}
          {editable && <HistoryButtons />}
          {editable && <SaveJobSetButton id={id} />}
        </div>
        <div className={classes.grouped}>
          {id !== undefined && <EditReadonly id={id} />}
          <MoreOptions
            id={id}
          />
        </div>
      </div>
    </Toolbar>
  )
}