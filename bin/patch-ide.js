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

export function getIdeCandidatePaths() {
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

export async function getIdeAppPath(customPath) {
    if (customPath) {
        const resolved = resolveIdeAppDir(customPath);
        if (resolved) {
            console.log(blue(`ℹ Using specified Antigravity IDE at:`));
            console.log(`  ${resolved}\n`);
            return resolved;
        }
    }

    const candidates = getIdeCandidatePaths();
    for (const c of candidates) {
        const resolved = resolveIdeAppDir(c);
        if (resolved) {
            console.log(blue(`ℹ Found Antigravity IDE installation at:`));
            console.log(`  ${resolved}\n`);
            return resolved;
        }
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

export async function restoreIde(appDir) {
    const outDir = path.join(appDir, 'out');
    const mainJsPath = path.join(outDir, 'main.js');
    const mainJsBak = path.join(outDir, 'main.js.rtl-bak');
    const workbenchHtml = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html');
    const workbenchHtmlBak = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html.rtl-bak');
    const jetskiHtml = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html');
    const jetskiHtmlBak = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html.rtl-bak');

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
            path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'Vazirmatn-Variable.woff2')
        ];
        for (const f of filesToClean) {
            if (fs.existsSync(f)) {
                fs.unlinkSync(f);
            }
        }

        spinner.succeed('Successfully restored original Antigravity IDE!\n');
    } catch (e) {
        spinner.fail('Failed to restore Antigravity IDE.');
        console.error(red(e.message));
        process.exit(1);
    }
}

export async function patchIde(appDir) {
    const outDir = path.join(appDir, 'out');
    const mainJsPath = path.join(outDir, 'main.js');
    const mainJsBak = path.join(outDir, 'main.js.rtl-bak');
    const workbenchHtml = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html');
    const workbenchHtmlBak = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html.rtl-bak');
    const jetskiHtml = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html');
    const jetskiHtmlBak = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html.rtl-bak');

    const spinner = ora('Checking permissions and backing up IDE files...').start();

    // Check write permissions
    try {
        fs.accessSync(outDir, fs.constants.W_OK);
        fs.accessSync(mainJsPath, fs.constants.W_OK);
    } catch (e) {
        spinner.fail('Permission Denied.');
        console.error(red('\nSystem Error: ' + e.message));
        if (os.platform() === 'win32') {
            console.error(yellow('\nPlease run your terminal as Administrator and try again.\n'));
        } else {
            console.error(yellow('\nPlease run this command with sudo.\n'));
        }
        process.exit(1);
    }

    try {
        // Backup original files if not already backed up
        if (!fs.existsSync(mainJsBak) && fs.existsSync(mainJsPath)) {
            fs.copyFileSync(mainJsPath, mainJsBak);
        }
        if (!fs.existsSync(workbenchHtmlBak) && fs.existsSync(workbenchHtml)) {
            fs.copyFileSync(workbenchHtml, workbenchHtmlBak);
        }
        if (!fs.existsSync(jetskiHtmlBak) && fs.existsSync(jetskiHtml)) {
            fs.copyFileSync(jetskiHtml, jetskiHtmlBak);
        }
    } catch (e) {
        spinner.fail('Failed to create backup.');
        console.error(red(e.message));
        process.exit(1);
    }

    spinner.text = 'Copying RTL assets and injection scripts...';
    try {
        // Copy font
        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontDest = path.join(outDir, 'Vazirmatn-Variable.woff2');
        const fontWorkbenchDest = path.join(outDir, 'vs', 'code', 'electron-browser', 'workbench', 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
            fs.copyFileSync(fontSource, fontWorkbenchDest);
        }

        // Copy client payload
        const clientSource = path.join(__dirname, 'ide-client.js');
        const clientDest = path.join(outDir, 'antigravity-rtl-client.js');
        fs.copyFileSync(clientSource, clientDest);

        // Copy main process hook
        const mainSource = path.join(__dirname, 'ide-main.js');
        const mainDest = path.join(outDir, 'antigravity-rtl-main.js');
        fs.copyFileSync(mainSource, mainDest);

    } catch (e) {
        spinner.fail('Failed to copy RTL assets.');
        console.error(red(e.message));
        process.exit(1);
    }

    spinner.text = 'Injecting RTL hook into main.js...';
    try {
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
            if (content.includes("font-src") && !content.includes("font-src\n\t\t\t\t\t'self'\n\t\t\t\t\tdata:")) {
                content = content.replace("font-src\n\t\t\t\t\t'self'", "font-src\n\t\t\t\t\t'self'\n\t\t\t\t\tdata:");
                fs.writeFileSync(filePath, content, 'utf8');
            }
        };

        patchCspInFile(workbenchHtml);
        patchCspInFile(jetskiHtml);

        spinner.succeed('Successfully patched Antigravity IDE!');
        console.log(green('\n✨ RTL Features have been enabled for Antigravity IDE.'));
        console.log(green('✨ Please restart Antigravity IDE to see the changes.\n'));

    } catch (e) {
        spinner.fail('Injection into Antigravity IDE failed.');
        console.error(red(e.message));
        process.exit(1);
    }
}
