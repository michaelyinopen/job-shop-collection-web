import {
  makeStyles,
  createStyles,
  Toolbar,
  Divider,
  Typography,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  jobSetsEditorIdSelector,
  jobSetsEditorIsEditSelector,
  jobSetsEditorIsLockedSelector,
} from './store'

const useStyles = makeStyles(theme => createStyles({
  titleRow: {
    position: "sticky",
    top: 0,
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
  },
  toolbar: {
    position: "sticky",
    top: 0,
    display: "flex",
    flexWrap: "wrap",
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
    boxShadow: "0px 6px 4px -6px rgba(0,0,0,0.75)",
  },
  allActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap-reverse",
  },
  grouped: {
    display: "flex",
    alignItems: "center",
  },
  separator: { flexGrow: 1 },
}))

export const JobSetEditorTitleBar = () => {
  const classes = useStyles()
  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isLocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)
  return (
    <Toolbar className={classes.toolbar} disableGutters>
      <Typography variant="h4">
        {`Job Set #${id}`}
      </Typography>
      {/* {id ? <LoadButton id={id} /> : null}
        <div className={classes.separator} />
        <div className={classes.allActions}>
          <div className={classes.grouped}>
            {!readOnly ? <HistoryButtons id={id} /> : null}
            {!readOnly ? <SaveJobSetButton id={id} /> : null}
          </div>
          <div className={classes.grouped}>
            {id ? <EditButtons id={id} /> : null}
            <MoreOptions
              id={id}
              isJsonEditorOpen={isJsonEditorOpen}
              openJsonEditorCallback={openJsonEditorCallback}
              closeJsonEditorCallback={closeJsonEditorCallback}
            />
          </div>
        </div> */}
    </Toolbar>
  )
}