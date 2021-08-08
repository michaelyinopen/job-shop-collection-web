import {
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
  ListItemText
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

export const RemoveMachineButton = ({ id }) => {
  return (
    <div>
      <Tooltip title={'remove'} placement="right-end">
        <IconButton onClick={() => { }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  )
}