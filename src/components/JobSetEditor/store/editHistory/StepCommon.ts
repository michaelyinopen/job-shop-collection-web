import type { JobState, ProcedureState } from '../jobSetEditorReducer'
import type {
  FormData,
  FieldChange,
  GroupedFieldChanges
} from './types'
import { arraysEqual } from '../../../../utility'

export function numberOfSlashes(value: string): number {
  return [...value].filter(c => c === '/').length
}

export function getMachineIdFromPath(path: string) {
  const indexOf3rdSlash = '/machines/entities/'.length - 1
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  return indexOf4thSlash === -1
    ? path.substring(indexOf3rdSlash + 1)
    : path.substring(indexOf3rdSlash + 1, indexOf4thSlash)
}

export function getJobIdFromPath(path: string) {
  const indexOf3rdSlash = '/jobs/entities/'.length - 1
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  return indexOf4thSlash === -1
    ? path.substring(indexOf3rdSlash + 1)
    : path.substring(indexOf3rdSlash + 1, indexOf4thSlash)
}

export function getJobColorIdFromPath(path: string) {
  const indexOf3rdSlash = '/jobColors/entities/'.length - 1
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  return indexOf4thSlash === -1
    ? path.substring(indexOf3rdSlash + 1)
    : path.substring(indexOf3rdSlash + 1, indexOf4thSlash)
}

export function getProcedureIdFromPath(path: string) {
  const indexOf3rdSlash = '/jobs/entities/'.length - 1
  const indexOf4thSlash = path.indexOf('/', indexOf3rdSlash + 1)
  const indexOf6thSlash = indexOf4thSlash + 'procedures/entities/'.length
  const indexOf7thSlash = path.indexOf('/', indexOf6thSlash + 1)
  return indexOf7thSlash === -1
    ? path.substring(indexOf6thSlash + 1)
    : path.substring(indexOf6thSlash + 1, indexOf7thSlash)
}

//#region getFieldChanges
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

  fieldChanges.push(...getJobsFieldChanges(previousFormData, currentFormData))

  fieldChanges.push(...getMachinesFieldChanges(previousFormData, currentFormData))

  //#region time options
  if (previousFormData.isAutoTimeOptions !== currentFormData.isAutoTimeOptions) {
    fieldChanges.push({ path: '/isAutoTimeOptions', previousValue: previousFormData.isAutoTimeOptions, newValue: currentFormData.isAutoTimeOptions })
  }
  if (previousFormData.manualTimeOptions.maxTimeMs !== currentFormData.manualTimeOptions.maxTimeMs) {
    fieldChanges.push({
      path: '/manualTimeOptions/maxTimeMs',
      previousValue: previousFormData.manualTimeOptions.maxTimeMs,
      newValue: currentFormData.manualTimeOptions.maxTimeMs
    })
  }
  if (previousFormData.manualTimeOptions.viewStartTimeMs !== currentFormData.manualTimeOptions.viewStartTimeMs) {
    fieldChanges.push({
      path: '/manualTimeOptions/viewStartTimeMs',
      previousValue: previousFormData.manualTimeOptions.viewStartTimeMs,
      newValue: currentFormData.manualTimeOptions.viewStartTimeMs
    })
  }
  if (previousFormData.manualTimeOptions.viewEndTimeMs !== currentFormData.manualTimeOptions.viewEndTimeMs) {
    fieldChanges.push({
      path: '/manualTimeOptions/viewEndTimeMs',
      previousValue: previousFormData.manualTimeOptions.viewEndTimeMs,
      newValue: currentFormData.manualTimeOptions.viewEndTimeMs
    })
  }
  if (previousFormData.manualTimeOptions.minViewDurationMs !== currentFormData.manualTimeOptions.minViewDurationMs) {
    fieldChanges.push({
      path: '/manualTimeOptions/minViewDurationMs',
      previousValue: previousFormData.manualTimeOptions.minViewDurationMs,
      newValue: currentFormData.manualTimeOptions.minViewDurationMs
    })
  }
  if (previousFormData.manualTimeOptions.maxViewDurationMs !== currentFormData.manualTimeOptions.maxViewDurationMs) {
    fieldChanges.push({
      path: '/manualTimeOptions/maxViewDurationMs',
      previousValue: previousFormData.manualTimeOptions.maxViewDurationMs,
      newValue: currentFormData.manualTimeOptions.maxViewDurationMs
    })
  }
  //#endregion time options

  return fieldChanges
}

