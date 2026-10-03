# Fix plan: standalone re-patch corruption + IDE log path

Two bugs, both found during the ponytail cleanup (already shipped in v1.2.3). Read this whole file before editing anything.

- **Bug 1** — `bin/patch-app.js` `patchApp`: re-patching can inject the payload twice, and the backup can go stale or become a patched copy.
- **Bug 2** — `bin/ide-main.js`: the log file path is hard-coded to `/tmp`, which does not exist on Windows.

Do Bug 2 first (tiny, independent), commit, then Bug 1, commit.

## Ground rules

1. Change only what this plan names. Don't reformat, rename, or "improve" nearby code.
2. Find edit locations by quoted text, not line numbers.
3. Don't add comments that narrate the change.
4. Don't touch `bin/payload.js` beyond what is written here (it is a template literal executed in another process; see the cleanup plan's rules if you must).
5. Run the verification steps at the end of each bug. Don't claim done without them passing.

---

## Bug 2: IDE log path is Unix-only

### Problem

```js
const LOG_FILE = '/tmp/antigravity-rtl.log';
```

On Windows `/tmp` resolves to `C:\tmp`, which normally doesn't exist. `log()` swallows the error, so nothing crashes, but every log line is silently lost on Windows — the one place you'd need it to debug a user report.

### Fix

In `bin/ide-main.js`, replace that line with:

```js
const LOG_FILE = path.join(os.tmpdir(), 'antigravity-rtl.log');
```

`path` and `os` are already imported in that file. Nothing else changes. On macOS `os.tmpdir()` is the per-user `$TMPDIR` (e.g. `/var/folders/.../T`), not `/tmp`, so if `README.md` or any issue template tells users to look at `/tmp/antigravity-rtl.log`, update that text to "the system temp folder (`os.tmpdir()`)". Currently nothing in the repo references the path (checked with `rg`).

### Verify

```bash
node --check bin/ide-main.js
rg -n "/tmp" bin/ide-main.js   # expect no output
```

Commit: `fix(ide): write log to os.tmpdir() instead of hard-coded /tmp`.

---

## Bug 1: standalone app re-patch corruption and stale backup

### How the current code fails

Current flow in `patchApp`:

1. If `app.asar.bak` doesn't exist, copy `app.asar` → `app.asar.bak` — **without checking whether `app.asar` is already patched.**
2. Extract `app.asar`, read `dist/utils.js`.
3. If `utils.js` contains `/* ANTIGRAVITY RTL PATCH */`: read the clean `utils.js` from the backup instead. (The `else` "already patched" branch is unreachable, because step 1 just guaranteed a backup exists.)
4. Replace the anchor `void win.loadURL(url);` with the payload.

Failure cases:

- **A. Backup deleted, then re-patch.** Step 1 copies the *patched* asar to `.bak`. Step 3 reads "clean" code from that patched backup. `bin/payload.js` itself contains `void win.loadURL(url);` (it re-emits the original call), so step 4 finds the anchor *inside the old payload* and injects a second payload. Result: every main-process listener is registered twice (each settings save writes the config file twice, and the whole renderer script is sent twice per page load; only the `__ANTIGRAVITY_RTL_LOADED__` guard stops the UI from appearing twice). Each further re-patch nests one more copy. And the backup can never restore the original.
- **B. Antigravity auto-updates.** The update replaces `app.asar` with a clean new version, but the old `.bak` stays. Re-patching works (fresh asar is clean), but `.bak` is still the **old** version, so `--restore` would downgrade the app.
- **C. Old patch with no way back.** Patches made by versions ≤ 1.2.3 have a start marker but no end marker, so the injected block can't be cut out exactly. If no clean backup exists, there is no safe way to recover; the tool must say so instead of guessing.

### Design

Three rules:

1. **A clean `app.asar` is the source of truth.** If the current `app.asar`'s `dist/utils.js` has no patch marker, (over)write `app.asar.bak` from it. This fixes B and prevents A from ever starting.
2. **Never back up a patched asar.** If the current `app.asar` is patched, get clean `utils.js` from (in order): stripping the patch block out of the current file (possible only for patches made after this fix, which add an end marker), else the backup if the backup is clean, else fail with reinstall instructions (case C).
3. **Repair a bad backup.** If the backup is missing or patched while the current asar is patched, rebuild a clean backup from the extracted tree after writing the clean `utils.js`, before injecting.

To make stripping exact from now on, the injected block gets an end marker. The payload already starts with `/* ANTIGRAVITY RTL PATCH */` (first line of `bin/payload.js`); `patchApp` appends `/* END ANTIGRAVITY RTL PATCH */` after it. Stripping replaces everything from the start marker to the end marker with the original anchor, which restores the original text exactly (the anchor was the only thing replaced).

Known, accepted leftover: the `devTools: !electron_1.app.isPackaged` → `devTools: true` rewrite is not reversed by stripping. A backup rebuilt from a stripped file therefore has DevTools force-enabled. That's harmless and matches what users already run; don't try to reverse it.

### Implementation

All edits in `bin/patch-app.js`.

#### Step 1 — constants and helpers

