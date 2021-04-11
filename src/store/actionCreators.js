import * as fromActionTypes from './actionTypes';

export const showSnackbar = message => ({
  type: fromActionTypes.showSnackbar,
  message
});

export const closeSnackbar = () => ({
  type: fromActionTypes.closeSnackbar,
});

export const getJobSetsBegin = () => ({
  type: fromActionTypes.getJobSetsBegin
});

export const getJobSetsSucceed = jobSets => ({
  type: fromActionTypes.getJobSetsSucceed,
  jobSets
});

export const getJobSetsFailed = failedMessage => ({
  type: fromActionTypes.getJobSetsFailed,
  failedMessage
});

export const deleteJobSetBegin = id => ({
  type: fromActionTypes.deleteJobSetBegin,
  id
});

export const deleteJobSetSucceed = (id, clear) => ({
  type: fromActionTypes.deleteJobSetSucceed,
  id,
  clear
});

export const deleteJobSetFailed = (id, clear) => ({
  type: fromActionTypes.deleteJobSetFailed,
  id,
  clear
});

export const clearDeletingJobSets = () => ({
  type: fromActionTypes.clearDeletingJobSets,
});

export const setCurrentJobSetId = id => ({
  type: fromActionTypes.setCurrentJobSetId,
  id
});

export const getJobSetBegin = id => ({
  type: fromActionTypes.getJobSetBegin,
  id
});

export const getJobSetSucceed = (id, jobSet) => ({
  type: fromActionTypes.getJobSetSucceed,
  id,
  title: jobSet.title,
  description: jobSet.description,
  content: JSON.parse(jobSet.content),
  jobColors: JSON.parse(jobSet.jobColors),
  isAutoTimeOptions: jobSet.isAutoTimeOptions,
  timeOptions: JSON.parse(jobSet.timeOptions),
  isLocked: jobSet.isLocked,
  eTag: jobSet.eTag,
});

export const getJobSetFailed = (id, failedMessage) => ({
  type: fromActionTypes.getJobSetFailed,
  id,
  failedMessage
});

export const createJobSetBegin = creatingId => ({
  type: fromActionTypes.createJobSetBegin,
  creatingId
});

export const createJobSetSucceed = (creatingId, id, jobSet) => ({
  type: fromActionTypes.createJobSetSucceed,
  id,
  creatingId,
  title: jobSet.title,
  description: jobSet.description,
  content: JSON.parse(jobSet.content),
  jobColors: JSON.parse(jobSet.jobColors),
  isAutoTimeOptions: jobSet.isAutoTimeOptions,
  timeOptions: JSON.parse(jobSet.timeOptions),
  isLocked: jobSet.isLocked,
  eTag: jobSet.eTag,
});

export const createJobSetFailed = (creatingId, failedMessage) => ({
  type: fromActionTypes.createJobSetFailed,
  creatingId,
  failedMessage
});

export const updateJobSetBegin = id => ({
  type: fromActionTypes.updateJobSetBegin,
  id
});

export const updateJobSetSucceed = (id, jobSet) => ({
  type: fromActionTypes.updateJobSetSucceed,
  id,
  title: jobSet.title,
  description: jobSet.description,
  content: JSON.parse(jobSet.content),
  jobColors: JSON.parse(jobSet.jobColors),
  isAutoTimeOptions: jobSet.isAutoTimeOptions,
  timeOptions: JSON.parse(jobSet.timeOptions),
  isLocked: jobSet.isLocked,
  eTag: jobSet.eTag,
});

export const updateJobSetFailed = (id, failedMessage) => ({
  type: fromActionTypes.updateJobSetFailed,
  id,
  failedMessage
});