import { useRef } from 'react'
import { useAppDispatch } from '../../store'
import { addNotification } from '../../notifications'
import { routePaths } from '../../route'
import { getJobSetsTakingThunkAction } from './store'

export const useLoadJobSetsCallback = () => {
  const dispatch = useAppDispatch()
  const callback = useRef(() => {
    dispatch(getJobSetsTakingThunkAction)
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

  return callback
}