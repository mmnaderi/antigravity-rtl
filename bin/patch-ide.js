import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, green, red, yellow } = picocolors;

function idePaths(appDir) {
    const outDir = path.join(appDir, 'out');
    const wbDir = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench');
    const mainJsPath = path.join(outDir, 'main.js');
    const workbenchHtml = path.join(wbDir, 'workbench.html');
    const jetskiHtml = path.join(wbDir, 'workbench-jetski-agent.html');
    return {
        outDir, wbDir, mainJsPath, workbenchHtml, jetskiHtml,
        mainJsBak: mainJsPath + '.rtl-bak',
        workbenchHtmlBak: workbenchHtml + '.rtl-bak',
        jetskiHtmlBak: jetskiHtml + '.rtl-bak'
    };
}

function getIdeCandidatePaths() {
    const candidates = [];
    const platform = os.platform();

    if (platform === 'darwin') {
        candidates.push('/Applications/Antigravity IDE.app');
        candidates.push(path.join(os.homedir(), 'Applications', 'Antigravity IDE.app'));
    } else if (platform === 'win32') {
        if (process.env.LOCALAPPDATA) {
            candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Antigravity IDE'));
            candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity-ide'));
            candidates.push(path.join(process.env.LOCALAPPDATA, 'Antigravity IDE'));
        }
        if (process.env.PROGRAMFILES) {
            candidates.push(path.join(process.env.PROGRAMFILES, 'Antigravity IDE'));
            candidates.push(path.join(process.env.PROGRAMFILES, 'antigravity-ide'));
        }
        if (process.env['PROGRAMFILES(X86)']) {
            candidates.push(path.join(process.env['PROGRAMFILES(X86)'], 'Antigravity IDE'));
        }
    } else {
        // Linux candidates
        candidates.push(path.join(os.homedir(), 'Downloads', 'Antigravity IDE'));
        candidates.push('/opt/Antigravity IDE');
        candidates.push('/opt/antigravity-ide');
        candidates.push('/usr/share/antigravity');
        candidates.push('/usr/share/antigravity-ide');
        candidates.push(path.join(os.homedir(), '.local', 'share', 'antigravity-ide'));
    }

    return candidates;
}

export function resolveIdeAppDir(inputPath) {
    if (!inputPath || !fs.existsSync(inputPath)) return null;

    let candidate = inputPath;
    
    // Check if inputPath is already resources/app
    if (fs.existsSync(path.join(candidate, 'out', 'main.js'))) {
        return candidate;
    }

    // Check if inside macOS .app
    const macAppDir = path.join(candidate, 'Contents', 'Resources', 'app');
    if (fs.existsSync(path.join(macAppDir, 'out', 'main.js'))) {
        return macAppDir;
    }

    // Check Linux / Windows standard resources/app
    const standardAppDir = path.join(candidate, 'resources', 'app');
    if (fs.existsSync(path.join(standardAppDir, 'out', 'main.js'))) {
        return standardAppDir;
    }

    return null;
}

export function detectIdeAppPath() {
    for (const c of getIdeCandidatePaths()) {
        const resolved = resolveIdeAppDir(c);
        if (resolved) return resolved;
    }
    return null;
}

export function hasIdeBackup(appDir) {
    if (!appDir) return false;
    const { mainJsPath, mainJsBak, workbenchHtmlBak, jetskiHtmlBak } = idePaths(appDir);
    let hasImport = false;
    if (fs.existsSync(mainJsPath)) {
        try {
            const code = fs.readFileSync(mainJsPath, 'utf8');
            hasImport = code.includes("import './antigravity-rtl-main.js';");
        } catch (_) {}
    }
    return fs.existsSync(mainJsBak) || fs.existsSync(workbenchHtmlBak) || fs.existsSync(jetskiHtmlBak) || hasImport;
}

export async function getIdeAppPath() {
    const detected = detectIdeAppPath();
    if (detected) {
        console.log(blue(`ℹ Found Antigravity IDE installation at:`));
        console.log(`  ${detected}\n`);
        return detected;
    }

    console.log(yellow(`⚠ Could not automatically find Antigravity IDE.`));
    const response = await prompts({
        type: 'text',
        name: 'customPath',
        message: 'Please enter the path to your Antigravity IDE directory:'
    });

    if (!response.customPath) {
        console.error(red('\n✖ No path entered. Aborting.\n'));
        process.exit(1);
    }

    const resolved = resolveIdeAppDir(response.customPath);
    if (!resolved) {
        console.error(red(`\n✖ Could not find valid IDE resources in "${response.customPath}". Aborting.\n`));
        process.exit(1);
    }

    return resolved;
}

