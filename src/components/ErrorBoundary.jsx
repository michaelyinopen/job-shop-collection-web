import { Component } from 'react'
import { Typography } from '@material-ui/core'
import { PageContainer } from '../styles/PageContainer'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <PageContainer>
          <Typography variant="h4">Error</Typography>
          <p>Sorry. Something went wrong.</p>
        </PageContainer >
      )
    }

    return this.props.children
  }
}