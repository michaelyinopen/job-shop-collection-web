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
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import RefreshIcon from '@material-ui/icons/Refresh'
import { NewJobSetLink } from '../../route'
import {
  useAppDispatch,
  useAppSelector,
  jobSetsPageSelectedItemIdsSelector,
} from '../../store'
import { routePaths } from '../../route'
import { addNotification } from '../../notifications'
import { ProgressOverlay } from '../../styles'
import { useLoadJobSetsCallback } from './useLoadJobSetsCallback'
import { useIsExtraSmallScreen } from './useIsExtraSmallScreen'
import {
  deleteSelectedJobSetsTakingThunkAction,
  deleteSelectedJobSetsIsLoadingSelector,
  jobSetsIsLoadingSelector
} from './store'

const useJobSetsSelectedToolbarStyles = makeStyles(theme => createStyles({
  toolbarSeparator: {
    flex: 1
  },
}))

const JobSetsSelectedToolbar = () => {
  const classes = useJobSetsSelectedToolbarStyles()

  const seletedItemIds = useAppSelector(jobSetsPageSelectedItemIdsSelector)

  const isLoading = useAppSelector(jobSetsIsLoadingSelector)
  const isDeleting = useAppSelector(deleteSelectedJobSetsIsLoadingSelector)

  const dispatch = useAppDispatch()
  const loadJobSetsCallback = useLoadJobSetsCallback()
  const deleteSelectedCallback = useCallback(
    () => {
      dispatch(deleteSelectedJobSetsTakingThunkAction)
        .then(result => {
          if (result?.kind === 'success') {
            dispatch(addNotification({
              summary: result.success(),
              matchPath: routePaths.jobSets
            }))
            loadJobSetsCallback()
          }
          else if (result?.kind === 'failure') {
            dispatch(addNotification({
              summary: `Error when deleting Job Sets.`,
              matchPath: routePaths.jobSets
            }))
          }
        })
        .catch(() => {
          dispatch(addNotification({
            summary: `Error when deleting Job Sets.`,
            matchPath: routePaths.jobSets
          }))
        })
        .finally(() =>
          loadJobSetsCallback()
        )
    },
    [dispatch, loadJobSetsCallback]
  )

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
            <IconButton onClick={deleteSelectedCallback} disabled={isDeleting}>
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
  const loadJobSetsCallback = useLoadJobSetsCallback()
  const isLoading = useAppSelector(jobSetsIsLoadingSelector)

  return (
    <>
      <Typography variant="h6" className={classes.tableTitle}>
        Job Sets
      </Typography>
      <ProgressOverlay isLoading={isLoading}>
        <IconButton onClick={loadJobSetsCallback}>
          <RefreshIcon />
        </IconButton>
      </ProgressOverlay>
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