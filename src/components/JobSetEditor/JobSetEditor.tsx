import { useEffect } from 'react'
import type { ComponentType, FunctionComponent } from 'react'
import { makeStyles, createStyles } from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetSelector,
} from '../../store'
import { addNotification } from '../../notifications'
import { PageContainer } from '../../styles'
import { getJobSetTakingThunkAction } from '../JobSets'
import {
  JobSetEditorProvider,
  useJobSetEditorDispatch,
  useJobSetEditorSelector,
  resetJobSetEditor,
  loadedJobSet,
  failedToLoadJobSet,
  setJobSetEditorId,
  setJobSetEditorIsEdit,
  setJobSetFromAppStore,
  jobSetsEditorLoadStatusSelector,
} from './store'
import type { AppStoreJobSet } from './store'
import { JobSetEditorTitleBar } from './JobSetEditorTitleBar'
import { JobSetEditorForm } from './JobSetEditorForm'
import { JobSetEditorState } from './JobSetEditorState'
import { ExitPrompt } from './ExitPrompt'

type JobSetEditorProps = {
  id: number// undefined for new?
  edit: boolean
}

type WithJobSetEditorProviderType =
  (Component: ComponentType<JobSetEditorProps>) => FunctionComponent<JobSetEditorProps>

const WithJobSetEditorProvider: WithJobSetEditorProviderType = (Component) => (props) => {
  return (
    <JobSetEditorProvider>
      <Component key={props.id} {...props} />
    </JobSetEditorProvider>
  )
}
const useStyles = makeStyles(theme => createStyles({
  pageContainer: {
    minHeight: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }
  }
}))

export const JobSetEditor: FunctionComponent<JobSetEditorProps> = WithJobSetEditorProvider(
  ({ id, edit }) => {
    const classes = useStyles()
    const isNew = id === undefined
    const dispatch = useAppDispatch()
    const editorDispatch = useJobSetEditorDispatch()

    useEffect(() => {
      editorDispatch(setJobSetEditorId(id))
      return () => {
        if (!isNew) { // does not reset if change from new to an activity with id
          editorDispatch(resetJobSetEditor())
        }
      }
    }, [editorDispatch, id, isNew])

    useEffect(() => {
      editorDispatch(setJobSetEditorIsEdit(edit))
    }, [editorDispatch, edit])

    const loadStatus = useJobSetEditorSelector(jobSetsEditorLoadStatusSelector)
    const isLoaded = loadStatus === 'loaded'

    useEffect(() => {
      if (!isNew && id && !isLoaded) {
        dispatch(getJobSetTakingThunkAction(id))
          .then(result => {
            if (result?.kind === 'success') {
              editorDispatch(loadedJobSet())
            }
            else if (result?.kind === 'failure') {
              dispatch(addNotification({
                summary: `Failed to get Job Set #${id}`
              }))
              editorDispatch(failedToLoadJobSet())
            }
          })
          .catch(() => {
            dispatch(addNotification({
              summary: `Failed to get Job Set #${id}`
            }))
          })
      }
    }, [dispatch, editorDispatch, isNew, id, isLoaded])

    const appJobSet = useAppSelector(createJobSetSelector(id))

    useEffect(() => {
      if (!isNew) {
        editorDispatch(setJobSetFromAppStore(appJobSet as AppStoreJobSet, isLoaded))
      }
    }, [isNew, editorDispatch, appJobSet, isLoaded])

    return (
      <PageContainer classes={{ pageContainer: classes.pageContainer }}>
        <ExitPrompt />
        <JobSetEditorTitleBar />
        <JobSetEditorForm />
        <JobSetEditorState />
      </PageContainer>
    )
  })