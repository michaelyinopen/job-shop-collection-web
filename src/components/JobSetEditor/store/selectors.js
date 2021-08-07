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
  machineTitleSelector,
  machineDescriptionSelector,
  jobIdsSelector,
  createProcedureIdsOfJobSelector,
  procedureMachineIdSelector,
  procedureProcessingTimeMsSelector,
  procedureSequenceSelector,
  isAutoTimeOptionsSelector,
  maxTimeMsSelector,
  viewStartTimeMsSelector,
  viewEndTimeMsSelector,
  maxViewDurationMsSelector,
  minViewDurationMsSelector,
} = getFormDataSelectors(jobSetsEditorFormDataSelector)