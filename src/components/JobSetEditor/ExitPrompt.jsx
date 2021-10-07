import { Prompt } from 'react-router-dom'
import {
  useJobSetEditorSelector,
  jobSetsEditorIsEditSelector,
  jobSetsEditorIdSelector,
} from './store'


export const ExitPrompt = () => {
  const id = useJobSetEditorSelector(jobSetsEditorIdSelector)
  const isNew = id === undefined
  const isEdit = useJobSetEditorSelector(jobSetsEditorIsEditSelector)
  const isCurrentStepSaved = useJobSetEditorSelector(es => es.steps[es.currentStepIndex].saveStatus === 'saved') //todo selector
  const isInitialStep = useJobSetEditorSelector(es => es.currentStepIndex === 0) //todo selector
  const isCurrentStepDiscardLocalChanges = useJobSetEditorSelector(es =>
    es.steps[es.currentStepIndex].mergeBehaviour === 'discard local changes'
    && es.steps[es.currentStepIndex].versionToken === es.versions[es.versions.length - 1]?.versionToken) //todo selector
  const loadedFromRemote = isInitialStep || isCurrentStepDiscardLocalChanges
  // todo maybe one bof selector for block exit?
  const condition = isEdit
    && !isCurrentStepSaved
    && (isNew || !loadedFromRemote)
  return (
    <Prompt
      when={condition}
      message={'Exit without saving?\nAll changes will be lost.'}
    />
  )
}