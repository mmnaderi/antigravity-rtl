# Antigravity IDE Support Implementation Plan (Ponytail Edition)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Antigravity IDE (VS Code Edition) support cleanly into `antigravity-rtl` following Ponytail minimal principles, fixing CSP regex and preserving Monaco editor fonts.

**Architecture:** Electron main-process injection (`ide-main.js`) hooks `browser-window-created` and `dom-ready` to inject client styles (`ide-client.js`) and embedded Vazirmatn font. A dedicated `patch-ide.js` manages file backups, main hook injection, and CSP loosening in `workbench.html` and `workbench-jetski-agent.html`. The existing robust app patcher in `bin/index.js` remains untouched, with a top-level router for `--ide` and `--app` flags.

**Tech Stack:** Node.js (ESM), Electron runtime hooks, CSS @font-face & unicode-bidi.

**Spec:** PR #4 (https://github.com/mmnaderi/antigravity-rtl/pull/4) + Ponytail minimal review fixes.

## Global Constraints
- Preserve Monaco Editor & Terminal fonts (no `!important` font override on `.monaco-editor` or `.terminal`).
- CSP patching must use newline-agnostic RegEx (works on Windows CRLF and Unix LF).
- Zero regression on existing standalone app features (topbar, React mount guard, auto-updater).
- Minimal diff: reuse existing files and helpers; strip dead selectors.

---

### Task 1: Create Minimal Client & Main Electron Hooks (`bin/ide-main.js` & `bin/ide-client.js`)

**Files:**
- Create: `bin/ide-main.js`
- Create: `bin/ide-client.js`

**Interfaces:**
- Consumes: `bin/Vazirmatn-Variable.woff2`
- Produces: Electron main hook and renderer scripts injected into Antigravity IDE.

- [ ] **Step 1: Create `bin/ide-main.js` with module-level font caching**
Inject hook into `app.on('browser-window-created')` to handle `SAVE_RTL_CONFIG` console messages and inject `antigravity-rtl-client.js` on `dom-ready`.

- [ ] **Step 2: Create trimmed `bin/ide-client.js`**
Port client logic from PR #4, but:
1. Strip dead selectors (`chat-message`, `user-input-step`, `ask-opt`).
2. Target `[data-testid="conversation-view"]`, `.rendered-markdown`, inputs, headings, and lists.
3. Keep `.monaco-editor` and `.terminal` strictly LTR without forcing a custom font-family.

- [ ] **Step 3: Syntax check with Node**
Run: `node --check bin/ide-main.js && node --check bin/ide-client.js`
Expected: Syntax OK.

- [ ] **Step 4: Commit**
```bash
git add bin/ide-main.js bin/ide-client.js
git commit -m "feat(ide): add minimal main process hook and client script"
```

---

### Task 2: Implement Robust IDE Patcher (`bin/patch-ide.js`)

**Files:**
- Create: `bin/patch-ide.js`

**Interfaces:**
- Consumes: Paths to IDE installation
- Produces: `patchIde(appDir)` and `restoreIde(appDir)`, plus `getIdeAppPath(customPath)`

- [ ] **Step 1: Write `bin/patch-ide.js` with resilient CSP RegEx**
Implement candidate path scanning (macOS `/Applications`, Windows `%LOCALAPPDATA%`, Linux `/opt` & `~/.local/share`).
Implement backup to `.rtl-bak`, copying assets, prepending `import './antigravity-rtl-main.js';` to `out/main.js`, and patching CSP via:
`content.replace(/(font-src[^;]*'self')/i, "$1 data:")`.
Implement `restoreIde(appDir)` to restore original files and remove injected assets.

- [ ] **Step 2: Verify syntax and dry-run detection**
Run: `node -e "import('./bin/patch-ide.js').then(m => console.log('Resolved IDE:', m.resolveIdeAppDir('/Applications/Antigravity IDE.app')))"`
Expected: Outputs `/Applications/Antigravity IDE.app/Contents/Resources/app`.

- [ ] **Step 3: Commit**
```bash
git add bin/patch-ide.js
git commit -m "feat(ide): implement robust IDE path detection and patcher"
```

---

### Task 3: Add CLI Flag Routing to `bin/index.js` & Update Documentation

**Files:**
- Modify: `bin/index.js`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: `patchIde`, `restoreIde`, `resolveIdeAppDir` from `./patch-ide.js`
- Produces: CLI interface supporting `--ide`, `--app`, `--restore`, `--path`, and `--help`.

- [ ] **Step 1: Add CLI flags and target detection in `bin/index.js`**
Parse `--ide`, `--app`, `--restore`, `--path`, `-h/--help`.
Route to `patchIde`/`restoreIde` when target is IDE, otherwise keep existing `main` app logic.

- [ ] **Step 2: Update `package.json` description & bump version**
Update description to include Antigravity IDE and bump version to `1.2.0`.

- [ ] **Step 3: Update `README.md`**
Document the `--ide` flag and IDE support cleanly in Persian and English.

- [ ] **Step 4: Commit**
```bash
git add bin/index.js package.json README.md
git commit -m "feat: add CLI routing for IDE support and update docs"
```

---

### Task 4: Verification & End-to-End Testing

- [ ] **Step 1: Verify CLI help and flag parsing**
Run: `node ./bin/index.js --help`
Expected: Displays help with `--ide`, `--app`, `--restore`, `--path`.

- [ ] **Step 2: Verify IDE candidate path detection**
Run: `node -e "import('./bin/patch-ide.js').then(m => console.log('Candidates:', m.getIdeCandidatePaths()))"`
Expected: Lists platform-appropriate candidate paths including `/Applications/Antigravity IDE.app`.

- [ ] **Step 3: Verify CSP patch regex against actual `workbench.html`**
Run: Test regex replacement in isolation to verify `font-src ... data:` insertion.
