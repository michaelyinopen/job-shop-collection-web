# PopperSelect

A Component that replaces MUI's `Select` component.

MUI's `Select` does not work with `overflow:overlay` css, because it uses `Menu` which uses `Popper` internally. The page annoyingly scrolls to the top when opening a `Popper`.

`PopperSelect` solves the problem by using `Popper` internaly.

`PopperSelect` is created by copying MUI 4.11.4 `Select`'s internal implementation, and references (non-public) internal modules. It mimics `Select` to take advantage of off-label features provided by `FormControl`.

E.g. the label that shrinks to the top when focused

E.g. the outline with space for the label

Position of the "drop down menu" will be below the input field outline

variant is always `outlined`