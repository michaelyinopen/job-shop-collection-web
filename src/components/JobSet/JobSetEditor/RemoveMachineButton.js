import React, { useContext, useCallback, useState } from 'react';
import prettyMs from 'pretty-ms';
import { useMachine, useProceduresOfMachine } from '../store/useSelectors';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import { removeMachine } from '../store/actionCreators';
import {
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import { Delete, ExpandMore } from '@material-ui/icons';

const RemoveMachineDialogChildren = ({
  id,
  removeTooltip,
  closeCallback
}) => {
  const machine = useMachine(id);
  const title = removeTooltip + "?";
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const confirmCallback = useCallback(
    () => {
      dispatch(removeMachine(id));
      closeCallback();
    },
    [dispatch, id, closeCallback]
  );

  const proceduresOfMachine = useProceduresOfMachine(id);
  const sortedProceduresOfMachine = [...proceduresOfMachine].sort((a, b) => {
    return a.jobId - b.jobId || a.sequence - b.sequence;
  });

  const machineTitle = machine.title ? `machine ${machine.title}` : "this machine";

  const content = !sortedProceduresOfMachine || sortedProceduresOfMachine.length === 0 ? null :
    (
      <DialogContent style={{ backgroundColor: "#cfe8fc" }}>
        Removing {machineTitle} will clear the machine selection of {sortedProceduresOfMachine.length} procedures.
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMore />}
          >
            View affected procedures
          </ExpansionPanelSummary>
          <Divider />
          <ExpansionPanelDetails style={{ padding: 0 }}>
            <List dense style={{ padding: 0 }}>
              {sortedProceduresOfMachine.map((p, index) => (
                <React.Fragment>
                  <ListItem>
                    <ListItemText
                      primary={`Job ${p.jobId}; sequence ${p.sequence}; time: ${prettyMs(p.processingMilliseconds ? p.processingMilliseconds : 0)}`}
                    />
                  </ListItem>
                  {index < sortedProceduresOfMachine.length - 1 ? <Divider component="li" /> : null}
                </React.Fragment>
              ))}
            </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </DialogContent >
    );

  return (
    <React.Fragment>
      <DialogTitle>{title}</DialogTitle>
      {content}
      <DialogActions>
        <Button onClick={closeCallback} variant="outlined" color="primary">
          Cancel
          </Button>
        <Button onClick={confirmCallback} variant="contained" color="primary" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

const RemoveMachineButton = React.memo(({
  id,
  removeTooltip,
  open,
  clickOpenCallback,
  closeCallback
}) => {
  return (
    <div>
      <Tooltip title={removeTooltip} placement="right-end">
        <IconButton onClick={clickOpenCallback}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={closeCallback}
      >
        {open ? (
          <RemoveMachineDialogChildren
            id={id}
            removeTooltip={removeTooltip}
            closeCallback={closeCallback}
          />
        ) : <div />}
      </Dialog>
    </div >
  );
});

const RemoveMachineButtonContainer = ({
  id,
}) => {
  const machine = useMachine(id);

  const removeTooltip = machine.title ? `Remove machine ${machine.title}` : "Remove this machine";

  const [open, setOpen] = useState(false);
  const clickOpenCallback = useCallback(
    () => setOpen(true),
    [setOpen]
  );
  const closeCallback = useCallback(
    () => setOpen(false),
    [setOpen]
  );
  return (
    <RemoveMachineButton
      id={id}
      removeTooltip={removeTooltip}
      open={open}
      clickOpenCallback={clickOpenCallback}
      closeCallback={closeCallback}
    />
  );
};

export default RemoveMachineButtonContainer;