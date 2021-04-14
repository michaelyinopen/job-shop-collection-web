import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery, useTheme, Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import clsx from 'clsx';
import Fab from '@material-ui/core/Fab';
import Container from '@material-ui/core/Container';
import * as fromRoutePaths from '../routePaths';
import hostConstants from '../hostConstants';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(1),
    height: "100%"
  },
  examplesLink: {
    margin: theme.spacing(2),
  },
  smallerTitle: {
    fontSize: "1.8em"
  },
  keyFeatures: {
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
    alignItems: "stretch",
    '& li': {
      '&:not(last-child)': {
        marginBottom: theme.spacing(2)
      }
    }
  },
  card: {
    display: 'flex',
    flexWrap: 'wrap-reverse',
  },
  content: {
    flex: '1 1 auto',
    minWidth: 240,
    width: 240,
  },
  media: {
    flex: '1 0 auto',
    width: 500,
    height: 400,
    [theme.breakpoints.down('xs')]: {
      width: 280,
      height: 224,
    }
  },
  containImage: {
    objectFit: 'contain',
  },
}));

const ExamplesLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} to={fromRoutePaths.jobSets} {...props} />
));

const Home = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmallerTitle = useMediaQuery(theme.breakpoints.down('xs'));
  const currentHostConstants = hostConstants[process.env.REACT_APP_HOST];
  const deploymentMethod = currentHostConstants?.useDeploymentMethod?.();
  return (
    <Container className={classes.container}>
      <h1 className={clsx({ [classes.smallerTitle]: isSmallerTitle })}>Job Shop Collection</h1>
      <p>
        Welcome to Job Shop Collection where you can find examples of the <a href="#job-shop-scheduling-problem">The Job Shop Scheduling Problem</a>.<br />
        <Fab
          component={ExamplesLink}
          variant="extended"
          size="medium"
          color="primary"
          className={classes.examplesLink}
        >
          View the examples now
        </Fab>
      </p>
      <h3>Key Features</h3>
      <ol className={classes.keyFeatures}>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" gutterBottom>CRUD Application</Typography>
            <Typography paragraph>
              This website allows users to view, store and edit scheduling data.
            </Typography>
            <Typography paragraph>
              The data is machines, jobs and procedures.
            </Typography>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src="key-features/key-feature-overview.mp4"
            title="CRUD Application"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" gutterBottom>Responsive Layout</Typography>
            <Typography paragraph> The layout is responsive to user's device size.</Typography>
            <Typography paragraph>
              For example, the app-bar and elements will change layout when screen size is too small.
            </Typography>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src="key-features/key-feature-responsive.mp4"
            title="Responsive layout"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" gutterBottom>Logical Input</Typography>
            <Typography paragraph>
              The input form contains logic and shared data among different sections. Redux is used for state management to ensure shared data are updated properly.
            </Typography>
            <Typography paragraph>
              For example, the addition and removal of a machine updates the options in procedures.
            </Typography>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src="key-features/key-feature-input-logic.mp4"
            title="Logical Input"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" gutterBottom>Drag & Drop</Typography>
            <Typography paragraph>
              Users can re-order the procedures within a job. Mouse and touch are both supported.
            </Typography>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src="key-features/key-feature-dnd.mp4"
            title="Drag and drop example"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" gutterBottom>Tests</Typography>
            <Typography paragraph>
              Jest.js is used for testing.
            </Typography>
            <Typography paragraph>
              (left) The test suites that includes unit tests and application wide tests.
            </Typography>
            <Typography paragraph>
              (right) The tests in one test suite about the redux store changes.
            </Typography>
          </CardContent>
          <CardMedia
            className={clsx(classes.media, classes.containImage)}
            component="img"
            src="key-features/key-feature-tests.png"
            title="Example of Tests"
          />
        </Card>
      </ol>
      <Fab
        component={ExamplesLink}
        variant="extended"
        size="medium"
        color="primary"
        className={classes.examplesLink}
      >
        View the examples now
        </Fab>
      <h3 id="job-shop-scheduling-problem">About The Job Shop Scheduling Problem</h3>
      <p>
        The Job Shop Problem is a scheduling problem, in which multiple jobs are processed on several machines.
        Each job consists of a sequence of tasks, which must be performed in a given order, and each task must be processed on a specific machine.
      </p>
      <p>
        The solution of the problem is a schedule, which describes clearly how the tasks are scheduled on the machines. This schedule provides visibility and control over the production process and ultimately boost production efficiency.
      </p>
      <p>
        References
      </p>
      <ul>
        <li><a href='https://en.wikipedia.org/wiki/Job_shop_scheduling'>Wikipedia</a></li>
        <li><a href='https://developers.google.com/optimization/scheduling/job_shop'>Google OR-Tools</a></li>
      </ul>
      <h3>This application is built with</h3>
      <ul>
        <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
        <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for server-side code</li>
        <li><a href='https://material-ui.com/'>Material-ui</a> for layout and styling</li>
        <li><a href={currentHostConstants?.hostLink}>{currentHostConstants?.hostName}</a> for hosting Web App and database</li>
        <li>{deploymentMethod}</li>
      </ul>
    </Container >
  );
}

export default Home;