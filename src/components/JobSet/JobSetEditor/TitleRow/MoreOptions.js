import React, { useState } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import {
  Menu,
  IconButton,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
// import jsonIcon from '@iconify/icons-mdi/json';
import DeleteJobSetMenuItem from './DeleteJobSetMenuItem';

// const useStyles = makeStyles(theme => ({
//   titleRow: {
//     position: "sticky",
//     top: 0,
//     zIndex: theme.zIndex.appBar - 1,
//     backgroundColor: theme.palette.background.default,
//     boxSizing: "border-box",
//   },
//   toolbar: { // move
//     display: "flex",
//     boxSizing: "border-box",
//     boxShadow: "0px 6px 4px -6px rgba(0,0,0,0.75)",
//     "& > *": {
//       margin: "4px"
//     },
//   },
//   separator: { flexGrow: 1 },
// }));

const MoreOptions = ({
  id,
  isJsonEditorOpen,
  openJsonEditorCallback,
  closeJsonEditorCallback,
  onMoreOptionsButtonClick,
  anchorEl,
  open,
  handleClose
}) => {
  // const classes = useStyles();
  return (
    <div>
      <IconButton onClick={onMoreOptionsButtonClick} >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {id ? <DeleteJobSetMenuItem id={id} /> : null}
        {/* <Tooltip
            title={isJsonEditorOpen ? "Already opened JSON Editor" : "Open JSON Editor"}
          >
            <Fab disabled={isJsonEditorOpen} size="medium" onClick={openJsonEditorCallback}>
              <InlineIcon icon={jsonIcon} className={classes.icon} />
            </Fab>
          </Tooltip> */}
      </Menu>
    </div>
  );
};

const MoreOptionsContainer = ({
  id,
  isJsonEditorOpen,
  openJsonEditorCallback,
  closeJsonEditorCallback,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const onMoreOptionsButtonClick = event => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <MoreOptions
      id={id}
      isJsonEditorOpen={isJsonEditorOpen}
      openJsonEditorCallback={openJsonEditorCallback}
      closeJsonEditorCallback={closeJsonEditorCallback}
      onMoreOptionsButtonClick={onMoreOptionsButtonClick}
      anchorEl={anchorEl}
      open={menuOpen}
      handleClose={handleClose}
    />
  )
};

export default MoreOptionsContainer;