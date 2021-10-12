import { ProcedureState } from '../jobSetEditorReducer'
import type {
  FormData,
  FieldChange,
  GroupedFieldChanges
} from './types'

export function numberOfSlashes(value: string): number {
  return [...value].filter(c => c === '/').length
}

export function arraysEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function getUpdatedProcedureMachineIdsMap(
  previousProcedures: ProcedureState[],
  currentProcedures: ProcedureState[],
) {
  // notice undefined and null
  // e.g. procedures which are deleted will have currentMachineId === undefined
  // e.g. procedures which cleared machineId selection will have currentMachineId === null
  let procedureMap: Map<string, { jobId: string, previousMachineId?: string | null, currentMachineId?: string | null }> =
    new Map(previousProcedures.map(pp => [
      pp.id,
      {
        jobId: pp.jobId,
        previousMachineId: pp.machineId
      }
    ]))
  for (const currentProcedure of currentProcedures) {
    const mappedProcedure = procedureMap.get(currentProcedure.id)
    if (mappedProcedure && mappedProcedure.previousMachineId === currentProcedure.machineId) {
      procedureMap.delete(currentProcedure.id)
    }
    else if (mappedProcedure?.previousMachineId == null && currentProcedure.machineId == null) {
      procedureMap.delete(currentProcedure.id)
    }
    else {
      const newMappedProcedure = {
        ...mappedProcedure,
        jobId: currentProcedure.jobId,
        currentMachineId: currentProcedure.machineId
      }
      procedureMap.set(currentProcedure.id, newMappedProcedure)
    }
  }
  return procedureMap
}

