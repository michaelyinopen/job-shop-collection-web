import { useRef } from 'react'
import {
  makeStyles,
  createStyles,
  Typography,
  Tooltip,
  IconButton,
} from '@material-ui/core'
import AutorenewIcon from '@material-ui/icons/Autorenew'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIsEditSelector,
  createJobColorSelector,
  createJobTextColorSelector,
  changeJobColor,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  popperRoot: {
    padding: "10px 20px"
  },
  jobTitleColorBox: {
    display: 'inline',
    padding: "0 4px",
    margin: "0 2px",
    borderRadius: "4px",
  },
  colorTitle: {
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1)
  },
  colorOptionsRoot: {
    display: "inline-flex",
    alignItems: "center"
  },
  colorBox: {
    display: "block",
    borderRadius: 5,
    padding: "0 20px",
    backgroundClip: "border-box",
    fontFamily: "monospace, monospace"
  },
  changeJobColorButton: {
    padding: 5,
    width: 34,
    height: 34,
  },
}))

export const JobOptions = ({ id }) => {
  const classes = useStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const jobColorSelector = useRef(createJobColorSelector(id)).current
  const jobColor = useJobSetEditorSelector(jobColorSelector)
  const jobTextColorSelector = useRef(createJobTextColorSelector(id)).current
  const jobTextColor = useJobSetEditorSelector(jobTextColorSelector)

  const editorDispatch = useJobSetEditorDispatch()
  return (
    <div className={classes.popperRoot}>
      <Typography variant='h6' gutterBottom>
        Job
        <span
          className={classes.jobTitleColorBox}
          style={{ backgroundColor: jobColor, color: jobTextColor }}
        >
          {id}
        </span>
        Options
      </Typography>
      <div className={classes.colorTitle}>
        Color
      </div>
      <div className={classes.colorOptionsRoot}>
        <div
          className={classes.colorBox}
          style={{ backgroundColor: jobColor, color: jobTextColor, }}
        >
          background: {jobColor}<br />
          foreground: {jobTextColor}
        </div>
        {isEdit && (
          <Tooltip title="Change color">
            <IconButton
              onClick={() => { editorDispatch(changeJobColor(id)) }}
              className={classes.changeJobColorButton}
            >
              <AutorenewIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  )
}