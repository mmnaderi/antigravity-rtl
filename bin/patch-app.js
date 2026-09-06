import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, green, red, yellow } = picocolors;

export function getAppCandidatePaths() {
    const candidates = [];
    const platform = os.platform();

    if (platform === 'darwin') {
        candidates.push('/Applications/Antigravity.app/Contents/Resources/app.asar');
        candidates.push(path.join(os.homedir(), 'Applications', 'Antigravity.app', 'Contents', 'Resources', 'app.asar'));
    } else if (platform === 'win32') {
        if (process.env.LOCALAPPDATA) {
            candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Antigravity', 'resources', 'app.asar'));
            candidates.push(path.join(process.env.LOCALAPPDATA, 'Antigravity', 'resources', 'app.asar'));
        }
        if (process.env.PROGRAMFILES) {
            candidates.push(path.join(process.env.PROGRAMFILES, 'Antigravity', 'resources', 'app.asar'));
        }
        if (process.env['PROGRAMFILES(X86)']) {
            candidates.push(path.join(process.env['PROGRAMFILES(X86)'], 'Antigravity', 'resources', 'app.asar'));
        }
    } else {
        candidates.push('/opt/Antigravity/resources/app.asar');
        candidates.push('/opt/antigravity/resources/app.asar');
        candidates.push('/usr/share/antigravity/resources/app.asar');
        candidates.push(path.join(os.homedir(), '.local', 'share', 'antigravity', 'resources', 'app.asar'));
    }
    return candidates;
}

export function getDefaultAppPath() {
    const candidates = getAppCandidatePaths();
    return candidates[0] || '';
}

export async function getAppAsarPath(customPath) {
    if (customPath) {
        if (fs.existsSync(customPath)) {
            let p = customPath;
            if (fs.statSync(p).isDirectory()) {
                p = path.join(p, 'resources', 'app.asar');
            }
            if (fs.existsSync(p)) return p;
        }
    }

    const candidates = getAppCandidatePaths();
    for (const c of candidates) {
        if (fs.existsSync(c)) {
            console.log(blue(`ℹ Found Antigravity installation at:`));
            console.log(`  ${c}\n`);
            return c;
        }
    }

    console.log(yellow(`⚠ Could not find Antigravity (App) at default location.`));
    const response = await prompts({
        type: 'text',
        name: 'customPath',
        message: 'Please enter the full path to app.asar:'
    });

    if (!response.customPath || !fs.existsSync(response.customPath)) {
        console.error(red('\n✖ Invalid path. Aborting.\n'));
        process.exit(1);
    }
    return response.customPath;
}

export async function restoreApp(asarPath) {
    const backupPath = asarPath + '.bak';
    if (!fs.existsSync(backupPath)) {
        console.error(red('✖ No backup found to restore.\n'));
        process.exit(1);
    }
    const spinner = ora('Restoring original app.asar...').start();
    try {
        fs.copyFileSync(backupPath, asarPath);
        spinner.succeed('Successfully restored original Antigravity!\n');
    } catch (e) {
        spinner.fail('Failed to restore.');
        console.error(red(e.message));
        process.exit(1);
    }
}

export async function patchApp(asarPath) {
    const backupPath = asarPath + '.bak';
    const spinner = ora('Checking permissions and backing up...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }
    } catch (e) {
        spinner.fail('Permission Denied.');
        console.error(red('\nSystem Error: ' + e.message));
        if (os.platform() === 'win32') {
            console.error(yellow('\nPlease run your terminal (PowerShell/CMD) as Administrator and try again.\n'));
        } else if (os.platform() === 'darwin') {
            console.error(yellow('\nPlease ensure you run this command with sudo.'));
            console.error(yellow('If you are using sudo, macOS requires your terminal to have "App Management" permission.'));
            console.error(yellow('Go to: System Settings > Privacy & Security > App Management'));
            console.error(yellow('And enable the toggle for your terminal, then try again.\n'));
        } else {
            console.error(yellow('\nPlease run this command with sudo.\n'));
        }
        process.exit(1);
    }
    
    const extractDir = path.join(path.dirname(asarPath), 'app-extracted-rtl-temp');
    spinner.text = 'Extracting app.asar (this may take a few seconds)...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('Failed to extract ASAR.');
        console.error(red(e.message));
        process.exit(1);
    }

    spinner.text = 'Injecting RTL features...';
    try {
        const utilsPath = path.join(extractDir, 'dist', 'utils.js');
        if (!fs.existsSync(utilsPath)) {
            throw new Error('dist/utils.js not found in ASAR. Unsupported Antigravity version.');
        }

        let utilsCode = fs.readFileSync(utilsPath, 'utf8');
        
        if (utilsCode.includes('/* ANTIGRAVITY RTL PATCH */')) {
            spinner.succeed('Antigravity is already patched!');
            fs.rmSync(extractDir, { recursive: true, force: true });
            console.log(green('\n✨ Enjoy your RTL experience!\n'));
            return;
        }

        const payloadPath = path.join(__dirname, 'payload.js');
        const payload = fs.readFileSync(payloadPath, 'utf8');

        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor not found. The app version might be unsupported.');
        }

        utilsCode = utilsCode.replace(anchor, payload);
        // Force-enable DevTools in packaged app
        utilsCode = utilsCode.replace(/devTools:\s*!electron_1?\.app\.isPackaged/g, 'devTools: true');
        fs.writeFileSync(utilsPath, utilsCode);

        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontDest = path.join(extractDir, 'dist', 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
        }

    } catch (e) {
        spinner.fail('Injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        process.exit(1);
    }

    spinner.text = 'Repacking app.asar (almost done)...';
    try {
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('Successfully patched Antigravity!');
        console.log(green('\n✨ RTL Features have been enabled. Please restart Antigravity to see the changes.\n'));
    } catch (e) {
        spinner.fail('Failed to repack ASAR.');
        console.error(red(e.message));
        process.exit(1);
    }
}
