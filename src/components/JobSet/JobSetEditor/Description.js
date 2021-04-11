import React, { useCallback, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import useDebouncedValue from '../../../functions/useDebouncedValue';
import { typingInputDebounceWait } from '../../../constants';
import { useDescription, useReadOnly } from '../store/useSelectors';
import { setDescription } from '../store/actionCreators';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: "relative",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: "600px",
  },
}));

const Description = React.memo(({
  value,
  readOnly,
  onChange,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <TextField
        label="Description"
        value={value ? value : ''}
        onChange={onChange}
        variant="filled"
        margin="dense"
        multiline
        fullWidth
        className={classes.field}
        inputProps={readOnly ? { readOnly: true } : {}}
      />
    </div>
  );
});

const DescriptionContainer = () => {
  const description = useDescription();
  const readOnly = useReadOnly();
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const setDescriptionCallback = useCallback(
    valueArg => {
      dispatch(setDescription(valueArg));
    },
    [dispatch]
  );
  const [descriptionValue, descriptionChangedCallback] = useDebouncedValue(description, setDescriptionCallback, typingInputDebounceWait);
  return (
    <Description
      value={descriptionValue}
      readOnly={readOnly}
      onChange={descriptionChangedCallback}
    />
  );
};

export default DescriptionContainer;
