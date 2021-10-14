import type { AppStoreJobSetDetail } from '../actions'
import { appStoreJobSet_To_FormData } from '../formDataConversion'
import type {
  FormData,
  Step,
  Operation,
  FieldChange,
  GroupedFieldChanges,
  CollectionFieldChange,
  CollectionAddChange,
  CollectionRemoveChange,
} from './types'
import {
  calculateStepName,
  getFieldChanges,
  getJobIdFromPath,
  numberOfSlashes,
} from "./StepCommon"

export function calculateRefreshedStep(
  previousVersionFormData: FormData,
  localFormData: FormData,
  remoteJobSet: AppStoreJobSetDetail
): Step | undefined {
  const remoteFormData = appStoreJobSet_To_FormData(remoteJobSet)

  const remoteVsLocal = getFieldChanges(localFormData, remoteFormData)
  const localVsPreviousVersion = getFieldChanges(previousVersionFormData, localFormData)
  const remoteVsPreviousVersion = getFieldChanges(previousVersionFormData, remoteFormData)

  const operations: Operation[] = []

  for (const change of remoteVsLocal) {
    const operation = calculateOperationFromRefreshedFieldChange(
      change,
      localVsPreviousVersion,
      remoteVsPreviousVersion)
    operations.push(operation)
  }

  if (operations.length === 0) {
    return undefined
  }
  const mergeBehaviour = operations.some(op => op.type === 'reverse local' || op.type === 'conflict')
    ? 'merge'
    : 'discard local changes'
  return {
    name: 'Refreshed',
    operations,
    versionToken: remoteJobSet.versionToken,
    mergeBehaviour,
  }
}

function calculateOperationFromRefreshedFieldChange(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation {
  const isRemoveRideResult = isRemovedRide(change)
  if (isRemoveRideResult[0]) {
    const removedRideId = isRemoveRideResult[1]
    if (localVsPreviousVersion.some(cs => isEditRideFor(removedRideId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Remove ride',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isRemovedRideFor(removedRideId, cs))) {
      return {
        type: 'merge' as const,
        fieldChanges: [change].flat(),
        applied: true
      }
    } else {
      return {
        type: 'reverse local' as const,
        fieldChanges: [change].flat(),
        applied: false
      }
    }
  }
  if (isMovedRides(change)) {
    if (remoteVsPreviousVersion.some(cs => isMovedRides(cs))
      && localVsPreviousVersion.some(cs => isMovedRides(cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Move rides',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isMovedRides(cs))) {
      return {
        type: 'merge' as const,
        fieldChanges: [change].flat(),
        applied: true
      }
    } else {
      return {
        type: 'reverse local' as const,
        fieldChanges: [change].flat(),
        applied: false
      }
    }
  }
  const isAddedRideResult = isAddedRide(change)
  if (isAddedRideResult[0]) {
    const addedRideId = isAddedRideResult[1]
    if (remoteVsPreviousVersion.some(cs => isEditRideFor(addedRideId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Reverse remove ride',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isAddedRideFor(addedRideId, cs))) {
      return {
        type: 'merge' as const,
        fieldChanges: [change].flat(),
        applied: true
      }
    } else {
      return {
        type: 'reverse local' as const,
        fieldChanges: [change].flat(),
        applied: false
      }
    }
  }

  // the remaining simple changes
  const fieldChange = change as FieldChange
  if (!localVsPreviousVersion.flat().some(c => c.path === fieldChange.path)) {
    // remote changed and there are no local edits
    return {
      type: 'merge' as const,
      fieldChanges: [fieldChange],
      applied: true
    }
  }
  else if (remoteVsPreviousVersion.flat().some(c => c.path === fieldChange.path)) {
    // remote and local both changed
    return {
      type: 'conflict' as const,
      fieldChanges: [fieldChange],
      conflictName: calculateStepName([fieldChange]),
      conflictApplied: true,
      applied: true
    }
  }
  else {
    // only local changed
    return {
      type: 'reverse local' as const,
      fieldChanges: [fieldChange],
      applied: false
    }
  }
}

//#region complex Machine changes
function isRemoveMachine(change: FieldChange | GroupedFieldChanges): [true, string] | [false, undefined] {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const removedId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return [true, removedId]
    }
  }
  return [false, undefined]
}

function isRemoveMachineFor(machineId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove'
      && c.collectionChange.id === machineId
    )
}

function isEditMachineFor(machineId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return !Array.isArray(change)
    && change.path.startsWith(`/machines/entities/${machineId}`)
    && numberOfSlashes(change.path) > 3
}

function isMoveMachines(change: FieldChange | GroupedFieldChanges): boolean {
  return !Array.isArray(change) && change.path === '/machines/ids'
}

function isAddMachine(change: FieldChange | GroupedFieldChanges): [true, string] | [false, undefined] {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return [true, addedId]
    }
  }
  return [false, undefined]
}

function isAddMachineFor(machineId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add'
      && c.collectionChange.id === machineId
    )
}
//#endregion complex Machine changes

//#region complex Job changes
function isRemoveJob(change: FieldChange | GroupedFieldChanges): [true, string] | [false, undefined] {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const removedId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return [true, removedId]
    }
  }
  return [false, undefined]
}

