import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { theme } from './styles'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { routePaths } from './route'

import { Layout } from './components/Layout'
import { Home } from './components/Home'
import { PageNotFound } from './components/PageNotFound'


export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path={routePaths.home} component={Home} />
            <Route component={PageNotFound} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
