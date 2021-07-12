import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import type { FunctionComponent } from 'react'
import type { Theme, StyledComponentProps } from '@material-ui/core/styles'
import type { ContainerProps } from '@material-ui/core'
import type { ClassKeyOfStyles } from '@material-ui/styles/withStyles'

const styles = (theme: Theme) => createStyles({
  pageContainer: {
    height: '100%',
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4)
  }
})

const useStyles = makeStyles(styles, { name: 'PageContainer' })
type ClassKey = ClassKeyOfStyles<typeof styles>

type Props = ContainerProps & StyledComponentProps<ClassKey>

export const PageContainer: FunctionComponent<Props> = (props) => {
  const classes = useStyles(props)
  return (
    <Container className={classes.pageContainer} {...props} />
  )
}