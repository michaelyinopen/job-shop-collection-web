import { makeStyles, createStyles } from '@material-ui/core'
import { NotificationDrawer } from '../../notifications'
import { AppBar } from './AppBar'

const useStyles = makeStyles(theme => createStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white'
  },
}))

export const Layout = props => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <AppBar />
      <div className={classes.container}>
        {props.children}
        <NotificationDrawer />
      </div>
    </div>
  )
}