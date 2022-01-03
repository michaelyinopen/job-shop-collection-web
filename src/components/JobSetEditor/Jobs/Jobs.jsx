import {
  makeStyles,
  createStyles,
  Typography,
  Tooltip,
  Collapse,
} from '@material-ui/core'
import { TransitionGroup } from 'react-transition-group'
import {
  useJobSetEditorSelector,
  fieldEditableSelector,
  jobIdsSelector,
} from '../store'
import { Job } from './Job'
import { CreateJob } from './CreateJob'

const useStyles = makeStyles(theme => createStyles({
  section: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  countMessage: {
    color: theme.palette.text.hint
  },
  noJobsMessage: {
    color: theme.palette.text.hint,
    fontStyle: 'italic'
  },
  list: {
    listStyleType: "none",
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
  },
}))

export const Jobs = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const jobIds = useJobSetEditorSelector(jobIdsSelector)

  return (
    <section>
      <Typography variant='h5' gutterBottom>
        Jobs
        <Tooltip title={`${jobIds.length} Jobs`}>
          <span className={classes.countMessage}>
            {jobIds.length === 0 ? "" : ` (${jobIds.length})`}
          </span>
        </Tooltip>
      </Typography>
      {jobIds.length === 0 && <div className={classes.noJobsMessage}>No jobs</div>}
      <ol className={classes.list}>
        <TransitionGroup component={null}>
          {jobIds.map(id => (
            <Collapse key={id} component='li'>
              <Job key={id} id={id} />
            </Collapse>
          ))}
        </TransitionGroup>
      </ol>
      {editable && <CreateJob />}
    </section>
  )
}