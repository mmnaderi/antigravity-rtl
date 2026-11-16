import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exec, execFile, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, 'auto-patcher.log');
const PID_FILE = path.join(__dirname, 'auto-patcher.pid');
const TARGET_ASAR = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'Programs',
    'antigravity',
    'resources',
    'app.asar'
);
const RESOURCES_DIR = path.dirname(TARGET_ASAR);
const UPDATER_DIR = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'antigravity-updater'
);

function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function log(msg) {
    const line = `[${getTimestamp()}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, line, 'utf8');
    } catch (_) {}
    console.log(msg);
}

function showNotification(title, message) {
    try {
        const psScript = [
            "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')",
            "$n = New-Object System.Windows.Forms.NotifyIcon",
            "$n.Icon = [System.Drawing.SystemIcons]::Information",
            `$n.BalloonTipTitle = "${title.replace(/"/g, '`"')}"`,
            `$n.BalloonTipText = "${message.replace(/"/g, '`"')}"`,
            "$n.Visible = $true",
            "$n.ShowBalloonTip(4000)",
            "Start-Sleep -Seconds 1",
            "$n.Dispose()"
        ].join('\r\n');

        const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
        exec(`powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand ${encoded}`, () => {});
    } catch (e) {
        log(`Failed to show notification: ${e.message}`);
    }
}

function isAsarPatched(filePath) {
    if (!fs.existsSync(filePath)) return false;
    try {
        const fd = fs.openSync(filePath, 'r');
        const stats = fs.fstatSync(fd);
        const readLen = Math.min(stats.size, 30 * 1024 * 1024);
        const buf = Buffer.alloc(readLen);
        fs.readSync(fd, buf, 0, readLen, 0);
        fs.closeSync(fd);
        return buf.includes(Buffer.from('/* ANTIGRAVITY RTL PATCH */'));
    } catch (e) {
        log(`Error reading app.asar to check patch status: ${e.message}`);
        return false;
    }
}

function isFileLocked(filePath) {
    if (!fs.existsSync(filePath)) return false;
    try {
        const fd = fs.openSync(filePath, 'r+');
        fs.closeSync(fd);
        return false;
    } catch (e) {
        return e.code === 'EBUSY' || e.code === 'EPERM';
    }
}

function executePatcher() {
    return new Promise((resolve) => {
        log('Executing antigravity-rtl patcher on Antigravity app...');
        const scriptPath = fs.existsSync(path.join(__dirname, 'bin', 'index.js'))
            ? path.join(__dirname, 'bin', 'index.js')
            : path.join(__dirname, '..', 'bin', 'index.js');
        const runCwd = fs.existsSync(path.join(__dirname, 'bin', 'index.js'))
            ? __dirname
            : path.join(__dirname, '..');
        execFile(process.execPath, [scriptPath, '--app'], { cwd: runCwd }, (error, stdout, stderr) => {
            if (error) {
                log(`Patcher failed with error: ${error.message}\n${stderr || ''}`);
                showNotification('Antigravity RTL', 'خطا در اعمال خودکار پچ RTL.');
                resolve(false);
            } else {
                log('Patcher completed successfully!');
                showNotification(
                    'Antigravity RTL',
                    'پلاگین RTL با موفقیت فعال شد. برای مشاهده تغییرات، برنامه را Reload یا باز و بسته کنید.'
                );
                resolve(true);
            }
        });
    });
}

// Single instance enforcement
function checkSingleInstance() {
    if (fs.existsSync(PID_FILE)) {
        try {
            const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
            if (!isNaN(oldPid) && oldPid !== process.pid) {
                try {
                    process.kill(oldPid, 0);
                    // On Windows, verify process name actually contains node to avoid PID reuse collisions
                    let isNode = true;
                    if (process.platform === 'win32') {
                        try {
                            const taskInfo = execSync(`tasklist /fi "PID eq ${oldPid}" /fo csv /nh`, { encoding: 'utf8', timeout: 3000 });
                            isNode = taskInfo.toLowerCase().includes('node');
                        } catch (_) {
                            isNode = false;
                        }
                    }
                    if (isNode) {
                        log(`Auto-patcher is already running (PID: ${oldPid}). Exiting duplicate instance.`);
                        process.exit(0);
                    } else {
                        log(`Stale PID ${oldPid} belonged to a non-node process. Overwriting.`);
                    }
                } catch (_) {
                    // Previous process is dead, overwrite
                }
            }
        } catch (_) {}
    }
    fs.writeFileSync(PID_FILE, String(process.pid), 'utf8');

    const cleanUp = () => {
        try {
            if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
        } catch (_) {}
        process.exit(0);
    };

    process.on('SIGINT', cleanUp);
    process.on('SIGTERM', cleanUp);
    process.on('exit', () => {
        try {
            if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
        } catch (_) {}
    });
}

process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.stack || err.message}`);
});

process.on('unhandledRejection', (reason) => {
    log(`Unhandled Rejection: ${reason}`);
});

checkSingleInstance();
log(`Antigravity RTL Auto-Patcher service started (PID: ${process.pid}).`);

