import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Tooltip, Box } from '@material-ui/core';
import { useMachineIds, useReadOnly } from '../store/useSelectors';
import AddMachine from './AddMachine';
import Machine from './Machine';

const useStyles = makeStyles(theme => ({
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

const Machines = React.memo(({
  machineIds,
  readOnly,
  count
}) => {
  const classes = useStyles();
  const countMessage = count === 0 ? "" : ` (${count})`;
  return (
    <section>
      <h2>
        Machines
        <Tooltip title={`${count} Machines`}><span className={classes.countMessage}>{countMessage}</span></Tooltip>
      </h2>
      {count === 0 ? <Box fontStyle="italic" color="text.hint"> No machines</Box> : null}
      <ol className={classes.list}>
        {machineIds.map(id => <li key={id}><Machine id={id} /></li>)}
        {!readOnly ? <li key="addMachine"><AddMachine /></li> : null}
      </ol>
    </section >
  );
});

const MachinesContainer = () => {
  const machineIds = useMachineIds();
  const readOnly = useReadOnly();
  const count = machineIds.length;
  return (
    <Machines
      machineIds={machineIds}
      readOnly={readOnly}
      count={count}
    />
  );
};

export default MachinesContainer;