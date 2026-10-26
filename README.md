# Prototype giga kit

Figma → live Vue prototype you can tune in the browser.

## Before you start (once per computer)

1. [Node.js](https://nodejs.org) 22.18 or newer (`node -v`).
2. [Claude Code](https://claude.com/claude-code).
3. The Figma plugin for Claude Code: open Claude Code anywhere and run
   ```
   /plugin install figma@claude-plugins-official
   ```
   then `/mcp`, pick **figma** and log in with your Figma account.

## Start a project

```bash
npx degit gigadesignstudio/prototype-giga-kit my-project
cd my-project
git init && git add -A && git commit -m "start"
npm install
claude
```

In Claude Code run `/figma-import <frame URL> <frame URL> …` (first frame = home page). Approve the analysis; Claude builds pages, blocks and tokens.

Then `npm run dev`, open the site, press **U** for the token panel, **?** for shortcuts.

## Everyday work (in Claude Code)

- New block: `/add-block` · new font: `/add-font` · newer kit: `/kit-upgrade`
- Anything else (spacers, text styles, interactions, animations): just ask. Rules live in `CLAUDE.md`.

## In the browser

- **U** token panel · **Shift + hover/click** a space or text to see/change its variable · **Cmd+S** save · **Cmd+Z / Cmd+Shift+Z** undo/redo · **Esc** close · **?** shortcuts
- Saved styles live in `styles/` (only your panel changes; `tokens/tokens.json` stays the source of truth). `default.json` loads on start.
