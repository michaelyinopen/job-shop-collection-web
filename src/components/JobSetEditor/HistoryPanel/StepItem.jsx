import { memo, useRef, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Paper,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  useJobSetEditorSelector,
  createStepDoneStatusSelector,
  createStepSelector,
  useJobSetEditorDispatch,
  jumpToStep,
  setMergeBehaviourDiscardLocal,
  setMergeBehaviourMerge,
} from '../store'
import { Conflicts } from './Conflicts'

const useNormalStepItemStyles = makeStyles(theme => createStyles({
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
  const classes = useNormalStepItemStyles()
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

const useVersionedStepItemStyles = makeStyles(theme => createStyles({
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
  },
  iconButton: {
    padding: theme.spacing(1),
  },
  mergeOptions: {
    paddingLeft: theme.spacing(2),
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  expandMore: {
    transition: `transform ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    transform: 'rotate(0deg)',
  },
  expandLess: {
    transition: `transform ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    transform: 'rotate(180deg)',
  },
  radioButton: {
    padding: theme.spacing(0.5),
  },
  smallFont: {
    fontSize: '0.875rem',
  }
}))

const VersionedStepItem = ({ step, isCurrent, undone }) => {
  const classes = useVersionedStepItemStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const [expand, setExpand] = useState(false)

  const showMergeOptions = useMemo(
    () => step.operations.some(op => op.type === 'reverse local' || op.type === 'conflict'),
    [step.operations]
  )
  const conflicts = useMemo(
    () => step.mergeBehaviour !== 'merge'
      ? []
      : step.operations.filter(op => op.type === 'conflict'),
    [step.mergeBehaviour, step.operations]
  )

  return (
    <>
      <ListItem
        button
        divider={!expand}
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
        {showMergeOptions && (
          <ListItemSecondaryAction>
            <IconButton
              className={classes.iconButton}
              onClick={() => {
                setExpand(!expand)
              }}
            >
              <ExpandMoreIcon
                className={clsx({
                  [classes.expandMore]: !expand,
                  [classes.expandLess]: expand,
                })}
              />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <Paper
          square
          elevation={0}
          className={classes.mergeOptions}
        >
          <RadioGroup
            size='small'
            value={step.mergeBehaviour}
            disabled={!isCurrent}
            onChange={e => {
              if (e.target.value === 'discard local changes') {
                editorDispatch(setMergeBehaviourDiscardLocal(step.id))
              }
              else if (e.target.value === 'merge') {
                editorDispatch(setMergeBehaviourMerge(step.id))
              }
            }}
          >
            <FormControlLabel
              value='discard local changes'
              label="Discard local changes"
              disabled={!isCurrent}
              control={<Radio size='small' className={classes.radioButton} />}
              classes={{
                label: classes.smallFont
              }}
            />
            <FormControlLabel
              value='merge'
              label={'Merge' + (conflicts.length !== 0 ? '*' : '')}
              disabled={!isCurrent}
              control={<Radio size='small' className={classes.radioButton} />}
              classes={{
                label: classes.smallFont
              }}
            />
          </RadioGroup>
          <Collapse in={conflicts.length !== 0} timeout="auto" unmountOnExit>
            <Conflicts
              stepId={step.id}
              conflicts={conflicts}
              undone={undone}
            />
          </Collapse>
        </Paper>
      </Collapse>
    </>
  )
}

export const StepItem = memo(({ id }) => {
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
})
