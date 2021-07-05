import { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingLeft: 0,
    paddingBottom: theme.spacing(1),
    paddingRight: 0,
    minWidth: 80,
    maxWidth: 168,
    flex: '1',
    color: 'inherit',
    borderColor: 'currentColor',
  },
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'column',
    fontSize: 12,
  }
}))

export const LabeledIconButton = memo((props) => {
  const {
    icon,
    label,
    ...otherProps
  } = props

  const classes = useStyles(props)

  return (
    <Button
      classes={{
        root: classes.root
      }}
      {...otherProps}
    >
      <span className={classes.wrapper}>
        {icon}
        <span>
          {label}
        </span>
      </span>
    </Button>
  )
})