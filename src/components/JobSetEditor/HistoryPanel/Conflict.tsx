import { useRef } from 'react'
import type {
  Operation as OperationType,
} from '../store/editHistory'
import {
  useJobSetEditorDispatch,
  applyConflict,
  unApplyConflict,
  useJobSetEditorSelector,
  createHasRelatedChangesSelector,
} from '../store'

type ConflictProps = {
  stepId: string,
  conflictIndex: number,
  conflict: OperationType,
  undone: boolean,
}

// key is StepId-conflictIndex
export const Conflict = ({
  stepId,
  conflictIndex,
  conflict,
  undone,
}: ConflictProps) => {
  const editorDispatch = useJobSetEditorDispatch()
  const hasRelatedChangesSelector = useRef(createHasRelatedChangesSelector(stepId, conflictIndex)).current
  const hasRelatedChanges = useJobSetEditorSelector(hasRelatedChangesSelector)
  const disabled = undone || hasRelatedChanges
  return (
    <div>
      <input
        type="checkbox"
        id={`conflict-${stepId}-${conflictIndex}`}
        checked={conflict.conflictApplied}
        onChange={e => {
          if (e.target.checked) {
            editorDispatch(applyConflict(stepId, conflictIndex))
          } else {
            editorDispatch(unApplyConflict(stepId, conflictIndex))
          }
        }}
        disabled={disabled}
      />
      <label htmlFor={`conflict-${stepId}-${conflictIndex}`}>{conflict.conflictName}</label>
    </div>
  )
}