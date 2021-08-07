import { memo } from 'react'
import { Title } from './Title'
import { Description } from './Description'

export const JobSetEditorForm = memo(() => {
  // const disabled = isLoading || isReadonly
  return (
    <div style={{ position: 'relative' }}>
      Form
      <Title />
      <Description />
    </div>
  )
})