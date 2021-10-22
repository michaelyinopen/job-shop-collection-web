import type {
  FormDataState,
} from '../jobSetEditorReducer'

export type ValidationError = {
  path: string
  severity: 'warning' | 'error'
  message: string
}

export function validateFormData(formData: FormDataState): ValidationError[] {
  const validateionErrors: ValidationError[] = []
  if (!formData.title) {
    validateionErrors.push({
      path: '/title',
      severity: 'error',
      message: 'Title is required'
    })
  }

  function calculateMachineValidationErrors(formData: FormDataState): ValidationError[] {
    const machineValidationErrors: ValidationError[] = []
    for (const machine of Object.values(formData.machines.entities)) {
      if (!machine.title) {
        machineValidationErrors.push({
          path: `/machines/entities/${machine.id}/title`,
          severity: 'warning',
          message: 'Machine title is required'
        })
      }
    }
    return machineValidationErrors
  }
  validateionErrors.push(...calculateMachineValidationErrors(formData))

  function calculateProcedureValidationErrors(formData: FormDataState): ValidationError[] {
    const procedureValidationErrors: ValidationError[] = []
    const procedures = Object.values(formData.jobs.entities)
      .flatMap(j => Object.values(j.procedures.entities))
    for (const procedure of procedures) {
      if (!procedure.machineId) {
        procedureValidationErrors.push({
          path: `/jobs/entities/${procedure.jobId}/procedures/entities/${procedure.id}/machineId`,
          severity: 'warning',
          message: "Procedure's machine is required"
        })
      }
      if (!procedure.processingTimeMs) {
        procedureValidationErrors.push({
          path: `/jobs/entities/${procedure.jobId}/procedures/entities/${procedure.id}/processingTimeMs`,
          severity: 'warning',
          message: "Procedure's time is required"
        })
      }
    }
    return procedureValidationErrors
  }
  validateionErrors.push(...calculateProcedureValidationErrors(formData))

  if (!formData.isAutoTimeOptions && formData.manualTimeOptions.maxTimeMs === 0) {
    validateionErrors.push({
      path: '/manualTimeOptions/maxTimeMs',
      severity: 'warning',
      message: 'Maximum time is required'
    })
  }
  if (!formData.isAutoTimeOptions && formData.manualTimeOptions.viewEndTimeMs === 0) {
    validateionErrors.push({
      path: '/manualTimeOptions/viewEndTimeMs',
      severity: 'warning',
      message: 'View end time is required'
    })
  }
  if (!formData.isAutoTimeOptions && formData.manualTimeOptions.minViewDurationMs === 0) {
    validateionErrors.push({
      path: '/manualTimeOptions/minViewDurationMs',
      severity: 'warning',
      message: 'Minimum view duration is required'
    })
  }
  if (!formData.isAutoTimeOptions && formData.manualTimeOptions.maxViewDurationMs === 0) {
    validateionErrors.push({
      path: '/manualTimeOptions/maxViewDurationMs',
      severity: 'warning',
      message: 'Maximum view duration is required'
    })
  }
  return validateionErrors
}