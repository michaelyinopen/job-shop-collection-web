import {
  makeStyles,
  createStyles,
  Drawer,
  Typography,
  Toolbar,
  Button,
  Card,
} from '@material-ui/core'
import { formatDistanceToNow, parseISO } from 'date-fns'
import CloseIcon from '@material-ui/icons/Close'
import {
  useAppDispatch,
  useAppSelector,
  isNotificationDrawerOpenSelector,
  allNotificationsSelector,
} from '../store'
import { closeDrawer } from './store'

const useStyles = makeStyles(theme => createStyles({
  drawerContainer: {
    width: 320,
    backgroundColor: theme.palette.grey[300],
    overflow: 'overlay',
  },
  drawerContent: {
    paddingTop: 0,
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  button: {
    minWidth: 48,
    width: 48,
    height: 48,
    [theme.breakpoints.down('xs')]: {
      width: '20vw',
    },
  },
  separator: { flexGrow: 1 },
  center: {
    textAlign: 'center'
  },
  list: {
    listStyleType: 'none',
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
  },
  card: {
    padding: theme.spacing(1),
    '&:not(:last-child)': {
      marginBottom: theme.spacing(1),
    },
  },
}))

export const NotificationDrawer = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const isNotificationDrawerOpen = useAppSelector(isNotificationDrawerOpenSelector)
  const allNotifications = useAppSelector(allNotificationsSelector)

  return (
    <Drawer
      anchor='right'
      classes={{
        paper: classes.drawerContainer
      }}
      BackdropProps={{ invisible: true }}
      open={isNotificationDrawerOpen}
      onClose={() => dispatch(closeDrawer())}
    >
      <Toolbar>
        <Typography variant="h4">
          Notifications
        </Typography>
        <div className={classes.separator} />
        <Button
          className={classes.button}
          color="inherit"
          onClick={() => dispatch(closeDrawer())}
        >
          <CloseIcon />
        </Button>
      </Toolbar>
      <div className={classes.drawerContent}>
        {allNotifications.length === 0
          ? <div className={classes.center}>No new notifications</div>
          : null}
        <ol className={classes.list}>
          {allNotifications.map(n => (
            <Card key={n.id} className={classes.card}>
              <Typography variant="subtitle1">
                {n.summary}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDistanceToNow(
                  parseISO(n.dateTimeIso),
                  { addSuffix: true }
                )}
              </Typography>
            </Card>
          ))}
        </ol>
      </div>
    </Drawer>
  )
}