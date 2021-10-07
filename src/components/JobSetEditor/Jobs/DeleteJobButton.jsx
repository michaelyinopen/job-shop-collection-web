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
  useJobSetEditorSelector,
  createJobTitleSelector,
  deleteJob,
} from '../store'

const DeleteJobDialogContent = ({ id, jobTitle, closeCallback }) => {
  const editorDispatch = useJobSetEditorDispatch()
  const confirmCallback = () => {
    editorDispatch(deleteJob(id))
    closeCallback()
  }
  return (
    <>
      <DialogTitle>{`Delete Job ${jobTitle}?`}</DialogTitle>
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
  const jobTitle = useJobSetEditorSelector(createJobTitleSelector(id))
  return (
    <div>
      <Tooltip
        title={`Delete Job ${jobTitle}`}
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
          <DeleteJobDialogContent
            id={id}
            jobTitle={jobTitle}
            closeCallback={() => setOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}