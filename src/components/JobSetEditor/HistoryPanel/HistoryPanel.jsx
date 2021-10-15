import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
} from '@material-ui/core'
import {
  useJobSetEditorDispatch,
  undo,
  redo,
  openHistoryPanel,
  closeHistoryPanel,
  useJobSetEditorSelector,
  canUndoSelector,
  canRedoSelector,
  isHistoryPanelOpenSelector,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  root: {
  },
  content: {
    overflow: 'auto',
    height: 'calc(100vh - 64px)',
  }
}))

export const HistoryPanel = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const isHistoryPanelOpen = useJobSetEditorSelector(isHistoryPanelOpenSelector)
  if (!isHistoryPanelOpen) {
    return null
  }
  return (
    <Paper square classes={{ root: classes.root }}>
      <div className={classes.content}>
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
      History X <br />
    </div>
    </Paper >
  )
}

// export const HistoryPanel = () => {
//   return <Drawer
//     className={classes.drawer}
//     variant="persistent"
//     anchor="left"
//     open={open}
//     classes={{
//       paper: classes.drawerPaper,
//     }}
//   >
//     <div className={classes.drawerHeader}>
//       <IconButton onClick={handleDrawerClose}>
//         {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//       </IconButton>
//     </div>
//     <Divider />
//     <List>
//       {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//         <ListItem button key={text}>
//           <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//           <ListItemText primary={text} />
//         </ListItem>
//       ))}
//     </List>
//     <Divider />
//     <List>
//       {['All mail', 'Trash', 'Spam'].map((text, index) => (
//         <ListItem button key={text}>
//           <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//           <ListItemText primary={text} />
//         </ListItem>
//       ))}
//     </List>
//   </Drawer>
// }