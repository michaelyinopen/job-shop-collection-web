import { useRef, useEffect } from 'react'
import type { ComponentType, FunctionComponent } from 'react'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetSelector
} from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
import { JobSetsPageContainer } from '../../styles'
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
  id: number
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

export const JobSetEditor: FunctionComponent<JobSetEditorProps> = WithJobSetEditorProvider(({ id, edit }) => {
  const dispatch = useAppDispatch()
  const editorDispatch = useJobSetEditorDispatch()

  useEffect(() => {
    editorDispatch(setJobSetEditorId(id))
    return () => { editorDispatch(resetJobSetEditor()) }
  }, [editorDispatch, id])

  // todo extract, because the refresh button will use the same
  const loadJobSetCallback = useRef(() => {
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
  }).current
  
  useEffect(() => {
    loadJobSetCallback()
  }, [loadJobSetCallback])

  const appJobSet = useAppSelector(createJobSetSelector(id))
  const loaded = useJobSetEditorSelector(jobSetsEditorLoadedSelector)

  useEffect(() => {
    editorDispatch(setJobSetFromAppStore(appJobSet))
  }, [editorDispatch, appJobSet, loaded])

  useEffect(() => {
    editorDispatch(setJobSetEditorIsEdit(edit))
  }, [editorDispatch, edit])

  //todo remove
  const jobSetEditorJobSet = useJobSetEditorSelector(jobSetsEditorJobSetSelector)
  return (
    <JobSetsPageContainer>
      <JobSetEditorTitleBar />
      <JobSetEditorForm />

      {/*todo remove, will use jobSetEditor's state */}
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(jobSetEditorJobSet, null, 2)}</pre>
    </JobSetsPageContainer>
  )
})