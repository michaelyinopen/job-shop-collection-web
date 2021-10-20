import { useRef } from 'react'
import {
  makeStyles,
  createStyles,
  FormControl,
  FormLabel,
  FormControlLabel,
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

const useConflictStyles = makeStyles(theme => createStyles({
  smallFont: {
    fontSize: '0.875rem',
  },
  checkbox: {
    padding: theme.spacing(0.5),
  },
  conflictLabel: {
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
  }
}))

type ConflictProps = {
  stepId: string,
  conflictIndex: number,
  conflict: OperationType,
  undone: boolean,
}

export const Conflict = ({
  stepId,
  conflictIndex,
  conflict,
  undone,
}: ConflictProps) => {
  const classes = useConflictStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const hasRelatedChangesSelector = useRef(createHasRelatedChangesSelector(stepId, conflictIndex)).current
  const hasRelatedChanges = useJobSetEditorSelector(hasRelatedChangesSelector)
  const disabled = undone || hasRelatedChanges
  return (
    <FormControlLabel
      label={conflict.conflictName}
      disabled={disabled}
      classes={{
        root: classes.conflictLabel,
        label: classes.smallFont
      }}
      control={(
        <Checkbox
          size='small'
          checked={conflict.conflictApplied}
          className={classes.checkbox}
          onChange={e => {
            if (e.target.checked) {
              editorDispatch(applyConflict(stepId, conflictIndex))
            } else {
              editorDispatch(unApplyConflict(stepId, conflictIndex))
            }
          }}
        />
      )}
    />
  )
}

const useConflictsStyles = makeStyles(theme => createStyles({
  conflicts: {
    paddingLeft: theme.spacing(1),
  }
}))

type ConflictsProps = {
  stepId: string,
  conflicts: OperationType[],
  undone: boolean,
}

export const Conflicts = ({
  stepId,
  conflicts,
  undone
}: ConflictsProps) => {
  const classes = useConflictsStyles()
  return (
    <FormControl variant='outlined' component="fieldset" fullWidth className={classes.conflicts}>
      <FormLabel component="legend" focused disabled={undone}>Conflicts</FormLabel>
      <FormGroup>
        {conflicts.map((c: OperationType, index: number) => (
          <Conflict
            key={`${stepId}-${index}`}
            stepId={stepId}
            conflict={c}
            conflictIndex={index}
            undone={undone}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}