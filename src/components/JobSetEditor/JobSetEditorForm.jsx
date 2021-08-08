import { memo } from 'react'
import { Title } from './Title'
import { Description } from './Description'
import { Machines } from './Machines'
import { TimeOptions } from './TimeOptions'

export const JobSetEditorForm = memo(() => {
  // const disabled = isLoading || isReadonly
  return (
    <div>
      Form
      <Title />
      <Description />
      <Machines />
      <TimeOptions />
    </div>
  )
})