// machines and procedure's machine option
// field changes placed after procedure's changes
// added procedure's machineId has to be null (e.g. added machine assigned to added procedure, then unapply add machine)
function getMachinesFieldChanges(previousFormData: FormData, currentFormData: FormData): Array<FieldChange | GroupedFieldChanges> {
  const previousMachineIds = previousFormData.machines.ids
  const currentMachineIds = currentFormData.machines.ids
  const previousProcedures = Object.values(previousFormData.jobs.entities)
    .flatMap(j => Object.values(j.procedures.entities))
  const currentProcedures = Object.values(currentFormData.jobs.entities)
    .flatMap(j => Object.values(j.procedures.entities))

  function getRemoveMachineFieldChanges(
    previousMachineIds: string[],
    currentMachineIds: string[],
    previousProcedures: ProcedureState[]
  ) {
    let removeMachineFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    let removedMachineProcedureIds: Array<string> = []
    const previousMachineIdAndIndices: Array<{ id: string, index: number }> =
      previousMachineIds.map((id, index) => ({ id, index }))
    const removedMachineIds = previousMachineIds.filter(pMId => !currentMachineIds.includes(pMId))
    for (const removedMachineId of removedMachineIds) {
      const removedIdIndex = previousMachineIdAndIndices.find(i => i.id === removedMachineId)
      const idFieldChange = {
        path: '/machines/ids',
        collectionChange: {
          type: 'remove' as const,
          id: removedMachineId,
          index: removedIdIndex!.index
        }
      }
      const entityFieldChange = {
        path: `/machines/entities/${removedMachineId}`,
        previousValue: previousFormData.machines.entities[removedMachineId],
        newValue: undefined
      }
      // procedure's machineIds
      const removedMachineIdProcedures = previousProcedures.filter(x =>
        x.machineId === removedMachineId)
      const procedurMachineIdFieldChanges: Array<FieldChange> = removedMachineIdProcedures.map(p => ({
        path: `/jobs/entities/${p.jobId}/procedures/entities/${p.id}/machineId`,
        previousValue: removedMachineId,
        newValue: null
      }))
      removedMachineProcedureIds.push(...removedMachineIdProcedures.map(p => p.id))

      removeMachineFieldChanges.push([idFieldChange, entityFieldChange, ...procedurMachineIdFieldChanges])
    }
    return [removeMachineFieldChanges, removedMachineProcedureIds] as const
  }
  const [removeMachineFieldChanges, removedMachineProcedureIds] = getRemoveMachineFieldChanges(
    previousMachineIds,
    currentMachineIds,
    previousProcedures
  )

  function getMoveMachineFieldChanges(
    previousMachineIds: string[],
    currentMachineIds: string[]
  ) {
    // machines that are not added or removed
    const correspondingPreviousMachineIds = previousMachineIds.filter(cMId => currentMachineIds.includes(cMId))
    const correspondingCurrentMachineIds = currentMachineIds.filter(cMId => previousMachineIds.includes(cMId))
    return arraysEqual(correspondingPreviousMachineIds, correspondingCurrentMachineIds)
      ? []
      : [
        {
          path: '/machines/ids',
          collectionChange: {
            type: 'move' as const,
            previousValue: correspondingPreviousMachineIds,
            newValue: correspondingCurrentMachineIds,
          }
        }
      ]
  }
  const moveMachineFieldChanges = getMoveMachineFieldChanges(
    previousMachineIds,
    currentMachineIds
  )

  function getUpdateMachineFieldChanges(
    previousMachineIds: string[],
    currentMachineIds: string[]
  ) {
    let updateMachineFieldChanges: Array<FieldChange> = []
    const commonMachineIds = currentMachineIds.filter(cMId => previousMachineIds.includes(cMId))
    for (const commonMachineId of commonMachineIds) {
      const previousMachine = previousFormData.machines.entities[commonMachineId]
      const currentMachine = currentFormData.machines.entities[commonMachineId]
      if (previousMachine.title !== currentMachine.title) {
        updateMachineFieldChanges.push({
          path: `/machines/entities/${commonMachineId}/title`,
          previousValue: previousMachine.title,
          newValue: currentMachine.title
        })
      }
      if (previousMachine.description !== currentMachine.description) {
        updateMachineFieldChanges.push({
          path: `/machines/entities/${commonMachineId}/description`,
          previousValue: previousMachine.description,
          newValue: currentMachine.description
        })
      }
    }
    return updateMachineFieldChanges
  }
  const updateMachineFieldChanges = getUpdateMachineFieldChanges(
    previousMachineIds,
    currentMachineIds
  )

  function getAddMachineFieldChanges(
    previousMachineIds: string[],
    currentMachineIds: string[],
    previousProcedures: ProcedureState[],
    currentProcedures: ProcedureState[]
  ) {
    let addMachineFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    let addedMachineProcedureIds: Array<string> = []
    const correspondingCurrentMachineIds = currentMachineIds.filter(cMId => previousMachineIds.includes(cMId))
    // currentIds with index of the previous position before any removal
    const referenceMachineIdIndices: Array<{ id: string, index: number }> =
      previousMachineIds
        .map((id, index) => ({ id, index }))
        .filter(pIdIndex => currentMachineIds.includes(pIdIndex.id))
        .map((pIdIndex, j) => ({
          id: correspondingCurrentMachineIds[j],
          index: pIdIndex.index
        }))

    let addedMachineIdIndices: Array<{ id: string, index: number | 'beginning', subindex: number }> = []
    let currentIndex: number | 'beginning' = 'beginning'
    let subindex = 0
    for (const currentMachineId of currentMachineIds) {
      const matchingReference = referenceMachineIdIndices.find(rIdIndex => rIdIndex.id === currentMachineId)
      if (matchingReference) {
        currentIndex = matchingReference.index
        subindex = 0
      } else {
        addedMachineIdIndices.push({
          id: currentMachineId,
          index: currentIndex,
          subindex
        })
        subindex = subindex + 1
      }
    }

    for (const { id: addedId, index, subindex } of addedMachineIdIndices) {
      const idFieldChange = {
        path: '/machines/ids',
        collectionChange: {
          type: 'add' as const,
          id: addedId,
          position: {
            index: index,
            subindex: subindex
          }

        }
      }
      const entityFieldChange = {
        path: `/machines/entities/${addedId}`,
        previousValue: undefined,
        newValue: currentFormData.machines.entities[addedId]
      }
      // procedure's machineIds
      const addedMachineIdProcedures = currentProcedures.filter(x =>
        x.machineId === addedId)
      const procedurMachineIdFieldChanges: Array<FieldChange> = addedMachineIdProcedures.map(p => ({
        path: `/jobs/entities/${p.jobId}/procedures/entities/${p.id}/machineId`,
        previousValue: previousProcedures.find(pp => pp.id === p.id)?.machineId,
        newValue: addedId
      }))
      addedMachineProcedureIds.push(...addedMachineIdProcedures.map(p => p.id))

      addMachineFieldChanges.push([idFieldChange, entityFieldChange, ...procedurMachineIdFieldChanges])
    }
    return [addMachineFieldChanges, addedMachineProcedureIds] as const
  }
  const [addMachineFieldChanges, addedMachineProcedureIds] = getAddMachineFieldChanges(
    previousMachineIds,
    currentMachineIds,
    previousProcedures,
    currentProcedures
  )

  function getProcedureMachineIdFieldChanges(
    previousProcedures: ProcedureState[],
    currentProcedures: ProcedureState[],
    removedMachineProcedureIds: string[],
    addedMachineProcedureIds: string[]
  ) {
    const procedureMachineIdFieldChanges: Array<FieldChange> = []
    const procedureMachineIdsMap = getUpdatedProcedureMachineIdsMap(
      previousProcedures,
      currentProcedures
    )
    for (const [procedureId, { jobId, previousMachineId, currentMachineId }] of procedureMachineIdsMap) {
      if (currentMachineId === null) {
        if (!removedMachineProcedureIds.includes(procedureId)) {
          procedureMachineIdFieldChanges.push(({
            path: `/jobs/entities/${jobId}/procedures/entities/${procedureId}/machineId`,
            previousValue: previousMachineId,
            newValue: currentMachineId
          }))
        }
      } else if (currentMachineId !== undefined) {
        // currentMachineId != null
        if (previousMachineId === null || previousMachineId === undefined) {
          if (!addedMachineProcedureIds.includes(procedureId)) {
            procedureMachineIdFieldChanges.push(({
              path: `/jobs/entities/${jobId}/procedures/entities/${procedureId}/machineId`,
              previousValue: previousMachineId,
              newValue: currentMachineId
            }))
          }
          else {
            // previousMachineId != null
            if (!addedMachineProcedureIds.includes(procedureId)) {
              procedureMachineIdFieldChanges.push(({
                path: `/jobs/entities/${jobId}/procedures/entities/${procedureId}/machineId`,
                previousValue: previousMachineId,
                newValue: currentMachineId
              }))
            }
            else {
              // addedMachineProcedureIds.includes(procedureId)
              if (!removedMachineProcedureIds.includes(procedureId)) {
                procedureMachineIdFieldChanges.push(({
                  path: `/jobs/entities/${jobId}/procedures/entities/${procedureId}/machineId`,
                  previousValue: previousMachineId,
                  newValue: null // set to null first, then the fieldChanged grouped with create, will set to current value, if applied
                }))
              }
            }
          }
        }
      }
    }
    return procedureMachineIdFieldChanges
  }
  const procedureMachineIdFieldChanges = getProcedureMachineIdFieldChanges(
    previousProcedures,
    currentProcedures,
    removedMachineProcedureIds,
    addedMachineProcedureIds
  )

  const machineFieldChanges = [
    ...removeMachineFieldChanges,
    ...moveMachineFieldChanges,
    ...updateMachineFieldChanges,
    ...procedureMachineIdFieldChanges,
    ...addMachineFieldChanges,
  ]

  return machineFieldChanges
}

