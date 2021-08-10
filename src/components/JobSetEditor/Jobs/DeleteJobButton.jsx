import { useState } from 'react'
import {
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
  deleteJob,
} from '../store'

const DeleteJobDialogContent = ({ id, closeCallback }) => {
  const editorDispatch = useJobSetEditorDispatch()
  const confirmCallback = () => {
    editorDispatch(deleteJob(id))
    closeCallback()
  }
  return (
    <>
      <DialogTitle>{`Delete Job ${id}?`}</DialogTitle>
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

export const DeleteJobButton = ({ id }) => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Tooltip
        title={`Delete Job ${id}`}
        placement="right-end"
      >
        <IconButton onClick={() => setOpen(true)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
      >
        {open && (
          <DeleteJobDialogContent
            id={id}
            closeCallback={() => setOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}