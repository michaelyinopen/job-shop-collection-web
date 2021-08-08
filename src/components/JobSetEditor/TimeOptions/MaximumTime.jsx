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
  jobSetsEditorIsEditSelector,
  isAutoTimeOptionsSelector,
  maxTimeMsSelector,
  setMaxTime,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  wrapper: {
    marginRight: theme.spacing(2),
    width: '12rem',
  }
}))

export const MaximumTime = () => {
  const classes = useStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isAuto = useJobSetEditorSelector(isAutoTimeOptionsSelector)
  const valueMs = useJobSetEditorSelector(maxTimeMsSelector)
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
          onChange={(_e, valueFormattedTime) => editorDispatch(setMaxTime(formattedTimeToMs(valueFormattedTime)))}
          onFocus={() => { }/*todo */}
          input={
            <TextField
              label='Maximun Time'
              error={false/*todo */}
              required
              size='small'
              margin="dense"
              variant="outlined"
              disabled={isAuto}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">hh:mm:ss</InputAdornment>,
                readOnly: !isEdit
              }}
            />
          }
        />
      </Tooltip>
    </div>
  )
}