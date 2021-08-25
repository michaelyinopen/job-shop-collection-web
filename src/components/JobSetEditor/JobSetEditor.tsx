import { useEffect } from 'react'
import type { ComponentType, FunctionComponent } from 'react'
import { makeStyles, createStyles } from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetSelector
} from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
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
  jobSetsEditorLoadedSelector,
  jobSetsEditorJobSetSelector,
} from './store'
import { JobSetEditorTitleBar } from './JobSetEditorTitleBar'
import { JobSetEditorForm } from './JobSetEditorForm'

type JobSetEditorProps = {
  id: number// undefined for new?
  edit: boolean
}

type WithJobSetEditorProviderType =
  (Component: ComponentType<JobSetEditorProps>) => FunctionComponent<JobSetEditorProps>

const WithJobSetEditorProvider: WithJobSetEditorProviderType = (Component) => (props) => {
  return (
    <JobSetEditorProvider>
      <Component {...props} />
    </JobSetEditorProvider>
  )
}
const useStyles = makeStyles(theme => createStyles({
  pageContainer: {
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

export const JobSetEditor: FunctionComponent<JobSetEditorProps> = WithJobSetEditorProvider(({ id, edit }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  useEffect(() => {
    editorDispatch(setJobSetEditorId(id))
    return () => { editorDispatch(resetJobSetEditor()) }
  }, [editorDispatch, id])

  useEffect(() => {
    editorDispatch(setJobSetEditorIsEdit(edit))
  }, [editorDispatch, edit])

  useEffect(() => {
    dispatch(getJobSetTakingThunkAction(id))
      .then(result => {
        if (result?.kind === 'success') {
          editorDispatch(loadedJobSet())
        } else if (result?.kind === 'failure') {
          editorDispatch(failedToLoadJobSet())
          dispatch(addNotification({
            summary: `Load Job Set ${id} Failed`,
            matchPath: routePaths.jobSetEditor
          }))
        }
      })
      .catch(() => {
        editorDispatch(failedToLoadJobSet())
        dispatch(addNotification({
          summary: `Load Job Set ${id} Failed`,
          matchPath: routePaths.jobSetEditor
        }))
      })
  }, [dispatch, editorDispatch, id])

  const appJobSet = useAppSelector(createJobSetSelector(id))
  const loaded = useJobSetEditorSelector(jobSetsEditorLoadedSelector)

  useEffect(() => {
    editorDispatch(setJobSetFromAppStore(appJobSet))
  }, [editorDispatch, appJobSet, loaded])

  //todo remove
  const jobSetEditorState = useJobSetEditorSelector(jobSetsEditorJobSetSelector)
  return (
    <PageContainer classes={{ pageContainer: classes.pageContainer }}>
      <JobSetEditorTitleBar />
      <JobSetEditorForm />
      {/*todo remove, will use jobSetEditor's state */}
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(jobSetEditorState, null, 2)}</pre>
    </PageContainer>
  )
})