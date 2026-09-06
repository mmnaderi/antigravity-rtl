#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import prompts from 'prompts';
import figlet from 'figlet';

import { patchApp, restoreApp, getAppAsarPath, getDefaultAppPath, getAppCandidatePaths } from './patch-app.js';
import { patchIde, restoreIde, getIdeAppPath, getIdeCandidatePaths, resolveIdeAppDir } from './patch-ide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { cyan, bold } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

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
  --ide              Patch or restore Antigravity IDE (VS Code Edition)
  --app              Patch or restore Antigravity Standalone App
  --restore          Revert changes and restore original backup files
  --path <dir/file>  Specify custom path to IDE directory or app.asar
  -h, --help         Show this help message

Supported Platforms:
  Windows, macOS, Linux
`);
    process.exit(0);
}

const isRestore = args.includes('--restore');
const forceIde = args.includes('--ide');
const forceApp = args.includes('--app');

// Find custom path argument if provided e.g. --path /foo/bar or last positional argument
let customPath = null;
const pathArgIdx = args.indexOf('--path');
if (pathArgIdx !== -1 && args[pathArgIdx + 1]) {
    customPath = args[pathArgIdx + 1];
} else {
    const nonFlags = args.filter(a => !a.startsWith('--'));
    if (nonFlags.length > 0) {
        customPath = nonFlags[0];
    }
}

async function determineTarget() {
    if (forceIde) return 'ide';
    if (forceApp) return 'app';

    if (customPath) {
        if (resolveIdeAppDir(customPath)) return 'ide';
        return 'app';
    }

    // Auto-detect installed apps
    const ideCandidates = getIdeCandidatePaths();
    let hasIde = ideCandidates.some(c => resolveIdeAppDir(c) !== null);

    const defaultAppCandidates = getAppCandidatePaths();
    let hasApp = defaultAppCandidates.some(c => fs.existsSync(c));

    if (hasIde && !hasApp) {
        return 'ide';
    }
    if (hasApp && !hasIde) {
        return 'app';
    }

    // If both or neither found, ask the user
    const actionLabel = isRestore ? 'restore' : 'patch';
    const response = await prompts({
        type: 'select',
        name: 'target',
        message: `Which application would you like to ${actionLabel}?`,
        choices: [
            { title: 'Antigravity IDE (VS Code Edition)', value: 'ide' },
            { title: 'Antigravity (Standalone App)', value: 'app' }
        ],
        initial: 0
    });

    if (!response.target) {
        process.exit(0);
    }
    return response.target;
}

async function main() {
    const target = await determineTarget();

    if (target === 'ide') {
        const ideAppDir = await getIdeAppPath(customPath);
        if (isRestore) {
            await restoreIde(ideAppDir);
        } else {
            await patchIde(ideAppDir);
        }
    } else {
        const appAsarPath = await getAppAsarPath(customPath);
        if (isRestore) {
            await restoreApp(appAsarPath);
        } else {
            await patchApp(appAsarPath);
        }
    }
}

main().catch(e => {
    console.error('\n✖ An unexpected error occurred:', e.message);
    process.exit(1);
});
