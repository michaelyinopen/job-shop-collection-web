import React, { useContext, useCallback } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputAdornment,
  Tooltip
} from '@material-ui/core';
import TimeField from 'react-simple-timefield';
import msToFormattedTime from '../../../functions/msToFormattedTime';
import formattedTimeToMs from '../../../functions/formattedTimeToMs';
import {
  useIsAutoTimeOptions,
  useMaxTimeFromRef,
  useViewStartTimeFromRef,
  useViewEndTimeFromRef,
  useMinViewDuration,
  useMaxViewDuration,
  useReadOnly
} from '../store/useSelectors';
import JobShopCollectionDispatchContext from '../../JobShopCollectionDispatchContext';
import {
  setIsAutoTimeOptions,
  setMaxTimeFromRef,
  setViewStartTimeFromRef,
  setViewEndTimeFromRef,
  setMinViewDuration,
  setMaxViewDuration
} from '../store/actionCreators';

const marginLeftStyle = { marginLeft: "16px" };

const AutomaticTimeOptions = React.memo(({
  value,
  readOnly,
  onChange,
}) => {
  return (
    <FormControl component="fieldset" style={marginLeftStyle} {...(readOnly ? { disabled: true } : {})}>
      <FormLabel component="legend">Automatic Time Options</FormLabel>
      <RadioGroup
        value={value}
        onChange={onChange}
        name="automatic-time-options"
      >
        <FormControlLabel value="true" control={<Radio />} label="Auto" />
        <FormControlLabel value="false" control={<Radio />} label="Manual" />
      </RadioGroup>
    </FormControl>
  )
});

const TimeInputField = React.memo(({
  label,
  value,
  onChange,
  readOnly,
  disabled
}) => {
  return (
    <Tooltip
      title={disabled ? "Auto set. Change to Manual to edit." : ""}
      placement="right-end"
    >
      <TimeField
        showSeconds
        value={value}
        style={{ ...marginLeftStyle, width: "12em" }}
        onChange={onChange}
        input={
          <TextField
            label={label}
            margin="dense"
            variant="outlined"
            disabled={disabled}
            InputProps={{
              endAdornment: <InputAdornment position="end">hh:mm:ss</InputAdornment>,
              readOnly: readOnly ? true : undefined
            }}
          />
        }
      />
    </Tooltip>
  );
});

const TimeOptions = React.memo(({
  readOnly,
  isAutoTimeOptions,
  maxTimeFromRef,
  viewStartTimeFromRef,
  viewEndTimeFromRef,
  minViewDuration,
  maxViewDuration,
  dispatchSetIsAutoTimeOptions,
  dispatchSetMaxTimeFromRef,
  dispatchSetViewStartTimeFromRef,
  dispatchSetViewEndTimeFromRef,
  dispatchSetMinViewDuration,
  dispatchSetMaxViewDuration,
}) => {
  return (
    <section>
      <h2>
        Time Options
      </h2>
      <AutomaticTimeOptions
        value={String(isAutoTimeOptions)}
        readOnly={readOnly}
        onChange={dispatchSetIsAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="Maximum Time"
        value={msToFormattedTime(maxTimeFromRef)}
        onChange={dispatchSetMaxTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="View Start Time"
        value={msToFormattedTime(viewStartTimeFromRef)}
        onChange={dispatchSetViewStartTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="View End Time"
        value={msToFormattedTime(viewEndTimeFromRef)}
        onChange={dispatchSetViewEndTimeFromRef}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="Minimun View Duration"
        value={msToFormattedTime(minViewDuration)}
        onChange={dispatchSetMinViewDuration}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
      <br />
      <TimeInputField
        label="Maximun View Duration"
        value={msToFormattedTime(maxViewDuration)}
        onChange={dispatchSetMaxViewDuration}
        readOnly={readOnly}
        disabled={isAutoTimeOptions}
      />
    </section >
  );
});

const TimeOptionsContainer = () => {
  const readOnly = useReadOnly();
  const isAutoTimeOptions = useIsAutoTimeOptions();
  const maxTimeFromRef = useMaxTimeFromRef();
  const viewStartTimeFromRef = useViewStartTimeFromRef();
  const viewEndTimeFromRef = useViewEndTimeFromRef();
  const minViewDuration = useMinViewDuration();
  const maxViewDuration = useMaxViewDuration();

  const dispatch = useContext(JobShopCollectionDispatchContext);

  const dispatchSetIsAutoTimeOptions = useCallback(
    event => dispatch(setIsAutoTimeOptions((event.target.value === 'true'))),
    [dispatch]
  );
  const dispatchSetMaxTimeFromRef = useCallback(
    (_event, value) => dispatch(setMaxTimeFromRef(formattedTimeToMs(value))),
    [dispatch]
  );
  const dispatchSetViewStartTimeFromRef = useCallback(
    (_event, value) => dispatch(setViewStartTimeFromRef(formattedTimeToMs(value))),
    [dispatch]
  );
  const dispatchSetViewEndTimeFromRef = useCallback(
    (_event, value) => dispatch(setViewEndTimeFromRef(formattedTimeToMs(value))),
    [dispatch]
  );
  const dispatchSetMinViewDuration = useCallback(
    (_event, value) => dispatch(setMinViewDuration(formattedTimeToMs(value))),
    [dispatch]
  );
  const dispatchSetMaxViewDuration = useCallback(
    (_event, value) => dispatch(setMaxViewDuration(formattedTimeToMs(value))),
    [dispatch]
  );

  return (
    <TimeOptions
      readOnly={readOnly}
      isAutoTimeOptions={isAutoTimeOptions}
      maxTimeFromRef={maxTimeFromRef}
      viewStartTimeFromRef={viewStartTimeFromRef}
      viewEndTimeFromRef={viewEndTimeFromRef}
      minViewDuration={minViewDuration}
      maxViewDuration={maxViewDuration}
      dispatchSetIsAutoTimeOptions={dispatchSetIsAutoTimeOptions}
      dispatchSetMaxTimeFromRef={dispatchSetMaxTimeFromRef}
      dispatchSetViewStartTimeFromRef={dispatchSetViewStartTimeFromRef}
      dispatchSetViewEndTimeFromRef={dispatchSetViewEndTimeFromRef}
      dispatchSetMinViewDuration={dispatchSetMinViewDuration}
      dispatchSetMaxViewDuration={dispatchSetMaxViewDuration}
    />
  )
};

export default TimeOptionsContainer;