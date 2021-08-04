import { makeStyles, createStyles } from '@material-ui/core'
import { PageContainer } from "."

const useStyles = makeStyles(theme => createStyles({
  pageContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }
}))

export const JobSetsPageContainer = ({ children }) => {
  const classes = useStyles()
  return (
    <PageContainer classes={{ pageContainer: classes.pageContainer }}>
      {children}
    </PageContainer>
  )
}
