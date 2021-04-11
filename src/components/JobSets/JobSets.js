import React, { useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { generatePath } from 'react-router';
import useReactRouter from 'use-react-router';
import { Link } from 'react-router-dom';
import { lighten, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Button,
  Checkbox,
  CircularProgress,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import {
  green,
  red
} from '@material-ui/core/colors';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Forward as ForwardIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  ReportProblem as ReportProblemIcon,
} from '@material-ui/icons';
import preventDefaultPropagation from '../../functions/preventDefaultPropagation';
import { jobSet as jobSetPath, newJobSet as newJobSetPath } from '../../routePaths';
import JobShopCollectionDispatchContext from '../JobShopCollectionDispatchContext';
import {
  getJobSetsBegin,
  getJobSetsSucceed,
  getJobSetsFailed,
  deleteJobSetBegin,
  deleteJobSetSucceed,
  deleteJobSetFailed,
  clearDeletingJobSets,
  showSnackbar,
} from '../../store/actionCreators';
import getJobSetsRequest from '../../requests/getJobSetsRequest'
import {
  useGetJobSetsIsLoading,
  useGetJobSetsFailedMessage,
  useJobSetHeaders,
  useJobSetDeleting,
  useJobSetSomeDeleting,
  useSelectedJobSets,
  useIsJobSetLocked,
} from '../../store/useSelectors';
import { deleteJobSetApiAsync } from '../../api';
import usePage, { actionCreators as pageActionCreators } from './usePage';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    height: '100%',
    paddingTop: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  root: {
    width: '100%'
  },
  toolbar: { // move
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: "flex",
  },
  toolbarHighlight: {  //move
    color: theme.palette.text.primary,
    backgroundColor: lighten(theme.palette.secondary.light, 0.5),
  },
  toolbarDeleteButton: {
    marginLeft: "auto"
  },
  withProgressWrapper: {
    position: 'relative',
  },
  progressOnButton: {
    position: 'absolute',
    zIndex: 1,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: 'flex'
  },
  tableTitle: { // move
    marginRight: theme.spacing(3),
  },
  createJobSetButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  createJobSetIcon: { marginRight: theme.spacing(0.5) },
  table: {
    tableLayout: "fixed",
  },
  rowWithMenu: {
    backgroundColor:
      theme.palette.type === 'light'
        ? 'rgba(0, 0, 0, 0.07)' // grey[200]
        : 'rgba(255, 255, 255, 0.14)',
  },
  descriptionCell: {
    maxWidth: '700px',
  },
  actionsFlexbox: {
    display: 'flex',
    justifyContent: 'space-evenly',
    maxWidth: '96px'
  },
  buttonSuccess: {
    backgroundColor: green[500],
  },
  buttonFailed: {
    backgroundColor: red[500],
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  idColumn: { width: '56px' },
  actionsColumn: { width: '96px', boxSizing: "border-box" },
  titleColumn: {
    width: '200px',
    boxSizing: "border-box",
    [theme.breakpoints.down('xs')]: { width: '100%' }
  },
  descriptionColumn: {
    width: '100%',
  },
}));

//#region title / toolbar
// todo: reverse disabled the delete
const ToolbarDeleteButton = React.memo(({
  onDelete,
  isDeleting,
}) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.withProgressWrapper, classes.toolbarDeleteButton)} onClick={preventDefaultPropagation}>
      <IconButton onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
      {isDeleting ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
    </div>
  );
});

const deleteOneJobSetFromSelected = async (jobSet, dispatch) => {
  const { id } = jobSet;
  dispatch(deleteJobSetBegin(id));
  try {
    await deleteJobSetApiAsync(id, jobSet.eTag);
    dispatch(deleteJobSetSucceed(id, false));
    return true;
  }
  catch (e) {
    dispatch(deleteJobSetFailed(id, false));
    return false;
  }
};

