import {
  makeStyles,
  createStyles,
  Toolbar,
  Typography,
  IconButton,
} from '@material-ui/core'
import SyncIcon from '@material-ui/icons/Sync'
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

export const JobSetEditorTitleBar = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isLocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)

  const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
  const initialized = useJobSetEditorSelector(jobSetsEditorInitializedSelector)

  const thunkLoading = useAppSelector(getJobSetIsLoadingSelector(id))

  const isLoading = thunkLoading || (!initialized && loadStatus !== 'failed')

  return (
    <Toolbar className={classes.toolbar} disableGutters>
      <Typography variant="h4">
        {id !== undefined ? `Job Set #${id}` : 'New Job Set'}
      </Typography>
      {id !== undefined && (
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
      )}
      {/* <div className={classes.separator} />
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
        </div> */}
    </Toolbar>
  )
}