import { useRef, useEffect } from 'react'
import { useAppDispatch } from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
import { getJobSetTakingThunkAction } from '../JobSets'

export const JobSet = () => {
  const dispatch = useAppDispatch()
  const callback = useRef(() => {
    dispatch(getJobSetTakingThunkAction(1))
      .then(result => {
        if (result?.kind === 'failure') {
          dispatch(addNotification({
            summary: "Load Job Sets Failed",
            matchPath: routePaths.jobSets
          }))
        }
      })
      .catch(() => {
        dispatch(addNotification({
          summary: "Load Job Sets Failed",
          matchPath: routePaths.jobSets
        }))
      })
  }, [dispatch]).current

  useEffect(() => {
    callback()
  }, [callback])
  return (
    <div>
      JobSet
    </div>
  )
}