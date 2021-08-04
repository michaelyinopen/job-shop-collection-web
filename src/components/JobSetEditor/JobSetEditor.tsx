import { useRef, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import {
  useAppDispatch,
  useAppSelector,
  createJobSetSelector
} from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
import { JobSetsPageContainer } from '../../styles'
import { getJobSetTakingThunkAction } from '../JobSets'

type JobSetEditorProps = {
  id: number
  edit: boolean
}

export const JobSetEditor: FunctionComponent<JobSetEditorProps> = ({ id, edit }) => {
  console.log({ id, edit })
  const dispatch = useAppDispatch()
  const callback = useRef(() => {
    dispatch(getJobSetTakingThunkAction(1))
      .then(result => {
        if (result?.kind === 'failure') {
          dispatch(addNotification({
            summary: `Load Job Set ${1} Failed`,
            matchPath: routePaths.jobSets
          }))
        }
      })
      .catch(() => {
        dispatch(addNotification({
          summary: `Load Job Set ${1} Failed`,
          matchPath: routePaths.jobSets
        }))
      })
  }).current

  useEffect(() => {
    callback()
  }, [callback])

  const jobSet = useAppSelector(createJobSetSelector(1))
  return (
    <JobSetsPageContainer>
      JobSet
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(jobSet, null, 2)}</pre>
    </JobSetsPageContainer>
  )
}