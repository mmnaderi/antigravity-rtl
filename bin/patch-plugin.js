import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { green, red, yellow, blue, bold, cyan } = picocolors;

export function getPluginDir() {
    return path.join(os.homedir(), '.gemini', 'config', 'plugins', 'antigravity-rtl');
}

export function isPluginInstalled() {
    const pluginDir = getPluginDir();
    return fs.existsSync(path.join(pluginDir, 'plugin.json'));
}

export async function installPlugin() {
    const spinner = ora('Installing Antigravity RTL Native Plugin (Zero-Patch)...').start();
    try {
        const targetDir = getPluginDir();
        const sourceDir = path.join(__dirname, '..', 'plugin');

        if (!fs.existsSync(sourceDir)) {
            throw new Error('Plugin source templates not found at: ' + sourceDir);
        }

        // Ensure target directory exists and copy recursively
        fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(sourceDir, targetDir, { recursive: true });

        // Ensure font binary is copied into sidecar directory
        const sidecarDir = path.join(targetDir, 'sidecars', 'rtl');
        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontDest = path.join(sidecarDir, 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontSource) && !fs.existsSync(fontDest)) {
            fs.copyFileSync(fontSource, fontDest);
        }

        spinner.succeed('Antigravity RTL Native Plugin installed successfully!');
        console.log(bold(green('\n✨ Native Zero-Patch Plugin is now active!')));
        console.log(blue(`ℹ Installed to user plugin path:`));
        console.log(`  ${targetDir}`);
        console.log(bold(cyan('\n🔒 Zero-Patch Guarantee:')));
        console.log(cyan('  • Your official Google app.asar was NOT modified.'));
        console.log(cyan('  • RTL support will permanently survive all future Antigravity updates!'));
        console.log(yellow('\nℹ Please restart Antigravity to load RTL.\n'));
        return true;
    } catch (err) {
        spinner.fail('Failed to install Antigravity RTL Native Plugin: ' + err.message);
        return false;
    }
}

export async function uninstallPlugin() {
    const targetDir = getPluginDir();
    if (!fs.existsSync(targetDir)) {
        console.log(yellow('ℹ No Antigravity RTL plugin installation found.\n'));
        return false;
    }

    const spinner = ora('Removing Antigravity RTL Native Plugin...').start();
    try {
        fs.rmSync(targetDir, { recursive: true, force: true });
        spinner.succeed('Antigravity RTL Native Plugin uninstalled successfully.\n');
        return true;
    } catch (err) {
        spinner.fail('Failed to remove plugin: ' + err.message);
        return false;
    }
}
