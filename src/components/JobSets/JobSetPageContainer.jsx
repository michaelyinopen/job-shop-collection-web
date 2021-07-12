import { makeStyles } from '@material-ui/core/styles'
import { PageContainer } from "../../styles"

const usePageContainerStyles = makeStyles(theme => ({
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
  const classes = usePageContainerStyles()
  return (
    <PageContainer classes={{ pageContainer: classes.pageContainer }}>
      {children}
    </PageContainer>
  )
}
