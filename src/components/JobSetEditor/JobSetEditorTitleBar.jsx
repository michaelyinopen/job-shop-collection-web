
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
import { SaveJobSetButton } from './SaveJobSetButton'

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
        {isEdit && (
          <div className={classes.grouped}>
            <HistoryButtons id={id} />
            <SaveJobSetButton id={id} />
          </div>
        )}
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