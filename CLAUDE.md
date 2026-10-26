# Prototype kit

Designers use this repo to turn a Figma design into a live, tunable Vue prototype. Each project is a copy of the template. The **site** (blocks, content, tokens, fonts) changes per project; the **kit** (token panel, highlight, Shift+click picker, shortcuts, generator) must behave the same everywhere.

Stack: Vite + Vue 3 + TypeScript, vue-router, Tailwind v4, @vueuse/core, class-variance-authority, clsx + tailwind-merge. Nuxt UI is used **only inside the kit**. Don't add dependencies.

## General guidelines

- After changes, briefly explain what was done. If something is ambiguous, ask before proceeding.
- Match the code style below. If it doesn't cover something, read 2–3 neighbouring files and copy them.
- Don't add things nobody asked for: dependencies, tests, docs, abstractions, error handling.
- Check changes in the browser (`npm run dev`, port 5173) before saying they're done.

## Structure

```
tokens/tokens.json        every design value (see "Tokens"); edits regenerate src/assets/tokens.css
styles/*.json             saved panel styles (Cmd+S); default.json loads on start
src/data/layout.json      site name, header (logo, nav), footer content
src/data/pages/<slug>.json  { title, blocks: [{ type, space?, ...props }] }; home.json → "/", others → "/<slug>"
src/pages/Page.vue        renders a page's blocks through the `components` Map
src/components/layout/    Header, Footer (rendered once around every page)
src/components/blocks/    one component per block type, shared by all pages
src/components/elements/  small shared pieces: Text, Link, Button, Image, Card
src/kit/, kit/            THE KIT — see "Kit rule"
public/assets, public/fonts
```

## Kit rule

`src/kit/` and `kit/` are the shared tool. **Don't edit them** unless the user explicitly asks to change the tool itself (the panel, highlight, shortcuts, generator). Everything a project needs is reachable from tokens, data and site components: the kit reads them automatically.

When the user does ask for a tool change: make it, bump `kit/VERSION` (minor for features, patch for fixes) and add a line to `kit/CHANGELOG.md`, and tell them it should also go into the template repo so other projects can get it with `/kit-upgrade`.

## Tokens

`tokens/tokens.json` has two levels. **Site variables** hold values; **block variables** only point at site variables.

| Key | Level | What | Example |
|---|---|---|---|
| `theme.spacing` | site | base spacers, px | `"m": { "default": "16px" }` |
| `theme.size` | site | fixed sizes of graphics (logo, dot); not spacing | `"logo": { "default": "62px" }` |
| `theme.color` | site | colors by role/family, nested ok | `"grey": { "500": "rgb(…)" }` |
| `utilities["typo-<name>"]` | site | base text styles | size, line-height, letter-spacing, weight, family, case |
| `fonts` | site | font stacks + optional files | see "Fonts" |
| `theme.specific` | block | named spacers, value = base spacer name | `"button-x": "gutter"` |
| `typography` | block | named text styles, value = base style name | `"title": "l-display"` |
| `theme.breakpoint.s` | site | the one breakpoint (mobile below, desktop above) | `"900px"` |

- Any value can be `{ "default": …, "s": … }`: `default` is mobile, `s` is ≥ breakpoint. Omit `s` when it's the same.
- Class names: spacers → `p-<name>`, `gap-x-<name>`, `mt-<name>`…; sizes → `w-<name>`, `size-<name>`; colors → `bg-<name>`, `text-<name>`; text styles → `typo-<name>`. Breakpoint prefix: `s:`.

### Rules for components (layout, blocks, elements)

- Use **only block variables**: specific spacers (`px-page-x`, `gap-card-gap`) and text-style classes (`typo-title`, or `ElementsText :theme="{ typo: 'title' }"`). Never base spacers (`p-m`), base text styles (`typo-s`), the default Tailwind scale (`p-4`, `text-sm`), hex colors or arbitrary values.
- Every distinct spacing role gets its own specific spacer, even if the value matches another one today (padding of a button ≠ page margin).
- Things like table rows, cards and labels size from their content; space them with gaps. No fixed heights or widths except true graphics (`theme.size`).
- Layout utilities that aren't values (`flex`, `grid-cols-4`, `col-span-2`, `items-center`) are fine.

