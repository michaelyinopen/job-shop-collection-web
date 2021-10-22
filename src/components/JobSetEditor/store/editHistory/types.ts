export type { FormDataState as FormData } from '../jobSetEditorReducer'

export type FieldChange = ValueFieldChange | CollectionFieldChange
export type ValueFieldChange = {
  path: string,
  previousValue: any,
  newValue: any,
}
export type CollectionFieldChange = {
  path: string,
  collectionChange: CollectionChange
}

export type CollectionChange = CollectionRemoveChange | CollectionMoveChange | CollectionAddChange
export type CollectionAddChange = { type: 'add', id: string, position: { index: number | 'beginning', subindex: number }, }
export type CollectionMoveChange = { type: 'move', previousValue: any, newValue: any, }
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
  id: string,
  name: string,
  operations: Operation[],
  versionToken?: string,
  mergeBehaviour?: 'merge' | 'discard local changes',
  saveStatus?: 'saving' | 'saved',
}