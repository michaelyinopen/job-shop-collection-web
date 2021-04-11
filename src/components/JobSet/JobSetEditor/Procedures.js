import React from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import { Box, Tooltip } from '@material-ui/core';
import { useProcedureOfJobIds, useReadOnly } from '../store/useSelectors';
import Procedure from './Procedure';
import CreateProcedure from './CreateProcedure';

const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
    overflow: "hidden",
    padding: "8px",
    boxSizing: "borderBox",
    backgroundColor: lighten(theme.palette.primary.light, 0.5)
  },
  header: {
    marginBlockStart: `${theme.spacing(0.5)}px`,
    marginBlockEnd: `${theme.spacing(0.5)}px`,
  },
  list: {
    listStyleType: "none",
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
  },
  countMessage: {
    color: theme.palette.text.hint
  }
}));

const Procedures = React.memo(({
  jobId,
  procedureIds,
  readOnly,
  count
}) => {
  const classes = useStyles();
  const countMessage = count === 0 ? "" : ` (${count})`;
  return (
    <section className={classes.root}>
      <h4 className={classes.header}>
        Job {jobId} Procedures
        <Tooltip title={`${count} Procedures in Job ${jobId}`}><span className={classes.countMessage}>{countMessage}</span></Tooltip>
      </h4>
      {count === 0 ? <Box fontStyle="italic" color="text.hint"> No procedures in job {jobId}</Box> : null}
      <ol className={classes.list}>
        {procedureIds.map(id => <li key={id}><Procedure id={id} /></li>)}
        {!readOnly ? <li key="createProcedure"><CreateProcedure jobId={jobId} /></li> : null}
      </ol>
    </section>
  );
});

const ProceduresContainer = ({
  jobId
}) => {
  const procedureIds = useProcedureOfJobIds(jobId);
  const readOnly = useReadOnly();
  const count = procedureIds.length;
  return (
    <Procedures
      jobId={jobId}
      readOnly={readOnly}
      procedureIds={procedureIds}
      count={count}
    />
  );
};

export default ProceduresContainer;