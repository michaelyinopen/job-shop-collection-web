import { nanoid } from 'nanoid'
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
  remoteFormData: FormData,
  remoteVersionToken: string
): Step | undefined {

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
    id: nanoid(),
    name: 'Refreshed',
    operations,
    versionToken: remoteVersionToken,
    mergeBehaviour,
  }
}

function calculateOperationFromRefreshedFieldChange(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation {
  const machineOperation = calculateComplexMachineOperation(
    change,
    localVsPreviousVersion,
    remoteVsPreviousVersion,
  )
  if (machineOperation) {
    return machineOperation
  }

  const jobOperation = calculateComplexJobOperation(
    change,
    localVsPreviousVersion,
    remoteVsPreviousVersion,
  )
  if (jobOperation) {
    return jobOperation
  }

  const procedureOperation = calculateComplexProcedureOperation(
    change,
    localVsPreviousVersion,
    remoteVsPreviousVersion,
  )
  if (procedureOperation) {
    return procedureOperation
  }

  // the remaining simple changes
  return calculateSimpleChangeOperation(
    change,
    localVsPreviousVersion,
    remoteVsPreviousVersion
  )
}

//#region complex Machine operation
function calculateComplexMachineOperation(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation | void {
  const isRemoveMachineResult = isRemoveMachine(change)
  if (isRemoveMachineResult.remove) {
    const { machineId } = isRemoveMachineResult
    if (localVsPreviousVersion.some(cs => isEditMachineFor(machineId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Remove machine',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isRemoveMachineFor(machineId, cs))) {
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
  if (isMoveMachines(change)) {
    if (remoteVsPreviousVersion.some(cs => isMoveMachines(cs))
      && localVsPreviousVersion.some(cs => isMoveMachines(cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Move machines',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isMoveMachines(cs))) {
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
  const isAddMachineResult = isAddMachine(change)
  if (isAddMachineResult.add) {
    const { machineId } = isAddMachineResult
    if (remoteVsPreviousVersion.some(cs => isEditMachineFor(machineId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Reverse remove machine',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isAddMachineFor(machineId, cs))) {
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
}

function isRemoveMachine(change: FieldChange | GroupedFieldChanges): { remove: true, machineId: string } | { remove: false } {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const removedId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return { remove: true, machineId: removedId }
    }
  }
  return { remove: false }
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

function isAddMachine(change: FieldChange | GroupedFieldChanges): { add: true, machineId: string } | { add: false } {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return { add: true, machineId: addedId }
    }
  }
  return { add: false }
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
//#endregion complex Machine operation

//#region complex Job operation
function calculateComplexJobOperation(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation | void {
  const isRemoveJobResult = isRemoveJob(change)
  if (isRemoveJobResult.remove) {
    const { jobId } = isRemoveJobResult
    if (localVsPreviousVersion.some(cs => isEditJobFor(jobId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Remove job',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isRemoveJobFor(jobId, cs))) {
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
  if (isMoveJobs(change)) {
    if (remoteVsPreviousVersion.some(cs => isMoveJobs(cs))
      && localVsPreviousVersion.some(cs => isMoveJobs(cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Move jobs',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isMoveJobs(cs))) {
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
  const isAddJobResult = isAddJob(change)
  if (isAddJobResult.add) {
    const { jobId } = isAddJobResult
    if (remoteVsPreviousVersion.some(cs => isEditJobFor(jobId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Reverse remove job',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isAddJobFor(jobId, cs))) {
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
}

function isRemoveJob(change: FieldChange | GroupedFieldChanges): { remove: true, jobId: string } | { remove: false } {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const removedId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return { remove: true, jobId: removedId }
    }
  }
  return { remove: false }
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

function isAddJob(change: FieldChange | GroupedFieldChanges): { add: true, jobId: string } | { add: false } {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return { add: true, jobId: addedId }
    }
  }
  return { add: false }
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
//#endregion complex Job operation

//#region complex Procedure operation
function calculateComplexProcedureOperation(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation | void {
  const isRemoveProcedureResult = isRemoveProcedure(change)
  if (isRemoveProcedureResult.remove) {
    const { jobId, procedureId } = isRemoveProcedureResult
    if (localVsPreviousVersion.some(cs => isEditProcedureFor(jobId, procedureId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Remove procedure',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isRemoveProcedureFor(jobId, procedureId, cs))) {
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
  if (isMoveProcedures(change)) {
    if (remoteVsPreviousVersion.some(cs => isMoveProcedures(cs))
      && localVsPreviousVersion.some(cs => isMoveProcedures(cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Move procedures',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isMoveProcedures(cs))) {
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
  const isAddProcedureResult = isAddProcedure(change)
  if (isAddProcedureResult.add) {
    const { jobId, procedureId } = isAddProcedureResult
    if (remoteVsPreviousVersion.some(cs => isEditProcedureFor(jobId, procedureId, cs))) {
      return {
        type: 'conflict' as const,
        fieldChanges: [change].flat(),
        conflictName: 'Reverse remove procedure',
        conflictApplied: true,
        applied: true
      }
    } else if (remoteVsPreviousVersion.some(cs => isAddProcedureFor(jobId, procedureId, cs))) {
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
}

function isRemoveProcedure(change: FieldChange | GroupedFieldChanges)
  : { remove: true, jobId: string, procedureId: string } | { remove: false } {
  if (Array.isArray(change)) {
    const removeIdFieldChange = change.find(c =>
      c.path.endsWith('/procedures/ids')
      && 'collectionChange' in c
      && c.collectionChange?.type === 'remove') as CollectionFieldChange | undefined
    if (removeIdFieldChange) {
      const jobId = getJobIdFromPath(removeIdFieldChange.path)
      const removedProcedureId = (removeIdFieldChange.collectionChange as CollectionRemoveChange).id
      return { remove: true, jobId, procedureId: removedProcedureId }
    }
  }
  return { remove: false }
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
  : { add: true, jobId: string, procedureId: string } | { add: false } {
  if (Array.isArray(change)) {
    const addIdFieldChange = change.find(c =>
      c.path.endsWith('/procedures/ids')
      && 'collectionChange' in c
      && c.collectionChange?.type === 'add') as CollectionFieldChange
    if (addIdFieldChange) {
      const jobId = getJobIdFromPath(addIdFieldChange.path)
      const addedId = (addIdFieldChange.collectionChange as CollectionAddChange).id
      return { add: true, jobId, procedureId: addedId }
    }
  }
  return { add: false }
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
//#endregion complex Procedure operation

function calculateSimpleChangeOperation(
  change: FieldChange | GroupedFieldChanges,
  localVsPreviousVersion: (FieldChange | GroupedFieldChanges)[],
  remoteVsPreviousVersion: (FieldChange | GroupedFieldChanges)[]
): Operation {
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