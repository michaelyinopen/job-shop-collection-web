import {
  makeStyles,
  createStyles,
  Typography,
} from '@material-ui/core'
import { AutomaticTimeOptions } from './AutomaticTimeOptions'
import { MaximumTime } from './MaximumTime'

const useStyles = makeStyles(theme => createStyles({
  section: {
    marginTop: theme.spacing(1),
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
      <Typography variant='h5' gutterBottom>
        Time Options
      </Typography>
      <div className={classes.content}>
        <AutomaticTimeOptions />
        <MaximumTime />
      </div>
    </section >
  )
}