export function getFieldChanges(previousFormData: FormData, currentFormData: FormData): Array<FieldChange | GroupedFieldChanges> {
  if (previousFormData === currentFormData) {
    return []
  }
  const fieldChanges: Array<FieldChange | GroupedFieldChanges> = []
  if (previousFormData.title !== currentFormData.title) {
    fieldChanges.push({ path: '/title', previousValue: previousFormData.title, newValue: currentFormData.title })
  }
  if (previousFormData.description !== currentFormData.description) {
    fieldChanges.push({ path: '/description', previousValue: previousFormData.description, newValue: currentFormData.description })
  }
  if (previousFormData.isAutoTimeOptions !== currentFormData.isAutoTimeOptions) {
    fieldChanges.push({ path: '/isAutoTimeOptions', previousValue: previousFormData.isAutoTimeOptions, newValue: currentFormData.isAutoTimeOptions })
  }
  if (previousFormData.manualTimeOptions !== currentFormData.manualTimeOptions) {
    fieldChanges.push({ path: '/manualTimeOptions', previousValue: previousFormData.manualTimeOptions, newValue: currentFormData.manualTimeOptions })
  }

  fieldChanges.push(...getMachinesFieldChanges(previousFormData, currentFormData))

  return fieldChanges
}

export function calculateStepName(fieldChanges: FieldChange[]): string {
  if (fieldChanges.length === 0) {
    return ''
  }

  // if (fieldChanges.length === 2 && fieldChanges.some(c => c.path === '/rides/ids')) {
  //   const idsChange = fieldChanges.find(c => c.path === '/rides/ids')!
  //   if (idsChange?.collectionChange?.type === 'add') {
  //     return 'Add ride'
  //   }
  //   if (idsChange?.collectionChange?.type === 'remove') {
  //     return 'Remove ride'
  //   }
  // }

  if (fieldChanges.length > 1) {
    return 'Multiple edits'
  }

  const { path } = fieldChanges[0]
  if (path === '/name') {
    return 'Edit name'
  }
  if (path === '/who') {
    return 'Edit who'
  }
  if (path === '/where') {
    return 'Edit where'
  }
  if (path === '/howMuch') {
    return 'Edit how much'
  }
  if (path === '/rides/ids') {
    return 'Move rides'
  }
  if (path.startsWith('/rides/entities/') && path.endsWith('description')) {
    return 'Edit ride description'
  }
  throw new Error('Cannot determine step name')
}
