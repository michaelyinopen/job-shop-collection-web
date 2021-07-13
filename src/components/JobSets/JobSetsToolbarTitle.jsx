import { forwardRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@material-ui/core'
import { lighten, makeStyles } from '@material-ui/core/styles'
import {
  Add as AddIcon,
  // Check as CheckIcon,
  // Delete as DeleteIcon,
  // Edit as EditIcon,
  // Forward as ForwardIcon,
  // MoreVert as MoreVertIcon,
  // OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  // ReportProblem as ReportProblemIcon,
} from '@material-ui/icons'
import { routePaths } from '../../route'
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageHasSelectedSelector,
  jobSetsIsLoadingSelector,
  jobSetsFailedMessageSelector,
} from '../../store'
import { ProgressOverlay } from '../../styles'
import { getJobSets } from './store'

const useStyles = makeStyles(theme => ({
  tableTitle: { // move
    marginRight: theme.spacing(3),
  },
  // container: {
  //   backgroundColor: theme.palette.background.default,
  //   height: '100%',
  //   paddingTop: theme.spacing(1),
  //   [theme.breakpoints.down('xs')]: {
  //     paddingLeft: 0,
  //     paddingRight: 0,
  //   },
  // },
  // root: {
  //   width: '100%'
  // },
  // toolbarDeleteButton: {
  //   marginLeft: "auto"
  // },
  // createJobSetButton: {
  //   marginTop: theme.spacing(1),
  //   marginBottom: theme.spacing(0.5),
  //   marginLeft: theme.spacing(1),
  //   marginRight: theme.spacing(1)
  // },
  // createJobSetIcon: { marginRight: theme.spacing(0.5) },
  // table: {
  //   tableLayout: "fixed",
  // },
  // rowWithMenu: {
  //   backgroundColor:
  //     theme.palette.type === 'light'
  //       ? 'rgba(0, 0, 0, 0.07)' // grey[200]
  //       : 'rgba(255, 255, 255, 0.14)',
  // },
  // descriptionCell: {
  //   maxWidth: '700px',
  // },
  // actionsFlexbox: {
  //   display: 'flex',
  //   justifyContent: 'space-evenly',
  //   maxWidth: '96px'
  // },
  // buttonSuccess: {
  //   backgroundColor: green[500],
  // },
  // buttonFailed: {
  //   backgroundColor: red[500],
  // },
  // visuallyHidden: {
  //   border: 0,
  //   clip: 'rect(0 0 0 0)',
  //   height: 1,
  //   margin: -1,
  //   overflow: 'hidden',
  //   padding: 0,
  //   position: 'absolute',
  //   top: 20,
  //   width: 1,
  // },
  // idColumn: { width: '56px' },
  // actionsColumn: { width: '96px', boxSizing: "border-box" },
  // titleColumn: {
  //   width: '200px',
  //   boxSizing: "border-box",
  //   [theme.breakpoints.down('xs')]: { width: '100%' }
  // },
  // descriptionColumn: {
  //   width: '100%',
  // },
}))
//const ToolbarDeleteButton 

const JobSetsSelectedToolbar = () => {
  const selectedCount = 1
  const seletedItemIds = [12]

  return (
    <>
      <Typography color="inherit" variant="subtitle1">
        {selectedCount} selected
      </Typography>
      {JSON.stringify(seletedItemIds)}
      {/* <ToolbarDeleteButtonContainer
        selected={selected}
        reloadCallback={reloadCallback}
      /> */}
    </>
  )
}

const NewJobSetLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.newJobSet} {...props} />
))

const useJobSetsTitleStyles = makeStyles(theme => ({
  tableTitle: {
    marginRight: theme.spacing(3),
    fontWeight: theme.typography.fontWeightRegular
  },
  createJobSetButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  createJobSetIcon: { marginRight: theme.spacing(0.5) },
}))

const JobSetsTitle = () => {
  const classes = useJobSetsTitleStyles()
  const theme = useTheme()
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'))

  const dispatch = useAppDispatch()
  const reloadCallback = useCallback(() => {
    dispatch(getJobSets())
  }, [dispatch])

  const isLoading = useAppSelector(jobSetsIsLoadingSelector)
  const failedMessage = useAppSelector(jobSetsFailedMessageSelector)

  return (
    <>
      <Typography variant="h6" className={classes.tableTitle}>
        Job Sets
      </Typography>
      <ProgressOverlay isLoading={isLoading}>
        <IconButton onClick={reloadCallback}>
          <RefreshIcon />
        </IconButton>
      </ProgressOverlay>
      <Typography color="error">
        {failedMessage}
      </Typography>
      <Button
        component={NewJobSetLink}
        variant="contained"
        color="primary"
        className={classes.createJobSetButton}
      >
        <AddIcon className={classes.createJobSetIcon} />
        {isExtraSmallScreen ? "New" : "Create New"}
      </Button>
    </>
  )
}

const useJobSetToolbarTitleStyles = makeStyles(theme => ({
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: "flex",
  },
  toolbarHighlight: {
    color: theme.palette.text.primary,
    backgroundColor: lighten(theme.palette.secondary.light, 0.5),
  }
}))

export const JobSetsToolbarTitle = () => {
  const classes = useJobSetToolbarTitleStyles()
  // const hasSelected = useAppSelector(jobSetsPageHasSelectedSelector)
  const hasSelected = true
  return (
    <Toolbar
      className={clsx(
        classes.toolbar,
        { [classes.toolbarHighlight]: hasSelected }
      )}
    >
      {hasSelected
        ? <JobSetsSelectedToolbar />
        : <JobSetsTitle />
      }
    </Toolbar >
  )
}