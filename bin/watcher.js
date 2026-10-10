import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, execSync } from 'child_process';
import picocolors from 'picocolors';
import * as asar from '@electron/asar';
import { detectAppAsarPath, patchApp } from './patch-app.js';
import { detectIdeAppPath, patchIde } from './patch-ide.js';

const { green, red, yellow, cyan, bold, blue } = picocolors;

const PATCH_START = '/* ANTIGRAVITY RTL PATCH */';

export function isAppPatched(asarPath) {
    if (!asarPath || !fs.existsSync(asarPath)) return false;
    try {
        asar.uncache(asarPath);
        const utils = asar.extractFile(asarPath, 'dist/utils.js').toString('utf8');
        return utils.includes(PATCH_START);
    } catch {
        return false;
    }
}

export function isIdePatched(ideAppDir) {
    if (!ideAppDir) return false;
    const mainJs = path.join(ideAppDir, 'main.js');
    if (!fs.existsSync(mainJs)) return false;
    try {
        const content = fs.readFileSync(mainJs, 'utf8');
        return content.includes("import './antigravity-rtl-main.js';");
    } catch {
        return false;
    }
}

export async function runWatcher({ appAsar, ideDir } = {}) {
    const asarPath = appAsar || detectAppAsarPath();
    const ideAppDir = ideDir || detectIdeAppPath();

    if (!asarPath && !ideAppDir) {
        console.error(red('✖ No Antigravity or Antigravity IDE installation found to watch.'));
        process.exit(1);
    }

    console.log(bold(cyan('👀 Antigravity RTL Auto-Update Watcher started...')));
    if (asarPath) console.log(blue(`  Watching Standalone App: ${asarPath}`));
    if (ideAppDir) console.log(blue(`  Watching IDE App: ${ideAppDir}`));
    console.log(yellow('  Press Ctrl+C to stop.\n'));

    let lastCheck = 0;
    const checkAndPatch = async (source) => {
        const now = Date.now();
        if (now - lastCheck < 5000) return;
        lastCheck = now;

        if (asarPath && fs.existsSync(asarPath)) {
            if (!isAppPatched(asarPath)) {
                console.log(yellow(`\n⚠ Detected unpatched Standalone App (${source}). Re-applying RTL patch...`));
                try {
                    await patchApp(asarPath, { exitOnError: false });
                    console.log(green('✔ Antigravity Standalone App re-patched successfully!'));
                } catch (e) {
                    console.error(red(`✖ Failed to re-patch Standalone App: ${e.message}`));
                }
            }
        }

        if (ideAppDir && fs.existsSync(ideAppDir)) {
            if (!isIdePatched(ideAppDir)) {
                console.log(yellow(`\n⚠ Detected unpatched IDE (${source}). Re-applying RTL patch...`));
                try {
                    await patchIde(ideAppDir, { exitOnError: false });
                    console.log(green('✔ Antigravity IDE re-patched successfully!'));
                } catch (e) {
                    console.error(red(`✖ Failed to re-patch IDE: ${e.message}`));
                }
            }
        }
    };

    // Initial check
    await checkAndPatch('initial startup check');

    // File watcher on directory
    if (asarPath) {
        const resourcesDir = path.dirname(asarPath);
        try {
            fs.watch(resourcesDir, (eventType, filename) => {
                if (filename && filename.toLowerCase().includes('asar')) {
                    setTimeout(() => checkAndPatch(`file event: ${filename}`), 2500);
                }
            });
        } catch (_) {}
    }

    // Periodic check every 30 seconds
    setInterval(() => {
        checkAndPatch('periodic sweep');
    }, 30000);
}

export function installWatcher({ silent = false } = {}) {
    const platform = os.platform();
    if (!silent) console.log(bold(cyan('⚙ Configuring Auto-Update Watcher for system startup...\n')));

    if (platform === 'win32') {
        const stateDir = path.join(process.env.LOCALAPPDATA || os.homedir(), 'AntigravityRtlWatcher');
        if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

        const vbsPath = path.join(stateDir, 'run-watcher.vbs');
        const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run "cmd /c npx antigravity-rtl --watch", 0, False\n`;
        fs.writeFileSync(vbsPath, vbsContent, 'utf8');

        try {
            const regCmd = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "AntigravityRtlWatcher" /t REG_SZ /d "wscript.exe \\"${vbsPath}\\"" /f`;
            execSync(regCmd, { stdio: 'ignore' });
            exec(`wscript.exe "${vbsPath}"`);
            if (!silent) {
                console.log(green('✔ Auto-Update Watcher enabled for system startup!'));
                console.log(cyan('  Antigravity RTL will now automatically re-patch after application updates.\n'));
            }
        } catch (e) {
            if (!silent) console.error(red(`✖ Failed to register startup key: ${e.message}`));
        }
    } else if (platform === 'darwin') {
        const agentDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
        if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });

        const plistPath = path.join(agentDir, 'com.mmnaderi.antigravity-rtl.plist');
        const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mmnaderi.antigravity-rtl</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/sh</string>
        <string>-c</string>
        <string>npx antigravity-rtl --watch</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>`;
        fs.writeFileSync(plistPath, plist, 'utf8');
        try {
            execSync(`launchctl load -w "${plistPath}"`, { stdio: 'ignore' });
            console.log(green('✔ macOS LaunchAgent installed and loaded successfully!'));
        } catch (e) {
            console.error(red(`✖ Failed to load LaunchAgent: ${e.message}`));
        }
    } else {
        const serviceDir = path.join(os.homedir(), '.config', 'systemd', 'user');
        if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

        const servicePath = path.join(serviceDir, 'antigravity-rtl.service');
        const service = `[Unit]
Description=Antigravity RTL Auto-Update Watcher
After=graphical-session.target

[Service]
ExecStart=/bin/sh -c 'npx antigravity-rtl --watch'
Restart=always
RestartSec=10

[Install]
WantedBy=default.target`;
        fs.writeFileSync(servicePath, service, 'utf8');
        try {
            execSync('systemctl --user daemon-reload && systemctl --user enable --now antigravity-rtl.service', { stdio: 'ignore' });
            console.log(green('✔ systemd user service installed and started successfully!'));
        } catch (e) {
            console.error(red(`✖ Failed to enable systemd service: ${e.message}`));
        }
    }
}

export function uninstallWatcher() {
    const platform = os.platform();
    console.log(bold(yellow('⚙ Removing Auto-Update Watcher...\n')));

    if (platform === 'win32') {
        try {
            execSync('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "AntigravityRtlWatcher" /f', { stdio: 'ignore' });
        } catch (_) {}
        console.log(green('✔ Startup registration removed for Windows.'));
    } else if (platform === 'darwin') {
        const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.mmnaderi.antigravity-rtl.plist');
        if (fs.existsSync(plistPath)) {
            try { execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' }); } catch (_) {}
            fs.unlinkSync(plistPath);
        }
        console.log(green('✔ LaunchAgent removed for macOS.'));
    } else {
        const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', 'antigravity-rtl.service');
        if (fs.existsSync(servicePath)) {
            try { execSync('systemctl --user disable --now antigravity-rtl.service', { stdio: 'ignore' }); } catch (_) {}
            fs.unlinkSync(servicePath);
        }
        console.log(green('✔ systemd service removed for Linux.'));
    }
}