Add right after the line `const { blue, green, red, yellow } = picocolors;`:

```js
const PATCH_START = '/* ANTIGRAVITY RTL PATCH */';
const PATCH_END = '/* END ANTIGRAVITY RTL PATCH */';
const ANCHOR = 'void win.loadURL(url);';
const PATCH_BLOCK = /\/\* ANTIGRAVITY RTL PATCH \*\/[\s\S]*?\/\* END ANTIGRAVITY RTL PATCH \*\//;
const LEGACY_PATCH_ERROR = 'This Antigravity install was patched by an older version of antigravity-rtl and no clean backup exists. Reinstall Antigravity, then run this command again.';

function readUtils(asarFile) {
    return asar.extractFile(asarFile, 'dist/utils.js').toString('utf8');
}

function stripPatch(code) {
    return PATCH_BLOCK.test(code) ? code.replace(PATCH_BLOCK, ANCHOR) : null;
}
```

Notes:
- `PATCH_START` is not a substring of `PATCH_END` (`/* A…` vs `/* END A…`), so `includes(PATCH_START)` is a safe "is patched" test.
- `asar.extractFile` throws if `dist/utils.js` is missing; the surrounding `try` turns that into a normal failure.

#### Step 2 — rewrite the start of `patchApp`

Replace everything in `patchApp` from `fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);` down to and including the closing `}` of the `if (utilsCode.includes('/* ANTIGRAVITY RTL PATCH */')) { ... }` block with:

```js
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);

        failLabel = 'Failed to read app.asar.';
        const currentUtils = readUtils(asarPath);
        const backupUtils = fs.existsSync(backupPath) ? readUtils(backupPath) : null;
        let cleanUtils;
        let repairBackup = false;

        if (!currentUtils.includes(PATCH_START)) {
            failLabel = 'Permission Denied.';
            fs.copyFileSync(asarPath, backupPath);
            cleanUtils = currentUtils;
        } else {
            const backupIsClean = backupUtils !== null && !backupUtils.includes(PATCH_START);
            cleanUtils = stripPatch(currentUtils) ?? (backupIsClean ? backupUtils : null);
            if (cleanUtils === null) throw new Error(LEGACY_PATCH_ERROR);
            repairBackup = !backupIsClean;
            spinner.text = 'Updating existing RTL patch to latest version...';
        }

        failLabel = 'Failed to extract ASAR.';
        spinner.text = 'Extracting app.asar (this may take a few seconds)...';
        fs.rmSync(extractDir, { recursive: true, force: true });
        asar.extractAll(asarPath, extractDir);

        const utilsPath = path.join(extractDir, 'dist', 'utils.js');
        const fontDest = path.join(extractDir, 'dist', 'Vazirmatn-Variable.woff2');

        if (repairBackup) {
            failLabel = 'Failed to rebuild clean backup.';
            spinner.text = 'Rebuilding clean backup...';
            fs.writeFileSync(utilsPath, cleanUtils);
            fs.rmSync(fontDest, { force: true });
            await asar.createPackage(extractDir, backupPath);
        }

        failLabel = 'Injection failed.';
        spinner.text = 'Injecting RTL features...';
        let utilsCode = cleanUtils;
```

Why each piece:
- The backup copy keeps the `'Permission Denied.'` label so a write failure still shows the sudo / App Management hint, same as today.
- `stripPatch(currentUtils)` is tried before the backup because it matches the *installed* version exactly; the backup may be from an older version.
- `repairBackup` rebuilds `.bak` from the extracted current tree with clean `utils.js` and without our font, so `--restore` gives a clean app again.
- The old `dist/utils.js not found` check is gone: `readUtils` throws for that case before extraction. To keep the friendly message, the catch block handles it (Step 4).

#### Step 3 — wrap the injection with the end marker

Below the new code, the existing lines are:

```js
        const payload = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');
        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor not found. The app version might be unsupported.');
        }
        utilsCode = utilsCode.replace(anchor, payload);
```

Replace them with:

```js
        const payload = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');
        if (!utilsCode.includes(ANCHOR)) {
            throw new Error('Injection anchor not found. The app version might be unsupported.');
        }
        utilsCode = utilsCode.replace(ANCHOR, () => `${payload.trimEnd()}\n${PATCH_END}`);
```

- The function form of `replace` stops `$&`, `` $` ``, `$'`, `$$` in the payload from being treated as replacement patterns. The payload has none today (checked), but one innocent edit to `payload.js` would otherwise corrupt the injection silently.
- Leave the devTools line, `writeFileSync`, font copy, repack and success messages after this unchanged. The font copy may use the `fontDest` variable from Step 2: `fs.copyFileSync(path.join(__dirname, 'Vazirmatn-Variable.woff2'), fontDest);`.

#### Step 4 — friendly message for a missing `utils.js`

In the `catch (e)` block, in the `else` branch, replace `console.error(red(e.message));` with:

```js
            console.error(red(/dist\/utils\.js/.test(e.message)
                ? 'dist/utils.js not found in ASAR. Unsupported Antigravity version.'
                : e.message));
```

