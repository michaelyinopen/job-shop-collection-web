import {
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

export const AutomaticTimeOptions = () => {
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const value = useJobSetEditorSelector(isAutoTimeOptionsSelector)
  const dispatch = useJobSetEditorDispatch()
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Automatic Time Options</FormLabel>
      <RadioGroup
        value={String(value)}
        onChange={e => dispatch(setIsAutoTimeOptions((e.target.value === 'true')))}
        name="automatic-time-options"
      >
        <FormControlLabel
          value='true'
          control={<Radio />}
          label="Auto"
          {...(isEdit ? {} : { disabled: true })} />
        <FormControlLabel
          value='false'
          control={<Radio />}
          label="Manual"
          {...(isEdit ? {} : { disabled: true })} />
      </RadioGroup>
    </FormControl>
  )
}
