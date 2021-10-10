import {
  makeStyles,
  createStyles,
  lighten,
  Tooltip
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  fieldEditableSelector,
  createJobTitleSelector,
  createProcedureIdsOfJobSelector,
} from '../store'
import { Procedure } from './Procedure'
import { CreateProcedure } from './CreateProcedure'

const useStyles = makeStyles(theme => createStyles({
  root: {
    margin: "0 auto",
    overflow: "hidden",
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    backgroundColor: lighten(theme.palette.primary.light, 0.5)
  },
  proceduresTitle: {
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1)
  },
  list: {
    listStyleType: "none",
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
    //todo add separation
  },
  countMessage: {
    color: theme.palette.text.hint
  },
  noProceduresMessage: {
    color: theme.palette.text.hint,
    fontStyle: 'italic'
  },
}))

export const Procedures = ({ jobId }) => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const jobTitle = useJobSetEditorSelector(createJobTitleSelector(jobId))
  const procedureIdsOfJob = useJobSetEditorSelector(createProcedureIdsOfJobSelector(jobId))
  return (
    <section className={classes.root}>
      <div className={classes.proceduresTitle}>
        Job {jobTitle} Procedures
        <Tooltip title={`${procedureIdsOfJob.length} procedures in Job ${jobTitle}`}>
          <span className={classes.countMessage}>
            {procedureIdsOfJob.length === 0 ? "" : ` (${procedureIdsOfJob.length})`}
          </span>
        </Tooltip>
      </div>
      {procedureIdsOfJob.length === 0 && (
        <div className={classes.noProceduresMessage}>
          {`No procedures in Job ${jobTitle}`}
        </div>
      )}
      <ol className={classes.list}>
        {procedureIdsOfJob.map(id => <li key={id}><Procedure key={id} jobId={jobId} id={id} /></li>)}
      </ol>
      {editable && <CreateProcedure jobId={jobId} />}
    </section>
  )
}