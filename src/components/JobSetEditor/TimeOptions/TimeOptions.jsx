import {
  makeStyles,
  createStyles,
  Typography,
  TextField,
  InputAdornment,
} from '@material-ui/core'
import { AutomaticTimeOptions } from './AutomaticTimeOptions'

const useStyles = makeStyles(theme => createStyles({
  section: {
    marginBottom: theme.spacing(2),
  },
  content: {
    marginLeft: theme.spacing(2),
  },
}))

export const TimeOptions = () => {
  const classes = useStyles()
  return (
    <section className={classes.section}>
      <Typography variant='h4' gutterBottom>
        Time Options
      </Typography>
      <AutomaticTimeOptions />
      {/* <br />
      <TimeInputField
        label="Maximum Time"
        value={msToFormattedTime(maxTimeFromRef)}
        onChange={dispatchSetMaxTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="View Start Time"
        value={msToFormattedTime(viewStartTimeFromRef)}
        onChange={dispatchSetViewStartTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="View End Time"
        value={msToFormattedTime(viewEndTimeFromRef)}
        onChange={dispatchSetViewEndTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="Minimun View Duration"
        value={msToFormattedTime(minViewDuration)}
        onChange={dispatchSetMinViewDuration}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="Maximun View Duration"
        value={msToFormattedTime(maxViewDuration)}
        onChange={dispatchSetMaxViewDuration}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      /> */}
    </section >
  )
}