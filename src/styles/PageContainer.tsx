import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import type { FunctionComponent } from 'react'
import type { ContainerProps } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  pageContainer: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  }
}))

export const PageContainer: FunctionComponent<ContainerProps> = (props) => {
  const classes = useStyles()
  return (
    <Container className={classes.pageContainer} {...props} />
  )
}