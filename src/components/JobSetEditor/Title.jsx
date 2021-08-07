import {
  makeStyles,
  createStyles,
  TextField,
  InputAdornment, //todo remove
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  useJobSetEditorDispatch,
  jobSetsEditorIsEditSelector,
  titleSelector,
  setTitle,
} from './store'

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'block',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: "400px",
  },
}))

export const Title = () => {
  const classes = useStyles()
  //const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isEdit = true //todo remvoe
  const value = useJobSetEditorSelector(titleSelector)
  console.log({ value })
  const editorDispatch = useJobSetEditorDispatch()
  //todo errorSelector
  return (
    <TextField
      label="Title"
      value={value}
      onFocus={() => { }/*todo */}
      onChange={e => editorDispatch(setTitle(e.target.value))}
      required
      size='small'
      error={false/*todo */}
      variant="filled"
      margin="dense"
      fullWidth
      classes={{
        root: classes.root
      }}
      inputProps={{
        maxLength: 50,
        ...(!isEdit ? { readOnly: true } : {}),
      }}
      InputProps={(value.length >= 40
        ? {
          endAdornment: (
            <InputAdornment position="end">
              {`${value.length}/50`}
            </InputAdornment>
          )
        }
        : {}
      )
      }
    />
  )
}
