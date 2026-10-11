import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isAppPatched } from '../bin/patch-app.js';
import { isIdePatched } from '../bin/patch-ide.js';
import { saveWatcherConfig, loadWatcherConfig, getStateDir } from '../bin/watcher.js';

test('isIdePatched accurately detects hook in out/main.js', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ide-test-'));
    try {
        const outDir = path.join(tempDir, 'out');
        fs.mkdirSync(outDir, { recursive: true });
        const mainJs = path.join(outDir, 'main.js');

        fs.writeFileSync(mainJs, 'console.log("clean main");', 'utf8');
        assert.strictEqual(isIdePatched(tempDir), false);

        fs.writeFileSync(mainJs, 'import \'./antigravity-rtl-main.js\';\nconsole.log("patched");', 'utf8');
        assert.strictEqual(isIdePatched(tempDir), true);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

test('isAppPatched returns false for nonexistent or invalid path', () => {
    assert.strictEqual(isAppPatched(null), false);
    assert.strictEqual(isAppPatched('/non/existent/path/app.asar'), false);
});

test('saveWatcherConfig and loadWatcherConfig preserve targets and paths', () => {
    const config = {
        watchApp: false,
        watchIde: true,
        appPath: null,
        idePath: '/custom/path/to/ide'
    };
    saveWatcherConfig(config);
    const loaded = loadWatcherConfig();
    assert.strictEqual(loaded.watchApp, false);
    assert.strictEqual(loaded.watchIde, true);
    assert.strictEqual(loaded.idePath, '/custom/path/to/ide');
});

test('getStateDir returns a valid path string', () => {
    const dir = getStateDir();
    assert.ok(typeof dir === 'string' && dir.length > 0);
});

