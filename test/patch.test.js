import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import * as asar from '@electron/asar';
import { patchApp, restoreApp } from '../bin/patch-app.js';
import { patchIde, restoreIde } from '../bin/patch-ide.js';

const BIN = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin');
const HOOK_IMPORT = "import './antigravity-rtl-main.js';";
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-rtl-test-'));
const readUtils = (file) => {
    asar.uncache(file);
    return asar.extractFile(file, 'dist/utils.js').toString('utf8');
};

test('standalone app: re-patch, lost backup and restore give back the original', async () => {
    const root = tmp();
    const src = path.join(root, 'src');
    fs.mkdirSync(path.join(src, 'dist'), { recursive: true });
    const original = 'module.exports = (win, url) => {\n    void win.loadURL(url);\n};\n';
    fs.writeFileSync(path.join(src, 'dist', 'utils.js'), original);
    const asarPath = path.join(root, 'app.asar');
    await asar.createPackage(src, asarPath);

    assert.equal(await patchApp(asarPath, { exitOnError: false }), true);
    assert.equal(await patchApp(asarPath, { exitOnError: false }), true);
    assert.equal(readUtils(asarPath).split('/* ANTIGRAVITY RTL PATCH */').length - 1, 1);

    fs.unlinkSync(asarPath + '.bak');
    assert.equal(await patchApp(asarPath, { exitOnError: false }), true);
    assert.equal(readUtils(asarPath + '.bak'), original);

    assert.equal(await restoreApp(asarPath, { exitOnError: false }), true);
    assert.equal(readUtils(asarPath), original);
});

test('standalone app: payload runs, and unsafe config values never reach the page', async () => {
    const root = tmp();
    const src = path.join(root, 'src');
    fs.mkdirSync(path.join(src, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(src, 'dist', 'utils.js'), 'module.exports = (win, url) => {\n    void win.loadURL(url);\n};\n');
    const asarPath = path.join(root, 'app.asar');
    await asar.createPackage(src, asarPath);
    await patchApp(asarPath, { exitOnError: false });

    process.env.HOME = process.env.USERPROFILE = root;
    const configPath = path.join(root, '.antigravity-rtl.json');
    fs.writeFileSync(configPath, JSON.stringify({ faFont: '"><img src=x onerror=alert(1)>', enFont: 'Vazirmatn' }));

    const handlers = {};
    let pageScript;
    const win = {
        loadURL() {},
        webContents: {
            on: (event, fn) => { handlers[event] = fn; },
            getURL: () => 'http://127.0.0.1:4000/',
            executeJavaScript: (code) => { pageScript = code; return Promise.resolve(); }
        }
    };
    const mod = { exports: {} };
    new Function('module', 'require', '__dirname', readUtils(asarPath))(mod, createRequire(import.meta.url), BIN);
    mod.exports(win, 'http://127.0.0.1:4000/');

    handlers['dom-ready']();
    assert.doesNotThrow(() => new vm.Script(pageScript), 'page script must be valid JavaScript');
    assert.ok(pageScript.includes('window.__antigravityRtlCore'));
    assert.ok(pageScript.includes('"enFont":"Vazirmatn"'));
    assert.ok(!pageScript.includes('onerror=alert'));

    handlers['console-message']({}, 0, 'SAVE_RTL_CONFIG|{"fs":"18"}');
    const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.equal(saved.fs, '18');
    assert.equal(saved.enFont, 'Vazirmatn');
});

test('IDE: a patched main.js is never backed up, so restore removes the hook', async () => {
    const appDir = tmp();
    const wbDir = path.join(appDir, 'out', 'vs', 'code', 'electron-browser', 'workbench');
    fs.mkdirSync(wbDir, { recursive: true });
    const mainJs = path.join(appDir, 'out', 'main.js');
    fs.writeFileSync(mainJs, HOOK_IMPORT + "\nconsole.log('main');\n");
    fs.writeFileSync(path.join(wbDir, 'workbench.html'), `<meta content="font-src 'self';">`);

    assert.equal(await patchIde(appDir, { exitOnError: false }), true);
    assert.ok(!fs.existsSync(mainJs + '.rtl-bak'));

    const client = fs.readFileSync(path.join(appDir, 'out', 'antigravity-rtl-client.js'), 'utf8');
    assert.ok(client.startsWith(fs.readFileSync(path.join(BIN, 'rtl-core.js'), 'utf8')));
    assert.doesNotThrow(() => new vm.Script(client.replaceAll('__FONT_BASE64__', '').replaceAll('__RTL_CONFIG__', '{}')));

    assert.equal(await restoreIde(appDir, { exitOnError: false }), true);
    assert.equal(fs.readFileSync(mainJs, 'utf8'), "console.log('main');\n");
});

test('IDE: an update refreshes a stale backup', async () => {
    const appDir = tmp();
    const wbDir = path.join(appDir, 'out', 'vs', 'code', 'electron-browser', 'workbench');
    fs.mkdirSync(wbDir, { recursive: true });
    const mainJs = path.join(appDir, 'out', 'main.js');
    const html = path.join(wbDir, 'workbench.html');
    fs.writeFileSync(mainJs, "console.log('v2');\n");
    fs.writeFileSync(mainJs + '.rtl-bak', "console.log('v1');\n");
    fs.writeFileSync(html, `<meta content="font-src 'self' v2;">`);
    fs.writeFileSync(html + '.rtl-bak', `<meta content="font-src 'self' v1;">`);

    assert.equal(await patchIde(appDir, { exitOnError: false }), true);
    assert.equal(await restoreIde(appDir, { exitOnError: false }), true);
    assert.equal(fs.readFileSync(mainJs, 'utf8'), "console.log('v2');\n");
    assert.equal(fs.readFileSync(html, 'utf8'), `<meta content="font-src 'self' v2;">`);
});
