---
name: add-font
description: Add a font family (files + tokens) to the prototype and use it in base text styles. Use when the user provides font files or asks to change/add a typeface.
---

# Add a font

1. **Files**: put `.woff2` (preferred) or `.woff` files in `public/fonts/`. If the user only names a font, ask for the files: don't download fonts from the web (licensing).
2. **Tokens** — in `tokens/tokens.json`, `fonts.<key>` (`sans`, `display`, `mono`…):
   ```json
   "display": {
     "font-family": "'Family Name', 'Helvetica Neue', Arial, sans-serif",
     "src": [
       { "url": "/fonts/FamilyName-Medium.woff2", "weight": "500", "style": "normal" },
       { "url": "/fonts/FamilyName-MediumItalic.woff2", "weight": "500", "style": "italic" }
     ]
   }
   ```
   The first name in `font-family` becomes the `@font-face` family; keep fallbacks after it. One `src` entry per weight/style file.
3. **Use**: point base text styles at it with `"font-family": "var(--font-<key>)"` in `utilities["typo-…"]`, and set `font-weight` to a weight that has a file.
4. **Verify**: `npm run tokens` (or save tokens.json with dev running) → `src/assets/tokens.css` has the `@font-face` blocks; in the browser the text uses the font (check `document.fonts` / computed `font-family`); `npm run build` passes.
