import { produce } from "immer"
import type {
  FormData,
  Step,
  ValueFieldChange,
  CollectionFieldChange,
  CollectionMoveChange,
  CollectionAddChange,
  CollectionRemoveChange,
} from './types'
import { numberOfSlashes } from "./StepCommon"

function groupby<T, K extends string | number>(
  array: T[],
  f: (item: T) => K
): { [key in K]: T[] } {
  return array.reduce(function (rv, x) {
    (rv[f(x)] = rv[f(x)] || []).push(x)
    return rv
  }, {} as { [key in K]: T[] })
}

function getJobIdFromPath(path: string) {
  const indexOf3rdSlash = '/jobs/entities/'.length
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  return path.substring(indexOf3rdSlash + 1, indexOf4thSlash)
}

function getProcedureIdFromPath(path: string) {
  const indexOf3rdSlash = '/jobs/entities/'.length
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  const indexOf6thSlash = 'procedures/entities/'.length
  const indexOf7thSlash = path.indexOf('/', indexOf6thSlash + 1)
  const preocedureId = path.substring(indexOf6thSlash + 1, indexOf7thSlash)
}

function redoFieldChange(fieldChange: ValueFieldChange, formData: FormData): FormData {
  const { path, newValue } = fieldChange
  return produce(formData, (draft) => {
    if (path === '/name') {
      draft.name = newValue
    }
    else if (path === '/who') {
      draft.who = newValue
    }
    else if (path === '/where') {
      draft.where = newValue
    }
    else if (path === '/howMuch') {
      draft.howMuch = newValue
    }
    else if (path.startsWith('/rides/entities/') && numberOfSlashes(path) === 3) {
      const rideId = path.substring('/rides/entities/'.length)
      if (newValue === undefined) {
        delete draft.rides.entities[rideId]
      } else {
        draft.rides.entities[rideId] = newValue
      }
    }
    else if (path.startsWith('/rides/entities/') && path.endsWith('description')) {
      const rideId = path.substring('/rides/entities/'.length, path.length - 'description'.length - 1)
      draft.rides.entities[rideId].description = newValue
    }
  })
}

