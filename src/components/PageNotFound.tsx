import { Fab, Typography } from '@material-ui/core'
import { PageContainer } from '../styles/PageContainer'

import type { FunctionComponent } from 'react'
import type { RouteComponentProps } from 'react-router-dom'

export const PageNotFound: FunctionComponent<RouteComponentProps> = ({ history }) => {
  return (
    <PageContainer>
      <Typography variant="h4">Page not found</Typography>
      <p>Sorry. The path does not link to any page.</p>
      <Fab
        onClick={() => history?.length === 1 ? window?.close?.() : history?.goBack?.() }
      >
        Back
      </Fab>
    </PageContainer >
  )
}