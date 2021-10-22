import type { ReactNode, FC } from 'react'
import {
  makeStyles,
  createStyles,
  Drawer
} from '@material-ui/core'
import { historyPanelWidth } from './HistoryPanel'
import { jobSetEditorTitleBarHeight } from './JobSetEditorTitleBar'
import clsx from 'clsx'
import {
  useJobSetEditorSelector,
  isHistoryPanelOpenSelector,
  useJobSetEditorDispatch,
  closeHistoryPanel,
} from './store'
import { useIsExtraSmallScreen } from '../JobSets/useIsExtraSmallScreen'

const useStyles = makeStyles(theme => createStyles({
  drawer: {
    position: 'sticky',
    top: jobSetEditorTitleBarHeight,
    width: 0,
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerShift: {
    width: historyPanelWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  formContainer: {
    flexGrow: 1,
    marginTop: 0,
    marginLeft: 0,
    padding: theme.spacing(1, 0, 1, 0),
    transition: theme.transitions.create('margin-left', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  formShift: {
    marginLeft: historyPanelWidth + theme.spacing(2),
    marginTop: 'calc(64px - 100vh)',
    transition: theme.transitions.create('margin-left', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}))

export type JobSetEditorLayoutProps = {
  jobSetEditorTitleBar: ReactNode
  historyPanel: ReactNode
  jobSetEditorForm: ReactNode
}

export const JobSetEditorLayout: FC<JobSetEditorLayoutProps> = ({
  jobSetEditorTitleBar,
  historyPanel,
  jobSetEditorForm,
}) => {
  const classes = useStyles()
  const isHistoryPanelOpen = useJobSetEditorSelector(isHistoryPanelOpenSelector)
  const editorDispatch = useJobSetEditorDispatch()
  const isExtraSmallScreen = useIsExtraSmallScreen()

  return isExtraSmallScreen
    ? (
      <>
        {jobSetEditorTitleBar}
        <Drawer
          open={isHistoryPanelOpen}
          disableScrollLock
          onClose={() => editorDispatch(closeHistoryPanel())}
        >
          {historyPanel}
        </Drawer>
        {jobSetEditorForm}
      </>
    ) : (
      <>
        {jobSetEditorTitleBar}
        <div className={clsx(classes.drawer, {
          [classes.drawerShift]: isHistoryPanelOpen,
        })}>
          {isHistoryPanelOpen && historyPanel}
        </div>
        <div className={clsx(classes.formContainer, {
          [classes.formShift]: isHistoryPanelOpen,
        })}>
          {jobSetEditorForm}
        </div>
      </>
    )
}