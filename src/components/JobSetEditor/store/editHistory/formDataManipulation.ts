import { produce, current, isDraft } from 'immer'
import type {
  FormData,
  Step,
  ValueFieldChange,
  CollectionFieldChange,
  CollectionMoveChange,
  CollectionAddChange,
  CollectionRemoveChange,
} from './types'
import { getJobIdFromPath, getProcedureIdFromPath, numberOfSlashes } from "./StepCommon"

function groupby<T, K extends string | number>(
  array: T[],
  f: (item: T) => K
): { [key in K]: T[] } {
  return array.reduce(function (rv, x) {
    (rv[f(x)] = rv[f(x)] || []).push(x)
    return rv
  }, {} as { [key in K]: T[] })
}

function redoFieldChange(fieldChange: ValueFieldChange, formData: FormData): FormData {
  const { path, newValue } = fieldChange
  const pathNumberOfSlashes = numberOfSlashes(path)
  if (path === '/title') {
    return {
      ...formData,
      title: newValue
    }
  }
  else if (path === '/description') {
    return {
      ...formData,
      description: newValue
    }
  }
  else if (path === '/isAutoTimeOptions') {
    return {
      ...formData,
      isAutoTimeOptions: newValue
    }
  }
  else if (path === '/manualTimeOptions/maxTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        maxTimeMs: newValue
      }
    }
  }
  else if (path === '/manualTimeOptions/viewStartTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        viewStartTimeMs: newValue
      }
    }
  }
  else if (path === '/manualTimeOptions/viewEndTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        viewEndTimeMs: newValue
      }
    }
  }
  else if (path === '/manualTimeOptions/minViewDurationMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        minViewDurationMs: newValue
      }
    }
  }
  else if (path === '/manualTimeOptions/maxViewDurationMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        maxViewDurationMs: newValue
      }
    }
  }
  else if (path.startsWith('/machines/entities/') && path.endsWith('title')) {
    const machineId = path.substring('/machines/entities/'.length, path.length - 'title'.length - 1)
    return produce(formData, draft => {
      draft.machines.entities[machineId].title = newValue
    })
  }
  else if (path.startsWith('/machines/entities/') && path.endsWith('description')) {
    const machineId = path.substring('/machines/entities/'.length, path.length - 'description'.length - 1)
    return produce(formData, draft => {
      draft.machines.entities[machineId].description = newValue
    })
  }
  else if (path.startsWith('/jobs/entities/') && path.endsWith('title') && pathNumberOfSlashes === 3) {
    const jobId = getJobIdFromPath(path)
    return produce(formData, draft => {
      draft.jobs.entities[jobId].title = newValue
    })
  }
  else if (path.startsWith('/jobColors/entities/') && path.endsWith('textColor')) {
    const jobColorId = path.substring('/jobColors/entities/'.length, path.length - 'textColor'.length - 1)
    return produce(formData, draft => {
      draft.jobColors.entities[jobColorId].textColor = newValue
    })
  }
  else if (path.startsWith('/jobColors/entities/') && path.endsWith('color')) {
    const jobColorId = path.substring('/jobColors/entities/'.length, path.length - 'color'.length - 1)
    return produce(formData, draft => {
      draft.jobColors.entities[jobColorId].color = newValue
    })
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('machineId')) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    if (formData.jobs.entities[jobId] && formData.jobs.entities[jobId].procedures.entities[procedureId]) {
      return produce(formData, draft => {
        draft.jobs.entities[jobId].procedures.entities[procedureId].machineId = newValue
      })
    }
    else {
      return formData
    }
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('processingTimeMs')) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    return produce(formData, draft => {
      draft.jobs.entities[jobId].procedures.entities[procedureId].processingTimeMs = newValue
    })
  }
  else if (path.startsWith('/machines/entities/') && pathNumberOfSlashes === 3) {
    const machineId = path.substring('/machines/entities/'.length)
    if (newValue === undefined) {
      return produce(formData, draft => {
        delete draft.machines.entities[machineId]
      })
    } else {
      return produce(formData, draft => {
        draft.machines.entities[machineId] = newValue
      })
    }
  }
  else if (path.startsWith('/jobs/entities/') && pathNumberOfSlashes === 3) {
    const jobId = path.substring('/jobs/entities/'.length)
    if (newValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobs.entities[jobId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobs.entities[jobId] = newValue
      })
    }
  }
  else if (path.startsWith('/jobColors/entities/') && pathNumberOfSlashes === 3) {
    const jobColorId = path.substring('/jobColors/entities/'.length)
    if (newValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobColors.entities[jobColorId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobColors.entities[jobColorId] = newValue
      })
    }
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && pathNumberOfSlashes === 6) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    if (newValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobs.entities[jobId].procedures.entities[procedureId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobs.entities[jobId].procedures.entities[procedureId] = newValue
      })
    }
  }
  return formData
}

