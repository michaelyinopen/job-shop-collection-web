import {
  jobSetsEditorFormDataSelector,
} from './jobSetEditorReducer'

import {
  getFormDataSelectors,
} from './formDataReducer'

export {
  jobSetsEditorIsEditSelector,
  jobSetsEditorLoadedSelector,
  jobSetsEditorFailedToLoadSelector,
} from './jobSetEditorReducer'

export const {
  titleSelector,
  descriptionSelector,
  machineIdsSelector,
  createMachineTitleSelector,
  createMachineDescriptionSelector,
  jobIdsSelector,
  createJobColorSelector,
  createJobTextColorSelector,
  createProcedureIdsOfJobSelector,
  createProcedureMachineIdSelector,
  createProcedureProcessingTimeMsSelector,
  createProcedureSequenceSelector,
  createProceduresAffectedByMachineSelector,
  isAutoTimeOptionsSelector,
  maxTimeMsSelector,
  viewStartTimeMsSelector,
  viewEndTimeMsSelector,
  maxViewDurationMsSelector,
  minViewDurationMsSelector,
} = getFormDataSelectors(jobSetsEditorFormDataSelector)