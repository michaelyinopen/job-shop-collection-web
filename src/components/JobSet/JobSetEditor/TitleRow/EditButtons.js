import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  Tooltip,
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { ToggleButton } from '@material-ui/lab';
import { Icon as IconifyIcon } from "@iconify/react";
import pencilOffOutline from '@iconify/icons-mdi/pencil-off-outline';
import { generatePath } from 'react-router';
import useReactRouter from 'use-react-router';
import StyledToggleButtonGroup, { toggleButtonGroupBorderStyle } from '../../../StyledToggleButtonGroup';
import { jobSet as jobSetPath } from '../../../../routePaths';
import { useReadOnly } from '../../store/useSelectors';
import { useIsJobSetLocked } from '../../../../store/useSelectors';

const useStyles = makeStyles(theme => ({
  icon: {
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonGroupBorderStyle: toggleButtonGroupBorderStyle(theme),
}));

const EditButtons = React.memo(({
  readOnly,
  handleReadOnlyChange,
  isLocked,
}) => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.toggleButtonGroupBorderStyle}>
      <StyledToggleButtonGroup
        value={readOnly}
        exclusive
        onChange={handleReadOnlyChange}
        className={classes.toggleButtonGroupStyle}
      >
        <ToggleButton value={false} {...(isLocked ? { disabled: true } : {})} >
          <Tooltip title="Edit" placement="bottom-end">
            <Edit />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={true}>
          <Tooltip title="Read-only" placement="bottom-end">
            <div className={classes.icon}>
              <IconifyIcon icon={pencilOffOutline} />
            </div>
          </Tooltip>
        </ToggleButton>
      </StyledToggleButtonGroup>
    </Paper >
  );
});

const EditButtonsContainer = ({
  id
}) => {
  const readOnly = useReadOnly();
  const { history: { push } } = useReactRouter();

  const handleReadOnlyChange = useMemo(
    () => {
      const readonlyPath = generatePath(jobSetPath, { id });
      const editingPath = generatePath(jobSetPath, { id, edit: "edit" });
      return (event, readOnlyValue) => {
        event.preventDefault();
        event.stopPropagation();
        if (!readOnly && readOnlyValue === true) {
          push(readonlyPath)
        }
        if (readOnly && readOnlyValue === false) {
          push(editingPath)
        }
      }
    },
    [id, push, readOnly]
  );
  const isLocked = useIsJobSetLocked(id);
  return (
    <EditButtons
      readOnly={readOnly}
      handleReadOnlyChange={handleReadOnlyChange}
      isLocked={isLocked}
    />
  )
};

export default EditButtonsContainer;