function redoMachineIdFieldChanges(
  formData: FormData,
  machineIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (machineIdFieldChangeApplies.length === 0) {
    return formData
  }
  let machineIds: string[]

  // move
  const appliedMoveFieldChangeIndex = machineIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    machineIds = [...formData.machines.ids]
  } else {
    const previousMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    const newMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    machineIds = previousMoveMachineIds.reduce(
      (accMachineIds, pMid, index) => {
        // swap the moved items according to unaltered formData.machine.ids
        accMachineIds[formData.machines.ids.indexOf(pMid)] = newMoveMachineIds[index]
        return accMachineIds
      },
      [...formData.machines.ids]
    )
  }

  // add
  const appliedCollectionAddChanges = machineIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  if (appliedCollectionAddChanges.length > 0) {
    let machineIdsWithAdd: string[] = []
    const machineIdAndIndices: Array<{ id: string, index: number }> =
      machineIds.map((id, index) => ({ id, index }))
    const groupedAddChanges = groupby(appliedCollectionAddChanges, c => c.position.index)
    for (const change of groupedAddChanges['beginning'] ?? []) {
      machineIdsWithAdd.push(change.id)
    }
    for (const { id, index } of machineIdAndIndices) {
      machineIdsWithAdd.push(id)
      for (const change of groupedAddChanges[index] ?? []) {
        machineIdsWithAdd.push(change.id)
      }
    }
    machineIds = machineIdsWithAdd
  }

  // remove
  const appliedCollectionRemoveChanges = machineIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    machineIds = machineIds.filter(id => id !== removeChange.id)
  }

  return produce(formData, draft => {
    draft.machines.ids = machineIds
  })
}

function redoJobIdFieldChanges(
  formData: FormData,
  jobIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (jobIdFieldChangeApplies.length === 0) {
    return formData
  }
  let jobIds: string[]

  // move
  const appliedMoveFieldChangeIndex = jobIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    jobIds = [...formData.jobs.ids]
  } else {
    const previousMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    const newMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    jobIds = previousMoveJobIds.reduce(
      (accJobIds, pJid, index) => {
        // swap the moved items according to unaltered formData.jobs.ids
        accJobIds[formData.jobs.ids.indexOf(pJid)] = newMoveJobIds[index]
        return accJobIds
      },
      [...formData.jobs.ids]
    )
  }

  // add
  const appliedCollectionAddChanges = jobIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  if (appliedCollectionAddChanges.length > 0) {
    let jobIdsWithAdd: string[] = []
    const jobIdAndIndices: Array<{ id: string, index: number }> =
      jobIds.map((id, index) => ({ id, index }))
    const groupedAddChanges = groupby(appliedCollectionAddChanges, c => c.position.index)
    for (const change of groupedAddChanges['beginning'] ?? []) {
      jobIdsWithAdd.push(change.id)
    }
    for (const { id, index } of jobIdAndIndices) {
      jobIdsWithAdd.push(id)
      for (const change of groupedAddChanges[index] ?? []) {
        jobIdsWithAdd.push(change.id)
      }
    }
    jobIds = jobIdsWithAdd
  }

  // remove
  const appliedCollectionRemoveChanges = jobIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    jobIds = jobIds.filter(id => id !== removeChange.id)
  }

  return produce(formData, draft => {
    draft.jobs.ids = jobIds
  })
}

