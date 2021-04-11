import { isEqual } from 'lodash';
import {
  initMachines,
  initJobs,
  initProcedures
} from './editContentReducer';

// returns [
//   isEqual:           bool,
//   mappedMachines:    array<machine>?,
//   mappedJobs:        array<job>?,
//   mappedProcedures:  array<procedure>?,
//   isJobsEqual:       bool?,
// ] 
const compareJobSetWithState = (jobSet, machinesState, jobsState, proceduresState) => {
  const mappedMachines = initMachines(jobSet.machines);
  const mappedJobs = initJobs(jobSet.jobs);
  const mappedProcedures = initProcedures(jobSet.jobs);

  if (isEqual(machinesState, mappedMachines) && isEqual(jobsState, mappedJobs) && isEqual(proceduresState, mappedProcedures)) {
    return [true];
  }
  return [false, mappedMachines, mappedJobs, mappedProcedures];
};

export default compareJobSetWithState;