import {
  makeStyles,
  createStyles,
  Card,
  Button
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import {
  useJobSetEditorDispatch,
  addMachine,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  machineCard: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    marginTop: 0,
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
    display: "flex",
    alignItems: "baseline",
    maxWidth: 600
  },
  addButton: {
    margin: theme.spacing(1),
  },
  addIcon: {
    marginRight: theme.spacing(1)
  },
}))

export const AddMachine = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <Card className={classes.machineCard}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => { editorDispatch(addMachine()) }}
        className={classes.addButton}
      >
        <AddIcon className={classes.addIcon} />
        Machine
      </Button>
    </Card>
  )
}