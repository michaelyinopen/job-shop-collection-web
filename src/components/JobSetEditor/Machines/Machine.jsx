import { memo } from 'react'
import {
  makeStyles,
  createStyles,
  Card,
  TextField,
  InputAdornment,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  fieldEditableSelector,
  createMachineTitleSelector,
  createMachineDescriptionSelector,
  setMachineTitle,
  showErrorSelector,
  focusMachineTitle,
  setMachineDescription,
} from '../store'
import { RemoveMachineButton } from './RemoveMachineButton'

const useMachineTitleStyles = makeStyles(theme => createStyles({
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))

const MachineTitle = ({ id }) => {
  const classes = useMachineTitleStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const value = useJobSetEditorSelector(createMachineTitleSelector(id))
  const editorDispatch = useJobSetEditorDispatch()
  const showError = useJobSetEditorSelector(showErrorSelector(`/machines/entities/${id}/title`))
  return (
    <TextField
      label='Title'
      value={value}
      onFocus={() => {
        if (editable) {
          editorDispatch(focusMachineTitle(id))
        }
      }}
      onChange={e => editorDispatch(setMachineTitle(id, e.target.value))}
      error={showError}
      required
      size='small'
      variant='filled'
      margin='dense'
      className={classes.title}
      inputProps={{
        maxLength: 50,
        readOnly: !editable,
      }}
      InputProps={(value?.length >= 40
        ? {
          endAdornment: (
            <InputAdornment position="end">
              {`${value?.length}/50`}
            </InputAdornment>
          )
        }
        : undefined
      )}
    />
  )
}

const useMachineDescriptionStyles = makeStyles(theme => createStyles({
  description: {
    marginRight: theme.spacing(1),
    maxWidth: 320
  },
}))

const MachineDescription = ({ id }) => {
  const classes = useMachineDescriptionStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const value = useJobSetEditorSelector(createMachineDescriptionSelector(id))
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <TextField
      label='Description'
      value={value}
      onChange={e => editorDispatch(setMachineDescription(id, e.target.value))}
      size='small'
      variant='filled'
      margin='dense'
      multiline
      fullWidth
      className={classes.description}
      inputProps={{
        maxLength: 1000,
        readOnly: !editable,
      }}
      InputProps={(value?.length >= 980
        ? {
          endAdornment: (
            <InputAdornment position="end">
              {`${value?.length}/1000`}
            </InputAdornment>
          )
        }
        : undefined
      )}
    />
  )
}

const useMachineStyles = makeStyles(theme => createStyles({
  machineCard: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
    display: "flex",
    alignItems: "baseline",
    maxWidth: 600
  },
  separator: { flexGrow: 1 },
}))

export const Machine = memo(({ id }) => {
  const classes = useMachineStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  return (
    <Card className={classes.machineCard}>
      <MachineTitle id={id} />
      <MachineDescription id={id} />
      <div className={classes.separator} />
      {editable && <RemoveMachineButton id={id} />}
    </Card>
  )
})