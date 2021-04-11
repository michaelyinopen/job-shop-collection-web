import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import { Lock as LockIcon } from '@material-ui/icons';
import MoreOptions from './MoreOptions';
import EditButtons from './EditButtons';
import HistoryButtons from './HistoryButtons';
import SaveJobSetButton from './SaveJobSetButton';
import LoadButton from './LoadButton';
import { useReadOnly } from '../../store/useSelectors';
import { useIsJobSetLocked } from '../../../../store/useSelectors';

const useStyles = makeStyles(theme => ({
  titleRow: {
    position: "sticky",
    top: 0,
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
    boxSizing: "border-box",
  },
  toolbar: { // move
    display: "flex",
    flexWrap: "wrap",
    boxSizing: "border-box",
    boxShadow: "0px 6px 4px -6px rgba(0,0,0,0.75)",
  },
  allActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap-reverse",
  },
  sameLine: {
    display: "flex",
    alignItems: "center",
  },
  separator: { flexGrow: 1 },
}));

const TitleRow = ({
  id,
  pageTitle,
  readOnly,
  isLocked,
  isJsonEditorOpen,
  openJsonEditorCallback,
  closeJsonEditorCallback,
  isExtraSmallScreen,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.titleRow}>
      <Toolbar className={classes.toolbar} disableGutters>
        <h1>
          {pageTitle}
          {isExtraSmallScreen && isLocked ? (
            <Box
              fontStyle="italic"
              color="text.hint"
              fontSize="h5.fontSize"
              component="span"
            >
              <LockIcon />
            </Box>
          ) : null}
          {!isExtraSmallScreen ? (
            <Box
              fontStyle="italic"
              color="text.hint"
              fontSize="h5.fontSize"
              component="span"
            >
              {isLocked ? "(locked)" : readOnly ? "(read-only)" : "(edit)"}
            </Box>
          ) : null}
        </h1>
        {id ? <LoadButton id={id} /> : null}
        <div className={classes.separator} />
        <div className={classes.allActions}>
          <div className={classes.sameLine}>
            {!readOnly ? <HistoryButtons id={id} /> : null}
            {!readOnly ? <SaveJobSetButton id={id} /> : null}
          </div>
          <div className={classes.sameLine}>
            {id ? <EditButtons id={id} /> : null}
            <MoreOptions
              id={id}
              isJsonEditorOpen={isJsonEditorOpen}
              openJsonEditorCallback={openJsonEditorCallback}
              closeJsonEditorCallback={closeJsonEditorCallback}
            />
          </div>
        </div>
      </Toolbar>
      <Divider variant="middle" />
    </div >
  );
};
const TitleRowContainer = ({
  id,
  isJsonEditorOpen,
  openJsonEditorCallback,
  closeJsonEditorCallback,
}) => {
  const readOnly = useReadOnly();
  const pageTitle = id ? `Job Set #${id}` : "New Job Set";
  const isLocked = useIsJobSetLocked(id);
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  return (
    <TitleRow
      id={id}
      pageTitle={pageTitle}
      readOnly={readOnly}
      isLocked={isLocked}
      isJsonEditorOpen={isJsonEditorOpen}
      openJsonEditorCallback={openJsonEditorCallback}
      closeJsonEditorCallback={closeJsonEditorCallback}
      isExtraSmallScreen={isExtraSmallScreen}
    />
  )
};

export default TitleRowContainer;