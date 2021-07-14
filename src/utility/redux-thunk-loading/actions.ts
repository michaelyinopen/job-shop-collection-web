const takeLeading_Start_type = '@@redux-thunk-loading/takeLeading_Start'
const takeLeading_Start = (name: string) => ({
  type: takeLeading_Start_type,
  payload: { name }
})
takeLeading_Start.type = takeLeading_Start_type
export { takeLeading_Start }

const takeLeading_End_type = '@@redux-thunk-loading/takeLeading_End'
const takeLeading_End = (name: string) => ({
  type: takeLeading_End_type,
  payload: { name }
})
takeLeading_End.type = takeLeading_End_type
export { takeLeading_End }

const takeEvery_Add_type = '@@redux-thunk-loading/takeEvery_Add'
const takeEvery_Add = (name: string) => ({
  type: takeEvery_Add_type,
  payload: { name }
})
takeEvery_Add.type = takeEvery_Add_type
export { takeEvery_Add }

const takeEvery_Remove_type = '@@redux-thunk-loading/takeEvery_Remove'
const takeEvery_Remove = (name: string) => ({
  type: takeEvery_Remove_type,
  payload: { name }
})
takeEvery_Remove.type = takeEvery_Remove_type
export { takeEvery_Remove }

const takeLatest_Add_type = '@@redux-thunk-loading/takeLatest_Add'
const takeLatest_Add = (name: string) => ({
  type: takeLatest_Add_type,
  payload: { name }
})
takeLatest_Add.type = takeLatest_Add_type
export { takeLatest_Add }

const takeLatest_Destroy_type = '@@redux-thunk-loading/takeLatest_Destroy'
const takeLatest_Destroy = (name: string) => ({
  type: takeLatest_Destroy_type,
  payload: { name }
})
takeLatest_Destroy.type = takeLatest_Destroy_type
export { takeLatest_Destroy }

export const reduxThunkLoadingActionTypes = [
  takeLeading_Start,
  takeLeading_End,
  takeEvery_Add,
  takeEvery_Remove,
  takeLatest_Add,
  takeLatest_Destroy
].map(a => a.type)