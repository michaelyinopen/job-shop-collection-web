import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(1),
    height: "100%"
  },
  backButton: {
    margin: theme.spacing(2),
  }
}));

const PageNotFound = ({ history }) => {
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <h1>Page not found</h1>
      <p>Sorry. The path does not link to any page.</p>
      <Fab
        onClick={() => history.goBack()}
        variant="extended"
        size="medium"
        color="primary"
        className={classes.backButton}
      >
        Back
      </Fab>
    </Container>
  )
};

export default PageNotFound;