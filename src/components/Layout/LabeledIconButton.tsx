import { memo } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

import type { FunctionComponent, ReactNode } from 'react'
import type { Theme, StyledComponentProps } from '@material-ui/core/styles'
import type { ButtonProps, ButtonClassKey } from '@material-ui/core'
import type { ClassKeyOfStyles } from '@material-ui/styles/withStyles'

const styles = (theme: Theme) => createStyles({
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
})
const useStyles = makeStyles(styles, { name: 'LabeledIconButton' })
type ClassKey = ClassKeyOfStyles<typeof styles> | ButtonClassKey

type OwnProps = {
  icon: ReactNode,
  label: ReactNode
}
type Props = OwnProps & ButtonProps & StyledComponentProps<ClassKey>

export const LabeledIconButton: FunctionComponent<Props> = memo((props) => {
  const {
    icon,
    label,
    ...otherProps
  } = props

  const classes = useStyles(props)

  return (
    <Button
      classes={classes}
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