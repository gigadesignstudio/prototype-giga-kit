---
name: add-block
description: Add a new block type (or extend an existing one) to the prototype following the kit's token rules. Use when the user asks for a new section/block/component on a page.
---

# Add a block

1. **Reuse first.** Check `src/components/blocks/` and `src/components/elements/`. If an existing block can express it with a new prop or `theme` variant (cva), extend it instead.
2. **Component**: `src/components/blocks/<Name>.vue`, single word, `withDefaults(defineProps<…>())`, content via props (it comes from page JSON). Use elements (`ElementsText`, `ElementsLink`, `ElementsButton`, `ElementsImage`, `ElementsCard`) instead of raw tags.
3. **Spacing**: for every padding/gap/margin role inside the block, use an existing specific spacer if the role is the same (`page-x` for page margins, `grid-x` for grid columns, `text-x` for text inset…), otherwise add `"<block>-<role>": "<base>"` to `theme.specific` in `tokens/tokens.json`. Never base spacers or Tailwind scale.
4. **Text**: use existing text styles when the role matches (`title`, `body`, `label`…). Otherwise add `"<role>": "<base>"` to `typography` and a `<role>: "typo-<role>"` entry to the `typo` variants in `src/components/elements/Text.vue`.
5. **Sizing**: content-sized; space items with gaps. Fixed sizes only for graphics (`theme.size`).
6. **Register** in the `components` Map in `src/pages/Page.vue` (`["<type>", Blocks<Name>]` + import).
7. **Use** it in `src/data/pages/<slug>.json`: `{ "type": "<type>", "space": "section", …props }`.
8. **Responsive**: mobile first, `s:` for desktop. Check both widths.
9. **Verify**: page renders, press U → the block appears under Block variables with its spacers/text styles, Shift+click its spaces/texts works, `npm run build` passes.