function redoJobColorIdFieldChanges(
  formData: FormData,
  jobColorIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (jobColorIdFieldChangeApplies.length === 0) {
    return formData
  }
  let jobColorIds: string[]

  // move
  const appliedMoveFieldChangeIndex = jobColorIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    jobColorIds = [...formData.jobColors.ids]
  } else {
    const previousMoveJobIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    const newMoveJobColorIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    jobColorIds = previousMoveJobIds.reduce(
      (accJobColorIds, pJcid, index) => {
        // swap the moved items according to unaltered formData.jobColors.ids
        accJobColorIds[formData.jobColors.ids.indexOf(pJcid)] = newMoveJobColorIds[index]
        return accJobColorIds
      },
      [...formData.jobColors.ids]
    )
  }

  // add
  const appliedCollectionAddChanges = jobColorIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  if (appliedCollectionAddChanges.length > 0) {
    let jobColorIdsWithAdd: string[] = []
    const jobIdAndIndices: Array<{ id: string, index: number }> =
      jobColorIds.map((id, index) => ({ id, index }))
    const groupedAddChanges = groupby(appliedCollectionAddChanges, c => c.position.index)
    for (const change of groupedAddChanges['beginning'] ?? []) {
      jobColorIdsWithAdd.push(change.id)
    }
    for (const { id, index } of jobIdAndIndices) {
      jobColorIdsWithAdd.push(id)
      for (const change of groupedAddChanges[index] ?? []) {
        jobColorIdsWithAdd.push(change.id)
      }
    }
    jobColorIds = jobColorIdsWithAdd
  }

  // remove
  const appliedCollectionRemoveChanges = jobColorIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    jobColorIds = jobColorIds.filter(id => id !== removeChange.id)
  }

  return produce(formData, draft => {
    draft.jobColors.ids = jobColorIds
  })
}

function redoProcedureIdFieldChanges(
  formData: FormData,
  procedureIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (procedureIdFieldChangeApplies.length === 0) {
    return formData
  }
  let resultFormData = formData
  const groupedProcedureIdFieldChanges = groupby(
    procedureIdFieldChangeApplies,
    c => getJobIdFromPath(c.fieldChange.path)
  )
  for (const [jobId, fieldChangeApplies] of Object.entries(groupedProcedureIdFieldChanges)) {
    resultFormData = redoProcedureIdFieldChangesForJob(
      jobId,
      resultFormData,
      fieldChangeApplies
    )
  }
  return resultFormData
}

function redoProcedureIdFieldChangesForJob(
  jobId: string,
  formData: FormData,
  procedureIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (procedureIdFieldChangeApplies.length === 0) {
    return formData
  }
  let procedureIds: string[]

  // move
  const appliedMoveFieldChangeIndex = procedureIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    procedureIds = [...formData.jobs.entities[jobId].procedures.ids]
  } else {
    const previousMoveProcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    const newMoveProcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    procedureIds = previousMoveProcedureIds.reduce(
      (accProcedureIds, pPid, index) => {
        // swap the moved items according to unaltered formData.jobs.ids
        accProcedureIds[formData.jobs.entities[jobId].procedures.ids.indexOf(pPid)] = newMoveProcedureIds[index]
        return accProcedureIds
      },
      [...formData.jobs.entities[jobId].procedures.ids]
    )
  }

  // add
  const appliedCollectionAddChanges = procedureIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  if (appliedCollectionAddChanges.length > 0) {
    let procedureIdsWithAdd: string[] = []
    const procedureIdAndIndices: Array<{ id: string, index: number }> =
      procedureIds.map((id, index) => ({ id, index }))
    const groupedAddChanges = groupby(appliedCollectionAddChanges, c => c.position.index)
    for (const change of groupedAddChanges['beginning'] ?? []) {
      procedureIdsWithAdd.push(change.id)
    }
    for (const { id, index } of procedureIdAndIndices) {
      procedureIdsWithAdd.push(id)
      for (const change of groupedAddChanges[index] ?? []) {
        procedureIdsWithAdd.push(change.id)
      }
    }
    procedureIds = procedureIdsWithAdd
  }

  // remove
  const appliedCollectionRemoveChanges = procedureIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    procedureIds = procedureIds.filter(id => id !== removeChange.id)
  }

  return produce(formData, draft => {
    draft.jobs.entities[jobId].procedures.ids = procedureIds
  })
}

