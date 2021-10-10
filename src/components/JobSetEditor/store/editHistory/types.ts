export type { FormDataState as FormData } from '../jobSetEditorReducer'

export type FieldChange = {
  path: string,
  previousValue?: any,
  newValue?: any,
  collectionChange?: CollectionChange
}

export type CollectionChange = CollectionRemoveChange | CollectionMoveChange | CollectionAddChange

export type CollectionAddChange = { type: 'add', id: string, position: { index: number | 'beginning', subindex: number }, }
export type CollectionMoveChange = { type: 'move' }
export type CollectionRemoveChange = { type: 'remove', id: string, index: number, }

export type GroupedFieldChanges = FieldChange[]

export type Operation = {
  type: 'edit' | 'merge' | 'conflict' | 'reverse local',
  fieldChanges: FieldChange[],
  conflictName?: string,
  conflictApplied?: boolean, // need this to preserve the selection when toggling 'merge' and 'discard local changes'
  applied: boolean,
}

export type Step = {
  name: string,
  operations: Operation[],
  versionToken?: string,
  mergeBehaviour?: 'merge' | 'discard local changes',
  saveStatus?: 'saving' | 'saved',
}