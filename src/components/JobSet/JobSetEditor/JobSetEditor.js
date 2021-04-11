import React, { useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';
import Title from './Title';
import Description from './Description';
import Machines from './Machines';
import Jobs from './Jobs';
import TimeOptions from './TimeOptions';
// import JsonEditor from './JsonEditor';
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import TitleRow from './TitleRow';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    minHeight: "100%",
    position: "relative",
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  }
}));

const JobSetEditor = ({
  id
}) => {
  const classes = useStyles();
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const openJsonEditorCallback = useCallback(
    () => setIsJsonEditorOpen(true),
    []
  );
  const closeJsonEditorCallback = useCallback(
    () => setIsJsonEditorOpen(false),
    []
  );

  const form = (
    <Container
      component="form"
      className={classes.container}
    >
      <TitleRow
        id={id}
        isJsonEditorOpen={isJsonEditorOpen}
        openJsonEditorCallback={openJsonEditorCallback}
        closeJsonEditorCallback={closeJsonEditorCallback}
      />
      <Title />
      <Description />
      <Machines />
      <Jobs />
      <TimeOptions />
    </Container>
  );
  if (isJsonEditorOpen) {
    return (
      <SplitterLayout primaryIndex={1}>
        {form}
        {isJsonEditorOpen ? null/*<JsonEditor closeJsonEditorCallback={closeJsonEditorCallback} />*/ : null}
      </SplitterLayout >
    );
  }
  return form;
};

export default JobSetEditor;