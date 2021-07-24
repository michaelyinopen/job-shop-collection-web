import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { theme } from '../styles'

export const ThemeDecorator = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}