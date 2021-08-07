import { memo } from 'react'
import { Title } from './Title'

export const JobSetEditorForm = memo(() => {
  // const disabled = isLoading || isReadonly
  return (
    <div>
      Form
      <Title />
      <Title />
    </div>
  )
})