import {
  getJobColorIdFromPath,
  getJobIdFromPath,
  getMachineIdFromPath,
  getProcedureIdFromPath,
  numberOfSlashes,
} from './StepCommon'
import type {
  ValueFieldChange,
  CollectionAddChange,
  CollectionFieldChange,
  CollectionRemoveChange,
  FieldChange,
  Operation,
  Step,
} from './types'

export function conflictHasRelatedChanges(conflict: Operation, step: Step): boolean {
  const stepFieldChanges = step.operations.flatMap(op => op.fieldChanges)
  if (conflict.fieldChanges.some(ac => stepFieldChanges.some(bc => bc.path === ac.path))) {
    return true
  }

  const isAddOrRemoveMachineResult = isAddOrRemoveMachine(conflict.fieldChanges)
  if (isAddOrRemoveMachineResult.addOrRemove) {
    const { machineId } = isAddOrRemoveMachineResult
    if (step.operations.some(op =>
      isEditMachineFor(machineId, op.fieldChanges)
      || isEditProcedureMachineIdOf(machineId, op.fieldChanges)
    )) {
      return true
    }
  }

  const isEditMachineResult = isEditMachine(conflict.fieldChanges)
  if (isEditMachineResult.edit) {
    const { machineId } = isEditMachineResult
    if (step.operations.some(op => isAddOrRemoveMachineFor(machineId, op.fieldChanges))) {
      return true
    }
  }

  const isEditProcedureMachineIdResult = isEditProcedureMachineId(conflict.fieldChanges)
  if (isEditProcedureMachineIdResult.edit) {
    const { machineIds } = isEditProcedureMachineIdResult
    if (step.operations.some(op =>
      machineIds.some(mId => isAddOrRemoveMachineFor(mId, op.fieldChanges))
    )) {
      return true
    }
  }

  const isAddOrRemoveJobResult = isAddOrRemoveJob(conflict.fieldChanges)
  if (isAddOrRemoveJobResult.addOrRemove) {
    const { jobId } = isAddOrRemoveJobResult
    if (step.operations.some(op => isEditJobOrJobColorFor(jobId, op.fieldChanges))) {
      return true
    }
  }

  const isEditJobOrJobColorResult = isEditJobOrJobColor(conflict.fieldChanges)
  if (isEditJobOrJobColorResult.edit) {
    const { jobId } = isEditJobOrJobColorResult
    if (step.operations.some(op => isAddOrRemoveJobFor(jobId, op.fieldChanges))) {
      return true
    }
  }

  const isAddOrRemoveProcedureResult = isAddOrRemoveProcedure(conflict.fieldChanges)
  if (isAddOrRemoveProcedureResult.addOrRemove) {
    const { jobId, procedureId } = isAddOrRemoveProcedureResult
    if (step.operations.some(op => isEditProcedureFor(jobId, procedureId, op.fieldChanges))) {
      return true
    }
  }

  const isEditProcedureResult = isEditProcedure(conflict.fieldChanges)
  if (isEditProcedureResult.edit) {
    const { jobId, procedureId } = isEditProcedureResult
    if (step.operations.some(op => isAddOrRemoveProcedureFor(jobId, procedureId, op.fieldChanges))) {
      return true
    }
  }

  return false
}

//#region Machine
function isAddOrRemoveMachine(change: FieldChange[]): { addOrRemove: true, machineId: string } | { addOrRemove: false } {
  if (change.length > 1) {
    const addOrRemoveIdFieldChange = change.find(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'remove' || c.collectionChange?.type === 'add')
    ) as CollectionFieldChange | undefined
    if (addOrRemoveIdFieldChange) {
      const machineId = (addOrRemoveIdFieldChange.collectionChange as CollectionRemoveChange | CollectionAddChange).id
      return { addOrRemove: true, machineId }
    }
  }
  return { addOrRemove: false }
}

function isEditMachine(change: FieldChange[]): { edit: true, machineId: string } | { edit: false } {
  if (change.length === 1) {
    const editFieldChange = change.find(c =>
      c.path.startsWith('/machines/entities/')
      && numberOfSlashes(c.path) > 3
    )
    if (editFieldChange) {
      const machineId = getMachineIdFromPath(editFieldChange.path)
      return { edit: true, machineId }
    }
  }
  return { edit: false }
}

function isEditProcedureMachineId(change: FieldChange[]): { edit: true, machineIds: string[] } | { edit: false } {
  const editFieldChanges = change.filter(c =>
    c.path.startsWith('/jobs/entities/')
    && c.path.includes('/procedures/entities/')
    && c.path.endsWith('/machineId')
    && numberOfSlashes(c.path) === 7
  ) as ValueFieldChange[]
  if (editFieldChanges.length > 0) {
    const machineIds: string[] = []
    for (const editFieldChange of editFieldChanges) {
      if (editFieldChange.previousValue && !machineIds.includes(editFieldChange.previousValue)) {
        machineIds.push(editFieldChange.previousValue)
      }
      if (editFieldChange.newValue && !machineIds.includes(editFieldChange.newValue)) {
        machineIds.push(editFieldChange.newValue)
      }
    }
    return { edit: true, machineIds }
  }
  return { edit: false }
}

