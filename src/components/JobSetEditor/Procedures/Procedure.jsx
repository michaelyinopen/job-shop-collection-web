import { memo, useRef } from 'react'
import {
  makeStyles,
  createStyles,
  TextField,
  Tooltip,
  MenuItem,
  InputAdornment,
  NativeSelect,
} from '@material-ui/core'
import TimeField from 'react-simple-timefield'
import { msToFormattedTime, formattedTimeToMs } from '../../../utility'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIsEditSelector,
  createProcedureJobIdSelector,
  createProcedureSequenceSelector,
  createProcedureProcessingTimeMsSelector,
  createJobColorSelector,
  createProcedureMachineIdSelector,
  machinesSelector,
  setProcedureMachineId,
  setProcedureProcessingTime,
} from '../store'
import { DeleteProcedureButton } from './DeleteProcedureButton'

const useProcedureMachineStyles = makeStyles(theme => createStyles({
  procedureMachineRoot: {
    display: "flex",
    alignItems: "center",
  },
  machineLabel: {
    verticalAlign: "top",
    paddingRight: 0,
    color: "black",
    backgroundColor: "white",
    minWidth: 0,
    paddingLeft: theme.spacing(1)
  },
  machineLabelTextField: {
    width: theme.spacing(24)
  },
  emptyMenuItemText: {
    color: theme.palette.text.hint,
    fontStyle: 'italic'
  },
  machineLabelSeparator: {
    position: "relative",
    width: theme.spacing(4),
    alignSelf: "stretch",
    overflow: "hidden",
    marginRight: theme.spacing(1),
    '&:after': {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      display: "block",
      width: 0,
      height: 0,
      borderBottom: `${theme.spacing(9)}px solid transparent`,
      borderLeft: `${theme.spacing(4)}px solid white`,
    }
  },
}))

const ProcedureMachine = ({ id }) => {
  const classes = useProcedureMachineStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const machines = useJobSetEditorSelector(machinesSelector)
  const procedureMachineIdSelector = useRef(createProcedureMachineIdSelector(id)).current
  const procedureMachineId = useJobSetEditorSelector(procedureMachineIdSelector)
  const editorDispatch = useJobSetEditorDispatch()

  return (
    <div className={classes.procedureMachineRoot}>
      <div className={classes.machineLabel}>
        <TextField
          label="Machine"
          select
          value={procedureMachineId ?? ""}
          onFocus={() => { }/*todo */}
          onChange={e => {
            const machineIdValue = e.target.value === ""
              ? null
              : e.target.value ?? null
            editorDispatch(setProcedureMachineId(id, machineIdValue))
          }}
          error={false/*todo */}
          required
          size='small'
          variant="outlined"
          margin="dense"
          className={classes.machineLabelTextField}
          inputProps={{
            readOnly: !isEdit
          }}
        >
          <MenuItem value="">
            <div className={classes.emptyMenuItemText}>(empty)</div>
          </MenuItem>
          {machines.map(m => (
            <MenuItem key={m.id} value={m.id}>
              <Tooltip title={m.description ? m.description : ""} placement="right">
                <div style={{ width: "100%" }}>{m.title}</div>
              </Tooltip>
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className={classes.machineLabelSeparator} />
    </div >
  )
}

const useProcessingTimeStyles = makeStyles(theme => createStyles({
  wrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    boxShadow: "0 0 8px 8px rgba(255, 255, 255, 0.4)",
    marginRight: theme.spacing(2),
    width: '12rem',
  }
}))

const ProcedureProcessingTime = ({ id }) => {
  const classes = useProcessingTimeStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const procedureProcessingTimeMsSelector = useRef(createProcedureProcessingTimeMsSelector(id)).current
  const valueMs = useJobSetEditorSelector(procedureProcessingTimeMsSelector)
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <div className={classes.wrapper}>
      <TimeField
        showSeconds
        value={msToFormattedTime(valueMs)}
        onChange={(_e, valueFormattedTime) => editorDispatch(setProcedureProcessingTime(id, formattedTimeToMs(valueFormattedTime)))}
        onFocus={() => { }/*todo */}
        input={
          <TextField
            label='Time'
            error={false/*todo */}
            required
            size='small'
            margin="dense"
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">hh:mm:ss</InputAdornment>,
              readOnly: !isEdit
            }}
          />
        }
      />
    </div>
  )
}

const useProcedureStyles = makeStyles(theme => createStyles({
  procedure: {
    boxShadow: theme.shadows[3],
    marginBottom: 2,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  machineAndTime: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    '& > *': {
      '&:not(:last-child)': {
        marginRight: theme.spacing(1)
      }
    }
  },
  sequeneAndActions: {
    height: "48px",
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    flexShrink: 0,
    '& > *': {
      '&:not(:last-child)': {
        marginRight: theme.spacing(1)
      }
    }
  },
  sequenceLabel: {
    marginTop: "auto",
    marginRight: theme.spacing(1.5),
    marginBottom: "auto",
    marginLeft: theme.spacing(1.5),
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: "black",
    background: "white",
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[1],
    textAlign: "center",
  },
  separator: { flexGrow: 1 },
}))

export const Procedure = memo(({ id }) => {
  const classes = useProcedureStyles()
  const opacity = 1// todo drragging: 0.4

  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const procedureJobIdSelector = useRef(createProcedureJobIdSelector(id)).current
  const jobId = useJobSetEditorSelector(procedureJobIdSelector)

  const jobColorSelector = useRef(createJobColorSelector(jobId)).current
  const jobColor = useJobSetEditorSelector(jobColorSelector)

  const procedureSequenceSelector = useRef(createProcedureSequenceSelector(id)).current
  const sequence = useJobSetEditorSelector(procedureSequenceSelector)

  return (
    <div
      className={classes.procedure}
      style={{ opacity, backgroundColor: jobColor }}
    >
      <div className={classes.machineAndTime}>
        <ProcedureMachine id={id} />
        <ProcedureProcessingTime id={id} />
      </div>
      <div className={classes.sequeneAndActions}>
        <div className={classes.sequenceLabel}>
          {sequence}
        </ div>
        <div className={classes.separator} />
        {isEdit && <DeleteProcedureButton id={id} />}
      </div>
    </div>
  )
})