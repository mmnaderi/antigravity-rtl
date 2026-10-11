import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exec, execSync } from 'child_process';
import picocolors from 'picocolors';
import { detectAppAsarPath, patchApp, isAppPatched } from './patch-app.js';
import { detectIdeAppPath, patchIde, isIdePatched } from './patch-ide.js';

const { green, red, yellow, cyan, bold, blue } = picocolors;

export function getStateDir() {
    const platform = os.platform();
    if (platform === 'win32') {
        return path.join(process.env.LOCALAPPDATA || os.homedir(), 'AntigravityRtlWatcher');
    } else if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'antigravity-rtl');
    } else {
        return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'antigravity-rtl');
    }
}

export function saveWatcherConfig(cfg) {
    try {
        const stateDir = getStateDir();
        if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
        fs.writeFileSync(path.join(stateDir, 'config.json'), JSON.stringify(cfg, null, 2), 'utf8');
    } catch (_) {}
}

export function loadWatcherConfig() {
    try {
        const cfgPath = path.join(getStateDir(), 'config.json');
        if (fs.existsSync(cfgPath)) {
            return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        }
    } catch (_) {}
    return null;
}

function getPidFile() {
    return path.join(getStateDir(), 'watcher.pid');
}

function isPidRunning(pid) {
    if (!pid || isNaN(pid)) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch (_) {
        return false;
    }
}

export function stopRunningWatcher() {
    const pidFile = getPidFile();
    if (fs.existsSync(pidFile)) {
        try {
            const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
            if (pid && isPidRunning(pid)) {
                try { process.kill(pid, 'SIGTERM'); } catch (_) {}
            }
        } catch (_) {}
        try { fs.unlinkSync(pidFile); } catch (_) {}
    }

    if (os.platform() === 'win32') {
        try {
            execSync('wmic process where "commandline like \'%AntigravityRtlWatcher%\'" call terminate', { stdio: 'ignore' });
        } catch (_) {}
    }
}

function getStableServiceScript() {
    const stateDir = getStateDir();
    const currentEntry = fileURLToPath(new URL('./index.js', import.meta.url));
    const isEphemeral = currentEntry.includes('_npx') || currentEntry.includes('.npm-cache');

    if (!isEphemeral) {
        return currentEntry;
    }

    // Persist a copy so the background service runs from a permanent local directory
    const serviceDir = path.join(stateDir, 'service');
    const binDest = path.join(serviceDir, 'bin');
    if (!fs.existsSync(binDest)) fs.mkdirSync(binDest, { recursive: true });

    const binSrc = path.dirname(currentEntry);
    const files = fs.readdirSync(binSrc);
    for (const f of files) {
        fs.copyFileSync(path.join(binSrc, f), path.join(binDest, f));
    }
    const pkgSrc = path.join(binSrc, '..', 'package.json');
    if (fs.existsSync(pkgSrc)) {
        fs.copyFileSync(pkgSrc, path.join(serviceDir, 'package.json'));
    }
    return path.join(binDest, 'index.js');
}

