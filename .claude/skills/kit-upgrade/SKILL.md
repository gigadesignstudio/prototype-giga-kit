---
name: kit-upgrade
description: Update this project's kit (token panel, highlight, picker, shortcuts, generator) to the latest version from the template repo, without touching the site. Use when the user asks to update/upgrade the kit or get new tool features.
---

# Kit upgrade

The kit is `src/kit/` and `kit/`. Everything else is the project's site and must not change.

1. **Source**: read `kit/SOURCE` (template repo URL or local path). If missing, ask the user for it.
2. **Clean tree**: run `git status`. If `src/kit/` or `kit/` have local changes, show them and ask whether to keep them (they'll be overwritten) before continuing. Commit or stash other changes only if the user agrees.
3. **Fetch**:
   ```bash
   git remote get-url kit || git remote add kit <source>
   git fetch kit
   ```
4. **Compare**: show `kit/VERSION` here vs `git show kit/main:kit/VERSION`, and the new entries in `git show kit/main:kit/CHANGELOG.md`. Stop if the versions match.
5. **Apply**:
   ```bash
   git rm -r -q --cached src/kit kit && rm -rf src/kit kit
   git checkout kit/main -- src/kit kit
   ```
   Keep this project's `kit/SOURCE` (restore it if it changed).
6. **Check the contract**: if the changelog mentions new token keys or conventions, add them to `tokens/tokens.json` / `styles/default.json` / `CLAUDE.md` as described there.
7. **Verify**: `npm install` if `package.json` in the template gained dependencies (compare and ask first), `npm run build`, then `npm run dev` and press U (panel opens, Block variables listed), Shift+click a space.
8. Report the version change and what's new. Don't commit unless asked.
