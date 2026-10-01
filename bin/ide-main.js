/**
 * Antigravity RTL Main-Process Injection Hook for Antigravity IDE
 * Prepend-imported at the top of resources/app/out/main.js
 */
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(os.homedir(), '.antigravity-rtl.json');

let cachedFontBase64 = null;
function getFontBase64() {
    if (cachedFontBase64 === null) {
        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        cachedFontBase64 = fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString('base64') : '';
    }
    return cachedFontBase64;
}

app.on('browser-window-created', (_event, win) => {
    // 1. Listen for console messages to save settings
    win.webContents.on('console-message', (_e, ...args) => {
        let msg = '';
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
            msg = args[0].message;
        } else {
            msg = args[1];
        }
        if (typeof msg === 'string' && msg.startsWith('SAVE_RTL_CONFIG|')) {
            try {
                fs.writeFileSync(CONFIG_FILE, msg.substring(16), 'utf8');
            } catch (err) {
                console.error('[Antigravity RTL] Failed to save config:', err);
            }
        }
    });

    // 2. Inject RTL script on dom-ready
    win.webContents.on('dom-ready', async () => {
        try {
            const url = win.webContents.getURL() || '';
            // Only inject in workbench, jetski, and html windows
            if (!url.includes('workbench') && !url.includes('jetski') && !url.endsWith('.html')) {
                return;
            }

            const fontBase64 = getFontBase64();

            // Read user config
            let rtlConfig = {
                faFont: '',
                enFont: '',
                codeFont: '',
                lh: '1.6',
                fs: '16',
                isRTL: true,
                forceRTL: false,
                fixAtSign: true
            };
            if (fs.existsSync(CONFIG_FILE)) {
                try {
                    const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
                    rtlConfig = { ...rtlConfig, ...parsed };
                } catch (e) {}
            }

            // Read client script and inject
            const clientPath = path.join(__dirname, 'antigravity-rtl-client.js');
            if (fs.existsSync(clientPath)) {
                let clientCode = fs.readFileSync(clientPath, 'utf8');
                clientCode = clientCode
                    .replace('__FONT_BASE64__', fontBase64)
                    .replace('__RTL_CONFIG__', JSON.stringify(rtlConfig));
                
                await win.webContents.executeJavaScript(clientCode);
            }
        } catch (err) {
            console.error('[Antigravity RTL] Failed to inject client script:', err);
        }
    });
});
