# Store

## `store` folder
Each "feature" folder can have a `store` folder, the feature's `index` will re-export everythin from store.

## "feature" folder
A somewhat arbitrary classification of related code.

Pro:
- organisation
- (group Components)
- (only objects exported by `index` is intented to be used outside of the "feature")

Con:
- inevitably will have edge cases, where things do not fit entirely

## Naming conventions
- reducers with reducer suffix
- selectors with selector suffix
- actions should contain verbs

## Import
- when inside the same "feature", import reducers, actions and selectors from `store` fodler
- when outside the "feature", import reducers, actions and selectors from the "feature"

## Selectors
Selectors are in the reducer file, because they change with reducer.

Use `import { createSelector } from '@reduxjs/toolkit'` for memoized and combined selectors.

Can use `backwardCompose` to functionally compose selectors.

### Circular reference
"feature"'s selector will reference parent(root) reducer's seletor functions,\
which causes the two reducer files to have circular references with each other.\
This is intentional and ES6 import can handle it.

Pro:
- do not need to re-export all (enhanced) selectors in the root store
- some createSelector will be easier to write

Con:
- "feature" unnecessarily knows details of the parent
- circular dependency
- (neutral) emphasis the "feature" classification