export function redoStep(draftStep: Step, previousFormData: FormData): FormData {
  let formData = isDraft(previousFormData)
    ? current(previousFormData)
    : previousFormData
  const step = isDraft(draftStep)
    ? current(draftStep)
    : draftStep

  const fieldChangeApplied = step.operations
    .flatMap(op => op.fieldChanges.map(fc => ({ fieldChange: fc, applied: op.applied })))

  const machineIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/machines/ids')
  formData = redoMachineIdFieldChanges(formData, machineIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const jobIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/jobs/ids')
  formData = redoJobIdFieldChanges(formData, jobIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const jobColorIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/jobColors/ids')
  formData = redoJobColorIdFieldChanges(formData, jobColorIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const procedureIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path.endsWith('/procedures/ids'))
  formData = redoProcedureIdFieldChanges(formData, procedureIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const ordinaryFieldChanges = fieldChangeApplied.filter(ca =>
    !machineIdFieldChanges.includes(ca)
    && !jobIdFieldChanges.includes(ca)
    && !jobColorIdFieldChanges.includes(ca)
    && !procedureIdFieldChanges.includes(ca)
  )
  for (const { fieldChange, applied } of ordinaryFieldChanges) {
    if (applied) {
      formData = redoFieldChange(fieldChange as ValueFieldChange, formData)
    }
  }
  return formData
}

function undoFieldChange(fieldChange: ValueFieldChange, formData: FormData): FormData {
  const { path, previousValue } = fieldChange
  const pathNumberOfSlashes = numberOfSlashes(path)
  if (path === '/title') {
    return {
      ...formData,
      title: previousValue
    }
  }
  else if (path === '/description') {
    return {
      ...formData,
      description: previousValue
    }
  }
  else if (path === '/isAutoTimeOptions') {
    return {
      ...formData,
      isAutoTimeOptions: previousValue
    }
  }
  else if (path === '/manualTimeOptions/maxTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        maxTimeMs: previousValue
      }
    }
  }
  else if (path === '/manualTimeOptions/viewStartTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        viewStartTimeMs: previousValue
      }
    }
  }
  else if (path === '/manualTimeOptions/viewEndTimeMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        viewEndTimeMs: previousValue
      }
    }
  }
  else if (path === '/manualTimeOptions/minViewDurationMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        minViewDurationMs: previousValue
      }
    }
  }
  else if (path === '/manualTimeOptions/maxViewDurationMs') {
    return {
      ...formData,
      manualTimeOptions: {
        ...formData.manualTimeOptions,
        maxViewDurationMs: previousValue
      }
    }
  }
  else if (path.startsWith('/machines/entities/') && path.endsWith('title')) {
    const machineId = path.substring('/machines/entities/'.length, path.length - 'title'.length - 1)
    return produce(formData, draft => {
      draft.machines.entities[machineId].title = previousValue
    })
  }
  else if (path.startsWith('/machines/entities/') && path.endsWith('description')) {
    const machineId = path.substring('/machines/entities/'.length, path.length - 'description'.length - 1)
    return produce(formData, draft => {
      draft.machines.entities[machineId].description = previousValue
    })
  }
  else if (path.startsWith('/jobs/entities/') && path.endsWith('title') && pathNumberOfSlashes === 3) {
    const jobId = getJobIdFromPath(path)
    return produce(formData, draft => {
      draft.jobs.entities[jobId].title = previousValue
    })
  }
  else if (path.startsWith('/jobColors/entities/') && pathNumberOfSlashes === 3) {
    const jobColorId = path.substring('/jobColors/entities/'.length)
    if (previousValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobColors.entities[jobColorId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobColors.entities[jobColorId] = previousValue
      })
    }
  }
  else if (path.startsWith('/jobColors/entities/') && path.endsWith('textColor')) {
    const jobColorId = path.substring('/jobColors/entities/'.length, path.length - 'textColor'.length - 1)
    return produce(formData, draft => {
      draft.jobColors.entities[jobColorId].textColor = previousValue
    })
  }
  else if (path.startsWith('/jobColors/entities/') && path.endsWith('color')) {
    const jobColorId = path.substring('/jobColors/entities/'.length, path.length - 'color'.length - 1)
    return produce(formData, draft => {
      draft.jobColors.entities[jobColorId].color = previousValue
    })
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('machineId')) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    if (formData.jobs.entities[jobId] && formData.jobs.entities[jobId].procedures.entities[procedureId]) {
      return produce(formData, draft => {
        draft.jobs.entities[jobId].procedures.entities[procedureId].machineId = previousValue
      })
    }
    else {
      return formData
    }
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('processingTimeMs')) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    return produce(formData, draft => {
      draft.jobs.entities[jobId].procedures.entities[procedureId].processingTimeMs = previousValue
    })
  }
  else if (path.startsWith('/machines/entities/') && pathNumberOfSlashes === 3) {
    const machineId = path.substring('/machines/entities/'.length)
    if (previousValue === undefined) {
      return produce(formData, draft => {
        delete draft.machines.entities[machineId]
      })
    } else {
      return produce(formData, draft => {
        draft.machines.entities[machineId] = previousValue
      })
    }
  }
  else if (path.startsWith('/jobs/entities/') && pathNumberOfSlashes === 3) {
    const jobId = path.substring('/jobs/entities/'.length)
    if (previousValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobs.entities[jobId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobs.entities[jobId] = previousValue
      })
    }
  }
  else if (path.startsWith('/jobColors/entities/') && pathNumberOfSlashes === 3) {
    const jobColorId = path.substring('/jobColors/entities/'.length)
    if (previousValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobColors.entities[jobColorId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobColors.entities[jobColorId] = previousValue
      })
    }
  }
  else if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && pathNumberOfSlashes === 6) {
    const jobId = getJobIdFromPath(path)
    const procedureId = getProcedureIdFromPath(path)
    if (previousValue === undefined) {
      return produce(formData, draft => {
        delete draft.jobs.entities[jobId].procedures.entities[procedureId]
      })
    } else {
      return produce(formData, draft => {
        draft.jobs.entities[jobId].procedures.entities[procedureId] = previousValue
      })
    }
  }
  return formData
}

