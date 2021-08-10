import {
  makeStyles,
  createStyles,
  Card,
  Button
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import {
  useJobSetEditorDispatch,
  createJob,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  jobCard: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(1),
    maxWidth: 800,
  },
  addButton: {
    margin: theme.spacing(1),
  },
  addIcon: {
    marginRight: theme.spacing(1)
  },
}))

export const CreateJob = () => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <Card className={classes.jobCard}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => { editorDispatch(createJob()) }}
        className={classes.addButton}
      >
        <AddIcon className={classes.addIcon} />
        Job
      </Button>
    </Card>
  )
}