export async function runWatcher({ watchApp = null, watchIde = null, appAsar = null, ideDir = null } = {}) {
    const stateDir = getStateDir();
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

    // Single-instance check
    const pidFile = getPidFile();
    if (fs.existsSync(pidFile)) {
        const existingPid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
        if (existingPid && isPidRunning(existingPid) && existingPid !== process.pid) {
            console.log(yellow(`ℹ Auto-Update Watcher is already running (PID: ${existingPid}). Exiting.`));
            return false;
        }
    }
    fs.writeFileSync(pidFile, String(process.pid), 'utf8');

    const cleanup = () => {
        try {
            if (fs.existsSync(pidFile) && parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10) === process.pid) {
                fs.unlinkSync(pidFile);
            }
        } catch (_) {}
    };
    process.on('exit', cleanup);
    process.on('SIGINT', () => { cleanup(); process.exit(0); });
    process.on('SIGTERM', () => { cleanup(); process.exit(0); });

    // Load persisted configuration if specific flags were not provided
    const savedConfig = loadWatcherConfig() || {};
    const effectiveWatchApp = watchApp !== null ? watchApp : (savedConfig.watchApp !== undefined ? savedConfig.watchApp : true);
    const effectiveWatchIde = watchIde !== null ? watchIde : (savedConfig.watchIde !== undefined ? savedConfig.watchIde : true);

    const asarPath = effectiveWatchApp ? (appAsar || savedConfig.appPath || detectAppAsarPath()) : null;
    const ideAppDir = effectiveWatchIde ? (ideDir || savedConfig.idePath || detectIdeAppPath()) : null;

    if (!asarPath && !ideAppDir) {
        console.error(red('✖ No configured or detected Antigravity installation to watch.'));
        cleanup();
        process.exit(1);
    }

    console.log(bold(cyan('👀 Antigravity RTL Auto-Update Watcher started...')));
    if (asarPath) console.log(blue(`  Watching Standalone App: ${asarPath}`));
    if (ideAppDir) console.log(blue(`  Watching IDE App: ${ideAppDir}`));
    console.log(yellow('  Press Ctrl+C to stop.\n'));

    let isPatching = false;
    let lastCheck = 0;

    const checkAndPatch = async (source) => {
        const now = Date.now();
        if (now - lastCheck < 5000 || isPatching) return;
        lastCheck = now;
        isPatching = true;

        try {
            if (effectiveWatchApp && asarPath && fs.existsSync(asarPath)) {
                if (!isAppPatched(asarPath)) {
                    console.log(yellow(`\n⚠ Detected unpatched Standalone App (${source}). Re-applying RTL patch...`));
                    const ok = await patchApp(asarPath, { exitOnError: false });
                    if (ok) {
                        console.log(green('✔ Antigravity Standalone App re-patched successfully!'));
                    } else {
                        console.error(red('✖ Failed to re-patch Antigravity Standalone App. Check write permissions.'));
                    }
                }
            }

            if (effectiveWatchIde && ideAppDir && fs.existsSync(ideAppDir)) {
                if (!isIdePatched(ideAppDir)) {
                    console.log(yellow(`\n⚠ Detected unpatched IDE (${source}). Re-applying RTL patch...`));
                    const ok = await patchIde(ideAppDir, { exitOnError: false });
                    if (ok) {
                        console.log(green('✔ Antigravity IDE re-patched successfully!'));
                    } else {
                        console.error(red('✖ Failed to re-patch Antigravity IDE. Check write permissions.'));
                    }
                }
            }
        } catch (e) {
            console.error(red(`✖ Error during check/patch: ${e.message}`));
        } finally {
            isPatching = false;
        }
    };

    // Initial check
    await checkAndPatch('initial startup check');

    // File watcher on Standalone resources directory
    if (effectiveWatchApp && asarPath) {
        const resourcesDir = path.dirname(asarPath);
        try {
            fs.watch(resourcesDir, (eventType, filename) => {
                if (filename && filename.toLowerCase().includes('asar')) {
                    setTimeout(() => checkAndPatch(`file event: ${filename}`), 2500);
                }
            });
        } catch (_) {}
    }

    // Periodic sweep every 30 seconds (also covers IDE file updates)
    setInterval(() => {
        checkAndPatch('periodic sweep');
    }, 30000);

    return true;
}

