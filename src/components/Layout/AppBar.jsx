import {
  makeStyles,
  createStyles,
  AppBar as MuiAppBar,
  Toolbar,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import HomeIcon from '@material-ui/icons/Home'
import ListIcon from '@material-ui/icons/List'
import InfoIcon from '@material-ui/icons/Info'
import GitHubIcon from '@material-ui/icons/GitHub'
import MessageIcon from '@material-ui/icons/Message'

import { HomeLink, JobSetsLink, AboutLink } from '../../route'
import { useAppDispatch } from '../../store'
import { openDrawer } from '../../notifications'
import { LabeledIconButton } from './LabeledIconButton'

const useStyles = makeStyles(theme => createStyles({
  title: {
    color: 'inherit',
    alignSelf: 'stretch',
    fontSize: 22.5,
  },
  separator: { flexGrow: 1 },
  wideToolbar: {
    '& > *': {
      '&:not(:last-child)': {
        marginRight: theme.spacing(1)
      }
    }
  },
  narrowToolbar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 0,
  }
}))

const WideAppBar = ({
  classes,
  openDrawerCallback
}) => {
  return (
    <MuiAppBar position="static">
      <Toolbar className={classes.wideToolbar}>
        <Button
          className={classes.title}
          component={HomeLink}
          color="inherit"
        >
          Job Shop Collection
        </Button>
        <Button
          className={classes.button}
          component={JobSetsLink}
          color="inherit"
          variant="outlined"
        >
          Job Sets
        </Button>
        <div className={classes.separator} />
        <IconButton
          className={classes.button}
          color="inherit"
          href="https://github.com/michaelyinopen/job-shop-collection-web"
          variant="outlined"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon />
        </IconButton>
        <Button
          className={classes.button}
          component={AboutLink}
          color="inherit"
          variant="outlined"
        >
          About
        </Button>
        <Tooltip title="Notifications">
          <IconButton
            className={classes.button}
            color="inherit"
            variant="outlined"
            onClick={openDrawerCallback}
          >
            <MessageIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </MuiAppBar >
  )
}

const NarrowAppBar = ({
  classes,
  openDrawerCallback
}) => {
  return (
    <MuiAppBar position="static">
      <Toolbar className={classes.narrowToolbar}>
        <LabeledIconButton
          icon={<HomeIcon fontSize="small" />}
          label="Home"
          component={HomeLink}
        />
        <LabeledIconButton
          icon={<ListIcon fontSize="small" />}
          label="Job Sets"
          component={JobSetsLink}
        />
        <LabeledIconButton
          icon={<InfoIcon fontSize="small" />}
          label="About"
          component={AboutLink}
        />
        <LabeledIconButton
          icon={<MessageIcon fontSize="small" />}
          label="Notifications"
          onClick={openDrawerCallback}
        />
      </Toolbar>
    </MuiAppBar>
  )
}

export const AppBar = () => {
  const classes = useStyles()
  const theme = useTheme()
  const widerThanSmall = useMediaQuery(theme.breakpoints.up('sm'))

  const dispatch = useAppDispatch()
  const openDrawerCallback = e => {
    dispatch(openDrawer())
  }

  return widerThanSmall
    ? <WideAppBar classes={classes} openDrawerCallback={openDrawerCallback} />
    : <NarrowAppBar classes={classes} openDrawerCallback={openDrawerCallback} />
}