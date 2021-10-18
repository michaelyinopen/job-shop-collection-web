import { useRef } from 'react'
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
  createStepSelector,
  createStepDoneStatusSelector,
  useJobSetEditorDispatch,
  jumpToStep,
} from '../store'
import { useSelector } from 'react-redux'

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

const VersionedStepItem = (props) => {
  return <NormalStepItem {...props} />
}

{/* <ListItem
button
divider
disableGutters
className={classes.undoneStep}
onClick={() => { }}
>
<ListItemText primary={'Edit maximum view duration'} />
</ListItem>
<ListItem
button
divider
disableGutters
className={classes.currentStep}
onClick={() => { }}
>
<ListItemText primary={'Edit minimum view duration'} />
</ListItem>
<ListItem
button
divider
disableGutters
className={classes.step}
onClick={() => { }}
>
<ListItemText primary={'Edit minimum view duration'} />
</ListItem> */}



export const StepItem = ({ id }) => {
  const stepSelector = useRef(createStepSelector(id)).current
  const step = useJobSetEditorSelector(stepSelector)
  const stepDoneStatusSelector = useRef(createStepDoneStatusSelector(id)).current
  const stepDoneStatus = useJobSetEditorSelector(stepDoneStatusSelector)
  if (!step?.versionToken) {
    return (
      <NormalStepItem
        step={step}
        isCurrent={stepDoneStatus === 'current'}
        undone={stepDoneStatus === 'undone'}
      />
    )
  }
  else {
    return (
      <VersionedStepItem
        step={step}
        isCurrent={stepDoneStatus === 'current'}
        undone={stepDoneStatus === 'undone'}
      />
    )
  }
}