function getLocalVersion() {
    try {
        const pkgPath = fs.existsSync(path.join(__dirname, 'package.json'))
            ? path.join(__dirname, 'package.json')
            : path.join(__dirname, '..', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        return pkg.version || '0.0.0';
    } catch (_) {
        return '0.0.0';
    }
}

function isNewerVersion(remote, local) {
    if (!remote || !local) return false;
    const rParts = remote.trim().split('.').map(n => parseInt(n, 10) || 0);
    const lParts = local.trim().split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
        const r = rParts[i] || 0;
        const l = lParts[i] || 0;
        if (r > l) return true;
        if (r < l) return false;
    }
    return false;
}

let isUpdatingSelf = false;

function performSelfUpdate(newVersion) {
    return new Promise((resolve) => {
        log(`Downloading and installing antigravity-rtl v${newVersion}...`);
        exec('npm install antigravity-rtl@latest --no-fund --no-audit', { cwd: __dirname, timeout: 60000 }, (err) => {
            if (err) {
                log(`Failed to update antigravity-rtl package: ${err.message}`);
                return resolve(false);
            }
            try {
                const srcDir = path.join(__dirname, 'node_modules', 'antigravity-rtl');
                if (fs.existsSync(srcDir)) {
                    for (const item of ['bin', 'extension', 'package.json', 'README.md']) {
                        const s = path.join(srcDir, item);
                        const d = path.join(__dirname, item);
                        if (fs.existsSync(s)) {
                            fs.cpSync(s, d, { recursive: true, force: true });
                        }
                    }
                    log(`Self-update to antigravity-rtl v${newVersion} completed successfully!`);
                    showNotification(
                        'Antigravity RTL به‌روزرسانی شد',
                        `پلاگین RTL به آخرین نسخه (v${newVersion}) ارتقا یافت.`
                    );
                    return resolve(true);
                }
            } catch (copyErr) {
                log(`Error copying updated files: ${copyErr.message}`);
            }
            resolve(false);
        });
    });
}

function checkForSelfUpdate() {
    return new Promise((resolve) => {
        if (isUpdatingSelf) return resolve(false);

        const currentVer = getLocalVersion();
        exec('npm view antigravity-rtl version', { timeout: 15000 }, async (err, stdout) => {
            if (err || !stdout) {
                return resolve(false);
            }

            const latestVer = stdout.trim();
            if (isNewerVersion(latestVer, currentVer)) {
                log(`New antigravity-rtl release found: v${latestVer} (current: v${currentVer}). Starting self-update...`);
                isUpdatingSelf = true;
                try {
                    const updated = await performSelfUpdate(latestVer);
                    if (updated) {
                        await checkAndPatch(true);
                    }
                    resolve(updated);
                } finally {
                    isUpdatingSelf = false;
                }
            } else {
                resolve(false);
            }
        });
    });
}

let isPatchingInProgress = false;

async function checkAndPatch(forceRepatch = false) {
    if (isPatchingInProgress) return;

    if (!fs.existsSync(TARGET_ASAR)) {
        log(`Target file not found yet: ${TARGET_ASAR}`);
        return;
    }

    if (!forceRepatch && isAsarPatched(TARGET_ASAR)) {
        // App is already patched and up to date
        return;
    }

    log(forceRepatch ? 'Applying updated RTL patch to app.asar...' : 'Unpatched app.asar detected (Antigravity was updated or reinstalled)!');

    if (isFileLocked(TARGET_ASAR)) {
        log('app.asar is currently locked by updater or another process. Retrying in 3 seconds...');
        setTimeout(checkAndPatch, 3000);
        return;
    }

    isPatchingInProgress = true;
    log('File is unlocked. Applying RTL patch now...');
    try {
        const success = await executePatcher();
        if (success) {
            log('Patch applied successfully to the updated version.');
        } else {
            log('Patch execution failed; will re-evaluate on next check or file event.');
        }
    } catch (err) {
        log(`Unexpected error during patch execution: ${err.message}`);
    } finally {
        isPatchingInProgress = false;
    }
}

// Watch resources directory
let debounceTimer = null;
const handleFileEvent = (eventType, filename) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        log(`Detected filesystem activity in resources directory: ${eventType} ${filename || ''}`);
        checkAndPatch();
        checkForSelfUpdate();
    }, 3000);
};

if (fs.existsSync(RESOURCES_DIR)) {
    try {
        fs.watch(RESOURCES_DIR, handleFileEvent);
        log(`Monitoring directory: ${RESOURCES_DIR}`);
    } catch (e) {
        log(`Failed to attach watcher to ${RESOURCES_DIR}: ${e.message}`);
    }
} else {
    log(`Warning: resources directory does not exist: ${RESOURCES_DIR}`);
}

if (fs.existsSync(UPDATER_DIR)) {
    try {
        fs.watch(UPDATER_DIR, handleFileEvent);
        log(`Monitoring updater directory: ${UPDATER_DIR}`);
    } catch (_) {}
}

// Periodic check for unpatched app.asar every 10 minutes
setInterval(checkAndPatch, 10 * 60 * 1000);

// Periodic check for antigravity-rtl self-updates every 12 hours
setInterval(checkForSelfUpdate, 12 * 60 * 60 * 1000);

// Immediate checks on startup
checkAndPatch();
setTimeout(checkForSelfUpdate, 5000);