const ToolbarDeleteButtonContainer = ({
  selected,
  reloadCallback
}) => {
  const isSomeDeleting = useJobSetSomeDeleting();
  const selectedJobSets = useSelectedJobSets(selected);
  const deletingJobSets = selectedJobSets.filter(js => !js.isLocked);
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const onDelete = useMemo(
    () => {
      let isDeleting = false;
      const getIsDeleting = () => isDeleting;
      const callback = () => {
        if (getIsDeleting()) {
          return;
        }
        if (selectedJobSets.length === 0) {
          return;
        }
        //#region confirm dialog
        if (deletingJobSets.length === 0) {
          window.alert("The selected Job Set(s) are locked and cannot be deleted.");
          return;
        }
        if (selectedJobSets.length === deletingJobSets.length) {
          if (!window.confirm(`Do you want to permanently delete ${selectedJobSets.length} Job Sets?`)) {
            return;
          }
        }
        if (selectedJobSets.length !== deletingJobSets.length) {
          if (!window.confirm(`${selectedJobSets.length - deletingJobSets.length} Job Sets are locked and cannot be deleted.\nDo you want to permanently delete ${deletingJobSets.length} Job Sets?`)) {
            return;
          }
        }
        //#endregion confirm dialog
        const deleteJobSetsAsync = async () => {
          isDeleting = true;
          const deleteJobSetsPromises = deletingJobSets.map(js => deleteOneJobSetFromSelected(js, dispatch));
          const results = await Promise.all(deleteJobSetsPromises);
          const deletingJobSetsCount = deletingJobSets.length;
          const successfulDeletesCount = results.filter(r => r).length;
          if (deletingJobSetsCount !== successfulDeletesCount) {
            alert(`Only deleted ${successfulDeletesCount} Job Set from ${deletingJobSetsCount} selected.\nPlease try again.`);
          }
          dispatch(clearDeletingJobSets());
          dispatch(showSnackbar(`Deleted ${successfulDeletesCount} Job Sets`));
          reloadCallback();
          isDeleting = false;
        };
        deleteJobSetsAsync();
      };
      return callback;
    },
    [
      selectedJobSets,
      deletingJobSets,
      reloadCallback,
      dispatch,
    ]
  );
  return (
    <ToolbarDeleteButton
      onDelete={onDelete}
      isDeleting={isSomeDeleting}
    />
  );
};

const JobSetSelectedToolbar = ({
  selectedCount,
  selected,
  reloadCallback
}) => {
  return (
    <React.Fragment>
      <Typography color="inherit" variant="subtitle1">
        {selectedCount} selected
      </Typography>
      <ToolbarDeleteButtonContainer
        selected={selected}
        reloadCallback={reloadCallback}
      />
    </React.Fragment>
  );
};

const NewJobSetLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} to={newJobSetPath} {...props} />
));

