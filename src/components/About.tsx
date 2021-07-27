import { makeStyles, createStyles, Button, Typography } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import { PageContainer } from '../styles/PageContainer'

const useStyles = makeStyles(theme => createStyles({
  section: {
    paddingBottom: theme.spacing(3),
  }
}))

export const About = () => {
  const classes = useStyles()
  return (
    <PageContainer>
      <Typography variant="h4">About</Typography>
      <div className={classes.section}>
        <p>Michael Yin built this website to show what he learned.</p>
        <Button
          href="https://github.com/michaelyinopen"
          target="_blank"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GitHubIcon />}
        >
          My GitHub Profile
        </Button>
      </div>
      <section className={classes.section}>
        <Typography
          id="source-code"
          variant="h6"
          component="h2"
          gutterBottom
        >
          Source Code
        </Typography>
        <Button
          href="https://github.com/michaelyinopen/job-shop-collection-web"
          target="_blank"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GitHubIcon />}
        >
          GitHub
        </Button>
      </section>
      <section className={classes.section}>
        <Typography
          id="releases"
          variant="h6"
          component="h2"
          gutterBottom
        >
          Releases
        </Typography>
        <p>Releases are moved to github.</p>
        <Button
          href="https://github.com/michaelyinopen/job-shop-collection-web/releases"
          target="_blank"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GitHubIcon />}
        >
          GitHub Releases
        </Button>
      </section>
    </PageContainer>
  )
}
