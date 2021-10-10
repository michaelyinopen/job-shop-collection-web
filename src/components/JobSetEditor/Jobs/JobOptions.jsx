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
  fieldEditableSelector,
  createJobTitleSelector,
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
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const jobTitle = useJobSetEditorSelector(createJobTitleSelector(id))
  const jobColor = useJobSetEditorSelector(createJobColorSelector(id))
  const jobTextColor = useJobSetEditorSelector(createJobTextColorSelector(id))

  const editorDispatch = useJobSetEditorDispatch()
  return (
    <div className={classes.popperRoot}>
      <Typography variant='h6' gutterBottom>
        Job
        <span
          className={classes.jobTitleColorBox}
          style={{ backgroundColor: jobColor, color: jobTextColor }}
        >
          {jobTitle}
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
        {editable && (
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