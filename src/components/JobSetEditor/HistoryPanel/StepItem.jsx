import { memo, useRef } from 'react'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@material-ui/core'
import {
  useJobSetEditorSelector,
  createNormalStepSelector,
  createStepDoneStatusSelector,
  useJobSetEditorDispatch,
  jumpToStep,
} from '../store'

const useStyles = makeStyles(theme => createStyles({
  step: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  undoneStep: {
    borderLeft: `${theme.spacing(1)}px dotted ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    opacity: 0.5,
  },
  currentStep: {
    borderLeft: `${theme.spacing(1)}px solid ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  }
}))

const NormalStepItem = ({ step, isCurrent, undone }) => {
  const classes = useStyles()
  const editorDispatch = useJobSetEditorDispatch()
  return (
    <ListItem
      button
      divider
      disableGutters
      className={clsx({
        [classes.currentStep]: isCurrent,
        [classes.undoneStep]: undone,
        [classes.step]: !isCurrent && !undone
      })}
      onClick={() => {
        editorDispatch(jumpToStep(step.id))
      }}
    >
      <ListItemText primary={step?.name ?? "\u00a0"} />
    </ListItem>
  )
}

const VersionedStepItem = ({ normalStep, isCurrent, undone }) => {
  // todo
  return null
}

export const StepItem = memo(({ id }) => {
  const normalStepSelector = useRef(createNormalStepSelector(id)).current
  const normalStep = useJobSetEditorSelector(normalStepSelector)
  const stepDoneStatusSelector = useRef(createStepDoneStatusSelector(id)).current
  const stepDoneStatus = useJobSetEditorSelector(stepDoneStatusSelector)
  if (!normalStep?.versionToken) {
    return (
      <NormalStepItem
        step={normalStep}
        isCurrent={stepDoneStatus === 'current'}
        undone={stepDoneStatus === 'undone'}
      />
    )
  }
  else {
    return (
      <VersionedStepItem
        normalStep={normalStep}
        isCurrent={stepDoneStatus === 'current'}
        undone={stepDoneStatus === 'undone'}
      />
    )
  }
})
