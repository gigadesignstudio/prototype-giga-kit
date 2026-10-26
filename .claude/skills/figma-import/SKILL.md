---
name: figma-import
description: Turn Figma frames into this prototype's pages, blocks and tokens. Use when the user gives Figma frame URLs to start or extend a prototype ("import these frames", "make this design real"). Runs in two phases and stops for approval after the analysis.
---

# Figma import

Input: Figma frame URLs, one per page (the first is the home page). Optional: which existing pages to replace.

The kit (panel, highlight, picker, generator) already exists. Only the **site** is generated: `tokens/tokens.json`, `src/data/layout.json`, `src/data/pages/*.json`, `src/components/{layout,blocks,elements}`, `public/assets`. Follow `CLAUDE.md` for every rule not repeated here.

## Phase 1 — Analyze all frames, then STOP

1. Load the `figma:figma-design-to-code` skill. For **every** frame: `get_metadata`, `get_screenshot`, `get_design_context` (if the response is sparse, request the child sections separately), `get_variable_defs`. Save screenshots to `figma/<page>.png`. Download image/SVG assets once into `public/assets/` (dedupe by content, name by role: `logo.svg`, `arrow.svg`).
2. **Header / footer** (the parts at the top / bottom of frames) become `LayoutHeader` / `LayoutFooter`, not blocks.
   - Same across frames → one component. Small differences (active link, dark over a hero) → a `theme` prop. Really different → list differences and ask.
   - Footer only on some frames → ask whether to show it everywhere.
   - List every nav link and match it to a page. Links with no frame become placeholder routes.
3. **Blocks**: split each page's content into vertically stacked blocks. Side-by-side content in one row is one block. Reuse existing block types (`heading`, `text`, `columns`, `groups`, `table`) and elements (`Text`, `Link`, `Button`, `Image`, `Card`) before inventing new ones; the same pattern on two pages is one block type with different props. For each block list type, props (content), elements used.
4. **Raw values** across all frames (header/footer included):
   - Spacing: every padding, gap, margin, distance between siblings, in px, with count and where (page > block > element).
   - Color: every fill/stroke/text color with count.
   - Typography: every text style (family, weight, size, line-height, letter-spacing, case) with count.
5. **Rationalize into one global token set** (never per-page tokens):
   - Base spacers: cluster values within ~15% or 2–4px, map onto `3xs … 3xl` (add/drop steps, keep a consistent ratio). `gutter` for the page margin if it's off-scale.
   - Specific spacers: one per spacing role found (page margin, block gaps, card gap, button padding…), each pointing to a base spacer. Name by role, not value.
   - Colors: merge near-duplicates (ΔE < 3), name by role/family (`white`, `black`, `grey.500`, `accent`).
   - Base text styles: collapse into `typo-xs … typo-xl` (+ `-display` for a second family). Text styles (`typography`): one per text role (label, body, title, nav…), each pointing to a base style.
   - Sizes: only true graphics (logo, icons, dots). Rows, cards, labels must size from content.
   - Breakpoint: frames give one viewport (say which). Infer the other side of `s` (900px): mobile spacing ≈ 0.6–0.75× desktop for `xl`+, small steps unchanged; type scales down 1–2 steps for large sizes only. If frames are different viewports, ask.
6. **Output, then STOP and wait for approval**:
   - Pages table: name → route → frame
   - Header/footer: structure, nav links → routes, theme variants
   - Blocks per page (table), shared block types marked, new block types flagged
   - Base spacers: raw values → token → default / s
   - Specific spacers: role → base
   - Colors: raw → token
   - Base text styles: raw → utility → default / s; text styles: role → base
   - Snapped inconsistencies (e.g. "hero bottom 23px → l 24px") and open questions

## Phase 2 — Build (after approval)

1. Write `tokens/tokens.json` (same shape as now; keep `breakpoint`, `fonts`, `utilities`, `typography`, `theme.spacing|specific|size|color`). Remove tokens the new design doesn't use. Font files → `/add-font`.
2. Update `Text.vue`'s `typo` variants to the new text styles; replace classes in layout/blocks/elements so they use only the new specific spacers and text styles.
3. Build/adjust `LayoutHeader` / `LayoutFooter` and blocks; register new blocks in `Page.vue`'s Map; write `src/data/layout.json` and one `src/data/pages/<slug>.json` per page (`space` per block for vertical rhythm). Delete example pages that aren't part of the design.
4. If the frame has no mobile menu, keep the kit's toggle menu below `s` and say so.
5. Regenerate `styles/default.json` from the new tokens: `{ "title": "Default", "slug": "default", "tokens": <tokens.json> }`.

## Phase 3 — Verify

- `npm run dev`; open every route at the frame width next to `figma/<page>.png`; measure block tops with JS and fix differences > ~4px.
- Click every nav link (active link styled), check mobile width, press U (Block variables list the new blocks), Shift+click a few spacers and texts.
- `npm run build` passes.
- Report: differences from Figma per page, inferred tokens, placeholder routes, limitations.
