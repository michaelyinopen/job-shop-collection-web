import { useState, useEffect, useCallback } from 'react'
import { generatePath, useHistory } from 'react-router-dom'
import { nanoid } from 'nanoid'
import {
  makeStyles,
  createStyles,
  Tooltip,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core'
import SaveIcon from '@material-ui/icons/Save'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { routePaths } from '../../../route'
import { ProgressOverlay } from '../../../styles'
import {
  useAppSelector,
  useAppDispatch,
} from '../../../store'
import { addNotification } from '../../../notifications'
import {
  createDeleteJobSetIsLoadingSelector,
  updateJobSetIsLoadingSelector,
  updateJobSetTakingThunkAction,
  createJobSetIsLoadingSelector,
  createJobSetTakingThunkAction,
} from '../../JobSets/store'
import {
  useJobSetEditorSelector,
  currentStepIndexSelector,
  jobSetsEditorLoadStatusSelector,
  jobSetsEditorInitializedSelector,
  updateJobSetRequestSelector,
  createJobSetRequestSelector,
  allErrorsSelector,
  hasBlockingErrorsSelector,
  hasWarningsSelector,
  useJobSetEditorDispatch,
  loadedJobSet,
  savingStep,
  savedStep,
  setAllTouched,
} from '../store'

type ValidationDialogContentProps = {
  type: 'create' | 'update',
  hasBlockingErrors: boolean,
  hasWarnings: boolean,
  closeCallback: () => void,
  saveCallback: () => void,
}

const useValidationDialogContentStyles = makeStyles(theme => createStyles({
  errorIcon: { color: theme.palette.error.main },
  warningIcon: { color: theme.palette.warning.main },
}))

const ValidationDialogContent = ({
  type,
  hasBlockingErrors,
  hasWarnings,
  closeCallback,
  saveCallback,
}: ValidationDialogContentProps) => {
  const classes = useValidationDialogContentStyles()
  const errors = useJobSetEditorSelector(allErrorsSelector)
  if (hasBlockingErrors) {
    return (
      <>
        <DialogTitle>{`Cannot ${type === 'create' ? 'create' : 'save'} because of validation errors`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <List>
              {errors.map(e => (
                <ListItem>
                  <ListItemIcon >
                    {e.severity === 'error'
                      ? <ErrorIcon className={classes.errorIcon} />
                      : <WarningIcon className={classes.warningIcon} />
                    }
                  </ListItemIcon>
                  <ListItemText>
                    {e.message}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCallback} variant="contained" color="primary">
            Back
          </Button>
        </DialogActions>
      </>
    )
  }
  else if (hasWarnings) {
    return (
      <>
        <DialogTitle>{`There are validation warnings`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are validations warnings but you can still {type === 'create' ? 'create' : 'save'}.
            <List>
              {errors.map(e => (
                <ListItem>
                  <ListItemIcon>
                    {e.severity === 'error'
                      ? <ErrorIcon className={classes.errorIcon} />
                      : <WarningIcon className={classes.warningIcon} />
                    }
                  </ListItemIcon>
                  <ListItemText>
                    {e.message}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCallback} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              saveCallback()
              closeCallback()
            }}
          >
            Save
          </Button>
        </DialogActions>
      </>
    )
  }
  return null
}

const useStyles = makeStyles(theme => createStyles({
  button: { margin: theme.spacing(1) },
  saveIcon: { marginRight: theme.spacing(0.5) },
}))

const CreateJobSetButton = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const [creationToken, setCreationToken] = useState<string | undefined>(undefined)
  useEffect(() => {
    setCreationToken(nanoid())
  }, [])

  const currentStepIndex = useJobSetEditorSelector(currentStepIndexSelector)
  const createJobSetRequest = useJobSetEditorSelector(createJobSetRequestSelector)

  const isCreating = useAppSelector(createJobSetIsLoadingSelector(creationToken!))

  const tooltip = isCreating ? "Saving..." : "Create"

  const hasBlockingErrors = useJobSetEditorSelector(hasBlockingErrorsSelector)
  const hasWarnings = useJobSetEditorSelector(hasWarningsSelector)
  const [openValidationDialog, setOpenValidationDialog] = useState(false)

  const closeCallback = useCallback(
    () => setOpenValidationDialog(false),
    []
  )

  const createCallback = useCallback(
    () => {
      editorDispatch(savingStep(currentStepIndex, true))
      dispatch(createJobSetTakingThunkAction(createJobSetRequest, creationToken!))
        .then(result => {
          if (result?.kind === 'success') {
            const createdJobSet = result.success()
            const createdId = createdJobSet.id
            dispatch(addNotification({
              summary: `Created Activity #${createdId}`
            }))
            editorDispatch(loadedJobSet())
            editorDispatch(savedStep(currentStepIndex))
            history.push(generatePath(routePaths.jobSetEditor, { id: createdId }))
          }
          else {
            dispatch(addNotification({
              summary: 'Failed to create Job Set',
              matchPath: routePaths.newJobSet
            }))
            editorDispatch(savingStep(currentStepIndex, false))
          }
        })
        .catch(() => {
          dispatch(addNotification({
            summary: 'Failed to create Job Set',
            matchPath: routePaths.newJobSet
          }))
          editorDispatch(savingStep(currentStepIndex, false))
        })
    },
    [editorDispatch, currentStepIndex, dispatch, createJobSetRequest, creationToken, history]
  )
  return (
    <ProgressOverlay
      isLoading={isCreating}
    >
      <Tooltip title={tooltip} placement="bottom-end">
        <div>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={isCreating}
            onClick={() => {
              editorDispatch(setAllTouched())
              if (hasBlockingErrors || hasWarnings) {
                setOpenValidationDialog(true)
              }
              else {
                createCallback()
              }
            }}
          >
            <SaveIcon className={classes.saveIcon} />
            Create
          </Button>
          <Dialog
            open={openValidationDialog}
            onClose={closeCallback}
            disableScrollLock
          >
            {openValidationDialog && (
              <ValidationDialogContent
                type='create'
                hasBlockingErrors={hasBlockingErrors}
                hasWarnings={hasWarnings}
                closeCallback={closeCallback}
                saveCallback={createCallback}
              />
            )}
          </Dialog>
        </div>
      </Tooltip >
    </ProgressOverlay >
  )
}

const UpdateJobSetButton = ({ id }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
  const initialized = useJobSetEditorSelector(jobSetsEditorInitializedSelector)

  const currentStepIndex = useJobSetEditorSelector(currentStepIndexSelector)
  const updateJobSetRequest = useJobSetEditorSelector(updateJobSetRequestSelector)

  const isDeleting = useAppSelector(createDeleteJobSetIsLoadingSelector(id))
  const isSaving = useAppSelector(updateJobSetIsLoadingSelector(id))

  const path = generatePath(routePaths.jobSetEditor, { id })

  const disabled = isDeleting || !initialized || loadStatus === 'failed'

  const tooltip =
    loadStatus === 'not loaded' ? "loading"
      : loadStatus === 'failed' ? "load failed"
        : isSaving ? "Saving..."
          : "Save"

  const hasBlockingErrors = useJobSetEditorSelector(hasBlockingErrorsSelector)
  const hasWarnings = useJobSetEditorSelector(hasWarningsSelector)
  const [openValidationDialog, setOpenValidationDialog] = useState(false)

  console.log({ hasBlockingErrors, hasWarnings })
  const closeCallback = useCallback(
    () => setOpenValidationDialog(false),
    []
  )

  const updateCallback = useCallback(
    () => {
      editorDispatch(savingStep(currentStepIndex, true))
      dispatch(updateJobSetTakingThunkAction(id, updateJobSetRequest!))
        .then(result => {
          if (result?.kind === 'success') {
            dispatch(addNotification({
              summary: `Saved Job Set #${id}`
            }))
            editorDispatch(savedStep(currentStepIndex))
            return
          }
          if (result?.failure().failureType === 'version condition failed') {
            dispatch(addNotification({
              summary: `Job Set #${id} was updated by another user, check the merged changes and save again`,
              matchPath: path
            }))
          }
          else if (result?.failure().failureType === 'forbidden because locked') {
            dispatch(addNotification({
              summary: `Job Set #${id} was locked and cannot be saved`,
              matchPath: path
            }))
          }
          else if (result?.failure().failureType === 'not found') {
            dispatch(addNotification({
              summary: `Job Set #${id} was deleted and cannot be saved`,
              matchPath: path
            }))
          }
          else {
            dispatch(addNotification({
              summary: `Failed to save Job Set #${id}`,
              matchPath: path
            }))
          }
          editorDispatch(savingStep(currentStepIndex, false))
        })
        .catch(() => {
          dispatch(addNotification({
            summary: `Failed to saved Job Set #${id}`,
            matchPath: path
          }))
          editorDispatch(savingStep(currentStepIndex, false))
        })
    },
    [currentStepIndex, dispatch, editorDispatch, id, path, updateJobSetRequest]
  )
  return (
    <ProgressOverlay
      isLoading={isSaving}
    >
      <Tooltip title={tooltip} placement="bottom-end">
        <div>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={disabled}
            onClick={() => {
              editorDispatch(setAllTouched())
              if (hasBlockingErrors || hasWarnings) {
                setOpenValidationDialog(true)
              }
              else {
                updateCallback()
              }
            }}
          >
            <SaveIcon className={classes.saveIcon} />
            Save
          </Button>
          <Dialog
            open={openValidationDialog}
            onClose={closeCallback}
            disableScrollLock
          >
            {openValidationDialog && (
              <ValidationDialogContent
                type='update'
                hasBlockingErrors={hasBlockingErrors}
                hasWarnings={hasWarnings}
                closeCallback={closeCallback}
                saveCallback={updateCallback}
              />
            )}
          </Dialog>
        </div>
      </Tooltip >
    </ProgressOverlay>
  )
}

export const SaveJobSetButton = ({ id }) => {
  return id ? <UpdateJobSetButton id={id} /> : <CreateJobSetButton />
}