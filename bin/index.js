#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import prompts from 'prompts';
import figlet from 'figlet';

import {
    patchApp,
    restoreApp,
    getAppAsarPath,
    detectAppAsarPath,
    hasAppBackup
} from './patch-app.js';
import {
    patchIde,
    restoreIde,
    getIdeAppPath,
    detectIdeAppPath,
    resolveIdeAppDir,
    hasIdeBackup
} from './patch-ide.js';
import {
    runWatcher,
    installWatcher,
    uninstallWatcher,
    stopRunningWatcher
} from './watcher.js';

import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { cyan, bold, blue, green, yellow } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

async function promptForStar() {
    const width = 60;
    const pad = (content, len) => content + ' '.repeat(Math.max(0, width - len));
    const yellowCol = '\x1b[38;2;255;190;11m';
    const goldCol = '\x1b[38;2;255;215;0m';
    const cyanCol = '\x1b[38;2;56;189;248m';
    const reset = '\x1b[0m';
    const boldText = '\x1b[1m';
    const dimText = '\x1b[2m';

    const lines = [
        pad(`  ${boldText}${goldCol}WAS ANTIGRAVITY RTL HELPFUL TO YOU?${reset}`, 37),
        pad('', 0),
        pad(`  ${dimText}If this tool made your workflow easier, consider giving${reset}`, 57),
        pad(`  ${dimText}a star on GitHub to support ongoing updates!${reset}`, 46),
        pad('', 0),
        pad(`  ${cyanCol}${boldText}GitHub:${reset} ${cyanCol}\x1b[4mhttps://github.com/mmnaderi/antigravity-rtl${reset}`, 53)
    ];

    console.log('\n  ' + yellowCol + '╭' + '─'.repeat(width) + '╮' + reset);
    for (const line of lines) {
        console.log('  ' + yellowCol + '│' + reset + line + yellowCol + '│' + reset);
    }
    console.log('  ' + yellowCol + '╰' + '─'.repeat(width) + '╯' + reset + '\n');

    if (process.stdout.isTTY) {
        try {
            const { openRepo } = await prompts({
                type: 'confirm',
                name: 'openRepo',
                message: 'Was Antigravity RTL helpful? Open GitHub to star the repo?',
                initial: true
            });
            if (openRepo) {
                const repoUrl = 'https://github.com/mmnaderi/antigravity-rtl';
                const openCmd = process.platform === 'darwin' ? `open "${repoUrl}"` : process.platform === 'win32' ? `start "" "${repoUrl}"` : `xdg-open "${repoUrl}"`;
                exec(openCmd);
                console.log('\n  ' + green('✨ Thank you so much for your support! Enjoy RTL in Antigravity!\n'));
            }
        } catch (_) {}
    }
}

