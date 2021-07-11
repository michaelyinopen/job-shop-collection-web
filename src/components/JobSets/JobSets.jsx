import { useEffect } from "react"
import { useAppDispatch, useAppSelector, jobSetIdsSelector } from '../../store'
import { getJobSets } from './store'

export const JobSets = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(getJobSets())
  }, [dispatch])

  const jobSetIds = useAppSelector(jobSetIdsSelector)

  return (
    <div>
      <h1>JobSets Page</h1>
      <div>{JSON.stringify(jobSetIds)}</div>
    </div>
  )
}