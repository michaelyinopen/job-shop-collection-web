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
  machineIdsSelector
} from '../store'
import { Machine } from './Machine'
import { AddMachine } from './AddMachine'

const useStyles = makeStyles(theme => createStyles({
  section: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  countMessage: {
    color: theme.palette.text.hint
  },
  noMachinesMessage: {
    color: theme.palette.text.hint,
    fontStyle: 'italic'
  },
  list: {
    listStyleType: 'none',
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
  }
}))

export const Machines = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const machineIds = useJobSetEditorSelector(machineIdsSelector)
  return (
    <section className={classes.section}>
      <Typography variant='h5' gutterBottom>
        Machines
        <Tooltip title={`${machineIds.length} Machines`}>
          <span className={classes.countMessage}>
            {machineIds.length === 0 ? "" : ` (${machineIds.length})`}
          </span>
        </Tooltip>
      </Typography>
      {machineIds.length === 0 && <div className={classes.noMachinesMessage}>No machines</div>}
      <ol className={classes.list}>
        <TransitionGroup component={null}>
          {machineIds.map(id => (
            <Collapse key={id} component='li'>
              <Machine key={id} id={id} />
            </Collapse>
          ))}
        </TransitionGroup>
      </ol>
      {editable && <AddMachine />}
    </section >
  )
}