export function installWatcher({ silent = false, targets = null } = {}) {
    const platform = os.platform();
    if (!silent) console.log(bold(cyan('⚙ Configuring Auto-Update Watcher for system startup...\n')));

    // Stop existing instance before setting up new service
    stopRunningWatcher();

    const stateDir = getStateDir();
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

    if (targets) {
        saveWatcherConfig(targets);
    }

    const nodeBin = process.execPath;
    const serviceScript = getStableServiceScript();

    if (platform === 'win32') {
        const vbsPath = path.join(stateDir, 'run-watcher.vbs');
        const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run """${nodeBin}"" ""${serviceScript}"" --watch", 0, False\n`;
        fs.writeFileSync(vbsPath, vbsContent, 'utf8');

        try {
            const regCmd = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "AntigravityRtlWatcher" /t REG_SZ /d "wscript.exe \\"${vbsPath}\\"" /f`;
            execSync(regCmd, { stdio: 'ignore' });
            exec(`wscript.exe "${vbsPath}"`);
            if (!silent) {
                console.log(green('✔ Auto-Update Watcher enabled for system startup!'));
                console.log(cyan('  Antigravity RTL will now automatically re-patch after application updates.\n'));
            }
            return true;
        } catch (e) {
            if (!silent) console.error(red(`✖ Failed to register startup key: ${e.message}`));
            return false;
        }
    } else if (platform === 'darwin') {
        const agentDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
        if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });

        const plistPath = path.join(agentDir, 'com.mmnaderi.antigravity-rtl.plist');
        const currentPath = process.env.PATH || '/usr/local/bin:/usr/bin:/bin';
        const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mmnaderi.antigravity-rtl</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodeBin}</string>
        <string>${serviceScript}</string>
        <string>--watch</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${currentPath}</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>`;
        fs.writeFileSync(plistPath, plist, 'utf8');
        try {
            execSync(`launchctl load -w "${plistPath}"`, { stdio: 'ignore' });
            if (!silent) console.log(green('✔ macOS LaunchAgent installed and loaded successfully!'));
            return true;
        } catch (e) {
            if (!silent) console.error(red(`✖ Failed to load LaunchAgent: ${e.message}`));
            return false;
        }
    } else {
        const serviceDir = path.join(os.homedir(), '.config', 'systemd', 'user');
        if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

        const servicePath = path.join(serviceDir, 'antigravity-rtl.service');
        const currentPath = process.env.PATH || '/usr/local/bin:/usr/bin:/bin';
        const service = `[Unit]
Description=Antigravity RTL Auto-Update Watcher
After=graphical-session.target

[Service]
ExecStart="${nodeBin}" "${serviceScript}" --watch
Environment="PATH=${currentPath}"
Restart=always
RestartSec=10

[Install]
WantedBy=default.target`;
        fs.writeFileSync(servicePath, service, 'utf8');
        try {
            execSync('systemctl --user daemon-reload && systemctl --user enable --now antigravity-rtl.service', { stdio: 'ignore' });
            if (!silent) console.log(green('✔ systemd user service installed and started successfully!'));
            return true;
        } catch (e) {
            if (!silent) console.error(red(`✖ Failed to enable systemd service: ${e.message}`));
            return false;
        }
    }
}

export function uninstallWatcher({ silent = false } = {}) {
    const platform = os.platform();
    if (!silent) console.log(bold(yellow('⚙ Removing Auto-Update Watcher...\n')));

    // Stop any running watcher process
    stopRunningWatcher();

    if (platform === 'win32') {
        try {
            execSync('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "AntigravityRtlWatcher" /f', { stdio: 'ignore' });
        } catch (_) {}
        if (!silent) console.log(green('✔ Startup registration removed for Windows.'));
    } else if (platform === 'darwin') {
        const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.mmnaderi.antigravity-rtl.plist');
        if (fs.existsSync(plistPath)) {
            try { execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' }); } catch (_) {}
            fs.unlinkSync(plistPath);
        }
        if (!silent) console.log(green('✔ LaunchAgent removed for macOS.'));
    } else {
        const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', 'antigravity-rtl.service');
        if (fs.existsSync(servicePath)) {
            try { execSync('systemctl --user disable --now antigravity-rtl.service', { stdio: 'ignore' }); } catch (_) {}
            fs.unlinkSync(servicePath);
        }
        if (!silent) console.log(green('✔ systemd service removed for Linux.'));
    }
}