// includes jobColor's filed changes
function getJobsFieldChanges(previousFormData: FormData, currentFormData: FormData): Array<FieldChange | GroupedFieldChanges> {
  const previousJobIds = previousFormData.jobs.ids
  const currentJobIds = currentFormData.jobs.ids

  function getRemoveJobFieldChanges(
    previousJobIds: string[],
    currentJobIds: string[],
    previousFormData: FormData,
  ) {
    let removeJobFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    const previousJobIdAndIndices: Array<{ id: string, index: number }> =
      previousJobIds.map((id, index) => ({ id, index }))
    const removedJobIds = previousJobIds.filter(pJId => !currentJobIds.includes(pJId))
    for (const removedJobId of removedJobIds) {
      const removedIdIndex = previousJobIdAndIndices.find(i => i.id === removedJobId)
      const idFieldChange = {
        path: '/jobs/ids',
        collectionChange: {
          type: 'remove' as const,
          id: removedJobId,
          index: removedIdIndex!.index
        }
      }
      const entityFieldChange = {
        path: `/jobs/entities/${removedJobId}`,
        previousValue: previousFormData.jobs.entities[removedJobId],
        newValue: undefined
      }
      const jobColorIdFieldChange = {
        path: '/jobColors/ids',
        collectionChange: {
          type: 'remove' as const,
          id: removedJobId,
          index: removedIdIndex!.index
        }
      }
      const jobColorEntityFieldChange = {
        path: `/jobColors/entities/${removedJobId}`,
        previousValue: previousFormData.jobColors.entities[removedJobId],
        newValue: undefined
      }
      removeJobFieldChanges.push([idFieldChange, entityFieldChange, jobColorIdFieldChange, jobColorEntityFieldChange])
    }
    return removeJobFieldChanges
  }
  const removeProcedureFieldChanges = getRemoveJobFieldChanges(
    previousJobIds,
    currentJobIds,
    previousFormData
  )

  function getMoveJobFieldChanges(
    previousJobIds: string[],
    currentJobIds: string[]
  ) {
    // machines that are not added or removed
    const correspondingPreviousJobIds = previousJobIds.filter(cJId => currentJobIds.includes(cJId))
    const correspondingCurrentJobIds = currentJobIds.filter(cJId => previousJobIds.includes(cJId))
    return arraysEqual(correspondingPreviousJobIds, correspondingCurrentJobIds)
      ? []
      : [
        {
          path: '/jobs/ids',
          collectionChange: {
            type: 'move' as const,
            previousValue: correspondingPreviousJobIds,
            newValue: correspondingCurrentJobIds,
          }
        },
        {
          path: '/jobColors/ids',
          collectionChange: {
            type: 'move' as const,
            previousValue: correspondingPreviousJobIds,
            newValue: correspondingCurrentJobIds,
          }
        }
      ]
  }
  const moveJobFieldChanges = getMoveJobFieldChanges(
    previousJobIds,
    currentJobIds
  )

  function getUpdateJobFieldChanges(
    previousJobIds: string[],
    currentJobIds: string[],
    previousFormData: FormData,
    currentFormData: FormData
  ) {
    let updateJobFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    const commonJobIds = currentJobIds.filter(cPId => previousJobIds.includes(cPId))
    for (const commonJobId of commonJobIds) {
      const previousJob = previousFormData.jobs.entities[commonJobId]
      const currentJob = currentFormData.jobs.entities[commonJobId]
      if (previousJob.title !== currentJob.title) {
        updateJobFieldChanges.push({
          path: `/jobs/entities/${commonJobId}/title`,
          previousValue: previousJob.title,
          newValue: currentJob.title
        })
      }
      const procedureFieldChanges = getProceduresFieldChanges(
        commonJobId,
        previousJob,
        currentJob
      )
      updateJobFieldChanges.push(...procedureFieldChanges)

      const previousJobColor = previousFormData.jobColors.entities[commonJobId]
      const currentJobColor = currentFormData.jobColors.entities[commonJobId]
      if (previousJobColor.color !== currentJobColor.color) {
        updateJobFieldChanges.push({
          path: `/jobColors/entities/${commonJobId}/color`,
          previousValue: previousJobColor.color,
          newValue: currentJobColor.color
        })
      }
      if (previousJobColor.textColor !== currentJobColor.textColor) {
        updateJobFieldChanges.push({
          path: `/jobColors/entities/${commonJobId}/textColor`,
          previousValue: previousJobColor.textColor,
          newValue: currentJobColor.textColor
        })
      }
    }
    return updateJobFieldChanges
  }
  const updateJobFieldChanges = getUpdateJobFieldChanges(
    previousJobIds,
    currentJobIds,
    previousFormData,
    currentFormData
  )

  function getAddJobFieldChanges(
    previousJobIds: string[],
    currentJobIds: string[],
    currentFormData: FormData
  ) {
    let addJobFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    const correspondingCurrentJobIds = currentJobIds.filter(cPId => previousJobIds.includes(cPId))
    // currentIds with index of the previous position before any removal
    const referenceJobIdIndices: Array<{ id: string, index: number }> =
      previousJobIds
        .map((id, index) => ({ id, index }))
        .filter(pIdIndex => currentJobIds.includes(pIdIndex.id))
        .map((pIdIndex, j) => ({
          id: correspondingCurrentJobIds[j],
          index: pIdIndex.index
        }))

    let addedJobIdIndices: Array<{ id: string, index: number | 'beginning', subindex: number }> = []
    let currentIndex: number | 'beginning' = 'beginning'
    let subindex = 0
    for (const currentProcedureId of currentJobIds) {
      const matchingReference = referenceJobIdIndices.find(rIdIndex => rIdIndex.id === currentProcedureId)
      if (matchingReference) {
        currentIndex = matchingReference.index
        subindex = 0
      } else {
        addedJobIdIndices.push({
          id: currentProcedureId,
          index: currentIndex,
          subindex
        })
        subindex = subindex + 1
      }
    }

    for (const { id: addedId, index, subindex } of addedJobIdIndices) {
      const idFieldChange = {
        path: `/jobs/ids`,
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
        path: `/jobs/entities/${addedId}`,
        previousValue: undefined,
        newValue: {
          ...currentFormData.jobs.entities[addedId],
          procedures: {
            ...currentFormData.jobs.entities[addedId].procedures,
            entities: Object.fromEntries(
              Object.values(currentFormData.jobs.entities[addedId].procedures.entities).map(p => [
                p.id,
                {
                  ...p,
                  machineId: null
                }
              ])
            )
          }
        }
      }
      const jobColorIdFieldChange = {
        path: `/jobColors/ids`,
        collectionChange: {
          type: 'add' as const,
          id: addedId,
          position: {
            index: index,
            subindex: subindex
          }
        }
      }
      const jobColorEntityFieldChange = {
        path: `/jobColors/entities/${addedId}`,
        previousValue: undefined,
        newValue: currentFormData.jobColors.entities[addedId]
      }
      addJobFieldChanges.push([idFieldChange, entityFieldChange, jobColorIdFieldChange, jobColorEntityFieldChange])
    }
    return addJobFieldChanges
  }
  const addJobFieldChanges = getAddJobFieldChanges(
    previousJobIds,
    currentJobIds,
    currentFormData
  )

  return [
    ...removeProcedureFieldChanges,
    ...moveJobFieldChanges,
    ...updateJobFieldChanges,
    ...addJobFieldChanges,
  ]
}

