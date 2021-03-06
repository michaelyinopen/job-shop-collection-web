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
  descriptionSelector,
  setDescription,
} from './store'

const useStyles = makeStyles(theme => createStyles({
  wrapper: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    maxWidth: 600,
  },
}))

export const Description = () => {
  const classes = useStyles()
  const editable = useJobSetEditorSelector(fieldEditableSelector)
  const value = useJobSetEditorSelector(descriptionSelector)
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <div className={classes.wrapper}>
      <TextField
        label='Description'
        value={value}
        onChange={e => editorDispatch(setDescription(e.target.value))}
        size='small'
        variant='filled'
        margin='dense'
        multiline
        fullWidth
        inputProps={{
          maxLength: 1000,
          readOnly: !editable,
        }}
        InputProps={(value.length >= 980
          ? {
            endAdornment: (
              <InputAdornment position="end">
                {`${value.length}/1000`}
              </InputAdornment>
            )
          }
          : undefined
        )}
      />
    </div>
  )
}