function undoMachineIdFieldChanges(
  formData: FormData,
  machineIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (machineIdFieldChangeApplies.length === 0) {
    return formData
  }
  let machineIds: string[]

  // undo move
  const appliedMoveFieldChangeIndex = machineIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    machineIds = [...formData.machines.ids]
  } else {
    const newMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    machineIds = newMoveMachineIds.reduce(
      (accMachineIds, nMid, index) => {
        // swap the moved items according to unaltered formData.machines.ids
        accMachineIds[formData.machines.ids.indexOf(nMid)] = previousMoveMachineIds[index]
        return accMachineIds
      },
      [...formData.machines.ids]
    )
  }

  // undo add
  const appliedCollectionAddChanges = machineIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  for (const addChange of appliedCollectionAddChanges) {
    machineIds = machineIds.filter(id => id !== addChange.id)
  }

  // undo remove
  const appliedCollectionRemoveChanges = machineIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    machineIds = [
      ...machineIds.slice(0, removeChange.index),
      removeChange.id,
      ...machineIds.slice(removeChange.index),
    ]
  }

  return produce(formData, draft => {
    draft.machines.ids = machineIds
  })
}

function undoJobIdFieldChanges(
  formData: FormData,
  jobIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (jobIdFieldChangeApplies.length === 0) {
    return formData
  }
  let jobIds: string[]

  // undo move
  const appliedMoveFieldChangeIndex = jobIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    jobIds = [...formData.jobs.ids]
  } else {
    const newMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    jobIds = newMoveJobIds.reduce(
      (accJobIds, nJid, index) => {
        // swap the moved items according to unaltered formData.jobs.ids
        accJobIds[formData.jobs.ids.indexOf(nJid)] = previousMoveJobIds[index]
        return accJobIds
      },
      [...formData.jobs.ids]
    )
  }

  // undo add
  const appliedCollectionAddChanges = jobIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  for (const addChange of appliedCollectionAddChanges) {
    jobIds = jobIds.filter(id => id !== addChange.id)
  }

  // undo remove
  const appliedCollectionRemoveChanges = jobIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    jobIds = [
      ...jobIds.slice(0, removeChange.index),
      removeChange.id,
      ...jobIds.slice(removeChange.index),
    ]
  }

  return produce(formData, draft => {
    draft.jobs.ids = jobIds
  })
}