Check what message `asar.extractFile` actually throws for a missing file (run it once against any asar). If it doesn't mention `dist/utils.js`, adjust the test to match the real message instead of guessing.

#### Step 5 — refuse to restore a patched backup

In `restoreApp`, right after the `if (!fs.existsSync(backupPath)) { ... }` block, add:

```js
    if (readUtils(backupPath).includes(PATCH_START)) {
        console.error(red('✖ The backup is itself patched, so restoring would not remove RTL. Run the patcher once to rebuild a clean backup, or reinstall Antigravity.\n'));
        if (exitOnError) process.exit(1);
        return false;
    }
```

This only triggers for users whose backup was already corrupted by case A. Running the patcher repairs it if the current install has an end marker. Otherwise they get `LEGACY_PATCH_ERROR`, which tells them to reinstall.

### Verify Bug 1

Syntax and CLI:

```bash
node --check bin/patch-app.js && node bin/index.js --help > /dev/null && echo OK
```

Scenario test, no sudo needed. Create `/tmp/patch-app-check.mjs` (don't commit it), replace `REPO` with the absolute repo path, and run `node /tmp/patch-app-check.mjs` from anywhere:

```js
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

const REPO = '/ABSOLUTE/PATH/TO/REPO';
const asar = createRequire(path.join(REPO, 'package.json'))('@electron/asar');
const { patchApp, restoreApp } = await import(path.join(REPO, 'bin', 'patch-app.js'));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agrtl-'));
const asarPath = path.join(root, 'app.asar');
const bak = asarPath + '.bak';
const START = '/* ANTIGRAVITY RTL PATCH */';
const END = '/* END ANTIGRAVITY RTL PATCH */';

async function makeAsar(version, utils) {
    const src = path.join(root, 'src-' + version);
    fs.mkdirSync(path.join(src, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(src, 'dist', 'utils.js'), utils ?? `// ${version}\nfunction open(win, url) {\n    void win.loadURL(url);\n}\nconst o = { devTools: !electron_1.app.isPackaged };\n`);
    await asar.createPackage(src, asarPath);
}
const utils = f => asar.extractFile(f, 'dist/utils.js').toString('utf8');
const count = (s, m) => s.split(m).length - 1;
function check(name, cond) {
    console.log((cond ? 'PASS ' : 'FAIL ') + name);
    if (!cond) process.exitCode = 1;
}
const opts = { exitOnError: false };

await makeAsar('v1');
check('fresh patch ok', await patchApp(asarPath, opts));
check('fresh: one start, one end', count(utils(asarPath), START) === 1 && count(utils(asarPath), END) === 1);
check('fresh: backup clean', !utils(bak).includes(START));

check('re-patch ok', await patchApp(asarPath, opts));
check('re-patch: still one payload', count(utils(asarPath), START) === 1);

fs.unlinkSync(bak);
check('no-backup re-patch ok', await patchApp(asarPath, opts));
check('no-backup: still one payload', count(utils(asarPath), START) === 1);
check('no-backup: backup rebuilt clean', fs.existsSync(bak) && !utils(bak).includes(START) && utils(bak).includes('void win.loadURL(url);'));

check('restore ok', await restoreApp(asarPath, opts));
check('restore: clean app', !utils(asarPath).includes(START) && utils(asarPath).includes('// v1'));

await patchApp(asarPath, opts);
await makeAsar('v2');
check('post-update patch ok', await patchApp(asarPath, opts));
check('post-update: backup refreshed to v2', utils(bak).includes('// v2'));

fs.unlinkSync(bak);
await makeAsar('legacy', `// legacy\n${START}\nwin.on('x', () => {});\n    void win.loadURL(url);\n`);
const before = fs.readFileSync(asarPath);
check('legacy no-backup refused', (await patchApp(asarPath, opts)) === false);
check('legacy: asar untouched', Buffer.compare(before, fs.readFileSync(asarPath)) === 0);
check('legacy: no backup created', !fs.existsSync(bak));

fs.copyFileSync(asarPath, bak);
check('restore refuses patched backup', (await restoreApp(asarPath, opts)) === false);

fs.rmSync(root, { recursive: true, force: true });
```

Expected: every line `PASS`, exit code 0. Run it once **before** editing too. On the old code, `no-backup: still one payload`, `no-backup: backup rebuilt clean`, `post-update: backup refreshed to v2`, `legacy no-backup refused` and `restore refuses patched backup` should fail, which confirms the test catches the bugs.

Then ask the user to run the real check (needs `sudo` and the standalone app):

1. `sudo node bin/index.js --app`, restart Antigravity, and confirm the RTL button appears exactly once.
2. `sudo node bin/index.js --app` again, restart, still exactly once.
3. `sudo node bin/index.js --restore --app`, restart, and confirm the RTL button is gone.

Commit: `fix(app): never back up a patched asar; strip old payload by end marker; refresh stale backup`.

---

## Out of scope (don't do)

- Reversing the `devTools: true` rewrite.
- Any change to the IDE patcher (`bin/patch-ide.js`). It uses per-file `.rtl-bak` and an idempotent import line and doesn't have this bug.
- Log rotation or size limits for the IDE log.