// same job
function getProceduresFieldChanges(jobId: string, previousFormDataJob: JobState, currentFormDataJob: JobState): Array<FieldChange | GroupedFieldChanges> {
  const previousProcedureIds = previousFormDataJob.procedures.ids
  const currentProcedureIds = currentFormDataJob.procedures.ids

  function getRemoveProcedureFieldChanges(
    jobId: string,
    previousProcedureIds: string[],
    currentProcedureIds: string[],
    previousFormDataJob: JobState,
  ) {
    let removeProcedureFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    const previousProcedureIdAndIndices: Array<{ id: string, index: number }> =
      previousProcedureIds.map((id, index) => ({ id, index }))
    const removedProcedureIds = previousProcedureIds.filter(pPId => !currentProcedureIds.includes(pPId))
    for (const removedProcedureId of removedProcedureIds) {
      const removedIdIndex = previousProcedureIdAndIndices.find(i => i.id === removedProcedureId)
      const idFieldChange = {
        path: `/jobs/entities/${jobId}/procedures/ids`,
        collectionChange: {
          type: 'remove' as const,
          id: removedProcedureId,
          index: removedIdIndex!.index
        }
      }
      const entityFieldChange = {
        path: `/jobs/entities/${jobId}/procedures/entities/${removedProcedureId}`,
        previousValue: previousFormDataJob.procedures.entities[removedProcedureId],
        newValue: undefined
      }
      removeProcedureFieldChanges.push([idFieldChange, entityFieldChange])
    }
    return removeProcedureFieldChanges
  }
  const removeProcedureFieldChanges = getRemoveProcedureFieldChanges(
    jobId,
    previousProcedureIds,
    currentProcedureIds,
    previousFormDataJob
  )

  function getMoveProcedureFieldChanges(
    jobId: string,
    previousProcedureIds: string[],
    currentProcedureIds: string[]
  ) {
    // machines that are not added or removed
    const correspondingPreviousProcedureIds = previousProcedureIds.filter(cPId => currentProcedureIds.includes(cPId))
    const correspondingCurrentProcedureIds = currentProcedureIds.filter(cPId => previousProcedureIds.includes(cPId))
    return arraysEqual(correspondingPreviousProcedureIds, correspondingCurrentProcedureIds)
      ? []
      : [
        {
          path: `/jobs/entities/${jobId}/procedures/ids`,
          collectionChange: {
            type: 'move' as const,
            previousValue: correspondingPreviousProcedureIds,
            newValue: correspondingCurrentProcedureIds,
          }
        }
      ]
  }
  const moveProcedureFieldChanges = getMoveProcedureFieldChanges(
    jobId,
    previousProcedureIds,
    currentProcedureIds
  )

  // does not handle machineId
  function getUpdateProcedureFieldChanges(
    jobId: string,
    previousProcedureIds: string[],
    currentProcedureIds: string[],
    previousFormDataJob: JobState,
    currentFormDataJob: JobState
  ) {
    let updateProcedureFieldChanges: Array<FieldChange> = []
    const commonProcedureIds = currentProcedureIds.filter(cPId => previousProcedureIds.includes(cPId))
    for (const commonProcedureId of commonProcedureIds) {
      const previousProcedure = previousFormDataJob.procedures.entities[commonProcedureId]
      const currentProcedure = currentFormDataJob.procedures.entities[commonProcedureId]
      if (previousProcedure.processingTimeMs !== currentProcedure.processingTimeMs) {
        updateProcedureFieldChanges.push({
          path: `/jobs/entities/${jobId}/procedures/entities/${commonProcedureId}/processingTimeMs`,
          previousValue: previousProcedure.processingTimeMs,
          newValue: currentProcedure.processingTimeMs
        })
      }
    }
    return updateProcedureFieldChanges
  }
  const updateProcedureFieldChanges = getUpdateProcedureFieldChanges(
    jobId,
    previousProcedureIds,
    currentProcedureIds,
    previousFormDataJob,
    currentFormDataJob
  )

  function getAddMachineFieldChanges(
    jobId,
    previousProcedureIds: string[],
    currentProcedureIds: string[],
    currentFormDataJob: JobState
  ) {
    let addProcedureFieldChanges: Array<FieldChange | GroupedFieldChanges> = []
    const correspondingCurrentProcedureIds = currentProcedureIds.filter(cPId => previousProcedureIds.includes(cPId))
    // currentIds with index of the previous position before any removal
    const referenceProcedureIdIndices: Array<{ id: string, index: number }> =
      previousProcedureIds
        .map((id, index) => ({ id, index }))
        .filter(pIdIndex => currentProcedureIds.includes(pIdIndex.id))
        .map((pIdIndex, j) => ({
          id: correspondingCurrentProcedureIds[j],
          index: pIdIndex.index
        }))

    let addedProcedureIdIndices: Array<{ id: string, index: number | 'beginning', subindex: number }> = []
    let currentIndex: number | 'beginning' = 'beginning'
    let subindex = 0
    for (const currentProcedureId of currentProcedureIds) {
      const matchingReference = referenceProcedureIdIndices.find(rIdIndex => rIdIndex.id === currentProcedureId)
      if (matchingReference) {
        currentIndex = matchingReference.index
        subindex = 0
      } else {
        addedProcedureIdIndices.push({
          id: currentProcedureId,
          index: currentIndex,
          subindex
        })
        subindex = subindex + 1
      }
    }

    for (const { id: addedId, index, subindex } of addedProcedureIdIndices) {
      const idFieldChange = {
        path: `/jobs/entities/${jobId}/procedures/ids`,
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
        path: `/jobs/entities/${jobId}/procedures/entities/${addedId}`,
        previousValue: undefined,
        newValue: {
          ...currentFormDataJob.procedures.entities[addedId],
          machineId: null // machineId is handled by getMachinesFieldChanges
        }
      }
      addProcedureFieldChanges.push([idFieldChange, entityFieldChange])
    }
    return addProcedureFieldChanges
  }
  const addProcedureFieldChanges = getAddMachineFieldChanges(
    jobId,
    previousProcedureIds,
    currentProcedureIds,
    currentFormDataJob
  )

  return [
    ...removeProcedureFieldChanges,
    ...moveProcedureFieldChanges,
    ...updateProcedureFieldChanges,
    ...addProcedureFieldChanges,
  ]
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
// added procedures' machineId has to be null (e.g. added machine assigned to added procedure, then unapply add machine)
// added jobs' procedures' machineId has to be null
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
    previousProcedures: ProcedureState[],
    previousFormData: FormData
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
    previousProcedures,
    previousFormData
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
    currentMachineIds: string[],
    previousFormData: FormData,
    currentFormData: FormData
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
    currentMachineIds,
    previousFormData,
    currentFormData
  )

  function getAddMachineFieldChanges(
    previousMachineIds: string[],
    currentMachineIds: string[],
    previousProcedures: ProcedureState[],
    currentProcedures: ProcedureState[],
    currentFormData: FormData
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
    currentProcedures,
    currentFormData
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
//#endregion getFieldChanges

//#region calculateStepName
export function calculateStepName(fieldChanges: FieldChange[]): string {
  if (fieldChanges.length === 0) {
    return ''
  }

  if (fieldChanges.length > 1 && fieldChanges.some(c => c.path === '/machines/ids')) {
    const idsChange = fieldChanges.find(c => c.path === '/machines/ids')!
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'add') {
      return 'Add machine'
    }
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'remove') {
      return 'Remove machine'
    }
  }

  if (fieldChanges.length > 1 && fieldChanges.some(c => c.path === '/jobs/ids')) {
    const idsChange = fieldChanges.find(c => c.path === '/jobs/ids')!
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'add') {
      return 'Create job'
    }
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'move') {
      return 'Move jobs'
    }
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'remove') {
      return 'Delete job'
    }
  }

  if (fieldChanges.length > 1 && fieldChanges.some(c => c.path.endsWith('/procedures/ids'))) {
    const idsChange = fieldChanges.find(c => c.path.endsWith('/procedures/ids'))!
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'add') {
      return 'Create procedure'
    }
    if (idsChange && 'collectionChange' in idsChange && idsChange.collectionChange.type === 'remove') {
      return 'Delete procedure'
    }
  }

  if (fieldChanges.length > 1) {
    return 'Multiple edits'
  }

  const { path } = fieldChanges[0]
  const pathNumberOfSlashes = numberOfSlashes(path)
  if (path === '/title') {
    return 'Edit title'
  }
  if (path === '/description') {
    return 'Edit description'
  }

  // time options
  if (path === '/isAutoTimeOptions') {
    return 'Edit auto time options'
  }
  if (path === '/manualTimeOptions/maxTimeMs') {
    return 'Edit maximum time'
  }
  if (path === '/manualTimeOptions/viewStartTimeMs') {
    return 'Edit view start time'
  }
  if (path === '/manualTimeOptions/viewEndTimeMs') {
    return 'Edit view end time'
  }
  if (path === '/manualTimeOptions/minViewDurationMs') {
    return 'Edit minimum view duration'
  }
  if (path === '/manualTimeOptions/maxViewDurationMs') {
    return 'Edit maximum view duration'
  }

  // machines
  if (path === '/machines/ids') {
    return 'Move machines'
  }
  if (path.startsWith('/machines/entities/') && path.endsWith('title')) {
    return 'Edit machine title'
  }
  if (path.startsWith('/machines/entities/') && path.endsWith('description')) {
    return 'Edit machine description'
  }

  // jobs
  if (path.startsWith('/jobs/entities/') && path.endsWith('title') && pathNumberOfSlashes === 4) {
    return 'Edit job title'
  }
  if (path.startsWith('/jobColors/entities/') && path.endsWith('color')) {
    return 'Edit job color'
  }
  if (path.startsWith('/jobColors/entities/') && path.endsWith('textColor')) {
    return 'Edit job textColor'
  }

  // procedures
  if (path.endsWith('/procedures/ids')) {
    return 'Move procedures'
  }
  if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('machineId')) {
    return "Edit procedure's machine"
  }
  if (path.startsWith('/jobs/entities/') && path.includes('/procedures/entities/') && path.endsWith('processingTimeMs')) {
    return "Edit procedure's time"
  }

  throw new Error('Cannot determine step name')
}
//#endregion calculateStepName