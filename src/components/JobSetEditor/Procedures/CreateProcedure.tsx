import {
  makeStyles,
  createStyles,
  Button
} from '@material-ui/core'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import {
  useJobSetEditorDispatch,
  createProcedure,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  procedure: {
    boxShadow: theme.shadows[3],
    marginBottom: 2,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    flexShrink: 0
  },
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  addIcon: {
    marginRight: theme.spacing(1)
  },
}))

export const CreateProcedure = ({ jobId }) => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <div className={classes.procedure}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => { editorDispatch(createProcedure(jobId)) }}
        className={classes.addButton}
      >
        <AddCircleIcon className={classes.addIcon} />
        Procedure
      </Button>
    </div>
  )
}