export async function restoreIde(appDir, { exitOnError = true } = {}) {
    const { outDir, wbDir, mainJsPath, mainJsBak, workbenchHtml, workbenchHtmlBak, jetskiHtml, jetskiHtmlBak } = idePaths(appDir);

    if (!hasIdeBackup(appDir)) {
        console.error(red('✖ No backup found to restore for Antigravity IDE.\n'));
        if (exitOnError) process.exit(1);
        return false;
    }

    const spinner = ora('Restoring original Antigravity IDE files...').start();
    try {
        // Restore main.js
        if (fs.existsSync(mainJsBak)) {
            fs.copyFileSync(mainJsBak, mainJsPath);
            fs.unlinkSync(mainJsBak);
        } else if (fs.existsSync(mainJsPath)) {
            let code = fs.readFileSync(mainJsPath, 'utf8');
            if (code.includes("import './antigravity-rtl-main.js';")) {
                code = code.replace("import './antigravity-rtl-main.js';\n", '');
                code = code.replace("import './antigravity-rtl-main.js';", '');
                fs.writeFileSync(mainJsPath, code, 'utf8');
            }
        }

        // Restore HTML files
        if (fs.existsSync(workbenchHtmlBak)) {
            fs.copyFileSync(workbenchHtmlBak, workbenchHtml);
            fs.unlinkSync(workbenchHtmlBak);
        }
        if (fs.existsSync(jetskiHtmlBak)) {
            fs.copyFileSync(jetskiHtmlBak, jetskiHtml);
            fs.unlinkSync(jetskiHtmlBak);
        }

        // Cleanup injected files
        const filesToClean = [
            path.join(outDir, 'antigravity-rtl-main.js'),
            path.join(outDir, 'antigravity-rtl-client.js'),
            path.join(outDir, 'Vazirmatn-Variable.woff2'),
            path.join(wbDir, 'Vazirmatn-Variable.woff2')
        ];
        for (const f of filesToClean) {
            fs.rmSync(f, { force: true });
        }

        spinner.succeed('Successfully restored original Antigravity IDE!\n');
        return true;
    } catch (e) {
        spinner.fail('Failed to restore Antigravity IDE.');
        console.error(red(e.message));
        if (exitOnError) process.exit(1);
        return false;
    }
}

export async function patchIde(appDir, { exitOnError = true } = {}) {
    const { outDir, mainJsPath, mainJsBak, workbenchHtml, workbenchHtmlBak, jetskiHtml, jetskiHtmlBak } = idePaths(appDir);

    const spinner = ora('Checking permissions and backing up IDE files...').start();
    let failLabel = 'Permission Denied.';
    try {
        fs.accessSync(outDir, fs.constants.W_OK);
        fs.accessSync(mainJsPath, fs.constants.W_OK);

        failLabel = 'Failed to create backup.';
        if (!fs.existsSync(mainJsBak) && fs.existsSync(mainJsPath)) {
            fs.copyFileSync(mainJsPath, mainJsBak);
        }
        if (!fs.existsSync(workbenchHtmlBak) && fs.existsSync(workbenchHtml)) {
            fs.copyFileSync(workbenchHtml, workbenchHtmlBak);
        }
        if (!fs.existsSync(jetskiHtmlBak) && fs.existsSync(jetskiHtml)) {
            fs.copyFileSync(jetskiHtml, jetskiHtmlBak);
        }

        failLabel = 'Failed to copy RTL assets.';
        spinner.text = 'Copying RTL assets and injection scripts...';
        fs.copyFileSync(path.join(__dirname, 'Vazirmatn-Variable.woff2'), path.join(outDir, 'Vazirmatn-Variable.woff2'));
        fs.copyFileSync(path.join(__dirname, 'ide-client.js'), path.join(outDir, 'antigravity-rtl-client.js'));
        fs.copyFileSync(path.join(__dirname, 'ide-main.js'), path.join(outDir, 'antigravity-rtl-main.js'));

        failLabel = 'Injection into Antigravity IDE failed.';
        spinner.text = 'Injecting RTL hook into main.js...';
        let mainCode = fs.readFileSync(mainJsPath, 'utf8');
        const importHook = "import './antigravity-rtl-main.js';\n";

        if (!mainCode.includes("import './antigravity-rtl-main.js';")) {
            mainCode = importHook + mainCode;
            fs.writeFileSync(mainJsPath, mainCode, 'utf8');
        }

        // Patch CSP in HTML files to allow data: fonts
        const patchCspInFile = (filePath) => {
            if (!fs.existsSync(filePath)) return;
            let content = fs.readFileSync(filePath, 'utf8');
            // If font-src does not have data:, add it
            if (content.includes("font-src") && !/font-src[^;]*\bdata:/.test(content)) {
                content = content.replace(/(font-src[\s\S]*?'self')/i, "$1\n\t\t\t\t\tdata:");
                fs.writeFileSync(filePath, content, 'utf8');
            }
        };

        patchCspInFile(workbenchHtml);
        patchCspInFile(jetskiHtml);

        spinner.succeed('Successfully patched Antigravity IDE!');
        console.log(green('\n✨ RTL Features have been enabled for Antigravity IDE.'));
        console.log(green('✨ Please restart Antigravity IDE to see the changes.\n'));
        return true;
    } catch (e) {
        spinner.fail(failLabel);
        if (failLabel === 'Permission Denied.') {
            console.error(red('\nSystem Error: ' + e.message));
            console.error(yellow(os.platform() === 'win32'
                ? '\nPlease run your terminal as Administrator and try again.\n'
                : '\nPlease run this command with sudo.\n'));
        } else {
            console.error(red(e.message));
        }
        if (exitOnError) process.exit(1);
        return false;
    }
}
