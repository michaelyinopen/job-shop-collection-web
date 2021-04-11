import { addMilliseconds, differenceInMilliseconds } from 'date-fns/fp';
import { isEqual } from 'lodash';
import updateObject from "../../../functions/updateObject";
import memoizeOne from 'memoize-one';

const memoizeGetProcessingTimeSum = memoizeOne(
  procedures => Object.values(procedures).reduce((prev, currProcess) => prev + (currProcess.processingMilliseconds ? currProcess.processingMilliseconds : 0), 0)
);

const memoizeSumOfMinTwoProcessingTime = memoizeOne(
  procedures => Object.values(procedures)
    .reduce((minTimes, currProcess) => { // [process1, process2, ...] to [min1, min2]
      if (!currProcess.processingMilliseconds) {
        return minTimes;
      }
      if (!minTimes[0]) { // first element (the min)
        minTimes.push(currProcess.processingMilliseconds);
        return minTimes;
      }
      if (!minTimes[1]) { // second element (the 2ndMin)
        if (currProcess.processingMilliseconds < minTimes[0]) {
          minTimes.unshift(currProcess.processingMilliseconds); // insert at beginning (current is min, previous min is 2ndMin)
          return minTimes;
        }
        minTimes.push(currProcess.processingMilliseconds); // insert at end (current is 2ndMin, previous min is still min)
        return minTimes;
      }
      if (currProcess.processingMilliseconds < minTimes[0]) {
        minTimes.unshift(currProcess.processingMilliseconds);
        minTimes.pop(currProcess.processingMilliseconds);
        return minTimes; //[currProcess.processingMilliseconds, prev[0]] (current is min, previous min is 2ndMin)
      }
      if (currProcess.processingMilliseconds < minTimes[1]) {
        minTimes.splice(1, 1, currProcess.processingMilliseconds);
        return minTimes; //[ prev[0], currProcess.processingMilliseconds] (current is 2ndMin, previous min is still min)
      }
      return minTimes;
    }, [])
    .reduce((a, b) => a + b, 0)// [min1, min2] to min1 + min2
);

const autoTimeOptions = state => {
  const processingTimeSum = memoizeGetProcessingTimeSum(state.procedures);  // remove memoization, because always/usually changed
  const maxTime = addMilliseconds(processingTimeSum)(state.timeOptions.referenceDate);
  const sumOfMinTwoProcessingTime = memoizeSumOfMinTwoProcessingTime(state.procedures); // remove memoization

  let timeOptions = updateObject(
    state.timeOptions,
    {
      maxTime: maxTime,
      viewStartTime: state.timeOptions.referenceDate,
      viewEndTime: maxTime,
      minViewDuration: sumOfMinTwoProcessingTime,
      maxViewDuration: processingTimeSum
    }
  );
  if (isEqual(timeOptions, state.timeOptions)) {
    timeOptions = state.timeOptions;
  }
  return updateObject(state, { timeOptions });
}

export const adjustTimeOptions = state => {
  if (state.isAutoTimeOptions) {
    return autoTimeOptions(state);
  }
  const { procedures, timeOptions } = state;
  const {
    maxTime = addMilliseconds(memoizeGetProcessingTimeSum(procedures))(timeOptions.referenceDate)
  } = timeOptions;
  const {
    viewStartTime = timeOptions.referenceDate
  } = timeOptions;
  const {
    viewEndTime = maxTime
  } = timeOptions;
  const {
    minViewDuration = Math.min(
      differenceInMilliseconds(timeOptions.referenceDate)(maxTime),
      memoizeSumOfMinTwoProcessingTime(state.procedures),
      differenceInMilliseconds(viewStartTime)(viewEndTime)
    )
  } = timeOptions;
  const {
    maxViewDuration = Math.min(
      differenceInMilliseconds(timeOptions.referenceDate)(maxTime),
      Math.max(
        memoizeGetProcessingTimeSum(state.procedures),
        differenceInMilliseconds(viewStartTime)(viewEndTime),
        minViewDuration
      )
    )
  } = timeOptions;

  const newTimeOptions = updateObject(
    timeOptions,
    {
      maxTime,
      viewStartTime,
      viewEndTime,
      minViewDuration,
      maxViewDuration
    }
  );
  return updateObject(state, { timeOptions: newTimeOptions });
}

const isAdjustTimeOptionsRequired = (state, stateBeforeAnyReducers) => {
  const isAutoChangedToTrueFn = () => state.isAutoTimeOptions && state.isAutoTimeOptions !== stateBeforeAnyReducers.isAutoTimeOptions;
  const isAutoAndProceduresChangedFn = () => state.isAutoTimeOptions && state.procedures !== stateBeforeAnyReducers.procedures;
  const timeOptionsChanged = () => state.timeOptions !== stateBeforeAnyReducers.timeOptions;
  return !stateBeforeAnyReducers || isAutoChangedToTrueFn() || isAutoAndProceduresChangedFn() || timeOptionsChanged();
}

const timeOptionsAdjustReducer = (state, _action, stateBeforeAnyReducers) => {
  if (isAdjustTimeOptionsRequired(state, stateBeforeAnyReducers)) {
    return adjustTimeOptions(state);
  }
  return state;
};

export default timeOptionsAdjustReducer;
