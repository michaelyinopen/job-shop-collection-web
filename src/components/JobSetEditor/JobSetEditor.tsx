import { useEffect } from 'react'
import type { ComponentType, FunctionComponent } from 'react'
import { Redirect, generatePath } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetSelector,
} from '../../store'
import { addNotification } from '../../notifications'
import { PageContainer } from '../../styles'
import { routePaths } from '../../route'
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
  jobSetsEditorIsLockedSelector,
} from './store'
import type { AppStoreJobSet } from './store'
import { JobSetEditorTitleBar } from './JobSetEditorTitleBar'
import { JobSetEditorForm } from './JobSetEditorForm'
import { JobSetEditorState } from './JobSetEditorState'
import { ExitPrompt } from './ExitPrompt'
import { HistoryPanel } from './HistoryPanel'
import { JobSetEditorLayout } from './JobSetEditorLayout'

type JobSetEditorProps = {
  id: number | undefined
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
    padding: theme.spacing(0, 4, 0, 4),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }
  },
}))

export const JobSetEditor: FunctionComponent<JobSetEditorProps> = WithJobSetEditorProvider(
  ({ id, edit }) => {
    const classes = useStyles()
    const isNew = id === undefined
    const dispatch = useAppDispatch()
    const editorDispatch = useJobSetEditorDispatch()

    useEffect(() => {
      if (isNew) {
        editorDispatch(resetJobSetEditor())
      }
    }, [editorDispatch, isNew])

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

    const islocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)
    if (edit && islocked) {
      return <Redirect to={generatePath(routePaths.jobSetEditor, { id: id! })} />
    }
    return (
      <PageContainer classes={{ pageContainer: classes.pageContainer }}>
        <ExitPrompt />
        <JobSetEditorLayout
          jobSetEditorTitleBar={<JobSetEditorTitleBar />}
          historyPanel={<HistoryPanel />}
          jobSetEditorForm={(
            <>
              <JobSetEditorForm />
              <JobSetEditorState />
            </>
          )}
        />
      </PageContainer>
    )
  })