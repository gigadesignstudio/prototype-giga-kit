# Kit changelog

## 1.0.1
- Saved styles store only the overrides on top of tokens.json, so tokens.json edits are never hidden by a saved style
- Font files: correct @font-face format for ttf/otf

## 1.0.0
- Token panel (U): Site variables (base spacers, sizes, typography, colors, breakpoints) and Block variables (grouped by component, found automatically)
- Mobile / Desktop tabs, sliders with number inputs, "inherits mobile" / "use mobile"
- Shift + hover / click on the page: spacer or text style under the cursor, popup to pick a base value or create a new one
- Highlight of every place a variable is used
- Styles: Cmd+S saves the loaded style (or Default), save/load/reset/download, default loads on start
- Cmd+Z / Cmd+Shift+Z undo/redo, Esc closes popup then panel, warning before leaving with unsaved changes, ? shortcuts list
- tokens.json → tokens.css generator, live CSS variables, @font-face from `fonts.*.src`
