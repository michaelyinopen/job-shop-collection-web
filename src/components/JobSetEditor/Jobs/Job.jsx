import { useRef } from 'react'
import {
  makeStyles,
  createStyles,
  Card,
  Typography,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  jobSetsEditorIsEditSelector,
  createJobColorSelector,
  createJobTextColorSelector,
} from '../store'
import { Procedures } from '../Procedures'
import { DeleteJobButton } from './DeleteJobButton'
import { JobOptionsButton } from './JobOptionsButton'

const useStyles = makeStyles(theme => createStyles({
  jobCard: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(1),
    maxWidth: 800,
  },
  headerRow: { display: 'flex' },
  jobTitle: {
    display: 'inline'
  },
  jobTitleColorBox: {
    display: 'inline',
    padding: "0 4px",
    margin: "0 2px",
    borderRadius: "4px",
  },
  separator: { flexGrow: 1 },
  headerRowActions: {
    display: 'inline-flex',
    alignItems: 'center',
    '& > *': {
      '&:not(:last-child)': {
        marginRight: theme.spacing(1)
      }
    }
  },
}))

export const Job = ({ id }) => {
  const classes = useStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const jobColorSelector = useRef(createJobColorSelector(id)).current
  const jobColor = useJobSetEditorSelector(jobColorSelector)
  const jobTextColorSelector = useRef(createJobTextColorSelector(id)).current
  const jobTextColor = useJobSetEditorSelector(jobTextColorSelector)
  return (
    <Card component="section" className={classes.jobCard}>
      <div className={classes.headerRow}>
        <Typography variant='h6' gutterBottom className={classes.jobTitle}>
          Job
          <div
            className={classes.jobTitleColorBox}
            style={{ backgroundColor: jobColor, color: jobTextColor }}
          >
            {id}
          </div>
        </Typography>
        <div className={classes.separator} />
        <aside className={classes.headerRowActions}>
          <JobOptionsButton id={id} />
          {isEdit && <DeleteJobButton id={id} />}
        </aside>
      </div>
      <Procedures key={id} jobId={id} />
    </Card>
  )
}