const JobSetTitle = ({
  classes,
  isLoading,
  failedMessage,
  reloadCallback,
  isSmallNewButton,
}) => {
  return (
    <React.Fragment>
      <div className={classes.tableTitle}>
        <Typography variant="h6" id="table-title">
          Job Sets
        </Typography>
      </div>
      <div className={classes.withProgressWrapper}>
        <IconButton onClick={reloadCallback}>
          <RefreshIcon />
        </IconButton>
        {isLoading ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
      </div>
      <Typography color="error">
        {failedMessage}
      </Typography>
      <Button
        component={NewJobSetLink}
        variant="contained"
        color="primary"
        className={classes.createJobSetButton}
      >
        <AddIcon className={classes.createJobSetIcon} />
        {isSmallNewButton ? "New" : "Create New"}
      </Button>
    </React.Fragment>
  );
};

const JobSetToolbarTitle = ({
  isLoading,
  failedMessage,
  selected,
  selectedCount,
  reloadCallback,
  isSmallNewButton,
}) => {
  const classes = useStyles();
  return (
    <Toolbar
      className={clsx(classes.toolbar, {
        [classes.toolbarHighlight]: selectedCount > 0,
      })}
    >
      {selectedCount > 0
        ? (
          <JobSetSelectedToolbar
            selectedCount={selectedCount}
            selected={selected}
            reloadCallback={reloadCallback}
          />
        ) : (
          <JobSetTitle
            classes={classes}
            isLoading={isLoading}
            failedMessage={failedMessage}
            reloadCallback={reloadCallback}
            isSmallNewButton={isSmallNewButton}
          />
        )
      }
    </Toolbar >
  );
};
//#endregion title / toolbar

//#region HeadRow
const JobSetSortableTableHeadCell = ({
  className,
  padding,
  align,
  property,
  order,
  orderBy,
  onSort,
  children
}) => {
  const classes = useStyles();
  return (
    <TableCell
      padding={padding}
      align={align}
      sortDirection={orderBy === property ? order : false}
      className={className}
    >
      <TableSortLabel
        active={orderBy === property}
        direction={order}
        onClick={onSort(property)}
      >
        {children}
        {orderBy === property ? (
          <span className={classes.visuallyHidden}>
            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
          </span>
        ) : null}
      </TableSortLabel>
    </TableCell>
  );
};

const JobSetTableHead = ({
  pageDispatch,
  selectedCount,
  rowCount,
  order,
  orderBy,
  showDescription,
}) => {
  const onSelectAllClick = () => pageDispatch(pageActionCreators.selectAll());
  const onSort = property => () => pageDispatch(pageActionCreators.requestSort(property));
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedCount > 0 && selectedCount < rowCount}
            checked={selectedCount > 0 && selectedCount === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all' }}
          />
        </TableCell>
        <JobSetSortableTableHeadCell
          className={classes.idColumn}
          align="left"
          padding="none"
          property="id"
          order={order}
          orderBy={orderBy}
          onSort={onSort}
        >
          Id
        </JobSetSortableTableHeadCell>
        <JobSetSortableTableHeadCell
          className={classes.titleColumn}
          align="left"
          property="title"
          order={order}
          orderBy={orderBy}
          onSort={onSort}
        >
          Title
        </JobSetSortableTableHeadCell>
        {showDescription ? (
          <JobSetSortableTableHeadCell
            className={classes.descriptionColumn}
            align="left"
            property="description"
            order={order}
            orderBy={orderBy}
            onSort={onSort}
          >
            Description
        </JobSetSortableTableHeadCell>
        ) : null}
        <TableCell className={classes.actionsColumn}>
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
//#endregion HeadRow

//#region row
// todo: reverse disabled the delete
const RowDeleteButton = React.memo(({
  dense,
  onDelete,
  isDeleting,
  deleteSucceed,
  deleteFailed,
  disabled,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.withProgressWrapper} onClick={preventDefaultPropagation}>
      <IconButton
        className={clsx({
          [classes.buttonSuccess]: deleteSucceed,
          [classes.buttonFailed]: deleteFailed
        })}
        {...(disabled ? { disabled: true } : {})}
        onClick={onDelete}
        onContextMenu={preventDefaultPropagation}
        size={dense ? 'small' : 'medium'}
      >
        {deleteFailed ? <ReportProblemIcon /> : deleteSucceed ? <CheckIcon /> : <DeleteIcon />}
      </IconButton>
      {isDeleting ? <div className={classes.progressOnButton}><CircularProgress /></div> : null}
    </div>
  );
});

const RowDeleteButtonContainer = ({
  id,
  jobSetHeader,
  dense,
  reloadCallback
}) => {
  const [isDeletingState, deleteSucceed, deleteFailed] = useJobSetDeleting(id);
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const onDelete = useMemo(
    () => {
      let isDeleting = false;
      const getIsDeleting = () => isDeleting;
      const callback = e => {
        e.stopPropagation();
        if (getIsDeleting()) {
          return;
        }
        if (!window.confirm(`Do you want to permanently delete Job Set ${id}\n${jobSetHeader.title}`)) {
          return;
        }
        const deleteJobSetAsync = async () => {
          isDeleting = true;
          dispatch(deleteJobSetBegin(id));
          try {
            await deleteJobSetApiAsync(id, jobSetHeader.eTag);
            isDeleting = false;
            dispatch(deleteJobSetSucceed(id, true));
            dispatch(showSnackbar(`Deleted Job Set ${id}`));
            reloadCallback();
          }
          catch (e) {
            alert(`Failed to delete Job Set ${id}\nPlease try again.`);
            isDeleting = false;
            dispatch(deleteJobSetFailed(id, true));
          }
        };
        deleteJobSetAsync();
      };
      return callback;
    },
    [
      id,
      jobSetHeader.eTag,
      jobSetHeader.title,
      reloadCallback,
      dispatch,
    ]
  );
  const isLocked = useIsJobSetLocked(id);
  return (
    <RowDeleteButton
      dense={dense}
      onDelete={onDelete}
      isDeleting={isDeletingState}
      deleteSucceed={deleteSucceed}
      deleteFailed={deleteFailed}
      disabled={isLocked}
    />
  );
};

const RowMoreActionsMenu = ({
  viewJobSetCallback,
  editJobSetCallback,
  openInNewTabCallback,
  anchorEl,
  anchorReference,
  anchorPosition,
  open,
  handleClose,
  isLocked
}) => {
  return (
    <Menu
      anchorReference={anchorReference}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      keepMounted
      open={open}
      onClose={handleClose}
      onClick={preventDefaultPropagation}
    >
      <MenuItem onClick={viewJobSetCallback} onContextMenu={preventDefaultPropagation}>
        <ListItemIcon>
          <ForwardIcon />
        </ListItemIcon>
        View
      </MenuItem>
      <MenuItem
        onClick={editJobSetCallback}
        onContextMenu={preventDefaultPropagation}
        disabled={isLocked}
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        Edit
      </MenuItem>
      <MenuItem onClick={openInNewTabCallback} onContextMenu={preventDefaultPropagation}>
        <ListItemIcon>
          <OpenInNewIcon />
        </ListItemIcon>
        Open in new tab
      </MenuItem>
    </Menu>
  );
};

const JobSetRow = React.memo(({
  jobSetHeader,
  dense,
  pageDispatch,
  rowIsSelectedFunction,
  reloadCallback,
  index,
  viewJobSetCallback,
  editJobSetCallback,
  openInNewTabCallback,
  showDescription,
}) => {
  const { id } = jobSetHeader;
  const classes = useStyles();
  const isItemSelected = rowIsSelectedFunction(jobSetHeader.id);
  const labelId = `job-set-table-checkbox-${index}`;
  const onSelect = useCallback(
    e => {
      e.stopPropagation();
      pageDispatch(pageActionCreators.selectOne(jobSetHeader.id));
    },
    [pageDispatch, jobSetHeader.id]
  );

  const [menuPosition, setMenuPosition] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorReference, setAnchorReference] = useState('none');
  const menuOpen = Boolean(anchorEl) || Boolean(menuPosition);

  const onMoreActionButtonClick = event => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorReference('anchorEl');
    setAnchorEl(event.currentTarget);
    setMenuPosition(null);
  };
  const onContextMenu = event => {
    event.stopPropagation();
    event.preventDefault();
    const cursorPositon = { top: event.pageY, left: event.pageX };
    setAnchorReference('anchorPosition');
    setMenuPosition(cursorPositon);
    setAnchorEl(null);
  };

  const handleCloseContextMenu = () => {
    setAnchorReference('none');
    setMenuPosition(null);
    setAnchorEl(null);
  };
  const isLocked = useIsJobSetLocked(id);
  return (
    <TableRow
      className={clsx({ [classes.rowWithMenu]: menuOpen })}
      hover
      onClick={viewJobSetCallback}
      onContextMenu={onContextMenu} // TODO replace with custom context menu, also stop propagation on buttons
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      selected={isItemSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          inputProps={{ 'aria-labelledby': labelId }}
          onClick={onSelect}
          onContextMenu={preventDefaultPropagation}
        />
      </TableCell>
      <TableCell component="th" id={labelId} scope="row" padding="none" className={classes.idColumn}>
        {jobSetHeader.id}
      </TableCell>
      <TableCell align="left" padding="none" className={classes.titleColumn}>
        <div className={classes.titleCell}>
          <Typography noWrap>
            {jobSetHeader.title}
          </Typography>
        </div>
      </TableCell>
      {showDescription ? (
        <TableCell align="left" padding="none" className={classes.descriptionColumn}>
          <div className={classes.descriptionCell}>
            <Typography noWrap>
              {jobSetHeader.description}
            </Typography>
          </div>
        </TableCell>
      ) : null}
      <TableCell align="left" padding="none" className={classes.actionsColumn}>
        <div className={classes.actionsFlexbox}>
          <RowDeleteButtonContainer
            id={id}
            jobSetHeader={jobSetHeader}
            dense={dense}
            reloadCallback={reloadCallback}
          />
          <IconButton
            onClick={onMoreActionButtonClick}
            onContextMenu={preventDefaultPropagation}
            size={dense ? 'small' : 'medium'}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
      </TableCell>
      <RowMoreActionsMenu
        viewJobSetCallback={viewJobSetCallback}
        editJobSetCallback={editJobSetCallback}
        openInNewTabCallback={openInNewTabCallback}
        anchorReference={anchorReference}
        anchorEl={anchorEl}
        anchorPosition={menuPosition}
        open={menuOpen}
        handleClose={handleCloseContextMenu}
        isLocked={isLocked}
      />
    </TableRow>
  );
});