function redoRideIdFieldChanges(
  formData: FormData,
  rideIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (rideIdFieldChangeApplies.length === 0) {
    return formData
  }
  let rideIds: string[]

  // move
  const appliedMoveFieldChangeIndex = rideIdFieldChangeApplies
    .findIndex(ca => ca.fieldChange.collectionChange?.type === 'move' && ca.applied)
  if (appliedMoveFieldChangeIndex === -1) {
    rideIds = formData.rides.ids
  } else {
    const previousMoveRideIds: string[] =
      (rideIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    const newMoveRideIds: string[] =
      (rideIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    rideIds = previousMoveRideIds.reduce(
      (accRideIds, pRid, index) => {
        // swap the moved items according to unaltered formData.ride.ids
        accRideIds[formData.rides.ids.indexOf(pRid)] = newMoveRideIds[index]
        return accRideIds
      },
      [...formData.rides.ids]
    )
  }

  // add
  const appliedCollectionAddChanges = rideIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'add')
    .map(ca => ca.fieldChange.collectionChange as CollectionAddChange)
  if (appliedCollectionAddChanges.length > 0) {
    let rideIdsWithAdd: string[] = []
    const rideIdAndIndices: Array<{ id: string, index: number }> =
      rideIds.map((id, index) => ({ id, index }))
    const groupedAddChanges = groupby(appliedCollectionAddChanges, c => c.position.index)
    for (const change of groupedAddChanges['beginning'] ?? []) {
      rideIdsWithAdd.push(change.id)
    }
    for (const { id, index } of rideIdAndIndices) {
      rideIdsWithAdd.push(id)
      for (const change of groupedAddChanges[index] ?? []) {
        rideIdsWithAdd.push(change.id)
      }
    }
    rideIds = rideIdsWithAdd
  }

  // remove
  const appliedCollectionRemoveChanges = rideIdFieldChangeApplies
    .filter(ca => ca.applied && ca.fieldChange.collectionChange?.type === 'remove')
    .map(ca => ca.fieldChange.collectionChange as CollectionRemoveChange)
  for (const removeChange of appliedCollectionRemoveChanges) {
    rideIds = rideIds.filter(id => id !== removeChange.id)
  }

  return {
    ...formData,
    rides: {
      ...formData.rides,
      ids: rideIds
    }
  }
}

export function redoStep(step: Step, previousFormData: FormData): FormData {
  let formData = previousFormData

  const fieldChangeApplied = step.operations
    .flatMap(op => op.fieldChanges.map(fc => ({ fieldChange: fc, applied: op.applied })))

  const rideIdFieldChanges = fieldChangeApplied
    .filter(ca => ca.fieldChange.path === '/rides/ids') as { fieldChange: CollectionFieldChange, applied: boolean }[]
  formData = redoRideIdFieldChanges(formData, rideIdFieldChanges)

  const ordinaryFieldChanges = fieldChangeApplied.filter(ca => ca.fieldChange.path !== '/rides/ids')
  for (const { fieldChange, applied } of ordinaryFieldChanges) {
    if (applied) {
      formData = redoFieldChange(fieldChange as ValueFieldChange, formData)
    }
  }
  return formData
}

function undoFieldChange(fieldChange: ValueFieldChange, formData: FormData): FormData {
  const { path, previousValue } = fieldChange
  return produce(formData, (draft) => {
    if (path === '/name') {
      draft.name = previousValue
    }
    else if (path === '/who') {
      draft.who = previousValue
    }
    else if (path === '/where') {
      draft.where = previousValue
    }
    else if (path === '/howMuch') {
      draft.howMuch = previousValue
    }
    else if (path === '/howMuch') {
      draft.howMuch = previousValue
    }
    else if (path.startsWith('/rides/entities/') && numberOfSlashes(path) === 3) {
      const rideId = path.substring('/rides/entities/'.length)
      if (previousValue === undefined) {
        delete draft.rides.entities[rideId]
      } else {
        draft.rides.entities[rideId] = previousValue
      }
    }
    else if (path.startsWith('/rides/entities/') && path.endsWith('description')) {
      const rideId = path.substring('/rides/entities/'.length, path.length - 'description'.length - 1)
      draft.rides.entities[rideId].description = previousValue
    }
  })
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
    machineIds = formData.machines.ids
  } else {
    const newMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveMachineIds: string[] =
      (machineIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    machineIds = newMoveMachineIds.reduce(
      (accMachineIds, nMid, index) => {
        // swap the moved items according to unaltered formData.ride.ids
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

  return {
    ...formData,
    machines: {
      ...formData.machines,
      ids: machineIds
    }
  }
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
    jobIds = formData.jobs.ids
  } else {
    const newMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveJobIds: string[] =
      (jobIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    jobIds = newMoveJobIds.reduce(
      (accJobIds, nJid, index) => {
        // swap the moved items according to unaltered formData.ride.ids
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

  return {
    ...formData,
    jobs: {
      ...formData.jobs,
      ids: jobIds
    }
  }
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
    jobColorIds = formData.jobColors.ids
  } else {
    const newMoveJobColorIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveJobColorIds: string[] =
      (jobColorIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    jobColorIds = newMoveJobColorIds.reduce(
      (accJobColorIds, nJcid, index) => {
        // swap the moved items according to unaltered formData.ride.ids
        accJobColorIds[formData.jobs.ids.indexOf(nJcid)] = previousMoveJobColorIds[index]
        return accJobColorIds
      },
      [...formData.jobs.ids]
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

  return {
    ...formData,
    jobColors: {
      ...formData.jobColors,
      ids: jobColorIds
    }
  }
}

function undoProcedureIdFieldChanges(
  formData: FormData,
  procedureIdFieldChangeApplies: { fieldChange: CollectionFieldChange, applied: boolean }[]
): FormData {
  if (procedureIdFieldChangeApplies.length === 0) {
    return formData
  }
  let newFormData = formData
  const groupedProcedureIdFieldChanges = groupby(
    procedureIdFieldChangeApplies,
    c => getJobIdFromPath(c.fieldChange.path)
  )
  for (const [jobId, fieldChangeApplies] of Object.entries(groupedProcedureIdFieldChanges)) {
    newFormData = undoProcedureIdFieldChangesForJob(
      jobId,
      newFormData,
      fieldChangeApplies
    )
  }
  return newFormData
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
    procedureIds = formData.jobs.entities[jobId].procedures.ids
  } else {
    const newMoveProdcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).newValue
    const previousMoveProcedureIds: string[] =
      (procedureIdFieldChangeApplies[appliedMoveFieldChangeIndex].fieldChange.collectionChange as CollectionMoveChange).previousValue
    procedureIds = newMoveProdcedureIds.reduce(
      (accProcedureIds, nPid, index) => {
        // swap the moved items according to unaltered formData.ride.ids
        accProcedureIds[formData.jobs.entities[jobId].procedures.ids.indexOf(nPid)] = previousMoveProcedureIds[index]
        return accProcedureIds
      },
      [...formData.jobs.ids]
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

  return {
    ...formData,
    jobs: {
      ...formData.jobs,
      entities: {
        ...formData.jobs.entities,
        [jobId]:{
          ...formData.jobs.entities[jobId],
          procedures:{
            ...formData.jobs.entities[jobId].procedures,
            ids:procedureIds
          }
        },
      }
    }
  }
}

export function undoStep(step: Step, previousFormData: FormData): FormData {
  let formData = previousFormData

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
  formData = undoProcedureIdFieldChanges(formData, jobIdFieldChanges as { fieldChange: CollectionFieldChange, applied: boolean }[])

  const ordinaryFieldChanges = fieldChangeApplied.filter(ca =>
    !machineIdFieldChanges.includes(ca)
    && jobIdFieldChanges.includes(ca)
    && jobColorIdFieldChanges.includes(ca)
    && procedureIdFieldChanges.includes(ca)
  )
  for (const { fieldChange, applied } of ordinaryFieldChanges) {
    if (applied) {
      formData = undoFieldChange(fieldChange as ValueFieldChange, formData)
    }
  }
  return formData
}
