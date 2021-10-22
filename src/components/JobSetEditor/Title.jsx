import {
  makeStyles,
  createStyles,
  TextField,
  InputAdornment,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  fieldEditableSelector,
  titleSelector,
  showErrorSelector,
  setTitle,
  focusTitle,
} from './store'

const useStyles = makeStyles(theme => createStyles({
  wrapper: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    maxWidth: 400,
  },
}))

export const Title = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const value = useJobSetEditorSelector(titleSelector)
  const editorDispatch = useJobSetEditorDispatch()
  const showError = useJobSetEditorSelector(showErrorSelector('/title'))
  //todo errorSelector
  return (
    <div className={classes.wrapper}>
      <TextField
        label='Title'
        value={value}
        onFocus={() => {
          if (editable) {
            editorDispatch(focusTitle())
          }
        }}
        onChange={e => editorDispatch(setTitle(e.target.value))}
        error={showError}
        required
        size='small'
        variant='filled'
        margin='dense'
        fullWidth
        inputProps={{
          maxLength: 50,
          readOnly: !editable,
        }}
        InputProps={(value.length >= 40
          ? {
            endAdornment: (
              <InputAdornment position="end">
                {`${value.length}/50`}
              </InputAdornment>
            )
          }
          : undefined
        )}
      />
    </div>
  )
}