### Recipes

- **New spacing in a block**: add `"<role>": "<base>"` to `theme.specific`, use the class in the component. The panel's "Block variables" picks it up automatically.
- **New text style**: add `"<role>": "<base>"` to `typography`, add `<role>: "typo-<role>"` to the `typo` variants in `src/components/elements/Text.vue`, use it.
- **New base spacer / size / color / base text style**: add it to the matching site key. Keep spacer steps in a consistent ratio.
- **New block**: see the `/add-block` skill. In short: component in `src/components/blocks/`, register it in the `components` Map in `Page.vue`, give it specific spacers + text styles, use it from page JSON.
- **New page**: add `src/data/pages/<slug>.json`; add a nav link in `layout.json` if needed.
- **Vertical space between blocks**: the block's `space` in page JSON (`section` default, `subsection`, `heading-content`, `title-content`). Add a new specific spacer + Map entry in `Page.vue` for a new kind.
- **Fonts**: see the `/add-font` skill.
- **Interactions & animations**: plain CSS transitions/`<Transition>`, VueUse for browser APIs. If a duration/easing is reused, make it a token. No animation libraries unless the user asks.

## Code style

The goal is code that looks like a teammate wrote it: flat, inline, short, few abstractions.

1. **Inline first.** Logic used once stays where it's used (`computed`, `watch`, `onMounted`, template). No helper for a single call site.
2. **No comments.** Names and structure carry the meaning. The only allowed comment is one short line explaining a non-obvious *why*.
3. **Composable or util only** when it's shared state, a framework concern, or used in 2+ places. Composables: `src/composables/useX.ts`, `export default function useX()`. Utils: named exports in `src/utils/index.ts`.
4. **Browser APIs through VueUse** (`useEventListener`, `useResizeObserver`, `onClickOutside`, `onKeyStroke`, `useBreakpoints`…), never `addEventListener` / `new ResizeObserver` / `matchMedia` by hand.
5. **Variants with `cva`** through one `theme` prop, not a pile of booleans. `cn()` for merging classes.
6. **Auto-imports**: Vue, vue-router, VueUse, `src/composables`, `src/utils` and all components are auto-imported. Only import third-party libs, `cva`, JSON data and block components in `Page.vue`.

### Vue components

- Order: `<script setup lang="ts">` → `<template>` → rare `<style>`. One component per file, PascalCase, one word where possible, category folder (`elements/Link.vue` → `<ElementsLink>`).
- Props: always `const props = withDefaults(defineProps<{ … }>(), { … })`, type-only, inline. No `interface Props`, no destructured props.
- Values set once from props are a plain `const`, not `computed`.
- `ref` for everything; no `reactive`, `watchEffect`, `provide`/`inject`, Pinia. Derived → `computed`; side effects → `watch`.
- v-model via `defineModel`; events via typed `defineEmits`.
- Lookups use `new Map([[key, value]])` + `.get()`, not `switch` or `if` chains.
- Named functions are `function handleX() {}` declarations; arrows for callbacks and computeds. Early returns for guards. `map`/`filter`/`find` over `for` loops. `async`/`await`, never `.then`. `const` always.
- Links: `ElementsLink` (RouterLink internally, `<a>` for external/mailto/#). No raw `<a>`, `<img>`, `<h2>` in blocks; use the elements.

### Formatting

100 cols, 2 spaces, double quotes, semicolons, trailing commas. Write already-formatted code.

## Don't

- Comments, JSDoc, banners, commented-out code
- Single-use helpers, wrapper composables, components extracted "for readability"
- Base spacers / base text styles / Tailwind scale / hex / arbitrary values in site components
- Fixed heights on rows, cards, labels
- Editing `src/kit/` or `kit/` without being asked
- New dependencies, tests, README/docs, unrelated refactors
