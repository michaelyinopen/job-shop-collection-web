import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import HomeIcon from '@material-ui/icons/Home'
import ListIcon from '@material-ui/icons/List'
import InfoIcon from '@material-ui/icons/Info'
import GitHubIcon from '@material-ui/icons/GitHub'

import { HomeLink, JobSetsLink, AboutLink } from '../../route'
import { LabeledIconButton } from './LabeledIconButton'

const useStyles = makeStyles(theme => ({
  title: {
    color: 'inherit',
    textDecoration: 'none',
    marginRight: theme.spacing(3),
    alignSelf: 'stretch'
  },
  button: {
    margin: theme.spacing(1),
  },
  separator: { flexGrow: 1 },
  narrowAppBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 0,
  }
}))

const WideAppBar = ({
  classes
}) => {
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Button
          className={classes.title}
          component={HomeLink}
          color="inherit"
        >
          <Typography variant="h5">
            Job Shop Collection
          </Typography>
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
      </Toolbar>
    </MuiAppBar>
  )
}

const NarrowAppBar = ({
  classes
}) => {
  return (
    <MuiAppBar position="static">
      <Toolbar className={classes.narrowAppBar}>
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
          icon={<GitHubIcon fontSize="small" />}
          label="Code"
          href="https://github.com/michaelyinopen/job-shop-collection-web"
        />
        <LabeledIconButton
          icon={<InfoIcon fontSize="small" />}
          label="About"
          component={AboutLink}
        />
      </Toolbar>
    </MuiAppBar>
  )
}

export const AppBar = () => {
  const classes = useStyles()
  const theme = useTheme()
  const widerThanSmall = useMediaQuery(theme.breakpoints.up('sm'))

  return widerThanSmall ? <WideAppBar classes={classes} /> : <NarrowAppBar classes={classes} />
}