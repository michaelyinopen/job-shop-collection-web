
import { Provider } from 'react-redux'
import { store } from './store'

import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { theme } from './styles'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { routePaths } from './route'

import { Layout } from './components/Layout'
import { Home } from './components/Home'
import { About } from './components/About'
import { JobSets } from './components/JobSets'
import { JobSetEditor } from './components/JobSetEditor'
import { PageNotFound } from './components/PageNotFound'

import { AppSnackbar, NotificationDrawer } from './notifications'

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
              <Route exact path={routePaths.jobSets} component={JobSets} />
              <Route exact path={routePaths.jobSetEditor}
                render={({ match }) => (
                  <JobSetEditor
                    key={match.params.id}
                    id={match.params.id}
                    edit={Boolean(match.params.edit)}
                  />
                )}
              />
              <Route component={PageNotFound} />
            </Switch>
            <AppSnackbar />
            <NotificationDrawer />
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