function isAddOrRemoveMachineFor(machineId: string, change: FieldChange[]): boolean {
  return change.length > 1
    && change.some(c =>
      c.path === '/machines/ids'
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'add' || c.collectionChange?.type === 'remove')
      && c.collectionChange.id === machineId
    )
}

function isEditMachineFor(machineId: string, change: FieldChange[]): boolean {
  return change.length === 1
    && change[0].path.startsWith(`/machines/entities/${machineId}`)
    && numberOfSlashes(change[0].path) > 3
}

function isEditProcedureMachineIdOf(machineId: string, change: FieldChange[]): boolean {
  return change.some(c =>
    c.path.startsWith('/jobs/entities/')
    && c.path.includes('/procedures/entities/')
    && c.path.endsWith('/machineId')
    && numberOfSlashes(c.path) === 7
    && ((c as ValueFieldChange).newValue === machineId || (c as ValueFieldChange).previousValue === machineId)
  )
}
//#endregion Machine

//#region Job
function isAddOrRemoveJob(change: FieldChange[]): { addOrRemove: true, jobId: string } | { addOrRemove: false } {
  if (change.length > 1) {
    const addOrRemoveIdFieldChange = change.find(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'remove' || c.collectionChange?.type === 'add')
    ) as CollectionFieldChange | undefined
    if (addOrRemoveIdFieldChange) {
      const jobId = (addOrRemoveIdFieldChange.collectionChange as CollectionRemoveChange | CollectionAddChange).id
      return { addOrRemove: true, jobId }
    }
  }
  return { addOrRemove: false }
}

function isEditJobOrJobColor(change: FieldChange[]): { edit: true, jobId: string } | { edit: false } {
  const editJobFieldChange = change.find(c =>
    c.path.startsWith('/jobs/entities/')
    && numberOfSlashes(c.path) > 3
  )
  if (editJobFieldChange) {
    const jobId = getJobIdFromPath(editJobFieldChange.path)
    return { edit: true, jobId }
  }
  const editJobColorFieldChange = change.find(c =>
    c.path.startsWith('/jobColors/entities/')
    && numberOfSlashes(c.path) > 3
  )
  if (editJobColorFieldChange) {
    const jobId = getJobColorIdFromPath(editJobColorFieldChange.path)
    return { edit: true, jobId }
  }
  return { edit: false }
}

function isAddOrRemoveJobFor(jobId: string, change: FieldChange[]): boolean {
  return change.length > 1
    && change.some(c =>
      c.path === '/jobs/ids'
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'add' || c.collectionChange?.type === 'remove')
      && c.collectionChange.id === jobId
    )
}

function isEditJobOrJobColorFor(jobId: string, change: FieldChange[]): boolean {
  const isEditJob = change.length === 1
    && change[0].path.startsWith(`/jobs/entities/${jobId}`)
    && numberOfSlashes(change[0].path) > 3
  const isEditJobColor = change.length === 1
    && change[0].path.startsWith(`/jobColors/entities/${jobId}`)
    && numberOfSlashes(change[0].path) > 3
  return isEditJob || isEditJobColor
}
//#endregion Job

//#region Procedure
function isAddOrRemoveProcedure(change: FieldChange[])
  : { addOrRemove: true, jobId: string, procedureId: string } | { addOrRemove: false } {
  if (change.length > 1) {
    const addOrRemoveIdFieldChange = change.find(c =>
      c.path.endsWith('/procedures/ids')
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'remove' || c.collectionChange?.type === 'add')
    ) as CollectionFieldChange | undefined
    if (addOrRemoveIdFieldChange) {
      const jobId = getJobIdFromPath(addOrRemoveIdFieldChange.path)
      const procedureId = (addOrRemoveIdFieldChange.collectionChange as CollectionRemoveChange | CollectionAddChange).id
      return { addOrRemove: true, jobId, procedureId }
    }
  }
  return { addOrRemove: false }
}

function isEditProcedure(change: FieldChange[])
  : { edit: true, jobId: string, procedureId: string } | { edit: false } {
  const editFieldChange = change.find(c =>
    c.path.startsWith('/jobs/entities/')
    && c.path.includes('/procedures/entities/')
    && numberOfSlashes(c.path) > 6
  )
  if (editFieldChange) {
    const jobId = getJobIdFromPath(editFieldChange.path)
    const procedureId = getProcedureIdFromPath(editFieldChange.path)
    return { edit: true, jobId, procedureId }
  }
  return { edit: false }
}

function isAddOrRemoveProcedureFor(jobId: string, procedureId: string, change: FieldChange[]): boolean {
  return change.length > 1
    && change.some(c =>
      c.path === `/jobs/entities/${jobId}/procedures/ids`
      && 'collectionChange' in c
      && (c.collectionChange?.type === 'add' || c.collectionChange?.type === 'remove')
      && c.collectionChange.id === procedureId
    )
}

function isEditProcedureFor(jobId: string, procedureId: string, change: FieldChange[]): boolean {
  return change.some(c =>
    c.path.startsWith(`/jobs/entities/${jobId}/procedures/entities/${procedureId}`)
    && numberOfSlashes(c.path) > 6
  )
}
//#endregion Procedure
