import { useJobSetEditorSelector } from './store'

export const OnlyInDevelopment = (Component) => () => {
  if (process.env.NODE_ENV === 'development') {
    return <Component />
  }
  return null
}

export const JobSetEditorState = OnlyInDevelopment(() => {
  const jobSetEditorState = useJobSetEditorSelector(state => state)
  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(jobSetEditorState, null, 2)}</pre>
  )
})