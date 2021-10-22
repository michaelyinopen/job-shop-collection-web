import {
  makeStyles,
  createStyles,
  Tooltip,
  TextField,
  InputAdornment,
} from '@material-ui/core'
import TimeField from 'react-simple-timefield'
import { msToFormattedTime, formattedTimeToMs } from '../../../utility'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  fieldEditableSelector,
  isAutoTimeOptionsSelector,
  showErrorSelector,
  maxTimeMsSelector,
  setMaxTime,
  focusMaxTime,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  wrapper: {
    marginRight: theme.spacing(2),
    width: '12rem',
  }
}))

export const MaximumTime = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const isAuto = useJobSetEditorSelector(isAutoTimeOptionsSelector)
  const valueMs = useJobSetEditorSelector(maxTimeMsSelector)
  const editorDispatch = useJobSetEditorDispatch()
  const showError = useJobSetEditorSelector(showErrorSelector('/manualTimeOptions/maxTimeMs'))
  return (
    <div className={classes.wrapper}>
      <Tooltip
        title={isAuto ? "Automatically set. Change to Manual to edit." : ""}
        placement="right-end"
      >
        <TimeField
          showSeconds
          value={msToFormattedTime(valueMs)}
          onChange={(_e, valueFormattedTime) => editorDispatch(setMaxTime(formattedTimeToMs(valueFormattedTime)))}
          onFocus={() => {
            if (editable && !isAuto) {
              editorDispatch(focusMaxTime())
            }
          }}
          input={
            <TextField
              label='Maximun Time'
              error={showError}
              required
              size='small'
              margin="dense"
              variant="outlined"
              disabled={isAuto}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">hh:mm:ss</InputAdornment>,
                readOnly: !editable
              }}
            />
          }
        />
      </Tooltip>
    </div>
  )
}