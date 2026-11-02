import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { generateClientScript } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(os.homedir(), '.antigravity-rtl.json');
const FONT_PATH = path.join(__dirname, 'Vazirmatn-Variable.woff2');

let fontBase64 = '';
try {
    if (fs.existsSync(FONT_PATH)) {
        fontBase64 = fs.readFileSync(FONT_PATH).toString('base64');
    }
} catch (_) {}

function getDevToolsPortPath() {
    const platform = os.platform();
    if (platform === 'win32') {
        const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        const p1 = path.join(appData, 'Antigravity', 'DevToolsActivePort');
        if (fs.existsSync(p1)) return p1;
        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
        return path.join(localAppData, 'Antigravity', 'DevToolsActivePort');
    } else if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'Antigravity', 'DevToolsActivePort');
    } else {
        const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
        const p1 = path.join(configDir, 'Antigravity', 'DevToolsActivePort');
        if (fs.existsSync(p1)) return p1;
        return path.join(configDir, 'antigravity', 'DevToolsActivePort');
    }
}

function readDevToolsPort() {
    const portFile = getDevToolsPortPath();
    if (!portFile || !fs.existsSync(portFile)) return null;
    try {
        const lines = fs.readFileSync(portFile, 'utf8').trim().split('\n');
        return lines[0]?.trim() || null;
    } catch (_) {
        return null;
    }
}

function loadConfig() {
    let rtlConfig = {
        faFont: '',
        enFont: '',
        codeFont: '',
        lh: '1.6',
        fs: '16',
        isRTL: true,
        forceRTL: false,
        starred: false,
        snoozeUntil: 0,
        toastStage: 0,
        cachedStars: '129'
    };
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            rtlConfig = { ...rtlConfig, ...parsed };
        }
    } catch (_) {}
    return rtlConfig;
}

function saveConfig(updated) {
    try {
        let current = loadConfig();
        const merged = { ...current, ...updated };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf8');
    } catch (_) {}
}

const activeSockets = new Map();

function connectToPage(page) {
    if (!page.webSocketDebuggerUrl) return;
    if (activeSockets.has(page.id)) return;

    try {
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        activeSockets.set(page.id, ws);

        let msgCounter = 1;

        ws.onopen = () => {
            // Enable Runtime domain to receive console messages & evaluate expressions
            ws.send(JSON.stringify({ id: msgCounter++, method: 'Runtime.enable' }));

            // Check if RTL is already injected into the page
            ws.send(JSON.stringify({
                id: 100,
                method: 'Runtime.evaluate',
                params: {
                    expression: 'Boolean(window.__ANTIGRAVITY_RTL_LOADED__)',
                    returnByValue: true
                }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                // Handle check response
                if (msg.id === 100) {
                    const isLoaded = Boolean(msg.result?.result?.value);
                    if (!isLoaded) {
                        const config = loadConfig();
                        const clientScript = generateClientScript(fontBase64, config);
                        ws.send(JSON.stringify({
                            id: msgCounter++,
                            method: 'Runtime.evaluate',
                            params: {
                                expression: clientScript,
                                returnByValue: false
                            }
                        }));
                    }
                }

                // Handle console messages (e.g. SAVE_RTL_CONFIG|...)
                if (msg.method === 'Runtime.consoleAPICalled') {
                    const args = msg.params?.args || [];
                    for (const arg of args) {
                        const val = arg.value;
                        if (typeof val === 'string' && val.startsWith('SAVE_RTL_CONFIG|')) {
                            try {
                                const parsed = JSON.parse(val.substring(16));
                                saveConfig(parsed);
                            } catch (_) {}
                        }
                    }
                }
            } catch (_) {}
        };

        ws.onclose = () => {
            activeSockets.delete(page.id);
        };

        ws.onerror = () => {
            activeSockets.delete(page.id);
            try { ws.close(); } catch (_) {}
        };
    } catch (_) {
        activeSockets.delete(page.id);
    }
}

function pollAndInject() {
    const port = readDevToolsPort();
    if (!port) return;

    const req = http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
            try {
                const targets = JSON.parse(raw);
                if (!Array.isArray(targets)) return;

                const pages = targets.filter(t => t.type === 'page' && t.webSocketDebuggerUrl);
                for (const page of pages) {
                    const ws = activeSockets.get(page.id);
                    if (!ws || ws.readyState !== WebSocket.OPEN) {
                        connectToPage(page);
                    } else {
                        // Periodic health check to re-inject if window reloaded/refreshed
                        ws.send(JSON.stringify({
                            id: 100,
                            method: 'Runtime.evaluate',
                            params: {
                                expression: 'Boolean(window.__ANTIGRAVITY_RTL_LOADED__)',
                                returnByValue: true
                            }
                        }));
                    }
                }
            } catch (_) {}
        });
    });

    req.on('error', () => {});
    req.setTimeout(2000, () => req.destroy());
}

// Start polling loop
console.log('[antigravity-rtl] Zero-Patch Plugin Engine started.');
setInterval(pollAndInject, 3000);
pollAndInject();
