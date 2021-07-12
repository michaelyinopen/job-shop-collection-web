import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Toolbar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
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
  jobSetIdsSelector,
  jobSetsPageHasSelectedSelector
} from '../../store'

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

const JobSetsSelectedToolbar = () => <div />

// const JobSetsSelectedToolbar = ({
//   selectedCount,
//   selected,
//   reloadCallback
// }) => {
//   return (
//     <React.Fragment>
//       <Typography color="inherit" variant="subtitle1">
//         {selectedCount} selected
//       </Typography>
//       <ToolbarDeleteButtonContainer
//         selected={selected}
//         reloadCallback={reloadCallback}
//       />
//     </React.Fragment>
//   );
// }

const NewJobSetLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.newJobSet} {...props} />
))

const useJobSetsTitleStyles = makeStyles(theme => ({
  tableTitle: {
    marginRight: theme.spacing(3),
    fontWeight: theme.typography.fontWeightRegular
  },
  withProgressWrapper: {
    position: 'relative',
  },
  progressOnButton: {
    position: 'absolute',
    zIndex: 1,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: 'flex'
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

  //todo
  const reloadCallback = () => { }
  const isLoading = false
  const failedMessage = null

  return (
    <>
      <Typography variant="h6" className={classes.tableTitle}>
        Job Sets
      </Typography>
      <div className={classes.withProgressWrapper}>
        <IconButton onClick={reloadCallback}>
          <RefreshIcon />
        </IconButton>
        {isLoading ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
      </div>
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
  const hasSelected = useAppSelector(jobSetsPageHasSelectedSelector)
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