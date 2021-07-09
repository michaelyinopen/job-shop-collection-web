
import { Provider } from 'react-redux'
import { store } from './store'

import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { theme } from './styles'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { routePaths } from './route'

import { Layout } from './components/Layout'
import { Home } from './components/Home'
import { About } from './components/About'
import { PageNotFound } from './components/PageNotFound'

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Switch>
              <Route exact path={routePaths.home} component={Home} />
              <Route exact path={routePaths.about} component={About} />
              <Route component={PageNotFound} />
            </Switch>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
