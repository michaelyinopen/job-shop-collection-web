
import { generatePath } from 'react-router-dom'
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
import { routePaths } from '../../route'
import { ProgressOverlay } from '../../styles'
import {
  useAppSelector,
  useAppDispatch,
} from '../../store'
import { addNotification } from '../../notifications'
import {
  getJobSetIsLoadingSelector,
  getJobSetTakingThunkAction,
  createDeleteJobSetIsLoadingSelector,
  deleteJobSetTakingThunkAction,
  updateJobSetIsLoadingSelector,
  updateJobSetTakingThunkAction,
} from '../JobSets/store'
import {
  useJobSetEditorSelector,
  jobSetsEditorIdSelector,
  jobSetsEditorIsEditSelector,
  currentStepIndexSelector,
  jobSetsEditorIsLockedSelector,
  jobSetsEditorLoadStatusSelector,
  jobSetsEditorInitializedSelector,
  updateJobSetRequestSelector,
  useJobSetEditorDispatch,
  loadedJobSet,
  // savingStep,
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
    marginBottom: theme.spacing(1),
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
  separator: { flexGrow: 1 },
}))

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
      </Tooltip>
    </ProgressOverlay>
  )
}

const HistoryButtons = (id) => {
  return null
}

const useSaveJobSetButtonStyles = makeStyles(theme => ({
  saveIcon: { marginRight: theme.spacing(0.5) },
}))

const CreateJobSetButton = () => {
  return null
}

const UpdateJobSetButton = ({ id }) => {
  const classes = useSaveJobSetButtonStyles()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
  const initialized = useJobSetEditorSelector(jobSetsEditorInitializedSelector)

  const currentStepIndex = useJobSetEditorSelector(currentStepIndexSelector)
  const updateJobSetRequest = useJobSetEditorSelector(updateJobSetRequestSelector)

  const isDeleting = useAppSelector(createDeleteJobSetIsLoadingSelector(id))
  const isSaving = useAppSelector(updateJobSetIsLoadingSelector(id))

  const path = generatePath(routePaths.jobSetEditor, { id })

  const disabled = isDeleting || !isEdit || !initialized || loadStatus === 'failed'

  const tooltip =
    loadStatus === 'not loaded' ? "loading"
      : loadStatus === 'failed' ? "load failed"
        : isSaving ? "Saving..."
          : "Save"
  return (
    <ProgressOverlay
      isLoading={isSaving}
    >
      <Tooltip title={tooltip} placement="bottom-end">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // editorDispatch(savingStep(currentStepIndex, true))
            dispatch(updateJobSetTakingThunkAction(id, updateJobSetRequest))
              .then(result => {
                if (result?.kind === 'success') {
                  dispatch(addNotification({
                    summary: `Saved Activity #${id}`
                  }))
                  // editorDispatch(savedStep(currentStepIndex))
                  return
                }
                if (result?.failure().failureType === 'version condition failed') {
                  dispatch(addNotification({
                    summary: `Activity #${id} was updated by another user, check the merged changes and save again`,
                    matchPath: path
                  }))
                }
                else if (result?.failure().failureType === 'forbidden because locked') {
                  dispatch(addNotification({
                    summary: `Activity #${id} was locked and cannot be saved`,
                    matchPath: path
                  }))
                }
                else if (result?.failure().failureType === 'not found') {
                  dispatch(addNotification({
                    summary: `Activity #${id} was deleted and cannot be saved`,
                    matchPath: path
                  }))
                }
                else {
                  dispatch(addNotification({
                    summary: `Failed to save Activity #${id}`,
                    matchPath: path
                  }))
                }
                // editorDispatch(savingStep(currentStepIndex, false))
              })
              .catch(() => {
                dispatch(addNotification(`Failed to saved Activity #${id}`))
                // editorDispatch(savingStep(currentStepIndex, false))
              })
          }}
          disabled={disabled}
        >
          <SaveIcon className={classes.saveIcon} />
          Save
        </Button>
      </Tooltip >
    </ProgressOverlay>
  )
}

const SaveJobSetButton = ({ id }) => {
  return id ? <UpdateJobSetButton id={id} /> : <CreateJobSetButton />
}

export const JobSetEditorTitleBar = () => {
  const classes = useStyles()

  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  // const isLocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)

  return (
    <Toolbar className={classes.toolbar} disableGutters>
      <Typography variant="h4">
        {id !== undefined ? `Job Set #${id}` : 'New Job Set'}
      </Typography>
      <RefreshJobSetButton id={id} />
      <div className={classes.separator} />
      <div className={classes.allActions}>
        <div className={classes.grouped}>
          {isEdit ? <HistoryButtons id={id} /> : null}
          {isEdit ? <SaveJobSetButton id={id} /> : null}
        </div>
        {/* <div className={classes.grouped}>
          {id ? <EditButtons id={id} /> : null}
          <MoreOptions
            id={id}
            isJsonEditorOpen={isJsonEditorOpen}
            openJsonEditorCallback={openJsonEditorCallback}
            closeJsonEditorCallback={closeJsonEditorCallback}
          />
        </div> */}
      </div>
    </Toolbar>
  )
}