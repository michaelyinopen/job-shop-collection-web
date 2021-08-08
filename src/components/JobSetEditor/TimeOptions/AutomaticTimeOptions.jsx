import {
  makeStyles,
  createStyles,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIsEditSelector,
  isAutoTimeOptionsSelector,
  setIsAutoTimeOptions
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  formControl: {
    marginBottom: theme.spacing(1)
  },
}))

export const AutomaticTimeOptions = () => {
  const classes = useStyles()
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const value = useJobSetEditorSelector(isAutoTimeOptionsSelector)
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">Automatic Time Options</FormLabel>
      <RadioGroup
        value={String(value)}
        onChange={e => editorDispatch(setIsAutoTimeOptions((e.target.value === 'true')))}
        name="automatic-time-options"
      >
        <FormControlLabel
          value='true'
          control={<Radio size='small' />}
          label="Automatic"
          disabled={!isEdit}
        />
        <FormControlLabel
          value='false'
          control={<Radio size='small' />}
          label="Manual"
          disabled={!isEdit}
        />
      </RadioGroup>
    </FormControl>
  )
}
