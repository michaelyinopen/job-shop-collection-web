import { useState, useEffect } from 'react'
import { generatePath, useHistory } from 'react-router-dom'
import { nanoid } from 'nanoid'
import {
  makeStyles,
  Tooltip,
  Button,
} from '@material-ui/core'
import SaveIcon from '@material-ui/icons/Save'
import { routePaths } from '../../route'
import { ProgressOverlay } from '../../styles'
import {
  useAppSelector,
  useAppDispatch,
} from '../../store'
import { addNotification } from '../../notifications'
import {
  createDeleteJobSetIsLoadingSelector,
  updateJobSetIsLoadingSelector,
  updateJobSetTakingThunkAction,
  createJobSetIsLoadingSelector,
  createJobSetTakingThunkAction,
} from '../JobSets/store'
import {
  useJobSetEditorSelector,
  currentStepIndexSelector,
  jobSetsEditorLoadStatusSelector,
  jobSetsEditorInitializedSelector,
  updateJobSetRequestSelector,
  createJobSetRequestSelector,
  useJobSetEditorDispatch,
  loadedJobSet,
  // savingStep,
} from './store'

const useStyles = makeStyles(theme => ({
  saveIcon: { marginRight: theme.spacing(0.5) },
}))

const CreateJobSetButton = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const [creationToken, setCreationToken] = useState(undefined)
  useEffect(() => {
    setCreationToken(nanoid())
  }, [])

  const currentStepIndex = useJobSetEditorSelector(currentStepIndexSelector)
  const createJobSetRequest = useJobSetEditorSelector(createJobSetRequestSelector)

  const isCreating = useAppSelector(createJobSetIsLoadingSelector(creationToken))

  const tooltip = isCreating ? "Saving..." : "Create"
  return (
    <ProgressOverlay
      isLoading={isCreating}
    >
      <Tooltip title={tooltip} placement="bottom-end">
        <Button
          variant="contained"
          color="primary"
          disabled={isCreating}
          onClick={() => {
            // editorDispatch(savingStep(currentStepIndex, true))
            dispatch(createJobSetTakingThunkAction(createJobSetRequest, creationToken))
              .then(result => {
                if (result?.kind === 'success') {
                  const createdJobSet = result.success()
                  const createdId = createdJobSet.id
                  dispatch(addNotification({
                    summary: `Created Activity #${createdId}`
                  }))
                  editorDispatch(loadedJobSet())
                  // editorDispatch(savedStep(currentStepIndex))
                  history.push(generatePath(routePaths.jobSetEditor, { id: createdId }))
                }
                else {
                  dispatch(addNotification({
                    summary: 'Failed to create Job Set',
                    matchPath: routePaths.newJobSet
                  }))
                  // editorDispatch(savingStep(currentStepIndex, false))
                }
              })
              .catch(() => {
                dispatch(addNotification({
                  summary: 'Failed to create Job Set',
                  matchPath: routePaths.newJobSet
                }))
                // editorDispatch(savingStep(currentStepIndex, false))
              })
          }}
        >
          <SaveIcon className={classes.saveIcon} />
          Create
        </Button>
      </Tooltip >
    </ProgressOverlay>
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
  return (
    <ProgressOverlay
      isLoading={isSaving}
    >
      <Tooltip title={tooltip} placement="bottom-end">
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          onClick={() => {
            // editorDispatch(savingStep(currentStepIndex, true))
            dispatch(updateJobSetTakingThunkAction(id, updateJobSetRequest))
              .then(result => {
                if (result?.kind === 'success') {
                  dispatch(addNotification({
                    summary: `Saved Job Set #${id}`
                  }))
                  // editorDispatch(savedStep(currentStepIndex))
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
                // editorDispatch(savingStep(currentStepIndex, false))
              })
              .catch(() => {
                dispatch(addNotification(`Failed to saved Job Set #${id}`))
                // editorDispatch(savingStep(currentStepIndex, false))
              })
          }}
        >
          <SaveIcon className={classes.saveIcon} />
          Save
        </Button>
      </Tooltip >
    </ProgressOverlay>
  )
}

export const SaveJobSetButton = ({ id }) => {
  return id ? <UpdateJobSetButton id={id} /> : <CreateJobSetButton />
}