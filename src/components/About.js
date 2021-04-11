import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Button,
} from '@material-ui/core';
import { Icon as IconifyIcon } from "@iconify/react";
import githubCircle from '@iconify/icons-mdi/github-circle';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(1),
    height: "100%"
  },
  icon: {
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const About = () => {
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <h1>About</h1>
      <p>Michael Yin built this website to show what he learned.</p>
      <Button
        href="https://github.com/michaelyinopen"
        variant="contained"
        color="primary"
        size="large"
        startIcon={
          <div className={classes.icon}>
            <IconifyIcon icon={githubCircle} />
          </div>
        }
      >
        My GitHub Profile
      </Button>
      <h2> Source Code </h2>
      <Button
        href="https://github.com/michaelyinopen/job-shop-collection"
        variant="contained"
        color="primary"
        size="large"
        startIcon={
          <div className={classes.icon}>
            <IconifyIcon icon={githubCircle} />
          </div>
        }
      >
        GitHub
      </Button>
      <h2> Releases </h2>
      <p>Releases are moved to github. </p>
      <Button
        href="https://github.com/michaelyinopen/job-shop-collection/releases"
        variant="contained"
        color="primary"
        size="large"
        startIcon={
          <div className={classes.icon}>
            <IconifyIcon icon={githubCircle} />
          </div>
        }
      >
        GitHub Releases
      </Button>
    </Container>
  )
};

export default About;
