import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles, createStyles, Card, CardContent, CardMedia, Typography, Fab } from '@material-ui/core'
import clsx from 'clsx'
import { PageContainer } from '../../styles'
import { ErrorBoundary } from '../ErrorBoundary'
import { routePaths } from '../../route'
import { hostsConstants } from '../../hostsConstants'

import keyFeatureManageData from './key-feature-manage-data.mp4'
import keyFeatureEditHistory from './key-feature-edit-history.mp4'
import keyFeatureResponsive from './key-feature-responsive.mp4'
import keyFeatureTests from './key-feature-tests.png'
import schedulerOverview from './SchedulerOverview.png'

const useStyles = makeStyles(theme => createStyles({
  noBottomMargin: {
    marginBlockEnd: 0,
    marginBottom: 0
  },
  list: {
    marginBlockStart: 0,
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
    '& > li': {
      '&:not(:last-child)': {
        marginBottom: theme.spacing(2)
      }
    }
  },
  card: {
    display: 'flex',
    flexWrap: 'wrap-reverse',
    alignItems: 'flex-end'
  },
  cardTitle: {
    fontWeight: theme.typography.fontWeightRegular,
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
  schedulerImage: {
    maxWidth: '100%',
    width: 700,
    height: 'auto',
    objectFit: 'contain',
  },
  containImage: {
    objectFit: 'contain',
  },
}))

const ExamplesLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.jobSets} {...props} />
))

const ViewExamplesButton = () => (
  <Fab
    component={ExamplesLink}
    variant="extended"
    size="medium"
    color="primary"
  >
    View the examples now
  </Fab>
)

export const Home = () => {
  const classes = useStyles()
  const currentHostConstants = hostsConstants[process.env.REACT_APP_HOST]
  const currentHostBuiltWiths = currentHostConstants?.useBuiltWiths?.()
  return (
    <ErrorBoundary>
      <PageContainer>
        <Typography variant="h4">Job Shop Collection</Typography>
        <p className={classes.noBottomMargin}>
          Welcome to Job Shop Collection where you manage data of <a href="#about-the-job-shop-scheduling-problem">The Job Shop Scheduling Problem</a>.<br />
          <ViewExamplesButton />
        </p>
        <Typography
          id="key-features"
          variant="h5"
          gutterBottom
        >
          Key Features
        </Typography>
        <ol className={classes.keyFeatures}>
          <Card component="li" raised className={classes.card}>
            <CardContent className={classes.content}>
              <Typography
                variant="h5"
                component="h3"
                className={classes.cardTitle}
              >
                Manage Data
              </Typography>
              <p>
                This website has a custom-built form to view, and edit scheduling data.
              </p>
              <p>
                The data is machines, jobs and procedures.
              </p>
            </CardContent>
            <CardMedia
              className={classes.media}
              component="video"
              src={keyFeatureManageData}
              title="Manage Data"
              alt="Manage Data"
              controls
              muted
            />
          </Card>
          <Card component="li" raised className={classes.card}>
            <CardContent className={classes.content}>
              <Typography
                variant="h5"
                component="h3"
                className={classes.cardTitle}
              >
                Edit History and Conflict Resolution
              </Typography>
              <p>
                The input form keeps the edit history, to allow undo and redo.
              </p>
              <p>
                If another user updates while you are editing, the changes are merged and conflicts can be resolved, to avoid losing progress.
              </p>
            </CardContent>
            <CardMedia
              className={classes.media}
              component="video"
              src={keyFeatureEditHistory}
              title="Edit History"
              alt="Edit History"
              controls
              muted
            />
          </Card>
          <Card component="li" raised className={classes.card}>
            <CardContent className={classes.content}>
              <Typography
                variant="h5"
                component="h3"
                className={classes.cardTitle}
              >
                Responsive Layout
              </Typography>
              <p>
                The layout is responsive to user's device size.
              </p>
              <p>
                For example, the app-bar and elements will change layout when screen size is too small.
              </p>
            </CardContent>
            <CardMedia
              className={classes.media}
              component="video"
              src={keyFeatureResponsive}
              title="Responsive layout"
              controls
              muted
            />
          </Card>
          <Card component="li" raised className={classes.card}>
            <CardContent className={classes.content}>
              <Typography
                variant="h5"
                component="h3"
                className={classes.cardTitle}
              >
                Tests
              </Typography>
              <p>
                Jest.js is used for testing.
              </p>
            </CardContent>
            <CardMedia
              className={clsx(classes.media, classes.containImage)}
              component="img"
              src={keyFeatureTests}
              title="Example of Tests"
            />
          </Card>
        </ol>
        <ViewExamplesButton />
        <Typography
          id="about-the-job-shop-scheduling-problem"
          variant="h5"
          gutterBottom
        >
          About The Job Shop Scheduling Problem
        </Typography>
        <p>
          The Job Shop Problem is a scheduling problem, in which
        </p>
        <ul>
          <li>Multiple jobs are processed on several machines</li>
          <li>Each job consists of a sequence of procedures, which must be performed in a given order</li>
          <li>Each procedure is processed on a specific machine</li>
        </ul>
        <p>
          The solution of the problem is a schedule, which describes how the tasks are scheduled on the machines.<br />
          This schedule provides visibility and control over the production process and ultimately boost production efficiency.
        </p>
        <Typography
          variant="subtitle1"
          noBottomMargin
        >
          References
        </Typography>
        <ul className={classes.list}>
          <li>
            <a
              href='https://en.wikipedia.org/wiki/Job_shop_scheduling'
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia
            </a>
          </li>
          <li>
            <a
              href='https://developers.google.com/optimization/scheduling/job_shop'
              target="_blank"
              rel="noreferrer"
            >
              Google OR-Tools
            </a>
          </li>
        </ul>
        Check out another project of mine {
          <a
            href='https://michaelyinopen.github.io/job-shop-scheduler/'
            target="_blank"
            rel="noreferrer"
          >
            Job Shop Scheduler
          </a>
        }.
        <br />
        <a
          href='https://michaelyinopen.github.io/job-shop-scheduler/'
          target="_blank"
          rel="noreferrer"
        >
          <img
            title='Job Shop Scheduler'
            src={schedulerOverview}
            alt='Job Shop Scheduler'
            className={classes.schedulerImage}
          />
        </a>
        <Typography
          id="this-application-is-built-with"
          variant="h5"
          gutterBottom
        >
          This application is built with
        </Typography>
        <ul>
          <li><a href='https://facebook.github.io/react/' target="_blank" rel="noreferrer">React</a> for client-side code</li>
          <li><a href='https://get.asp.net/' target="_blank" rel="noreferrer">ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx' target="_blank" rel="noreferrer">C#</a> for server-side code</li>
          <li><a href='https://material-ui.com/' target="_blank" rel="noreferrer">Material-ui</a> for layout and styling</li>
          {currentHostBuiltWiths?.map(b => (
            <li>
              {b}
            </li>
          ))}
        </ul>
        Source code: {<a href='https://github.com/michaelyinopen/job-shop-collection-web' target="_blank" rel="noreferrer">Github</a>}
      </PageContainer>
    </ErrorBoundary >
  )
}