function printBanner() {
    try {
        const fullArt = figlet.textSync('Antigravity RTL', { font: 'RubiFont' }).split('\n');
        const hexColors = ['#3387FF', '#F25041', '#DFAC2A', '#91C45B'];
        const colors = hexColors.map(hex => {
            const bigint = parseInt(hex.replace('#', ''), 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        });

        const applyGradient = (text) => {
            let result = '';
            const len = text.length;
            for (let i = 0; i < len; i++) {
                const char = text[i];
                if (char === ' ' || char === '\n') {
                    result += char;
                    continue;
                }
                const factor = len > 1 ? i / (len - 1) : 0;
                const segments = colors.length - 1;
                const segmentFloat = factor * segments;
                const segmentIdx = Math.min(Math.floor(segmentFloat), segments - 1);
                const segmentFactor = segmentFloat - segmentIdx;

                const cStart = colors[segmentIdx];
                const cEnd = colors[segmentIdx + 1];

                const r = Math.round(cStart.r + segmentFactor * (cEnd.r - cStart.r));
                const g = Math.round(cStart.g + segmentFactor * (cEnd.g - cStart.g));
                const b = Math.round(cStart.b + segmentFactor * (cEnd.b - cStart.b));

                result += `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
            }
            return result;
        };

        console.log('');
        for (const line of fullArt) {
            if (!line.trim()) continue;
            console.log(applyGradient(line));
        }
        console.log('');
        console.log(`\x1b[2m  RTL & UI Patcher for Antigravity & Antigravity IDE | v${pkg.version}\x1b[0m\n`);
    } catch (err) {
        console.log(bold(cyan(`\n✨ Antigravity Smart RTL Patcher v${pkg.version}\n`)));
    }
}

printBanner();

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  npx antigravity-rtl [options] [path]

Options:
  --ide              Patch or restore Antigravity IDE only (VS Code Edition)
  --app              Patch or restore Antigravity Standalone App only
  -r, --restore      Revert changes, restore original backup files and remove watcher
  --no-watcher       Skip automatic installation of the update watcher
  --watch            Run background auto-repatch watcher in foreground
  --install-watcher  Enable auto-repatch watcher on system startup
  --uninstall-watcher Disable auto-repatch watcher
  --path <dir/file>  Specify custom path to IDE directory or app.asar
  --browser          Install the Remote Control browser extension folder
  -h, --help         Show this help message

Default Behavior:
  Running without --app or --ide will auto-detect installed applications:
  • If both Antigravity and Antigravity IDE are found, both will be patched.
  • If only one is found, that one will be patched.
  • Auto-Update Watcher is automatically enabled to keep RTL active after updates!
  • Running with --restore will restore all detected applications and remove the watcher.

Examples:
  npx antigravity-rtl               # Auto-detect, patch and enable auto-update watcher
  npx antigravity-rtl --ide         # Patch only Antigravity IDE
  npx antigravity-rtl --app         # Patch only Antigravity Standalone App
  npx antigravity-rtl --restore     # Restore apps and remove watcher
  npx antigravity-rtl --no-watcher  # Patch without installing the background watcher
  npx antigravity-rtl --browser     # Extension for Remote Control in Chrome/Arc
`);
    process.exit(0);
}

function installBrowserExtension() {
    const dest = path.join(os.homedir(), '.antigravity-rtl-extension');
    const extDir = path.join(__dirname, '..', 'extension');
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(path.join(extDir, 'manifest.json'), path.join(dest, 'manifest.json'));
    fs.copyFileSync(path.join(__dirname, 'remote-client.js'), path.join(dest, 'content.js'));
    fs.copyFileSync(path.join(__dirname, 'Vazirmatn-Variable.woff2'), path.join(dest, 'Vazirmatn-Variable.woff2'));
    console.log(green(`\nRemote Control extension ready:\n  ${dest}\n`));
    console.log('The remote UI is a cross-origin iframe, so the desktop patch cannot reach it.');
    console.log('In Chrome or Arc: open the extensions page, turn on Developer Mode,');
    console.log('then Load unpacked and choose the folder above. Reload the remote tab.');
    console.log(yellow('Browser settings are stored in the extension, separate from ~/.antigravity-rtl.json.\n'));
    const openCmd = process.platform === 'darwin' ? `open "${dest}"` : process.platform === 'win32' ? `explorer "${dest}"` : `xdg-open "${dest}"`;
    exec(openCmd, () => {});
}

if (args.includes('--browser')) {
    installBrowserExtension();
    process.exit(0);
}

const isRestore = args.includes('--restore') || args.includes('-r');
const forceIde = args.includes('--ide');
const forceApp = args.includes('--app');

// Find custom path argument if provided e.g. --path /foo/bar or last positional argument
let customPath = null;
const pathArgIdx = args.indexOf('--path');
if (pathArgIdx !== -1 && args[pathArgIdx + 1]) {
    customPath = args[pathArgIdx + 1];
} else {
    const nonFlags = args.filter(a => !a.startsWith('-'));
    if (nonFlags.length > 0) {
        customPath = nonFlags[0];
    }
}

if (args.includes('--watch')) {
    const started = await runWatcher({
        watchApp: forceApp ? true : (forceIde ? false : null),
        watchIde: forceIde ? true : (forceApp ? false : null),
        appAsar: customPath && !forceIde ? customPath : null,
        ideDir: customPath && (forceIde || resolveIdeAppDir(customPath)) ? (resolveIdeAppDir(customPath) || customPath) : null
    });
    if (started) {
        await new Promise(() => {});
    } else {
        process.exit(0);
    }
}

if (args.includes('--install-watcher')) {
    const ok = installWatcher({
        silent: false,
        targets: {
            watchApp: forceApp ? true : (forceIde ? false : true),
            watchIde: forceIde ? true : (forceApp ? false : true),
            appPath: customPath && !forceIde ? customPath : null,
            idePath: customPath && (forceIde || resolveIdeAppDir(customPath)) ? (resolveIdeAppDir(customPath) || customPath) : null
        }
    });
    process.exit(ok ? 0 : 1);
}

if (args.includes('--uninstall-watcher')) {
    uninstallWatcher({ silent: false });
    process.exit(0);
}

async function main() {
    if (isRestore) {
        stopRunningWatcher();
    }

    const [runApp, runIde, verb] = isRestore
        ? [restoreApp, restoreIde, 'restore']
        : [patchApp, patchIde, 'patch'];
    let ok = false;
    let targetAppPath = null;
    let targetIdeDir = null;

    if (customPath) {
        const ideDir = resolveIdeAppDir(customPath);
        if (forceIde || ideDir) {
            targetIdeDir = ideDir || customPath;
            ok = await runIde(targetIdeDir);
        } else {
            targetAppPath = customPath;
            ok = await runApp(targetAppPath);
        }
    } else if (forceApp && !forceIde) {
        targetAppPath = await getAppAsarPath();
        ok = await runApp(targetAppPath);
    } else if (forceIde && !forceApp) {
        targetIdeDir = await getIdeAppPath();
        ok = await runIde(targetIdeDir);
    } else {
        const appPath = detectAppAsarPath();
        const ideDir = detectIdeAppPath();
        targetAppPath = appPath;
        targetIdeDir = ideDir;

        if (!appPath && !ideDir) {
            console.log(yellow('⚠ Could not automatically locate Antigravity or Antigravity IDE.'));
            const { target } = await prompts({
                type: 'select',
                name: 'target',
                message: `Which application would you like to ${verb}?`,
                choices: [
                    { title: 'Antigravity IDE (VS Code Edition)', value: 'ide' },
                    { title: 'Antigravity (Standalone App)', value: 'app' }
                ],
                initial: 0
            });
            if (!target) process.exit(0);
            if (target === 'ide') {
                targetIdeDir = await getIdeAppPath();
                targetAppPath = null;
                ok = await runIde(targetIdeDir);
            } else {
                targetAppPath = await getAppAsarPath();
                targetIdeDir = null;
                ok = await runApp(targetAppPath);
            }
        } else {
            const targets = [
                appPath && { name: 'Antigravity (Standalone App)', run: o => runApp(appPath, o), hasBackup: hasAppBackup(appPath) },
                ideDir && { name: 'Antigravity IDE', run: o => runIde(ideDir, o), hasBackup: hasIdeBackup(ideDir) }
            ].filter(t => t && (!isRestore || t.hasBackup));

            if (targets.length === 0) {
                console.log(yellow('⚠ No backup files found to restore for detected application(s).\n'));
                return;
            }

            const multi = targets.length > 1;
            if (multi && !isRestore) {
                console.log(bold(cyan('ℹ Found both Antigravity (Standalone App) and Antigravity IDE!')));
                console.log(bold(cyan('  Patching both applications...\n')));
            }
            for (const [i, t] of targets.entries()) {
                if (isRestore) console.log(blue(`ℹ Found backup for ${t.name}. Restoring...`));
                else if (multi) console.log(bold(`${i ? '\n' : ''}--- ${i + 1}/2: ${t.name} ---`));
                else console.log(blue(`ℹ Found ${t.name}. Patching...\n`));
                if (await t.run({ exitOnError: !multi })) ok = true;
            }
            if (multi && ok && !isRestore) {
                console.log(bold(green('\n✨ Done! Please restart your application(s) to enjoy RTL.\n')));
            }
        }
    }

    if (ok && !isRestore) {
        if (!args.includes('--no-watcher')) {
            console.log(bold(cyan('🔄 Setting up Auto-Update Watcher (auto-repatch on updates)...')));
            installWatcher({
                silent: false,
                targets: {
                    watchApp: forceApp ? true : (forceIde ? false : Boolean(targetAppPath)),
                    watchIde: forceIde ? true : (forceApp ? false : Boolean(targetIdeDir)),
                    appPath: targetAppPath,
                    idePath: targetIdeDir
                }
            });
        }
        console.log(cyan('\nRemote Control in the browser is separate. Set it up with: npx antigravity-rtl --browser\n'));
        await promptForStar();
    } else if (isRestore && ok) {
        uninstallWatcher({ silent: true });
    }
}

main().catch(e => {
    console.error('\n✖ An unexpected error occurred:', e.message);
    process.exit(1);
});
