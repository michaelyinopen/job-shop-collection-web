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
  viewEndTimeMsSelector,
  setViewEndTime,
  focusViewEndTime,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  wrapper: {
    marginRight: theme.spacing(2),
    width: '12rem',
  }
}))

export const ViewEndTime = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const isAuto = useJobSetEditorSelector(isAutoTimeOptionsSelector)
  const valueMs = useJobSetEditorSelector(viewEndTimeMsSelector)
  const editorDispatch = useJobSetEditorDispatch()
  //todo errorSelector
  return (
    <div className={classes.wrapper}>
      <Tooltip
        title={isAuto ? "Automatically set. Change to Manual to edit." : ""}
        placement="right-end"
      >
        <TimeField
          showSeconds
          value={msToFormattedTime(valueMs)}
          onChange={(_e, valueFormattedTime) => editorDispatch(setViewEndTime(formattedTimeToMs(valueFormattedTime)))}
          onFocus={() => {
            if (editable && !isAuto) {
              editorDispatch(focusViewEndTime())
            }
          }}
          input={
            <TextField
              label='View End Time'
              error={false/*todo */}
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