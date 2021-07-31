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
Tried to reference parent selector from "feature" reducer file, but failed because got undefined.\
~~"feature"'s selector will reference parent(root) reducer's seletor functions,\
which causes the two reducer files to have circular references with each other.\
This is intentional and ES6 import can handle it.~~

### export getFeatureSelectors
"feature" selectors will be exported using a get{Feature}Selectors, that takes the slice selector 
to create the completed reducers, and return an object with selector properties.

The selectors will be re-exported in the `./store/selectors` file.

TakingThunk isLoading selectors are not exported by `./store/selectors`,
because that slice have a fixed location in the root state.