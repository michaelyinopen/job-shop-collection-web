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
  isHistoryPanelOpenSelector,
} from './store'
import type { AppStoreJobSet } from './store'
import { JobSetEditorTitleBar } from './JobSetEditorTitleBar'
import { JobSetEditorForm } from './JobSetEditorForm'
import { JobSetEditorState } from './JobSetEditorState'
import { ExitPrompt } from './ExitPrompt'
import { HistoryPanel } from './HistoryPanel'
import clsx from 'clsx'

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

const historyPanelWidth = 200

const useStyles = makeStyles(theme => createStyles({
  pageContainer: {
    minHeight: '100%',
    padding: theme.spacing(0, 4, 0, 4),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }
  },
  drawer: {
    position: 'sticky',
    top: 64,
    width: 0,
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawerShift: {
    width: historyPanelWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  formContainer: {
    flexGrow: 1,
    marginTop: 'calc(64px - 100vh)',
    marginLeft: 0,
    padding: theme.spacing(1, 0, 1, 0),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  formShift: {
    marginLeft: historyPanelWidth + theme.spacing(2),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
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

    const isHistoryPanelOpen = useJobSetEditorSelector(isHistoryPanelOpenSelector)

    const islocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)
    if (edit && islocked) {
      return <Redirect to={generatePath(routePaths.jobSetEditor, { id: id! })} />
    }
    return (
      <PageContainer classes={{ pageContainer: classes.pageContainer }}>
        <ExitPrompt />
        <JobSetEditorTitleBar />
        <div className={clsx(classes.drawer, {
          [classes.drawerShift]: isHistoryPanelOpen,
        })}>
          {isHistoryPanelOpen && <HistoryPanel />}
        </div>
        <div className={clsx(classes.formContainer, {
          [classes.formShift]: isHistoryPanelOpen,
        })}>
          <JobSetEditorForm />
          <JobSetEditorState />
        </div>
      </PageContainer>
    )
  })