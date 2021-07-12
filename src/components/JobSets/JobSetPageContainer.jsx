import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { PageContainer } from "../../styles"

const useStyles = makeStyles(theme => ({
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
      <Paper>
        {children}
      </Paper>
    </PageContainer>
  )
}