const JobSetRowWithRouter = (props) => {
  const { history: { push } } = useReactRouter();
  const { jobSetHeader: { id } } = props;
  const [viewJobSetCallback, editJobSetCallback, openInNewTabCallback] = useMemo(
    () => {
      const path = generatePath(jobSetPath, { id });
      const openInNewTabCallback = e => {
        e.stopPropagation();
        const win = window.open(path, '_blank');
        win.focus();
      };
      const viewCallback = e => {
        e.stopPropagation();
        push(path);
      };
      const editPath = generatePath(jobSetPath, { id, edit: "edit" });
      const editCallback = e => {
        e.stopPropagation();
        e.preventDefault();
        push(editPath);
      }
      return [viewCallback, editCallback, openInNewTabCallback];
    },
    [push, id]
  );
  return (
    <JobSetRow
      {...props}
      viewJobSetCallback={viewJobSetCallback}
      editJobSetCallback={editJobSetCallback}
      openInNewTabCallback={openInNewTabCallback}
    />
  );
};
//#endregion row

//#region Table
const JobSets = React.memo(({
  jobSetHeadersRows,
  jobSetToolbarTitle,
  jobSetTableHead,
  tablePagination,
  reloadCallback,
  pageDispatch,
  emptyRows,
  rowsPerPage,
  pageIndex,
  rowIsSelectedFunction,
  showDescription,
}) => {
  const classes = useStyles();
  const dense = rowsPerPage > 10;
  return (
    <Container className={classes.container}>
      <Paper className={classes.root}>
        {jobSetToolbarTitle}
        <Table
          className={classes.table}
          aria-labelledby="table-title"
          size={dense ? 'small' : 'medium'}
        >
          {jobSetTableHead}
          <TableBody>
            {jobSetHeadersRows
              .slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage)
              .map((jsh, index) => (
                <JobSetRowWithRouter
                  key={jsh.id}
                  jobSetHeader={jsh}
                  dense={dense}
                  pageDispatch={pageDispatch}
                  rowIsSelectedFunction={rowIsSelectedFunction}
                  reloadCallback={reloadCallback}
                  index={index}
                  showDescription={showDescription}
                />
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: (dense ? 31 : 49) * emptyRows }}>
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        {tablePagination}
      </Paper >
    </Container>
  );
});
//#endregion Table

