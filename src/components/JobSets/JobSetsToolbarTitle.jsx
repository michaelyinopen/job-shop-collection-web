import { useCallback } from 'react'
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
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@material-ui/icons'
import { NewJobSetLink } from '../../route'
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageHasSelectedSelector,
  jobSetsPageSelectedItemIdsSelector,
  jobSetsFailedMessageSelector,
} from '../../store'
import { ProgressOverlay } from '../../styles'
import {
  getJobSetsTakingThunkAction,
  jobSetsIsLoadingSelector
} from './store'

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

const useJobSetsSelectedToolbarStyles = makeStyles(theme => ({
  toolbarSeparator: {
    flex: 1
  },
}))

const JobSetsSelectedToolbar = () => {
  const classes = useJobSetsSelectedToolbarStyles()

  const seletedItemIds = useAppSelector(jobSetsPageSelectedItemIdsSelector)

  // todo
  const isDeleting = false
  const deleteSelectedCallback = () => { console.log("deleteSelected") }

  return (
    <>
      <Typography color="inherit" variant="subtitle1">
        {seletedItemIds.length} selected
      </Typography>
      <div className={classes.toolbarSeparator} />
      <ProgressOverlay isLoading={isDeleting}>
        <IconButton onClick={deleteSelectedCallback}>
          <DeleteIcon />
        </IconButton>
      </ProgressOverlay>
    </>
  )
}

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
    dispatch(getJobSetsTakingThunkAction)
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
    display: 'flex',
    borderRadius: '4px 4px 0 0'
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