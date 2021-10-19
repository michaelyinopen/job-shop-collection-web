import { memo, useRef, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  makeStyles,
  createStyles,
  Paper,
  Divider,
  Button,
  Typography,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  FormControl,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  useJobSetEditorSelector,
  createNormalStepSelector,
  createStepDoneStatusSelector,
  createStepSelector,
  useJobSetEditorDispatch,
  jumpToStep,
  setMergeBehaviourDiscardLocal,
  setMergeBehaviourMerge,
} from '../store'

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
  },
  conflicts: {
    paddingLeft: theme.spacing(1),
  },
  conflictLabel: {
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
  }
}))

const VersionedStepItem = ({ normalStep, isCurrent, undone }) => {
  const stepId = normalStep.id
  const [expand, setExpand] = useState(false)
  const classes = useVersionedStepItemStyles()
  const editorDispatch = useJobSetEditorDispatch()
  const step = useJobSetEditorSelector(createStepSelector(stepId))

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
          <RadioGroup size='small' value={step.mergeBehaviour} onChange={e => {
            if (e.target.value === 'discard local changes') {
              editorDispatch(setMergeBehaviourDiscardLocal(stepId))
            }
            else if (e.target.value === 'merge') {
              editorDispatch(setMergeBehaviourMerge(stepId))
            }
          }}>
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
            <FormControl variant='outlined' component="fieldset" fullWidth className={classes.conflicts}>
              <FormLabel component="legend" focused>Conflicts</FormLabel>
              <FormGroup>
                <FormControlLabel
                  label="Gilad Gray"
                  control={<Checkbox size='small' checked={true} onChange={() => { }} />}
                  classes={{
                    root: classes.conflictLabel,
                    label: classes.smallFont
                  }}
                />
                <FormControlLabel
                  label="Jason Killian"
                  control={<Checkbox size='small' checked={true} onChange={() => { }} />}
                  classes={{
                    root: classes.conflictLabel,
                    label: classes.smallFont
                  }}
                />
                <FormControlLabel
                  label="Antoine Llorca"
                  control={<Checkbox size='small' checked={true} onChange={() => { }} />}
                  classes={{
                    root: classes.conflictLabel,
                    label: classes.smallFont
                  }}
                />
                <FormControlLabel
                  label="Edit procedure's machine"
                  control={<Checkbox size='small' checked={true} onChange={() => { }} />}
                  classes={{
                    root: classes.conflictLabel,
                    label: classes.smallFont
                  }}
                />
              </FormGroup>
            </FormControl>
          </Collapse>
        </Paper>
      </Collapse>
    </>
  )
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
