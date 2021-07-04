import { Fab, Typography } from '@material-ui/core'
import { PageContainer } from './PageContainer'

export const PageNotFound = ({ history }) => {
  return (
    <PageContainer>
      <Typography variant="h4">Page not found</Typography>
      <p>Sorry. The path does not link to any page.</p>
      <Fab
        onClick={() => history.goBack()}
      >
        Back
      </Fab>
    </PageContainer>
  )
}