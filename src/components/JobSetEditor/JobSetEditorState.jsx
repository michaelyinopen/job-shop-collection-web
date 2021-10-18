import { useJobSetEditorSelector } from './store'

export const OnlyInDevelopment = (Component) => () => {
  console.log({ showEditorState: process.env.REACT_APP_SHOW_EDITOR_STATE })
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_SHOW_EDITOR_STATE) {
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