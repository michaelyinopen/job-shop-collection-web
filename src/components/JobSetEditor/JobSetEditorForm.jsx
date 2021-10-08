import { memo } from 'react'
import { Title } from './Title'
import { Description } from './Description'
import { Machines } from './Machines'
import { Jobs } from './Jobs'
import { TimeOptions } from './TimeOptions'

export const JobSetEditorForm = memo(() => {
  // const disabled = isLoading || isReadonly
  return (
    <div>
      <Title />
      <Description />
      <Machines />
      <Jobs />
      <TimeOptions />
    </div>
  )
})