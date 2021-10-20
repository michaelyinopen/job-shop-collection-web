import { useRef } from 'react'
import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
  Button,
  Typography,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  FormControl,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
} from '@material-ui/core'
import type {
  Operation as OperationType,
} from '../store/editHistory'
import {
  useJobSetEditorDispatch,
  applyConflict,
  unApplyConflict,
  useJobSetEditorSelector,
  createHasRelatedChangesSelector,
} from '../store'

type ConflictProps = {
  stepId: string,
  conflictIndex: number,
  conflict: OperationType,
  undone: boolean,
}

// key is StepId-conflictIndex
export const Conflict = ({
  stepId,
  conflictIndex,
  conflict,
  undone,
}: ConflictProps) => {
  const editorDispatch = useJobSetEditorDispatch()
  const hasRelatedChangesSelector = useRef(createHasRelatedChangesSelector(stepId, conflictIndex)).current
  const hasRelatedChanges = useJobSetEditorSelector(hasRelatedChangesSelector)
  const disabled = undone || hasRelatedChanges
  return (
    <div>
      <input
        type="checkbox"
        id={`conflict-${stepId}-${conflictIndex}`}
        checked={conflict.conflictApplied}
        onChange={e => {
          if (e.target.checked) {
            editorDispatch(applyConflict(stepId, conflictIndex))
          } else {
            editorDispatch(unApplyConflict(stepId, conflictIndex))
          }
        }}
        disabled={disabled}
      />
      <label htmlFor={`conflict-${stepId}-${conflictIndex}`}>{conflict.conflictName}</label>
    </div>
  )
}

const useConflictsStyles = makeStyles(theme => createStyles({
  smallFont: {
    fontSize: '0.875rem',
  },
  checkbox: {
    padding: theme.spacing(0.5),
  },
  conflicts: {
    paddingLeft: theme.spacing(1),
  },
  conflictLabel: {
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
  }
}))

export const Conflicts = ({
  conflicts,
  isCurrent
}) => {
  const classes = useConflictsStyles()
  return (
    <FormControl variant='outlined' component="fieldset" fullWidth className={classes.conflicts}>
      <FormLabel component="legend" focused>Conflicts</FormLabel>
      <FormGroup>
        <FormControlLabel
          label="Gilad Gray"
          disabled={!isCurrent}
          classes={{
            root: classes.conflictLabel,
            label: classes.smallFont
          }}
          control={<Checkbox size='small'  className={classes.checkbox} checked={true} onChange={() => { }} />}
        />
        <FormControlLabel
          label="Jason Killian"
          disabled={!isCurrent}
          classes={{
            root: classes.conflictLabel,
            label: classes.smallFont
          }}
          control={<Checkbox size='small'  className={classes.checkbox} checked={true} onChange={() => { }} />}
        />
        <FormControlLabel
          label="Antoine Llorca"
          disabled={!isCurrent}
          classes={{
            root: classes.conflictLabel,
            label: classes.smallFont
          }}
          control={<Checkbox size='small'  className={classes.checkbox} checked={true} onChange={() => { }} />}
        />
        <FormControlLabel
          label="Edit procedure's machine"
          disabled={!isCurrent}
          classes={{
            root: classes.conflictLabel,
            label: classes.smallFont
          }}
          control={<Checkbox size='small' checked={true} onChange={() => { }} />}
        />
      </FormGroup>
    </FormControl>
  )
}