function isRemoveJobFor(jobId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove'
      && c.collectionChange.id === jobId
    )
}

function isEditJobFor(jobId: string, change: FieldChange | GroupedFieldChanges): boolean {
  const isEditJob = !Array.isArray(change)
    && change.path.startsWith(`/jobs/entities/${jobId}`)
    && numberOfSlashes(change.path) > 3
  const isEditJobColor = !Array.isArray(change)
    && change.path.startsWith(`/jobColors/entities/${jobId}`)
    && numberOfSlashes(change.path) > 3
  return isEditJob || isEditJobColor
}

function isMoveJobs(change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change) && change.every(c => c.path === '/jobs/ids' || c.path === '/jobColors/ids')
}

function isAddJob(change: FieldChange | GroupedFieldChanges): [true, string] | [false, undefined] {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return [true, addedId]
    }
  }
  return [false, undefined]
}

function isAddJobFor(jobId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add'
      && c.collectionChange.id === jobId
    )
}
//#endregion complex Job changes

//#region complex Procedure changes
function isRemoveProcedure(change: FieldChange | GroupedFieldChanges)
  : [true, { jobId: string, procedureId: string }] | [false, undefined] {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path.endsWith('/procedures/ids')
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const jobId = getJobIdFromPath(removeIdFieldChange.path)
      const removedProcedureId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return [true, { jobId, procedureId: removedProcedureId }]
    }
  }
  return [false, undefined]
}

function isRemoveProcedureFor(jobId: string, procedureId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === `/jobs/entities/${jobId}/procedures/ids`
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove'
      && c.collectionChange.id === procedureId
    )
}

function isEditProcedureFor(jobId: string, procedureId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return [change].flat().some(c =>
    c.path.startsWith(`/jobs/entities/${jobId}/procedures/entities/${procedureId}`)
    && numberOfSlashes(c.path) > 6
  )
}

function isMoveProcedures(change: FieldChange | GroupedFieldChanges): boolean {
  return !Array.isArray(change) && change.path.endsWith('/procedures/ids')
}

function isAddProcedure(change: FieldChange | GroupedFieldChanges)
  : [true, { jobId: string, procedureId: string }] | [false, undefined] {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path.endsWith('/procedures/ids')
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const jobId = getJobIdFromPath(addIdFieldChange.path)
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return [true, { jobId, procedureId: addedId }]
    }
  }
  return [false, undefined]
}

function isAddProcedureFor(jobId: string, procedureId: string, change: FieldChange | GroupedFieldChanges): boolean {
  return Array.isArray(change)
    && change.some(c =>
      c.path === `/jobs/entities/${jobId}/procedures/ids`
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add'
      && c.collectionChange.id === procedureId
    )
}
//#endregion complex Procedure changes

