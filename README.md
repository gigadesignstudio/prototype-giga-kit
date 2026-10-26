# Prototype kit

Figma → live Vue prototype you can tune in the browser.

## Start a project

1. Create a repo from this template (GitHub → "Use this template"), clone it, `npm install`.
2. Open it in Claude Code and run `/figma-import <frame URL> <frame URL> …` (first frame = home page).
3. Approve the analysis; Claude builds pages, blocks and tokens.
4. `npm run dev` → open the site, press **U** for the token panel, **?** for shortcuts.

## Everyday work (in Claude Code)

- New block: `/add-block` — new font: `/add-font` — new kit version: `/kit-upgrade`
- Anything else (spacers, text styles, interactions, animations): just ask. Rules live in `CLAUDE.md`.

## In the browser

- **U** token panel · **Shift + hover/click** a space or text to see/change its variable · **Cmd+S** save · **Cmd+Z / Cmd+Shift+Z** undo/redo · **Esc** close · **?** shortcuts
- Saved styles live in `styles/`; `default.json` loads on start.
