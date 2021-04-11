import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import {
  Home as HomeIcon,
  List as ListIcon,
  Info as InfoIcon,
} from '@material-ui/icons'
import { Icon as IconifyIcon } from "@iconify/react";
import githubCircle from '@iconify/icons-mdi/github-circle';
import * as fromRoutePaths from '../routePaths';
import LabeledButton from './LabeledButton';

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    color: "inherit",
    textDecoration: "none",
    marginRight: theme.spacing(3)
  },
  button: {
    margin: theme.spacing(1),
    textTransform: "none",
  },
  separator: { flexGrow: 1 },
  container: {
    flex: "1 1 auto",
    position: "relative"
  },
  icon: {
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  narrowAppBar: {
    display: 'flex',
    justifyContent: 'space-around',
    height: 56,
    padding: 0,
  },
}));

const HomeLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} to={fromRoutePaths.home} {...props} />
));

const JobSetsLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} to={fromRoutePaths.jobSets} {...props} />
));

const AboutLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} to={fromRoutePaths.about} {...props} />
));

const WideAppBar = ({
  classes
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <HomeLink className={classes.title}>
          <Typography variant="h5">
            Job Shop Collection
          </Typography>
        </HomeLink>
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
          href="https://github.com/michaelyinopen/job-shop-collection"
          variant="outlined"
        >
          <div className={classes.icon}>
            <IconifyIcon icon={githubCircle} />
          </div>
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
    </AppBar>
  );
};

const NarrowAppBar = ({
  classes
}) => {
  return (
    <AppBar position="static">
      <Toolbar className={classes.narrowAppBar}>
        <LabeledButton
          icon={<HomeIcon />}
          label="Home"
          component={HomeLink}
        />
        <LabeledButton
          icon={<ListIcon />}
          label="Job Sets"
          component={JobSetsLink}
        />
        <LabeledButton
          icon={(
            <div className={classes.icon}>
              <IconifyIcon icon={githubCircle} />
            </div>
          )}
          label="Code"
          href="https://github.com/michaelyinopen/job-shop-collection"
        />
        <LabeledButton
          icon={<InfoIcon />}
          label="About"
          component={AboutLink}
        />
      </Toolbar>
    </AppBar>
  );
};

const Layout = props => {
  const classes = useStyles();
  const theme = useTheme();
  const widerThanSmall = useMediaQuery(theme.breakpoints.up('sm'));

  const appBar = widerThanSmall ? <WideAppBar classes={classes} /> : <NarrowAppBar classes={classes} />;
  return (
    <div className={classes.root}>
      {appBar}
      <div className={classes.container}>
        {props.children}
      </div>
    </div>
  )
};

export default Layout
