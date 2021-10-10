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

// machines and procedure's machine option?
function getMachinesFieldChanges(previousFormData: FormData, currentFormData: FormData): Array<FieldChange | GroupedFieldChanges> {
  const previousMachineIds = previousFormData.machines.ids
  const currentMachineIds = currentFormData.machines.ids

  let machineFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
  let countedProcedureIds: Array<string> = [];

  (function removeMachineFieldChanges() {
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
      // todo also group clear procedure's machineIds here
      // countedProcedureIds
      machineFieldChanges.push([idFieldChange, entityFieldChange])
    }
  })();

  (function moveMachineFieldChanges() {
    // rides that are not added or removed
    const correspondingPreviousMachineIds = previousMachineIds.filter(cMId => currentMachineIds.includes(cMId))
    const correspondingCurrentMachineIds = currentMachineIds.filter(cMId => previousMachineIds.includes(cMId))
    if (!arraysEqual(correspondingPreviousMachineIds, correspondingCurrentMachineIds)) {
      machineFieldChanges.push({
        path: '/machines/ids',
        previousValue: correspondingPreviousMachineIds,
        newValue: correspondingCurrentMachineIds,
        collectionChange: { type: 'move' as const }
      })
    }
  })();

  (function updateMachinePropertiesFieldChanges() {
    const commonMachineIds = currentMachineIds.filter(cMId => previousMachineIds.includes(cMId))
    for (const commonMachineId of commonMachineIds) {
      const previousMachine = previousFormData.machines.entities[commonMachineId]
      const currentMachine = currentFormData.machines.entities[commonMachineId]
      if (previousMachine.title !== currentMachine.title) {
        machineFieldChanges.push({
          path: `/machines/entities/${commonMachineId}/title`,
          previousValue: previousMachine.title,
          newValue: currentMachine.title
        })
      }
      if (previousMachine.description !== currentMachine.description) {
        machineFieldChanges.push({
          path: `/machines/entities/${commonMachineId}/description`,
          previousValue: previousMachine.description,
          newValue: currentMachine.description
        })
      }
    }
  })();

  (function addMachinePropertiesFieldChanges() {
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
      // todo also group clear procedure's machineIds here
      // countedProcedureIds
      machineFieldChanges.push([idFieldChange, entityFieldChange])
    }
  })()

  // ProcedureMachineIdFieldChanges
  // use countedProcedureIds

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

  if (fieldChanges.length === 2 && fieldChanges.some(c => c.path === '/rides/ids')) {
    const idsChange = fieldChanges.find(c => c.path === '/rides/ids')!
    if (idsChange?.collectionChange?.type === 'add') {
      return 'Add ride'
    }
    if (idsChange?.collectionChange?.type === 'remove') {
      return 'Remove ride'
    }
  }

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
