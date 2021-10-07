import { useState } from 'react'
import {
  makeStyles,
  createStyles,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import {
  useJobSetEditorDispatch,
  deleteProcedure,
} from '../store'

const DeleteProcedureDialogContent = ({ jobId, id, closeCallback }) => {
  const editorDispatch = useJobSetEditorDispatch()
  const confirmCallback = () => {
    editorDispatch(deleteProcedure(jobId, id))
    closeCallback()
  }
  return (
    <>
      <DialogTitle>{`Delete Procedure?`}</DialogTitle>
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

const useDeleteProcedureButtonStyles = makeStyles(theme => createStyles({
  lightShadow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    boxShadow: "0 0 8px 8px rgba(255, 255, 255, 0.4)",
  }
}))

export const DeleteProcedureButton = ({ jobId, id }) => {
  const classes = useDeleteProcedureButtonStyles()
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Tooltip
        title={`Delete Procedure`}
        placement="right-end"
      >
        <IconButton onClick={() => setOpen(true)}>
          <div className={classes.lightShadow}>
            <DeleteIcon />
          </div>
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableScrollLock
      >
        {open && (
          <DeleteProcedureDialogContent
            jobId={jobId}
            id={id}
            closeCallback={() => setOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}