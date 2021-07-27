import { useCallback } from 'react'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  lighten,
  Toolbar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@material-ui/core'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@material-ui/icons'
import { NewJobSetLink } from '../../route'
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageSelectedItemIdsSelector,
  jobSetsFailedMessageSelector,
} from '../../store'
import { ProgressOverlay } from '../../styles'
import { useIsExtraSmallScreen } from './useIsExtraSmallScreen'
import {
  getJobSetsTakingThunkAction,
  jobSetsIsLoadingSelector
} from './store'

const useJobSetsSelectedToolbarStyles = makeStyles(theme => createStyles({
  toolbarSeparator: {
    flex: 1
  },
}))

const JobSetsSelectedToolbar = () => {
  const classes = useJobSetsSelectedToolbarStyles()

  const isLoading = useAppSelector(jobSetsIsLoadingSelector)
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
      {isLoading
        ? <CircularProgress />
        : (
          <ProgressOverlay isLoading={isDeleting}>
            <IconButton onClick={deleteSelectedCallback}>
              <DeleteIcon />
            </IconButton>
          </ProgressOverlay>
        )
      }
    </>
  )
}

const useJobSetsTitleStyles = makeStyles(theme => createStyles({
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
  const isExtraSmallScreen = useIsExtraSmallScreen()

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

const useJobSetsToolbarTitleStyles = makeStyles(theme => createStyles({
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
  const classes = useJobSetsToolbarTitleStyles()
  const selectedItemIds = useAppSelector(jobSetsPageSelectedItemIdsSelector)
  const hasSelected = selectedItemIds.length > 0
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