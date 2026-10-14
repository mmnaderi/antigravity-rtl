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
const LOG_FILE = path.join(os.tmpdir(), 'antigravity-rtl.log');

function log(...args) {
    try {
        const line = `[${new Date().toISOString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) {}
}

let cachedFontBase64 = null;
function getFontBase64() {
    if (cachedFontBase64 === null) {
        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        cachedFontBase64 = fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString('base64') : '';
    }
    return cachedFontBase64;
}

// === Math & Formula LTR Fix ===
try {
    const electronApp = typeof app !== 'undefined' ? app : (typeof require !== 'undefined' ? require('electron').app : null);
    if (electronApp) {
        const mathFixCss = `
    .katex, .katex *, .katex-display, .katex-display *, .katex-html, .katex-html *,
    mjx-container, mjx-container *, math, math *, .math, .math *,
    .math-inline, .math-block, span[class*="katex"], div[class*="katex"] {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    .katex, .math-inline, math {
      text-align: left !important;
    }
    .katex:not(.katex-display *) {
      display: inline-block !important;
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      vertical-align: middle !important;
    }
    .katex-display, .math-block, mjx-container[display="true"] {
      display: block !important;
      text-align: center !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      box-sizing: border-box !important;
      padding: 4px 0 !important;
    }
    .katex-display > .katex {
      display: inline-block !important;
      text-align: initial !important;
      max-width: none !important;
    }
    sub, sup {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    .katex-display::-webkit-scrollbar,
    .katex::-webkit-scrollbar,
    .math-block::-webkit-scrollbar,
    mjx-container::-webkit-scrollbar {
      height: 6px !important;
    }
    .katex-display::-webkit-scrollbar-thumb,
    .katex::-webkit-scrollbar-thumb,
    .math-block::-webkit-scrollbar-thumb,
    mjx-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.25) !important;
      border-radius: 3px !important;
    }
    .katex-display::-webkit-scrollbar-thumb:hover,
    .katex::-webkit-scrollbar-thumb:hover,
    .math-block::-webkit-scrollbar-thumb:hover,
    mjx-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.45) !important;
    }
    .katex-display::-webkit-scrollbar-track,
    .katex::-webkit-scrollbar-track,
    .math-block::-webkit-scrollbar-track,
    mjx-container::-webkit-scrollbar-track {
      background: transparent !important;
    }
  `;
        electronApp.on('web-contents-created', (_event, contents) => {
            const injectMathFix = () => { contents.insertCSS(mathFixCss).catch(() => {}); };
            contents.on('dom-ready', injectMathFix);
            contents.on('did-finish-load', injectMathFix);
            contents.on('did-navigate-in-page', injectMathFix);
        });
    }
} catch (e) {}

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
                const newConfig = JSON.parse(msg.substring(16));
                let merged = newConfig;
                if (fs.existsSync(CONFIG_FILE)) {
                    try {
                        const existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
                        merged = { ...existing, ...newConfig };
                    } catch (_) {}
                }
                fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
                log('Config saved:', JSON.stringify(merged));
            } catch (err) {
                log('Failed to save config:', err.message);
            }
        }
    });

    const injectScript = async (sourceEvent) => {
        try {
            const url = win.webContents.getURL() || '';
            log(`[${sourceEvent}] URL:`, url);

            // Filter for workbench and relevant windows
            if (!url.includes('workbench') && !url.includes('jetski') && !url.endsWith('.html') && url !== '') {
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
                    .replaceAll('__FONT_BASE64__', fontBase64)
                    .replaceAll('__RTL_CONFIG__', JSON.stringify(rtlConfig));

                await win.webContents.executeJavaScript(clientCode);
                log(`[${sourceEvent}] Successfully injected antigravity-rtl-client.js`);
            }
        } catch (err) {
            log(`[${sourceEvent}] Injection error:`, err.message);
        }
    };

    // 2. Inject RTL script on dom-ready
    win.webContents.on('dom-ready', () => injectScript('dom-ready'));
});
