import React, { useMemo, useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { MoreHoriz, Autorenew } from '@material-ui/icons';
import { Tooltip, IconButton } from '@material-ui/core';
import JobButton from './JobButton';
import JobShopCollectionDispatchContext from '../../../JobShopCollectionDispatchContext';
import { changeJobColor } from '../../store/actionCreators';
import { useJobColor, useReadOnly } from '../../store/useSelectors';
import usePopperHandlers from './usePopperHandlers';
import CustomPopper from './CustomPopper';

const useStyles = makeStyles(theme => ({
  colorOptionsRoot: { display: "inline-flex", alignItems: "center" },
  colorOptionsTitle: {
    marginBlockStart: "8px",
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  colorBox: {
    display: "block",
    borderRadius: "5px",
    padding: "0 20px",
    backgroundClip: "border-box",
  },
  changeJobColorButton: { padding: 5, width: "34px", height: "34px", boxSizing: "border-box" },
  popperRoot: { padding: "10px 20px" },
  popperTitle: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  popperTitleColorBox: {
    display: "inline-block",
    padding: "0 4px",
    margin: "0 2px",
    borderRadius: "4px",
  },
}));

const ColorOption = ({
  classes,
  readOnly,
  backgroundColor,
  foregroundColor,
  changeJobColor
}) => {
  return (
    <React.Fragment>
      <h4 className={classes.colorOptionsTitle}>
        Color
      </h4>
      <div className={classes.colorOptionsRoot}>
        <div
          className={classes.colorBox}
          style={{ backgroundColor: backgroundColor, color: foregroundColor, fontFamily: "monospace, monospace" }}
        >
          background: {backgroundColor}<br />
          foreground: {foregroundColor}
        </div>
        {!readOnly ? (
          <Tooltip title="Change color">
            <IconButton
              onClick={changeJobColor}
              className={classes.changeJobColorButton}
            >
              <Autorenew />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    </React.Fragment >
  );
};

const JobOptionsButton = ({
  id
}) => {
  const classes = useStyles();
  const readOnly = useReadOnly();
  const [backgroundColor, foregroundColor] = useJobColor(id);
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const changeJobColorCallback = useCallback(
    () => dispatch(changeJobColor(id)),
    [id, dispatch]
  );
  const [
    anchorElement,
    open,
    handlePopperOpen,
    handlePopperClose
  ] = usePopperHandlers();

  //#region icon
  const iconMemo = useMemo(() => <MoreHoriz />, []);
  const title = "Job options"
  //#endregion icon

  //#region popper
  const colorOptionMemo = useMemo(
    () => (
      <ColorOption
        classes={classes}
        readOnly={readOnly}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        changeJobColor={changeJobColorCallback}
      />
    ),
    [classes, readOnly, backgroundColor, foregroundColor, changeJobColorCallback]
  );

  const popperContent = useMemo(
    () => {
      return (
        <article className={classes.popperRoot}>
          <h3 className={classes.popperTitle}>
            Job
            <span
              className={classes.popperTitleColorBox}
              style={{ backgroundColor: backgroundColor, color: foregroundColor }}
            >
              {id}
            </span>
            Options
          </h3>
          {colorOptionMemo}
        </article>
      );
    },
    [id, classes, colorOptionMemo, backgroundColor, foregroundColor]
  );

  const popperMemo = useMemo(
    () => (
      <CustomPopper
        open={open}
        anchorElement={anchorElement}
        handlePopperClose={handlePopperClose}
        canSelect
      >
        {popperContent}
      </CustomPopper>
    ),
    [anchorElement, open, handlePopperClose, popperContent]
  );
  //#endregion popper

  return (
    <JobButton
      open={open}
      handlePopperOpen={handlePopperOpen}
      handlePopperClose={handlePopperClose}
      icon={iconMemo}
      title={title}
      popper={popperMemo}
    />
  )
};

export default JobOptionsButton;