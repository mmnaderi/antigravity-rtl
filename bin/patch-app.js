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

function getAppCandidatePaths() {
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

export function detectAppAsarPath() {
    return getAppCandidatePaths().find(c => fs.existsSync(c)) || null;
}

export function hasAppBackup(asarPath) {
    return asarPath ? fs.existsSync(asarPath + '.bak') : false;
}

export async function getAppAsarPath() {
    const detected = detectAppAsarPath();
    if (detected) {
        console.log(blue(`ℹ Found Antigravity installation at:`));
        console.log(`  ${detected}\n`);
        return detected;
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

export async function restoreApp(asarPath, { exitOnError = true } = {}) {
    const backupPath = asarPath + '.bak';
    if (!fs.existsSync(backupPath)) {
        console.error(red('✖ No backup found for Antigravity (App) to restore.\n'));
        if (exitOnError) process.exit(1);
        return false;
    }
    const spinner = ora('Restoring original Antigravity app.asar...').start();
    try {
        fs.copyFileSync(backupPath, asarPath);
        fs.unlinkSync(backupPath);
        spinner.succeed('Successfully restored original Antigravity!\n');
        return true;
    } catch (e) {
        spinner.fail('Failed to restore Antigravity.');
        console.error(red(e.message));
        if (exitOnError) process.exit(1);
        return false;
    }
}

export async function patchApp(asarPath, { exitOnError = true } = {}) {
    const backupPath = asarPath + '.bak';
    const extractDir = path.join(path.dirname(asarPath), 'app-extracted-rtl-temp');
    const spinner = ora('Checking permissions and backing up Antigravity App...').start();
    let failLabel = 'Permission Denied.';
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }

        failLabel = 'Failed to extract ASAR.';
        spinner.text = 'Extracting app.asar (this may take a few seconds)...';
        fs.rmSync(extractDir, { recursive: true, force: true });
        asar.extractAll(asarPath, extractDir);

        failLabel = 'Injection failed.';
        spinner.text = 'Injecting RTL features...';
        const utilsPath = path.join(extractDir, 'dist', 'utils.js');
        if (!fs.existsSync(utilsPath)) {
            throw new Error('dist/utils.js not found in ASAR. Unsupported Antigravity version.');
        }

        let utilsCode = fs.readFileSync(utilsPath, 'utf8');

        if (utilsCode.includes('/* ANTIGRAVITY RTL PATCH */')) {
            if (fs.existsSync(backupPath)) {
                spinner.text = 'Updating existing RTL patch to latest version...';
                utilsCode = asar.extractFile(backupPath, 'dist/utils.js').toString('utf8');
            } else {
                spinner.succeed('Antigravity is already patched!');
                fs.rmSync(extractDir, { recursive: true, force: true });
                console.log(green('\n✨ Enjoy your RTL experience!\n'));
                return true;
            }
        }

        const payload = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');
        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor not found. The app version might be unsupported.');
        }
        utilsCode = utilsCode.replace(anchor, payload);
        // Force-enable DevTools in packaged app
        utilsCode = utilsCode.replace(/devTools:\s*!electron_1?\.app\.isPackaged/g, 'devTools: true');
        fs.writeFileSync(utilsPath, utilsCode);

        fs.copyFileSync(path.join(__dirname, 'Vazirmatn-Variable.woff2'), path.join(extractDir, 'dist', 'Vazirmatn-Variable.woff2'));

        failLabel = 'Failed to repack ASAR.';
        spinner.text = 'Repacking app.asar (almost done)...';
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('Successfully patched Antigravity!');
        console.log(green('\n✨ RTL Features have been enabled for Antigravity (Standalone App).'));
        console.log(green('✨ Please restart Antigravity to see the changes.\n'));
        return true;
    } catch (e) {
        spinner.fail(failLabel);
        if (failLabel === 'Permission Denied.') {
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
        } else {
            console.error(red(e.message));
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        if (exitOnError) process.exit(1);
        return false;
    }
}
