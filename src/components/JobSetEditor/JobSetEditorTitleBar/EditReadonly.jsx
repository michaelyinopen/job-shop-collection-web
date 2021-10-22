import { useHistory, generatePath } from 'react-router-dom'
import {
  makeStyles,
  createStyles,
  Paper,
  Tooltip,
} from '@material-ui/core'
import {
  ToggleButtonGroup,
  ToggleButton,
} from '@material-ui/lab'
import EditIcon from '@material-ui/icons/Edit'
import LockIcon from '@material-ui/icons/Lock'
import { Icon as IconifyIcon } from "@iconify/react"
import pencilOffOutline from '@iconify/icons-mdi/pencil-off-outline'
import { routePaths } from '../../../route'
import {
  useJobSetEditorSelector,
  jobSetsEditorIsEditSelector,
  jobSetsEditorIsLockedSelector,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  icon: {
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  grouped: {
    margin: theme.spacing(0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: "50%",
    },
    '&:first-child': {
      borderRadius: "50%",
      borderLeft: "1px solid transparent"
    },
  },
  groupContainer: {
    display: 'flex',
    border: `1px solid ${theme.palette.divider}`,
    flexWrap: 'wrap'
  },
  toggleButtonRoot: {
    color: theme.palette.grey[600]
  }
}))

export const EditReadonly = ({ id }) => {
  const classes = useStyles()
  const history = useHistory()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isLocked = useJobSetEditorSelector(jobSetsEditorIsLockedSelector)
  if (isLocked) {
    return (
      <Paper elevation={0} className={classes.groupContainer}>
        <Tooltip title="Locked" placement="bottom-end">
          <ToggleButtonGroup
            value={true}
            classes={{
              grouped: classes.grouped
            }}
          >
            <ToggleButton classes={{ root: classes.toggleButtonRoot }} value={true} disabled>
              <LockIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>
      </Paper >
    )
  }
  return (
    <Paper elevation={0} className={classes.groupContainer}>
      <ToggleButtonGroup
        value={isEdit}
        exclusive
        classes={{
          grouped: classes.grouped
        }}
        onChange={(e, isEditValue) => {
          if (!isEdit && isEditValue === true) {
            history.push(generatePath(routePaths.jobSetEditor, { id, edit: "edit" }))
          }
          if (isEdit && isEditValue === false) {
            history.push(generatePath(routePaths.jobSetEditor, { id }))
          }
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <ToggleButton classes={{ root: classes.toggleButtonRoot }} value={true}>
          <Tooltip title="Edit" placement="bottom-end">
            <EditIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton classes={{ root: classes.toggleButtonRoot }} value={false}>
          <Tooltip title="Read-only" placement="bottom-end">
            <div className={classes.icon}>
              <IconifyIcon icon={pencilOffOutline} />
            </div>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper >
  )
}