const JobSetsContainer = () => {
  const jobShopCollectionDispatch = useContext(JobShopCollectionDispatchContext);
  const jobSetsRequest = useMemo(
    () => {
      return getJobSetsRequest(
        () => jobShopCollectionDispatch(getJobSetsBegin()),
        (...args) => jobShopCollectionDispatch(getJobSetsSucceed(...args)),
        (...args) => jobShopCollectionDispatch(getJobSetsFailed(...args))
      );
    },
    [jobShopCollectionDispatch]
  );

  useEffect(
    () => {
      jobSetsRequest();
    },
    [jobSetsRequest]
  );

  const jobSetHeaders = useJobSetHeaders();
  const isLoading = useGetJobSetsIsLoading();
  const failedMessage = useGetJobSetsFailedMessage();

  const [pageState, pageDispatch] = usePage(jobSetHeaders);

  const jobSetHeadersRows = pageState.rows;
  const rowCount = jobSetHeadersRows.length;
  const rowsPerPage = pageState.rowsPerPage;
  const pageIndex = pageState.pageIndex;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rowCount - pageIndex * rowsPerPage);

  const selected = pageState.selected;
  const selectedCount = selected.length;
  const rowIsSelectedFunction = useCallback(
    id => selected.indexOf(id) !== -1,
    [selected]
  );
  const order = pageState.order;
  const orderBy = pageState.orderBy;

  const onChangePage = useCallback(
    (e, newPageIndex) => pageDispatch(pageActionCreators.changePage(newPageIndex)),
    [pageDispatch]
  );

  const onChangeRowsPerPage = useCallback(
    e => pageDispatch(pageActionCreators.changeRowsPerPage(+e.target.value)),
    [pageDispatch]
  );

  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const showDescription = !isExtraSmallScreen;
  const isSmallNewButton = isExtraSmallScreen;

  const jobSetToolbarTitle = useMemo(
    () => {
      return (
        <JobSetToolbarTitle
          isLoading={isLoading}
          failedMessage={failedMessage}
          selected={selected}
          selectedCount={selectedCount}
          reloadCallback={jobSetsRequest}
          isSmallNewButton={isSmallNewButton}
        />
      );
    },
    [isLoading, failedMessage, selected, selectedCount, jobSetsRequest, isSmallNewButton]
  );

  const jobSetTableHead = useMemo(
    () => {
      return (
        <JobSetTableHead
          pageDispatch={pageDispatch}
          selectedCount={selectedCount}
          rowCount={rowCount}
          order={order}
          orderBy={orderBy}
          showDescription={showDescription}
        />
      );
    },
    [pageDispatch, selectedCount, rowCount, order, orderBy, showDescription]
  );

  const showRowsPerPage = !isExtraSmallScreen;
  const tablePagination = useMemo(
    () => {
      return (
        <TablePagination
          rowsPerPageOptions={showRowsPerPage ? [5, 10, 15, 20] : [rowsPerPage]}
          component="div"
          count={rowCount}
          rowsPerPage={rowsPerPage}
          page={pageIndex}
          backIconButtonProps={{
            'aria-label': 'previous page',
          }}
          nextIconButtonProps={{
            'aria-label': 'next page',
          }}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      );
    },
    [rowCount, rowsPerPage, pageIndex, onChangePage, onChangeRowsPerPage, showRowsPerPage]
  );

  return (
    <JobSets
      jobSetHeadersRows={jobSetHeadersRows}
      jobSetToolbarTitle={jobSetToolbarTitle}
      jobSetTableHead={jobSetTableHead}
      tablePagination={tablePagination}
      reloadCallback={jobSetsRequest}
      pageDispatch={pageDispatch}
      rowsPerPage={rowsPerPage}
      emptyRows={emptyRows}
      pageIndex={pageIndex}
      rowIsSelectedFunction={rowIsSelectedFunction}
      showDescription={showDescription}
    />
  );
};

export default JobSetsContainer;