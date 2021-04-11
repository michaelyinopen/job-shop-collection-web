import React, { useCallback, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import useDebouncedValue from '../../../functions/useDebouncedValue';
import { typingInputDebounceWait } from '../../../constants';
import { useTitle, useReadOnly } from '../store/useSelectors';
import { setTitle } from '../store/actionCreators';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: "relative",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: "400px",
  },
}));

const Title = React.memo(({
  value,
  readOnly,
  onChange
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <TextField
        label="Title"
        value={value ? value : ''}
        onChange={onChange}
        required
        error={!value || value.length === 0}
        variant="filled"
        margin="dense"
        fullWidth
        inputProps={{
          maxLength: 50,
          ...(readOnly ? { readOnly: true } : {})
        }}
      />
    </div>
  );
});

const TitleContainer = () => {
  const title = useTitle();
  const readOnly = useReadOnly();
  const dispatch = useContext(JobShopCollectionDispatchContext);
  const setTitleCallback = useCallback(
    valueArg => {
      dispatch(setTitle(valueArg));
    },
    [dispatch]
  );
  const [titleValue, titleChangedCallback] = useDebouncedValue(title, setTitleCallback, typingInputDebounceWait);
  return (
    <Title
      value={titleValue}
      readOnly={readOnly}
      onChange={titleChangedCallback}
    />
  );
};

export default TitleContainer;
