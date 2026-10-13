#!/usr/bin/env node
import fs from 'fs';
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
    installPlugin,
    uninstallPlugin,
    isPluginInstalled
} from './patch-plugin.js';

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
  --plugin           Install native Zero-Patch plugin (Permanent across app updates) [Recommended]
  --uninstall-plugin Remove native Zero-Patch plugin
  --ide              Patch or restore Antigravity IDE only (VS Code Edition)
  --app              Patch or restore Antigravity Standalone App only (Legacy asar patch)
  -r, --restore      Revert changes and restore original backup files / plugin
  --path <dir/file>  Specify custom path to IDE directory or app.asar
  -h, --help         Show this help message

Default Behavior:
  Running without --app or --ide will auto-detect installed applications:
  • Antigravity Standalone: Installs native Zero-Patch plugin (survives updates).
  • Antigravity IDE: Automatically patches IDE workbench.
  • Running with --restore will restore all detected applications and backups.

Examples:
  npx antigravity-rtl               # Auto-detect and install plugin / patch IDE
  npx antigravity-rtl --plugin      # Install native Zero-Patch plugin
  npx antigravity-rtl --ide         # Patch only Antigravity IDE
  npx antigravity-rtl --app         # Patch only Antigravity Standalone App (asar)
  npx antigravity-rtl --restore     # Restore all detected patched apps & plugin
  npx antigravity-rtl -r --ide      # Restore only Antigravity IDE
`);
    process.exit(0);
}

const isRestore = args.includes('--restore') || args.includes('-r');
const forceIde = args.includes('--ide');
const forceApp = args.includes('--app');
const forcePlugin = args.includes('--plugin');
const forceUninstallPlugin = args.includes('--uninstall-plugin');

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

async function main() {
    if (forceUninstallPlugin) {
        await uninstallPlugin();
        return;
    }

    if (forcePlugin) {
        const ok = isRestore ? await uninstallPlugin() : await installPlugin();
        if (ok && !isRestore) await promptForStar();
        return;
    }

    const [runApp, runIde, verb] = isRestore
        ? [restoreApp, restoreIde, 'restore']
        : [patchApp, patchIde, 'patch'];
    let ok = false;

    if (customPath) {
        const ideDir = resolveIdeAppDir(customPath);
        ok = (forceIde || ideDir) ? await runIde(ideDir || customPath) : await runApp(customPath);
    } else if (forceApp && !forceIde) {
        ok = await runApp(await getAppAsarPath());
    } else if (forceIde && !forceApp) {
        ok = await runIde(await getIdeAppPath());
    } else {
        const appPath = detectAppAsarPath();
        const ideDir = detectIdeAppPath();

        if (!appPath && !ideDir && (!isRestore || !isPluginInstalled())) {
            console.log(yellow('⚠ Could not automatically locate Antigravity or Antigravity IDE.'));
            const { target } = await prompts({
                type: 'select',
                name: 'target',
                message: `Which application would you like to ${verb}?`,
                choices: [
                    { title: 'Antigravity (Standalone App) - Native Plugin (Permanent / Zero-Patch) [Recommended]', value: 'plugin' },
                    { title: 'Antigravity IDE (VS Code Edition)', value: 'ide' },
                    { title: 'Antigravity (Standalone App) - Legacy Asar Patch', value: 'app' }
                ],
                initial: 0
            });
            if (!target) process.exit(0);
            if (target === 'plugin') {
                ok = isRestore ? await uninstallPlugin() : await installPlugin();
            } else if (target === 'ide') {
                ok = await runIde(await getIdeAppPath());
            } else {
                ok = await runApp(await getAppAsarPath());
            }
        } else {
            let targets = [];

            if (isRestore) {
                if (isPluginInstalled()) {
                    targets.push({ name: 'Antigravity Native Plugin', run: () => uninstallPlugin() });
                }
                if (appPath && hasAppBackup(appPath)) {
                    targets.push({ name: 'Antigravity (Standalone App)', run: o => runApp(appPath, o) });
                }
                if (ideDir && hasIdeBackup(ideDir)) {
                    targets.push({ name: 'Antigravity IDE', run: o => runIde(ideDir, o) });
                }
            } else {
                if (appPath) {
                    targets.push({
                        name: 'Antigravity Standalone (Native Zero-Patch Plugin)',
                        run: () => installPlugin()
                    });
                }
                if (ideDir) {
                    targets.push({
                        name: 'Antigravity IDE',
                        run: o => runIde(ideDir, o)
                    });
                }
            }

            if (targets.length === 0) {
                console.log(yellow('⚠ No installed plugins or backup files found to restore.\n'));
                return;
            }

            const multi = targets.length > 1;
            if (multi && !isRestore) {
                console.log(bold(cyan('ℹ Found both Antigravity (Standalone App) and Antigravity IDE!')));
                console.log(bold(cyan('  Configuring both environments...\n')));
            }
            for (const [i, t] of targets.entries()) {
                if (isRestore) console.log(blue(`ℹ Found ${t.name}. Restoring...`));
                else if (multi) console.log(bold(`${i ? '\n' : ''}--- ${i + 1}/2: ${t.name} ---`));
                else console.log(blue(`ℹ Target: ${t.name}\n`));
                if (await t.run({ exitOnError: !multi })) ok = true;
            }
            if (multi && ok && !isRestore) {
                console.log(bold(green('\n✨ Done! Please restart your application(s) to enjoy RTL.\n')));
            }
        }
    }

    if (ok && !isRestore) await promptForStar();
}

main().catch(e => {
    console.error('\n✖ An unexpected error occurred:', e.message);
    process.exit(1);
});
