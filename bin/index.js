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
  -r, --restore      Revert changes and restore original backup files
  --path <dir/file>  Specify custom path to IDE directory or app.asar
  -h, --help         Show this help message

Default Behavior:
  Running without --app or --ide will auto-detect installed applications:
  • If both Antigravity and Antigravity IDE are found, both will be patched.
  • If only one is found, that one will be patched.
  • Running with --restore will restore all detected applications with backups.

Examples:
  npx antigravity-rtl               # Auto-detect and patch both/available apps
  npx antigravity-rtl --ide         # Patch only Antigravity IDE
  npx antigravity-rtl --app         # Patch only Antigravity Standalone App
  npx antigravity-rtl --restore     # Restore all detected patched apps
  npx antigravity-rtl -r --ide      # Restore only Antigravity IDE
`);
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

async function main() {
    if (isRestore) {
        if (customPath) {
            if (forceIde || resolveIdeAppDir(customPath)) {
                const ideDir = resolveIdeAppDir(customPath) || customPath;
                await restoreIde(ideDir);
            } else {
                await restoreApp(customPath);
            }
            return;
        }

        if (forceApp && !forceIde) {
            const appPath = await getAppAsarPath();
            await restoreApp(appPath);
            return;
        }

        if (forceIde && !forceApp) {
            const ideDir = await getIdeAppPath();
            await restoreIde(ideDir);
            return;
        }

        // Auto-detect targets to restore
        const appPath = detectAppAsarPath();
        const ideDir = detectIdeAppPath();

        if (!appPath && !ideDir) {
            console.log(yellow('⚠ Could not automatically locate Antigravity or Antigravity IDE.'));
            const response = await prompts({
                type: 'select',
                name: 'target',
                message: 'Which application would you like to restore?',
                choices: [
                    { title: 'Antigravity IDE (VS Code Edition)', value: 'ide' },
                    { title: 'Antigravity (Standalone App)', value: 'app' }
                ],
                initial: 0
            });
            if (!response.target) process.exit(0);
            if (response.target === 'ide') {
                const p = await getIdeAppPath();
                await restoreIde(p);
            } else {
                const p = await getAppAsarPath();
                await restoreApp(p);
            }
            return;
        }

        const appHasBak = hasAppBackup(appPath);
        const ideHasBak = hasIdeBackup(ideDir);

        if (!appHasBak && !ideHasBak) {
            console.log(yellow('⚠ No backup files found to restore for detected application(s).\n'));
            return;
        }

        if (appHasBak) {
            console.log(blue('ℹ Found backup for Antigravity (Standalone App). Restoring...'));
            await restoreApp(appPath, { exitOnError: false });
        }
        if (ideHasBak) {
            console.log(blue('ℹ Found backup for Antigravity IDE. Restoring...'));
            await restoreIde(ideDir, { exitOnError: false });
        }
        return;
    }

    // Patch Mode
    let patchedAny = false;

    if (customPath) {
        if (forceIde || resolveIdeAppDir(customPath)) {
            const ideDir = resolveIdeAppDir(customPath) || customPath;
            patchedAny = await patchIde(ideDir);
        } else {
            patchedAny = await patchApp(customPath);
        }
    } else if (forceApp && !forceIde) {
        const appPath = await getAppAsarPath();
        patchedAny = await patchApp(appPath);
    } else if (forceIde && !forceApp) {
        const ideDir = await getIdeAppPath();
        patchedAny = await patchIde(ideDir);
    } else {
        // Auto-detect installed applications
        const appPath = detectAppAsarPath();
        const ideDir = detectIdeAppPath();

        if (appPath && ideDir) {
            console.log(bold(cyan('ℹ Found both Antigravity (Standalone App) and Antigravity IDE!')));
            console.log(bold(cyan('  Patching both applications...\n')));
            console.log(bold('--- 1/2: Antigravity (Standalone App) ---'));
            const okApp = await patchApp(appPath, { exitOnError: false });
            console.log('');
            console.log(bold('--- 2/2: Antigravity IDE ---'));
            const okIde = await patchIde(ideDir, { exitOnError: false });
            if (okApp || okIde) {
                console.log(bold(green('\n✨ Done! Please restart your application(s) to enjoy RTL.\n')));
                patchedAny = true;
            }
        } else if (appPath) {
            console.log(blue('ℹ Found Antigravity (Standalone App). Patching...\n'));
            patchedAny = await patchApp(appPath);
        } else if (ideDir) {
            console.log(blue('ℹ Found Antigravity IDE. Patching...\n'));
            patchedAny = await patchIde(ideDir);
        } else {
            // Neither detected automatically
            console.log(yellow('⚠ Could not automatically locate Antigravity or Antigravity IDE.'));
            const response = await prompts({
                type: 'select',
                name: 'target',
                message: 'Which application would you like to patch?',
                choices: [
                    { title: 'Antigravity IDE (VS Code Edition)', value: 'ide' },
                    { title: 'Antigravity (Standalone App)', value: 'app' }
                ],
                initial: 0
            });
            if (!response.target) process.exit(0);
            if (response.target === 'ide') {
                const p = await getIdeAppPath();
                patchedAny = await patchIde(p);
            } else {
                const p = await getAppAsarPath();
                patchedAny = await patchApp(p);
            }
        }
    }

    if (patchedAny) {
        await promptForStar();
    }
}

main().catch(e => {
    console.error('\n✖ An unexpected error occurred:', e.message);
    process.exit(1);
});
