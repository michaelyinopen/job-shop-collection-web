import { useState } from 'react'
import {
  makeStyles,
  createStyles,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  List,
  ListItem,
  ListItemText,
  lighten,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { msToFormattedTime } from '../../../utility'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  createMachineTitleSelector,
  createProceduresAffectedByMachineSelector,
  removeMachine,
  createJobTitleSelector,
  createProcedureIndexSelector,
} from '../store'

const ProcedureListItemText = ({ procedure }) => {
  const jobTitle = useJobSetEditorSelector(createJobTitleSelector(procedure.jobId))
  const procedureIndex = useJobSetEditorSelector(createProcedureIndexSelector(procedure.jobId, procedure.id))
  const sequence = procedureIndex + 1
  return (
    <ListItemText
      primary={`Job ${jobTitle}, sequence ${sequence}, time: ${msToFormattedTime(procedure.processingTimeMs)}`}
    />
  )
}

const useRemoveMachineDialogContentStyles = makeStyles(theme => createStyles({
  dialogContent: {
    backgroundColor: lighten(theme.palette.primary.light, 0.8)
  },
  expansionPanel: {
    marginTop: theme.spacing(1)
  },
  expansionPanelDetails: {
    padding: 0
  },
  list: {
    padding: 0,
    '& > *': {
      '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`
      }
    }
  }
}))

const RemoveMachineDialogContent = ({ id, machineTitle, closeCallback }) => {
  const classes = useRemoveMachineDialogContentStyles()

  const proceduresAffectedByMachine =
    useJobSetEditorSelector(createProceduresAffectedByMachineSelector(id))

  const editorDispatch = useJobSetEditorDispatch()
  const confirmCallback = () => {
    editorDispatch(removeMachine(id))
    closeCallback()
  }
  return (
    <>
      <DialogTitle>{machineTitle ? `Remove machine ${machineTitle}?` : "Remove this machine?"}</DialogTitle>
      {!!proceduresAffectedByMachine.length && (
        <DialogContent className={classes.dialogContent}>
          Removing {machineTitle} will clear the machine selection of {proceduresAffectedByMachine.length} procedures.
          <ExpansionPanel defaultExpanded className={classes.expansionPanel}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              Affected procedures
            </ExpansionPanelSummary>
            <Divider />
            <ExpansionPanelDetails className={classes.expansionPanelDetails}>
              <List dense className={classes.list}>
                {proceduresAffectedByMachine.map(p => (
                  <ListItem key={p.id}>
                    <ProcedureListItemText procedure={p} />
                  </ListItem>
                ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </DialogContent >
      )}
      <DialogActions>
        <Button onClick={closeCallback} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={confirmCallback} variant="contained" color="primary" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </>
  )
}

export const RemoveMachineButton = ({ id }) => {
  const machineTitle = useJobSetEditorSelector(createMachineTitleSelector(id))
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Tooltip
        title={machineTitle ? `Remove machine ${machineTitle}` : "Remove this machine"}
        placement="right-end"
      >
        <IconButton onClick={() => setOpen(true)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableScrollLock
      >
        {open && (
          <RemoveMachineDialogContent
            id={id}
            machineTitle={machineTitle}
            closeCallback={() => setOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}