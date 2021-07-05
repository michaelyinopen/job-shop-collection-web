import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, CardMedia, Typography, Fab } from '@material-ui/core'
import clsx from 'clsx'
import { PageContainer } from '../../styles'
import { routePaths } from '../../route'
import { hostsConstants } from '../../hostsConstants'

import keyFeatureOverview from './key-feature-overview.mp4'
import keyFeatureResponsive from './key-feature-responsive.mp4'
import keyFeatureInputLogic from './key-feature-input-logic.mp4'
import keyFeatureDnd from './key-feature-dnd.mp4'
import keyFeatureTests from './key-feature-tests.png'

const useStyles = makeStyles(theme => ({
  noBottomMargin: {
    marginBlockEnd: 0,
    marginBottom: 0
  },
  sectionHeader: {
    fontWeight: theme.typography.fontWeightBold
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
    alignItems: 'flex-end'
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
    <PageContainer>
      <Typography variant="h4">Job Shop Collection</Typography>
      <p className={classes.noBottomMargin}>
        Welcome to Job Shop Collection where you can find examples of the <a href="#about-the-job-shop-scheduling-problem">The Job Shop Scheduling Problem</a>.<br />
        <ViewExamplesButton />
      </p>
      <Typography
        id="key-features"
        variant="h6"
        component="h2"
        gutterBottom
        className={classes.sectionHeader}
      >
        Key Features
      </Typography>
      <ol className={classes.keyFeatures}>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h3">CRUD Application</Typography>
            <p>
              This website allows users to view, store and edit scheduling data.
            </p>
            <p>
              The data is machines, jobs and procedures.
            </p>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src={keyFeatureOverview}
            title="CRUD Application"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h3">Responsive Layout</Typography>
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
            <Typography variant="h5" component="h3">Logical Input</Typography>
            <p>
              The input form contains logic and shared data among different sections. Redux is used for state management to ensure shared data are updated properly.
            </p>
            <p>
              For example, the addition and removal of a machine updates the options in procedures.
            </p>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src={keyFeatureInputLogic}
            title="Logical Input"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h3">Drag & Drop</Typography>
            <p>
              Users can re-order the procedures within a job. Mouse and touch are both supported.
            </p>
          </CardContent>
          <CardMedia
            className={classes.media}
            component="video"
            src={keyFeatureDnd}
            title="Drag and drop example"
            controls
            muted
          />
        </Card>
        <Card component="li" raised className={classes.card}>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h3">Tests</Typography>
            <p>
              Jest.js is used for testing.
            </p>
            <p>
              (left) The test suites that includes unit tests and application wide tests.
            </p>
            <p>
              (right) The tests in one test suite about the redux store changes.
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
        variant="h6"
        component="h2"
        gutterBottom
        className={classes.sectionHeader}
      >
        About The Job Shop Scheduling Problem
      </Typography>
      <p>
        The Job Shop Problem is a scheduling problem, in which
        <ul>
          <li>Multiple jobs are processed on several machines</li>
          <li>Each job consists of a sequence of tasks, which must be performed in a given order</li>
          <li>Each task must be processed on a specific machine</li>
        </ul>
      </p>
      <p>
        The solution of the problem is a schedule, which describes clearly how the tasks are scheduled on the machines.<br />
        This schedule provides visibility and control over the production process and ultimately boost production efficiency.
      </p>
      <Typography
        variant="subtitle1"
      >
        References
      </Typography>
      <ul>
        <li><a href='https://en.wikipedia.org/wiki/Job_shop_scheduling'>Wikipedia</a></li>
        <li><a href='https://developers.google.com/optimization/scheduling/job_shop'>Google OR-Tools</a></li>
      </ul>
      <Typography
        id="this-application-is-built-with"
        variant="h6"
        component="h2"
        gutterBottom
        className={classes.sectionHeader}
      >
        This application is built with
      </Typography>
      <ul>
        <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
        <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for server-side code</li>
        <li><a href='https://material-ui.com/'>Material-ui</a> for layout and styling</li>
        {currentHostBuiltWiths?.map(b => (
          <li>
            {b}
          </li>
        ))}
      </ul>
    </PageContainer>
  )
}