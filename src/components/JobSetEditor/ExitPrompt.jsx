import { Prompt } from 'react-router-dom'
import {
  useJobSetEditorSelector,
  promptExitWhenSavingSelector,
} from './store'


export const ExitPrompt = () => {
  const condition = useJobSetEditorSelector(promptExitWhenSavingSelector)
  return (
    <Prompt
      when={condition}
      message={'Exit without saving?\nAll changes will be lost.'}
    />
  )
}