import {
  makeStyles,
  createStyles,
  TextField,
  InputAdornment,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIsEditSelector,
  titleSelector,
  setTitle,
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
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const value = useJobSetEditorSelector(titleSelector)
  const editorDispatch = useJobSetEditorDispatch()
  //todo errorSelector
  return (
    <div className={classes.wrapper}>
      <TextField
        label='Title'
        value={value}
        onFocus={() => { }/*todo */}
        onChange={e => editorDispatch(setTitle(e.target.value))}
        error={false/*todo */}
        required
        size='small'
        variant='filled'
        margin='dense'
        fullWidth
        inputProps={{
          maxLength: 50,
          readOnly: !isEdit,
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
