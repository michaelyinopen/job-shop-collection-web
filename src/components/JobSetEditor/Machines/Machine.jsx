import { useRef } from 'react'
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
  jobSetsEditorIsEditSelector,
  createMachineTitleSelector,
  createMachineDescriptionSelector,
  setMachineTitle,
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
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const machineTitleSelector = useRef(createMachineTitleSelector(id)).current
  const value = useJobSetEditorSelector(machineTitleSelector)
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <TextField
      label='Title'
      value={value}
      onFocus={() => { }/*todo */}
      onChange={e => editorDispatch(setMachineTitle(id, e.target.value))}
      error={false/*todo */}
      required
      size='small'
      variant='filled'
      margin='dense'
      className={classes.title}
      inputProps={{
        maxLength: 50,
        readOnly: !isEdit,
      }}
      InputProps={(value.length >= 40
        ? {
          endAdornment: (
            <InputAdornment position="end">
              {`${value.length}/50`}
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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: 320
  },
}))

const MachineDescription = ({ id }) => {
  const classes = useMachineDescriptionStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const machineDescriptionSelector = useRef(createMachineDescriptionSelector(id)).current
  const value = useJobSetEditorSelector(machineDescriptionSelector)
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
        readOnly: !isEdit,
      }}
      InputProps={(value.length >= 980
        ? {
          endAdornment: (
            <InputAdornment position="end">
              {`${value.length}/1000`}
            </InputAdornment>
          )
        }
        : undefined
      )}
    />
  )
}

const useMachineStyles = makeStyles(theme => createStyles({
  machine: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    margin: theme.spacing(1),
    display: "flex",
    alignItems: "baseline",
    maxWidth: 600
  },
  separator: { flexGrow: 1 },
}))

export const Machine = ({ id }) => {
  const classes = useMachineStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  return (
    <Card className={classes.machine}>
      <MachineTitle id={id} />
      <MachineDescription id={id} />
      <div className={classes.separator} />
      {isEdit && <RemoveMachineButton id={id} />}
    </Card>
  )
}