function undoJobColorIdFieldChanges(
  formData: FormData,
  jobColorIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (jobColorIdFieldChangeApplies.length === 0) {
    return formData
  }
  let jobColorIds: string[]

  // undo move
  const appliedMoveFieldChangeIndex = jobColorIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    jobColorIds = [...formData.jobColors.ids]
  } else {
    const newMoveJobColorIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveJobColorIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    jobColorIds = newMoveJobColorIds.reduce(
      (accJobColorIds, nJcid, index) => {
        // swap the moved items according to unaltered formData.jobColors.ids
        accJobColorIds[formData.jobColors.ids.indexOf(nJcid)] = previousMoveJobColorIds[index]
        return accJobColorIds
      },
      [...formData.jobColors.ids]
    )
  }

  // undo add
  const appliedCollectionAddChanges = jobColorIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  for (const addChange of appliedCollectionAddChanges) {
    jobColorIds = jobColorIds.filter(id => id !== addChange.id)
  }

  // undo remove
  const appliedCollectionRemoveChanges = jobColorIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    jobColorIds = [
      ...jobColorIds.slice(0, removeChange.index),
      removeChange.id,
      ...jobColorIds.slice(removeChange.index),
    ]
  }

  return produce(formData, draft => {
    draft.jobColors.ids = jobColorIds
  })
}

function undoProcedureIdFieldChanges(
  formData: FormData,
  procedureIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (procedureIdFieldChangeApplies.length === 0) {
    return formData
  }
  let resultFormData = formData
  const groupedProcedureIdFieldChanges = groupby(
    procedureIdFieldChangeApplies,
    c => getJobIdFromPath(c.fieldChange.path)
  )
  for (const [jobId, fieldChangeApplies] of Object.entries(groupedProcedureIdFieldChanges)) {
    resultFormData = undoProcedureIdFieldChangesForJob(
      jobId,
      resultFormData,
      fieldChangeApplies
    )
  }
  return resultFormData
}

function undoProcedureIdFieldChangesForJob(
  jobId: string,
  formData: FormData,
  procedureIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (procedureIdFieldChangeApplies.length === 0) {
    return formData
  }
  let procedureIds: string[]

  // undo move
  const appliedMoveFieldChangeIndex = procedureIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    procedureIds = [...formData.jobs.entities[jobId].procedures.ids]
  } else {
    const newMoveProdcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveProcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    procedureIds = newMoveProdcedureIds.reduce(
      (accProcedureIds, nPid, index) => {
        // swap the moved items according to unaltered procedures.ids
        accProcedureIds[formData.jobs.entities[jobId].procedures.ids.indexOf(nPid)] = previousMoveProcedureIds[index]
        return accProcedureIds
      },
      [...formData.jobs.entities[jobId].procedures.ids]
    )
  }

  // undo add
  const appliedCollectionAddChanges = procedureIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  for (const addChange of appliedCollectionAddChanges) {
    procedureIds = procedureIds.filter(id => id !== addChange.id)
  }

  // undo remove
  const appliedCollectionRemoveChanges = procedureIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    procedureIds = [
      ...procedureIds.slice(0, removeChange.index),
      removeChange.id,
      ...procedureIds.slice(removeChange.index),
    ]
  }

  return produce(formData, draft => {
    draft.jobs.entities[jobId].procedures.ids = procedureIds
  })
}

export function undoStep(draftStep: Step, previousFormData: FormData): FormData {
  let formData = isDraft(previousFormData)
    ? current(previousFormData)
    : previousFormData
  const step = isDraft(draftStep)
    ? current(draftStep)
    : draftStep

  const fieldChangeApplied = step.operations
    .flatMap(op => op.fieldChanges.map(fc => ({ fieldChange: fc, applied: op.applied })))

  const machineIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/machines/ids')
  formData = undoMachineIdFieldChanges(formData, machineIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const jobIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/jobs/ids')
  formData = undoJobIdFieldChanges(formData, jobIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const jobColorIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/jobColors/ids')
  formData = undoJobColorIdFieldChanges(formData, jobColorIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const procedureIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path.endsWith('/procedures/ids'))
  formData = undoProcedureIdFieldChanges(formData, procedureIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const ordinaryFieldChanges = fieldChangeApplied.filter(ca =>
    !machineIdFieldChanges.includes(ca)
    && !jobIdFieldChanges.includes(ca)
    && !jobColorIdFieldChanges.includes(ca)
    && !procedureIdFieldChanges.includes(ca)
  )
  for (const { fieldChange, applied } of ordinaryFieldChanges) {
    if (applied) {
      formData = undoFieldChange(fieldChange as ValueFieldChange, formData)
    }
  }

  return formData
}
