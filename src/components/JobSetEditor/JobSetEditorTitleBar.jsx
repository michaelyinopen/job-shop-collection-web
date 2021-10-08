import {
  makeStyles,
  createStyles,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from '@material-ui/core'
import SyncIcon from '@material-ui/icons/Sync'
import SaveIcon from '@material-ui/icons/Save'
import { ProgressOverlay } from '../../styles'
import {
  useAppSelector,
  useAppDispatch,
} from '../../store'
import { addNotification } from '../../notifications'
import {
  getJobSetIsLoadingSelector,
  getJobSetTakingThunkAction,
} from '../JobSets/store'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIdSelector,
  jobSetsEditorIsEditSelector,
  jobSetsEditorIsLockedSelector,
  jobSetsEditorLoadStatusSelector,
  jobSetsEditorInitializedSelector,
  loadedJobSet,
} from './store'

const useStyles = makeStyles(theme => createStyles({
  toolbar: {
    position: "sticky",
    top: 0,
    display: "flex",
    flexWrap: "wrap",
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
    boxShadow: "0px 6px 4px -6px rgba(0,0,0,0.75)",
    marginBottom: theme.spacing(1)
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
  separator: { flexGrow: 1 },
}))

const RefreshJobSetButton = (id) => {
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
      <IconButton
        onClick={() => {
          dispatch(getJobSetTakingThunkAction(id))
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
    </ProgressOverlay>
  )
}

const HistoryButtons = (id) => {
  return null
}

const useSaveJobSetButtonStyles = makeStyles(theme => ({
  saveIcon: { marginRight: theme.spacing(0.5) },
}))

const UpdateJobSetButton = (id) => {
  const classes = useSaveJobSetButtonStyles()
  const dispatch = useAppDispatch()
  const editorDispatch = useActivityEditorDispatch()

  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
  const initialized = useJobSetEditorSelector(jobSetsEditorInitializedSelector)

  const formData = useJobSetEditorSelector(es => es.formData)
  const versionToken = useActivityEditorSelector(es => es.versions[es.versions.length - 1]?.versionToken)
  const currentStepIndex = useActivityEditorSelector(es => es.currentStepIndex)

  const isDeleting = useAppSelector(createActivityIsDeletingSelector(id))
  const isSaving = useAppSelector(createUpdateActivityIsLoadingSelector(id))

  const disabled = isDeleting || !isEdit || !initialized || loadStatus === 'failed'

  const tooltip = isLoading ? "loading" : loadFailedMessage ? "load failed"
    : isProgress ? "Saving..." : "Save"
  return (
    <Tooltip title={tooltip} placement="bottom-end">
      <ProgressOverlay
        isLoading={false/*todo*/}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={()=>{

          }}
          disabled={disabled}
        >
          <SaveIcon className={classes.saveIcon} />
          Save
        </Button>
      </ProgressOverlay>
    </Tooltip>
  )
}

const SaveJobSetButton = (id) => {
  return id ? <UpdateJobSetButton id={id} /> : <CreateJobSetButton />;
}

export const JobSetEditorTitleBar = () => {
  const classes = useStyles()

  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
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
          {!readOnly ? <HistoryButtons id={id} /> : null}
          {!readOnly ? <SaveJobSetButton id={id} /> : null}
        </div>
        <div className={classes.grouped}>
          {id ? <EditButtons id={id} /> : null}
          <MoreOptions
            id={id}
            isJsonEditorOpen={isJsonEditorOpen}
            openJsonEditorCallback={openJsonEditorCallback}
            closeJsonEditorCallback={closeJsonEditorCallback}
          />
        </div>
      </div>
    </Toolbar>
  )
}