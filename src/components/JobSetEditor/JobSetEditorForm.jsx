import { memo } from 'react'
import { connect } from 'react-redux'
import { Title } from './Title'
import { Description } from './Description'
import { Machines } from './Machines'
import { Jobs } from './Jobs'
import { TimeOptions } from './TimeOptions'
import {
  useJobSetEditorSelector,
  showDetailSelector
} from './store'

export const JobSetEditorForm = connect()(memo(
  () => {
    const showDetail = useJobSetEditorSelector(showDetailSelector)
    return (
      <div>
        <Title />
        <Description />
        {showDetail && (
          <>
            <Machines />
            <Jobs />
            <TimeOptions />
          </>
        )}
      </div>
    )
  }
))