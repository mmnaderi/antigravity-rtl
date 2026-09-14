/* ANTIGRAVITY RTL PATCH */
win.webContents.on('console-message', (event, ...args) => {
    let message = '';
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        message = args[0].message;
    } else {
        message = args[1];
    }
    if (typeof message === 'string' && message.startsWith('SAVE_RTL_CONFIG|')) {
        try {
            const data = message.substring(16);
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            require('fs').writeFileSync(configPath, data);
        } catch (e) {}
    }
});
void win.loadURL(url);

win.webContents.on('dom-ready', () => {
    // Strict Guard: only inject when page has loaded a valid local server URL
    const currentURL = win.webContents.getURL();
    if (!currentURL || !/^https?:\/\/127\.0\.0\.1:\d+/i.test(currentURL)) {
        return;
    }
    try {
        const fontPath = require('path').join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontBase64 = require('fs').readFileSync(fontPath).toString('base64');
        
        let rtlConfig = {
            faFont: '',
            enFont: '',
            codeFont: '',
            lh: '1.6',
            fs: '16',
            isRTL: true,
            forceRTL: false,
            fixAtSign: true,
            placement: 'sidebar',
            floatingBottom: 24,
            sidebarWidth: 256,
            compactSidebar: true,
            userMsgEnabled: true,
            userMsgDark: {
                bg: '#1e2433',
                text: '#f1f5f9',
                border: '#384c6e',
                borderWidth: '1.5',
                shadow: 'soft'
            },
            userMsgLight: {
                bg: '#f0f4ff',
                text: '#0f172a',
                border: '#cbd5e1',
                borderWidth: '1.5',
                shadow: 'soft'
            },
            inputBoxEnabled: false,
            inputBoxDark: {
                border: '#384c6e',
                borderWidth: '1.5'
            },
            inputBoxLight: {
                border: '#cbd5e1',
                borderWidth: '1.5'
            }
        };
        try {
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            if (require('fs').existsSync(configPath)) {
                const cfg = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
                if (cfg.userMsgBg && !cfg.userMsgDark) {
                    cfg.userMsgDark = {
                        bg: cfg.userMsgBg,
                        text: cfg.userMsgText || '#f1f5f9',
                        border: cfg.userMsgBorder || '#384c6e',
                        borderWidth: cfg.userMsgBorderWidth || '1.5',
                        shadow: cfg.userMsgShadow || 'soft'
                    };
                }
                rtlConfig = { 
                    ...rtlConfig, 
                    ...cfg,
                    userMsgDark: { ...rtlConfig.userMsgDark, ...(cfg.userMsgDark || {}) },
                    userMsgLight: { ...rtlConfig.userMsgLight, ...(cfg.userMsgLight || {}) },
                    inputBoxDark: { ...rtlConfig.inputBoxDark, ...(cfg.inputBoxDark || {}) },
                    inputBoxLight: { ...rtlConfig.inputBoxLight, ...(cfg.inputBoxLight || {}) }
                };
            }
        } catch (e) {}

        win.webContents.executeJavaScript(`(() => {
            if (window.__ANTIGRAVITY_RTL_LOADED__) {
                return;
            }
            window.__ANTIGRAVITY_RTL_LOADED__ = true;

            const fontBase64 = '${fontBase64}';
            const rtlConfig = ${JSON.stringify(rtlConfig)};
            
            let isRTL = rtlConfig.isRTL !== false;
            let forceRTL = rtlConfig.forceRTL || false;
            let fixAtSign = rtlConfig.fixAtSign !== false;
            let placement = rtlConfig.placement || 'sidebar';
            let floatingBottom = parseInt(rtlConfig.floatingBottom) || 24;
            let sidebarWidth = parseInt(rtlConfig.sidebarWidth) || 256;
            let compactSidebar = rtlConfig.compactSidebar !== false;
            let userMsgEnabled = rtlConfig.userMsgEnabled !== false;

            let userMsgDark = {
                bg: '#1e2433',
                text: '#f1f5f9',
                border: '#384c6e',
                borderWidth: '1.5',
                shadow: 'soft',
                ...(rtlConfig.userMsgDark || {})
            };

            let userMsgLight = {
                bg: '#f0f4ff',
                text: '#0f172a',
                border: '#cbd5e1',
                borderWidth: '1.5',
                shadow: 'soft',
                ...(rtlConfig.userMsgLight || {})
            };

            let inputBoxEnabled = rtlConfig.inputBoxEnabled || false;
            let inputBoxDark = {
                border: '#384c6e',
                borderWidth: '1.5',
                ...(rtlConfig.inputBoxDark || {})
            };
            let inputBoxLight = {
                border: '#cbd5e1',
                borderWidth: '1.5',
                ...(rtlConfig.inputBoxLight || {})
            };

            function isAppDark() {
                try {
                    const b = document.body;
                    const d = document.documentElement;
                    if (b && b.classList) {
                        if (b.classList.contains('dark') || b.classList.contains('theme-dark') || b.classList.contains('dark-theme') || b.classList.contains('vscode-dark')) return true;
                    }
                    if (d && d.classList) {
                        if (d.classList.contains('dark') || d.classList.contains('theme-dark') || d.classList.contains('dark-theme') || d.classList.contains('vscode-dark')) return true;
                    }
                } catch (_) {}
                return false;
            }

            let activeTab = isAppDark() ? 'dark' : 'light';
            let activeMainTab = 'rtl';

            function getShadowCSS(type, borderCol, mode) {
                if (type === 'none') return 'none';
                if (mode === 'light') {
                    switch (type) {
                        case 'soft': 
                            return '0 4px 14px -1px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)';
                        case '3d': 
                        case 'medium':
                            return '0 5px 0 0 rgba(0, 0, 0, 0.18), 0 12px 24px -2px rgba(15, 23, 42, 0.22)';
                        case 'glow': 
                            return \`0 0 0 1.5px \${borderCol}, 0 6px 22px 3px \${borderCol}66, 0 2px 6px \${borderCol}40\`;
                        default: return 'none';
                    }
                } else {
                    switch (type) {
                        case 'soft': 
                            return '0 6px 18px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)';
                        case '3d': 
                        case 'medium':
                            return '0 5px 0 0 rgba(0, 0, 0, 0.8), 0 14px 28px -3px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                        case 'glow': 
                            return \`0 0 0 1.5px \${borderCol}, 0 0 25px 4px \${borderCol}88, 0 0 50px 10px \${borderCol}44\`;
                        default: return 'none';
                    }
                }
            }

            // =========================================================================
            // 🛡️ True App-Ready & Anti-White-Screen Guard
            // Ensures Antigravity has genuinely mounted its React UI before touching DOM
            // =========================================================================
            function isAntigravityReady() {
                try {
                    if (!document || !document.body) return false;
                    
                    // 1. Antigravity root container must exist and contain rendered React elements
                    const root = document.getElementById('root');
                    if (!root || !root.children || root.children.length === 0) return false;

                    // 2. Must contain at least one primary Antigravity UI shell element
                    const hasSidebar = !!document.querySelector('[role="navigation"][aria-label="Sidebar"]') || 
                                       !!document.querySelector('[role="navigation"]');
                    const hasMain = !!document.querySelector('[role="main"]') || 
                                    !!document.querySelector('main') || 
                                    !!document.querySelector('[contenteditable="true"]');
                    const hasResizer = !!document.querySelector('.cursor-col-resize');

                    return Boolean(hasSidebar || hasMain || hasResizer);
                } catch (_) {
                    return false;
                }
            }

            function mountExtension() {
                if (document.querySelector('.rtl-widget-container')) return;

            // 1. Permanent Widget Styles (Vibe UI Spec & WCAG AAA Contrast)
            if (!document.getElementById('rtl-widget-style')) {
                let widgetStyle = document.createElement('style');
                widgetStyle.id = 'rtl-widget-style';
                widgetStyle.innerHTML = \`
                    /* Light Mode Tokens */
                    :root, body, body.light, body.theme-light, body.vscode-light {
                        --rtl-bg: #ffffff;
                        --rtl-surface: #f1f5f9;
                        --rtl-surface-hover: #e2e8f0;
                        --rtl-card-bg: #f8fafc;
                        --rtl-card-border: #e2e8f0;
                        --rtl-text: #0f172a;
                        --rtl-text-secondary: #334155;
                        --rtl-text-muted: #64748b;
                        --rtl-border: #e2e8f0;
                        --rtl-border-subtle: #f1f5f9;
                        --rtl-input-bg: #ffffff;
                        --rtl-input-border: #cbd5e1;
                        --rtl-accent: #4f46e5;
                        --rtl-accent-hover: #4338ca;
                        --rtl-shadow-panel: 0 16px 36px -6px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.08);
                    }

                    /* Dark Mode Tokens */
                    body.dark, body.theme-dark, body.dark-theme, body.vscode-dark,
                    :root.dark, .dark, .rtl-widget-panel.rtl-is-dark {
                        --rtl-bg: #141824;
                        --rtl-surface: #1e2638;
                        --rtl-surface-hover: #273147;
                        --rtl-card-bg: #181f30;
                        --rtl-card-border: #2b364d;
                        --rtl-text: #f8fafc;
                        --rtl-text-secondary: #cbd5e1;
                        --rtl-text-muted: #94a3b8;
                        --rtl-border: #2a3449;
                        --rtl-border-subtle: #1e2638;
                        --rtl-input-bg: #111520;
                        --rtl-input-border: #374461;
                        --rtl-accent: #6366f1;
                        --rtl-accent-hover: #4f46e5;
                        --rtl-shadow-panel: 0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
                    }

                    .rtl-widget-panel {
                        height: 520px !important;
                        max-height: 85vh !important;
                        transform: scale(0.94) translateY(8px);
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease, visibility 0.22s;
                        transform-origin: bottom right;
                    }
                    .rtl-widget-panel.rtl-panel-open {
                        transform: scale(1) translateY(0) !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                    }

                    /* Sidebar Resizing Cursor & Selection Lock */
                    body.rtl-sidebar-resizing,
                    body.rtl-sidebar-resizing * {
                        cursor: col-resize !important;
                        user-select: none !important;
                    }

                    /* Toggle OFF state — explicit color instead of Tailwind utility */
                    .rtl-toggle-off {
                        background-color: rgba(148, 163, 184, 0.35) !important;
                    }
                    .rtl-widget-panel.rtl-is-dark .rtl-toggle-off {
                        background-color: rgba(100, 116, 139, 0.45) !important;
                    }

                    /* Rich Tab View Slide & Fade Transitions */
                    .rtl-tab-view {
                        display: none;
                        opacity: 0;
                        transform: translateY(8px) scale(0.99);
                        transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
                        width: 100%;
                    }
                    .rtl-tab-view.rtl-tab-active {
                        display: flex !important;
                        opacity: 1 !important;
                        transform: translateY(0) scale(1) !important;
                    }
                    .rtl-tab-view.rtl-tab-leaving {
                        display: flex !important;
                        opacity: 0 !important;
                        transform: translateY(-8px) scale(0.99) !important;
                        pointer-events: none !important;
                    }
                    .rtl-tab-view.rtl-tab-entering {
                        display: flex !important;
                        opacity: 0 !important;
                        transform: translateY(10px) scale(0.99) !important;
                        pointer-events: none !important;
                    }

                    .rtl-theme-panel {
                        background-color: var(--rtl-bg) !important;
                        color: var(--rtl-text) !important;
                        border: 1px solid var(--rtl-border) !important;
                        box-shadow: var(--rtl-shadow-panel) !important;
                        backdrop-filter: blur(16px) !important;
                    }

                    .rtl-card {
                        background-color: var(--rtl-card-bg) !important;
                        border: 1px solid var(--rtl-card-border) !important;
                        border-radius: 12px !important;
                    }

                    .rtl-label {
                        font-size: 11px !important;
                        font-weight: 500 !important;
                        color: var(--rtl-text-secondary) !important;
                        line-height: 1.2 !important;
                        user-select: none !important;
                    }

                    /* Reset Icon Button (Vibe UI Spec) */
                    .rtl-reset-icon-btn {
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 24px !important;
                        height: 24px !important;
                        border-radius: 6px !important;
                        color: var(--rtl-text-secondary) !important;
                        background: transparent !important;
                        border: 1px solid transparent !important;
                        cursor: pointer !important;
                        transition: all 0.15s ease !important;
                        opacity: 0.75 !important;
                    }
                    .rtl-reset-icon-btn:hover {
                        opacity: 1 !important;
                        background-color: var(--rtl-surface) !important;
                        border-color: var(--rtl-border) !important;
                        color: var(--rtl-text) !important;
                    }

                    /* Custom Slim Scrollbar for Settings Panel (Vibe UI Spec) */
                    .rtl-panel-body {
                        scrollbar-width: thin !important;
                        scrollbar-color: rgba(140, 150, 170, 0.35) transparent !important;
                    }
                    .rtl-panel-body::-webkit-scrollbar {
                        width: 3px !important;
                        height: 3px !important;
                    }
                    .rtl-panel-body::-webkit-scrollbar-track {
                        background: transparent !important;
                    }
                    .rtl-panel-body::-webkit-scrollbar-thumb {
                        background: rgba(140, 150, 170, 0.35) !important;
                        border-radius: 9999px !important;
                    }
                    .rtl-panel-body::-webkit-scrollbar-thumb:hover {
                        background: rgba(140, 150, 170, 0.65) !important;
                    }
                    .rtl-panel-body::-webkit-scrollbar-button {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                    }

                    /* Pinned Bottom Footer (Fixed across tab switches) */
                    .rtl-panel-footer-pinned {
                        flex-shrink: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        padding: 7px 12px !important;
                        border-top: 1px solid var(--rtl-border) !important;
                        background-color: var(--rtl-surface) !important;
                        box-sizing: border-box !important;
                        width: 100% !important;
                    }

                    /* Main Navigation Tabs (RTL & Text vs UI & Styling) */
                    .rtl-main-nav {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 4px !important;
                        padding: 3px !important;
                        background-color: var(--rtl-surface) !important;
                        border: 1px solid var(--rtl-border) !important;
                        border-radius: 9px !important;
                        margin-bottom: 2px !important;
                        box-sizing: border-box !important;
                        width: 100% !important;
                    }
                    .rtl-main-nav-btn {
                        flex: 1 1 0 !important;
                        min-width: 0 !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        padding: 6px 8px !important;
                        border: none !important;
                        outline: none !important;
                        border-radius: 7px !important;
                        background: transparent !important;
                        color: var(--rtl-text-secondary) !important;
                        font-size: 11.5px !important;
                        font-weight: 500 !important;
                        cursor: pointer !important;
                        transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        user-select: none !important;
                        line-height: 1 !important;
                        white-space: nowrap !important;
                    }
                    .rtl-main-nav-btn:hover:not(.active) {
                        background-color: var(--rtl-surface-hover) !important;
                        color: var(--rtl-text) !important;
                    }
                    .rtl-main-nav-btn.active {
                        background-color: var(--rtl-accent) !important;
                        color: #ffffff !important;
                        font-weight: 600 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
                    }

                    /* Tab Switcher (Dark / Light) */
                    .rtl-tab-group {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 4px !important;
                        padding: 3px !important;
                        background-color: var(--rtl-surface) !important;
                        border: 1px solid var(--rtl-border) !important;
                        border-radius: 8px !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .rtl-tab-btn {
                        flex: 1 1 0 !important;
                        min-width: 0 !important;
                        padding: 5px 8px !important;
                        font-size: 11px !important;
                        font-weight: 500 !important;
                        text-align: center !important;
                        border: none !important;
                        outline: none !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        background: transparent !important;
                        color: var(--rtl-text-secondary) !important;
                        transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        white-space: nowrap !important;
                        user-select: none !important;
                    }
                    .rtl-tab-btn:hover:not(.active) {
                        background-color: var(--rtl-surface-hover) !important;
                        color: var(--rtl-text) !important;
                    }
                    .rtl-tab-btn.active {
                        background-color: var(--rtl-accent) !important;
                        color: #ffffff !important;
                        font-weight: 600 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
                    }

                    /* Shadow Segmented Buttons */
                    .rtl-shadow-group {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 4px !important;
                        padding: 3px !important;
                        background-color: var(--rtl-surface) !important;
                        border: 1px solid var(--rtl-border) !important;
                        border-radius: 8px !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .rtl-shadow-btn {
                        flex: 1 1 0 !important;
                        min-width: 0 !important;
                        padding: 5px 2px !important;
                        font-size: 10.5px !important;
                        font-weight: 500 !important;
                        text-align: center !important;
                        border: none !important;
                        outline: none !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        background: transparent !important;
                        color: var(--rtl-text-secondary) !important;
                        transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        white-space: nowrap !important;
                        line-height: 1 !important;
                        user-select: none !important;
                    }
                    .rtl-shadow-btn:hover:not(.active) {
                        background-color: var(--rtl-surface-hover) !important;
                        color: var(--rtl-text) !important;
                    }
                    .rtl-shadow-btn.active {
                        background-color: var(--rtl-accent) !important;
                        color: #ffffff !important;
                        font-weight: 600 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
                    }

                    /* Controls Styling */
                    .rtl-color-input {
                        -webkit-appearance: none !important;
                        appearance: none !important;
                        width: 22px !important;
                        height: 22px !important;
                        padding: 0 !important;
                        border: 1px solid var(--rtl-border) !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        background: transparent !important;
                        overflow: hidden !important;
                        flex-shrink: 0 !important;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
                    }
                    .rtl-color-input::-webkit-color-swatch-wrapper {
                        padding: 0 !important;
                    }
                    .rtl-color-input::-webkit-color-swatch {
                        border: none !important;
                        border-radius: 5px !important;
                    }
                    .rtl-hex-input {
                        width: 68px !important;
                        height: 22px !important;
                        padding: 0 6px !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                        font-size: 11px !important;
                        text-transform: uppercase !important;
                        text-align: center !important;
                        color: var(--rtl-text) !important;
                        background-color: var(--rtl-input-bg) !important;
                        border: 1px solid var(--rtl-input-border) !important;
                        border-radius: 6px !important;
                        box-sizing: border-box !important;
                        outline: none !important;
                        transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
                    }
                    .rtl-hex-input:focus {
                        border-color: var(--rtl-accent) !important;
                        box-shadow: 0 0 0 1px var(--rtl-accent) !important;
                    }
                    .rtl-range-slider {
                        -webkit-appearance: none !important;
                        appearance: none !important;
                        width: 80px !important;
                        height: 4px !important;
                        background: var(--rtl-surface-hover) !important;
                        border-radius: 2px !important;
                        outline: none !important;
                        cursor: pointer !important;
                    }
                    .rtl-range-slider::-webkit-slider-thumb {
                        -webkit-appearance: none !important;
                        appearance: none !important;
                        width: 14px !important;
                        height: 14px !important;
                        border-radius: 50% !important;
                        background: var(--rtl-accent) !important;
                        border: 2px solid var(--rtl-bg) !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
                        cursor: pointer !important;
                        transition: transform 0.1s ease !important;
                    }
                    .rtl-range-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.15) !important;
                    }
                    .rtl-badge-val {
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                        font-size: 10.5px !important;
                        color: var(--rtl-text-muted) !important;
                        width: 34px !important;
                        text-align: right !important;
                        user-select: none !important;
                    }

                    .rtl-btn-ghost {
                        font-size: 11px !important;
                        font-weight: 500 !important;
                        color: var(--rtl-text-secondary) !important;
                        background: transparent !important;
                        border: 1px solid var(--rtl-border) !important;
                        border-radius: 6px !important;
                        padding: 5px 8px !important;
                        cursor: pointer !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        transition: all 0.15s ease !important;
                        user-select: none !important;
                    }
                    .rtl-btn-ghost:hover {
                        background: var(--rtl-surface) !important;
                        color: var(--rtl-text) !important;
                        border-color: var(--rtl-border-subtle) !important;
                    }

                    .rtl-theme-input {
                        background-color: var(--rtl-input-bg) !important;
                        color: var(--rtl-text) !important;
                        border: 1px solid var(--rtl-input-border) !important;
                    }
                    .w-11 { width: 44px !important; }
                    .h-6 { height: 24px !important; }
                    .w-4 { width: 16px !important; }
                    .h-4 { height: 16px !important; }
                    .bg-accent { background-color: var(--rtl-accent) !important; }
                    
                    .rtl-toggle-btn-reset {
                        padding: 0 !important;
                        border: none !important;
                        box-sizing: border-box !important;
                        min-width: 36px !important;
                        outline: none !important;
                        display: inline-flex !important;
                        align-items: center !important;
                    }
                    
                    .rtl-github-link {
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        font-size: 11px !important;
                        font-weight: 500 !important;
                        color: var(--rtl-text-secondary) !important;
                        text-decoration: none !important;
                        transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        user-select: none !important;
                        line-height: 1 !important;
                        opacity: 0.75 !important;
                    }
                    .rtl-github-link:hover {
                        color: #eab308 !important;
                        opacity: 1 !important;
                    }
                \`;
                document.head.appendChild(widgetStyle);
            }

            const savedFaFont = rtlConfig.faFont || '';
            const savedEnFont = rtlConfig.enFont || '';
            const savedCodeFont = rtlConfig.codeFont || '';
            const savedLH = rtlConfig.lh || '1.6';
            const savedFS = rtlConfig.fs || '16';
            
            // 2. Dynamic Style Tags (Separate RTL and UI styles for complete independence)
            let rtlStyle = document.getElementById('antigravity-rtl-style');
            if (!rtlStyle) {
                rtlStyle = document.createElement('style');
                rtlStyle.id = 'antigravity-rtl-style';
                document.head.appendChild(rtlStyle);
            }

            let uiStyle = document.getElementById('antigravity-ui-style');
            if (!uiStyle) {
                uiStyle = document.createElement('style');
                uiStyle.id = 'antigravity-ui-style';
                document.head.appendChild(uiStyle);
            }
            
            const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs, sWidth) => {
                let faFontRule = '';
                let faFontName = "'PersianOnlyFont'";
                
                if (faFont) {
                    faFontName = "'UserPersianFont', 'PersianOnlyFont'";
                    let baseFaFont = faFont.replace(/[-\\s]?Regular$/i, '');
                    faFontRule = \`
                        @font-face {
                            font-family: 'UserPersianFont';
                            src: local('\${faFont}'), local('\${baseFaFont}');
                            font-weight: 400;
                            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                        }
                        @font-face {
                            font-family: 'UserPersianFont';
                            src: local('\${baseFaFont} Bold'), local('\${baseFaFont}-Bold'), local('\${baseFaFont}Bold');
                            font-weight: 700;
                            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                        }
                    \`;
                }
                
                let enFontStr = enFont ? \`'\${enFont}', ui-sans-serif, system-ui, sans-serif\` : 'ui-sans-serif, system-ui, sans-serif';
                let codeFontStr = codeFont ? \`'\${codeFont}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace\` : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
                
                let forceRtlStyle = forceRTL ? \`
                    .prose > *:not(pre):not(code), 
                    [data-testid="chat-message"] > *:not(pre):not(code), 
                    .markdown-body > *:not(pre):not(code), 
                    .leading-relaxed > *:not(pre):not(code),
                    [data-testid="user-input-step"],
                    [data-testid="user-input-step"] > *:not(pre):not(code),
                    div:has(> [role="radiogroup"]),
                    label[for^="ask-opt-"] {
                        direction: rtl !important;
                        text-align: right !important;
                        unicode-bidi: isolate !important;
                    }
                \` : '';

                let msgBoxCSS = userMsgEnabled ? \`
                    /* Light Mode User Message */
                    :root, body, body.light, body.theme-light {
                        --user-msg-bg: \${userMsgLight.bg};
                        --user-msg-text: \${userMsgLight.text};
                        --user-msg-border-color: \${userMsgLight.border};
                        --user-msg-border-width: \${userMsgLight.borderWidth}px;
                        --user-msg-shadow: \${getShadowCSS(userMsgLight.shadow, userMsgLight.border, 'light')};
                    }

                    /* Dark Mode User Message */
                    body.dark, body.theme-dark, body.dark-theme, body.vscode-dark, :root.dark, .dark {
                        --user-msg-bg: \${userMsgDark.bg};
                        --user-msg-text: \${userMsgDark.text};
                        --user-msg-border-color: \${userMsgDark.border};
                        --user-msg-border-width: \${userMsgDark.borderWidth}px;
                        --user-msg-shadow: \${getShadowCSS(userMsgDark.shadow, userMsgDark.border, 'dark')};
                    }

                    /* Layout, Stacking & Spacing Isolation (Anti-Overlap & Anti-Halo) */
                    [data-testid="user-input-step"] {
                        position: relative !important;
                        z-index: 10 !important;
                        padding-bottom: 8px !important;
                        margin-bottom: 4px !important;
                    }
                    div.sticky:has([data-testid="user-input-step"]) {
                        overflow: visible !important;
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] {
                        background: transparent !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0.75rem !important;
                        transition: all 0.2s ease !important;
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] > div {
                        background-color: var(--user-msg-bg) !important;
                        border: var(--user-msg-border-width) solid var(--user-msg-border-color) !important;
                        box-shadow: var(--user-msg-shadow) !important;
                        color: var(--user-msg-text) !important;
                        border-radius: 0.75rem !important;
                        position: relative !important;
                        z-index: 2 !important;
                        transition: all 0.2s ease !important;
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"]:hover > div {
                        filter: brightness(1.04);
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] .whitespace-pre-wrap,
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] p,
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] span:not(.text-muted-foreground) {
                        color: var(--user-msg-text) !important;
                    }

                    /* Harmonized Floating Action Toolbar (Edit / Copy) */
                    [data-testid="user-input-step"] .user-input-buttons-container {
                        background-color: var(--user-msg-bg) !important;
                        border: 1px solid var(--user-msg-border-color) !important;
                        box-shadow: 0 0 16px 6px var(--user-msg-bg) !important;
                    }
                    [data-testid="user-input-step"] .user-input-buttons-container button {
                        color: var(--user-msg-text) !important;
                        opacity: 0.75 !important;
                        transition: all 0.15s ease !important;
                        border-radius: 9999px !important;
                    }
                    [data-testid="user-input-step"] .user-input-buttons-container button:hover {
                        opacity: 1 !important;
                        background-color: rgba(255, 255, 255, 0.15) !important;
                    }
                    :root:not(.dark) [data-testid="user-input-step"] .user-input-buttons-container button:hover {
                        background-color: rgba(0, 0, 0, 0.08) !important;
                    }
                \` : '';

                let inputBoxCSS = inputBoxEnabled ? \`
                    /* Light Mode Input Box — mirrors User Message border + shadow */
                    :root, body, body.light, body.theme-light {
                        --input-box-border-color: \${userMsgLight.border};
                        --input-box-border-width: \${userMsgLight.borderWidth}px;
                        --input-box-shadow: \${getShadowCSS(userMsgLight.shadow, userMsgLight.border, 'light')};
                    }

                    /* Dark Mode Input Box — mirrors User Message border + shadow */
                    body.dark, body.theme-dark, body.dark-theme, body.vscode-dark, :root.dark, .dark {
                        --input-box-border-color: \${userMsgDark.border};
                        --input-box-border-width: \${userMsgDark.borderWidth}px;
                        --input-box-shadow: \${getShadowCSS(userMsgDark.shadow, userMsgDark.border, 'dark')};
                    }

                    [id="antigravity.agentSidePanelInputBox"], [id*="agentSidePanelInputBox"] {
                        border: var(--input-box-border-width) solid var(--input-box-border-color) !important;
                        box-shadow: var(--input-box-shadow) !important;
                        transition: border 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease !important;
                    }
                \` : '';
                
                // 1. Independent UI & Styling CSS (Always active, never disabled by RTL Engine)
                uiStyle.textContent = \`
                    /* Compact Sidebar Support — prevents left-clipping and enables fluid mouse resizing down to 160px */
                    div:has(> div > [role="navigation"][aria-label="Sidebar"]),
                    div:has(> [role="navigation"][aria-label="Sidebar"]) {
                        min-width: 0 !important;
                    }
                    div:has(> [role="navigation"][aria-label="Sidebar"]) {
                        left: 0 !important;
                        right: auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    [role="navigation"][aria-label="Sidebar"] {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                    }

                    /* Custom User Message Box */
                    \${msgBoxCSS}

                    /* Custom Chat Input Box */
                    \${inputBoxCSS}
                \`;

                // 2. RTL Engine & Typography CSS (Toggled with RTL Engine)
                rtlStyle.textContent = \`
                    \${faFontRule}
                    @font-face {
                        font-family: 'PersianOnlyFont';
                        src: url('data:font/woff2;base64,\${fontBase64}') format('woff2');
                        font-weight: 100 900;
                        unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                    }

                    :root, :host, html, body {
                        font-family: \${faFontName}, \${enFontStr}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
                    }
                    .prose, [data-testid="chat-message"], .markdown-body, .leading-relaxed, [contenteditable="true"], [contenteditable="true"] p {
                        font-size: \${fs}px !important;
                    }
                    p, h1, h2, h3, h4, h5, h6, ul, ol {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    .prose > *, [data-testid="chat-message"] > *, .markdown-body > * {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    label[for^="ask-opt-"] {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    label[for^="ask-opt-"][dir="rtl"] {
                        direction: rtl;
                        text-align: right;
                    }
                    textarea[data-testid="ask-question-writein"] {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    
                    \${forceRtlStyle}
                    
                    /* RTL List Padding Fix */
                    ul:not(#_)[dir="rtl"], ol:not(#_)[dir="rtl"],
                    [dir="rtl"] ul:not(#_), [dir="rtl"] ol:not(#_) {
                        padding-left: 0 !important;
                        padding-right: 1.25rem !important;
                    }
                    
                    /* Nested RTL List Padding Fix */
                    [dir="rtl"] ul:not(#_) ul:not(#_), [dir="rtl"] ul:not(#_) ol:not(#_),
                    [dir="rtl"] ol:not(#_) ul:not(#_), [dir="rtl"] ol:not(#_) ol:not(#_),
                    ul:not(#_)[dir="rtl"] ul:not(#_), ul:not(#_)[dir="rtl"] ol:not(#_),
                    ol:not(#_)[dir="rtl"] ul:not(#_), ol:not(#_)[dir="rtl"] ol:not(#_) {
                        padding-left: 0 !important;
                        padding-right: 2.5rem !important;
                    }
                    
                    /* Thinking Blocks (Keep LTR) */
                    .cursor-edit.text-secondary-foreground,
                    .cursor-edit.text-secondary-foreground * {
                        direction: ltr !important;
                        text-align: left !important;
                        unicode-bidi: isolate !important;
                    }
                    
                    /* Code Blocks */
                    pre, code, pre *, code * {
                        unicode-bidi: isolate !important;
                        direction: ltr !important;
                        text-align: left !important;
                        font-family: \${codeFontStr} !important;
                    }
                    
                    /* AI Response Line Height */
                    .leading-relaxed {
                        line-height: \${lh} !important;
                    }
                    
                    [contenteditable="true"], [contenteditable="true"] * {
                        unicode-bidi: isolate !important;
                        text-align: start !important;
                    }
                    
                    /* Smart Auto-Direction for Sidebar & Truncated Texts */
                    [role="navigation"][aria-label="Sidebar"] *, .truncate {
                        unicode-bidi: plaintext !important;
                        text-align: start !important;
                    }
                    /* Apply line height exclusively to chat paragraphs and input area */
                    .prose p, .prose li, .markdown-body p, [data-testid="chat-message"] p, [data-testid="chat-message"] .leading-relaxed, .leading-relaxed, [data-testid="user-input-step"], [data-testid="user-input-step"] div, [data-lexical-text="true"], [contenteditable="true"], [contenteditable="true"] p, .pointer-events-none.absolute.overflow-hidden, label[for^="ask-opt-"] {
                        line-height: \${lh} !important;
                    }
                \`;
            };
            
            updateDynamicCSS(savedFaFont, savedEnFont, savedCodeFont, savedLH, savedFS, sidebarWidth);
            
            // 3. Input Observer Logic
            function updateDir() {
                if (!isRTL) return;
                
                document.querySelectorAll('[contenteditable="true"] p, [contenteditable="true"], textarea[data-testid="ask-question-writein"]').forEach(el => {
                    const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
                    const text = raw.replace(/[\\u200B-\\u200F\\uFEFF]/g, '').trim();
                    if (text.length > 0) {
                        const isRtlText = /^[^a-zA-Z]*[\\u0591-\\u07FF\\uFB1D-\\uFDFD\\uFE70-\\uFEFC]/.test(text);
                        const newDir = isRtlText ? 'rtl' : 'ltr';
                        if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
                    } else {
                        if (el.hasAttribute('dir')) el.removeAttribute('dir');
                    }
                });
                
                document.querySelectorAll(\`
                    .prose > *, 
                    [data-testid="chat-message"] > *, 
                    .markdown-body > *, 
                    .leading-relaxed > *,
                    [data-testid="user-input-step"],
                    [data-testid="user-input-step"] > *,
                    div:has(> [role="radiogroup"]),
                    label[for^="ask-opt-"]
                \`).forEach(el => {
                    if (el.tagName === 'PRE' || el.tagName === 'CODE') return;
                    
                    const text = el.textContent.replace(/[\\u200B-\\u200F\\uFEFF]/g, '').trim();
                    let dir = 'auto';
                    
                    if (forceRTL) {
                        dir = 'rtl';
                    } else if (text) {
                        const firstChar = text.match(/[A-Za-z\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/);
                        if (firstChar) {
                            const isPersianOrArabic = /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/.test(firstChar[0]);
                            dir = isPersianOrArabic ? 'rtl' : 'ltr';
                        }
                    }
                    
                    if (el.getAttribute('dir') !== dir) {
                        el.setAttribute('dir', dir);
                    }
                });
            }
            document.body.addEventListener('input', updateDir, { capture: true });
            document.body.addEventListener('focusin', updateDir, { capture: true });
            const observer = new MutationObserver(updateDir);
            observer.observe(document.body, { childList: true, subtree: true });
            setInterval(updateDir, 500);
            
            // Shortcuts & Keyboard fixes
            document.addEventListener('keydown', (e) => {
                if (e.altKey && e.code === 'KeyR') {
                    e.preventDefault();
                    setRTLActive(!isRTL);
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (!fixAtSign) return;
                if (e.code === 'Digit2' && e.shiftKey) {
                    if (e.key === '٬' || e.key === '،') {
                        e.preventDefault();
                        document.execCommand('insertText', false, '@');
                    }
                }
            }, { capture: true });

            // 4. Create Settings Widget
            const oldWidget = document.querySelector('.rtl-widget-container');
            if (oldWidget) oldWidget.remove();
            
            const widgetWrapper = document.createElement('div');
            widgetWrapper.className = 'rtl-widget-container group fixed';
            widgetWrapper.style.cssText = \`direction: ltr; position: fixed !important; z-index: 999999 !important; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none !important; overflow: visible !important;\`;
            
            widgetWrapper.innerHTML = \`
                <!-- Floating Trigger Icon -->
                <div id="rtl-floating-trigger" class="relative w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:text-foreground cursor-pointer opacity-80 hover:opacity-100 transition-all duration-200 shadow-md \${placement === 'sidebar' ? 'hidden' : ''}" style="position: fixed !important; bottom: \${floatingBottom}px !important; right: 16px !important; pointer-events: auto !important; \${placement === 'sidebar' ? 'display: none !important;' : 'display: flex !important;'}">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                
                <!-- Settings Panel -->
                <div id="rtl-settings-panel" class="rtl-widget-panel rtl-theme-panel fixed p-0 rounded-2xl text-sm w-80 flex flex-col overflow-hidden" style="position: fixed !important; bottom: \${placement === 'sidebar' ? '56px' : (floatingBottom + 45) + 'px'} !important; \${placement === 'sidebar' ? 'left: 16px !important; right: auto !important;' : 'right: 16px !important; left: auto !important;'}">
                    
                    <!-- Pinned Top Header & Main Navigation Tabs -->
                    <div class="rtl-panel-header-pinned flex flex-col gap-2 p-2.5 pb-2 border-b border-border border-opacity-40 shrink-0">
                        <!-- Header with Close Button -->
                        <div class="flex items-center justify-between px-0.5">
                            <div class="flex items-center gap-1.5 font-semibold text-sm">
                                <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <span>Antigravity RTL & UI</span>
                            </div>
                            <button id="rtl-panel-close-btn" type="button" class="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer" title="Close (Esc)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>

                        <!-- Main 2-Tab Navigation Switcher (RTL & Typography vs UI & Styling) -->
                        <div class="rtl-main-nav">
                            <button id="rtl-main-nav-rtl" type="button" class="rtl-main-nav-btn \${activeMainTab === 'rtl' ? 'active' : ''}">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                                <span>RTL & Typography</span>
                            </button>
                            <button id="rtl-main-nav-ui" type="button" class="rtl-main-nav-btn \${activeMainTab === 'ui' ? 'active' : ''}">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/></svg>
                                <span>UI & Styling</span>
                            </button>
                        </div>
                    </div>

                    <!-- Scrollable Content Body (Zero Scroll on 520px height) -->
                    <div class="rtl-panel-body flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                        
                        <!-- TAB 1: RTL & Typography View -->
                        <div id="rtl-view-rtl" class="rtl-tab-view flex flex-col gap-2 \${activeMainTab === 'rtl' ? 'rtl-tab-active' : ''}">
                            <!-- Card 1: RTL Engine & Controls -->
                            <div class="rtl-card flex flex-col gap-2 p-2.5">
                                <div class="flex items-center justify-between gap-4">
                                    <div class="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                                        <span id="rtl-toggle-label" class="font-medium text-xs opacity-90">\${isRTL ? 'RTL Engine Enabled' : 'RTL Engine Disabled'}</span>
                                    </div>
                                    <button id="rtl-toggle-btn" type="button" role="switch" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${isRTL ? 'bg-accent' : 'rtl-toggle-off'} cursor-pointer">
                                        <span id="rtl-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${isRTL ? '24px' : '4px'});"></span>
                                    </button>
                                </div>
                                
                                <div id="rtl-engine-controls" class="flex flex-col gap-2 pt-1.5 border-t border-border border-opacity-30 transition-all duration-300 \${isRTL ? '' : 'opacity-40 pointer-events-none'}">
                                    <!-- Force RTL -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium text-xs opacity-80">Force Full RTL</span>
                                        <button id="rtl-force-btn" type="button" role="switch" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-5 w-9 \${forceRTL ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                            <span id="rtl-force-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-3.5 w-3.5" style="transform: translateX(\${forceRTL ? '18px' : '3px'});"></span>
                                        </button>
                                    </div>
                                    
                                    <!-- Placement: Sidebar vs Floating -->
                                    <div class="flex flex-col gap-1">
                                        <span class="font-medium text-xs opacity-80">Button Location</span>
                                        <div class="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-muted border border-border border-opacity-40">
                                            <button id="rtl-loc-sidebar-btn" type="button" class="py-1 px-2 text-[11px] font-medium rounded-md transition-all \${placement === 'sidebar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} cursor-pointer">
                                                Sidebar Menu
                                            </button>
                                            <button id="rtl-loc-floating-btn" type="button" class="py-1 px-2 text-[11px] font-medium rounded-md transition-all \${placement === 'floating' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} cursor-pointer">
                                                Floating Icon
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Floating Height Slider -->
                                    <div id="rtl-float-height-row" class="flex items-center justify-between gap-2 \${placement === 'floating' ? '' : 'hidden'}">
                                        <span class="font-medium text-xs opacity-80" title="Floating button bottom offset">Float Height</span>
                                        <div class="flex items-center gap-1.5">
                                            <input id="rtl-float-height-input" type="range" min="16" max="220" step="4" value="\${floatingBottom}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                            <span id="rtl-float-height-val" class="text-[10px] font-mono text-muted-foreground w-8 text-right">\${floatingBottom}px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 2: Typography & Fonts -->
                            <div id="rtl-typo-card" class="rtl-card flex flex-col gap-2 p-2.5 transition-all duration-300 \${isRTL ? '' : 'opacity-40 pointer-events-none'}">
                                <!-- Typography Header -->
                                <div class="flex items-center gap-1.5 pb-1 border-b border-border border-opacity-30">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
                                    <span class="font-medium text-xs opacity-90">Typography & Fonts</span>
                                </div>

                                <!-- FA/AR Font -->
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">FA/AR Font</span>
                                    <input id="rtl-fafont-input" type="text" placeholder="Default: Vazirmatn" value="\${savedFaFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                                </div>
                                <!-- EN Font -->
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">EN Font</span>
                                    <input id="rtl-enfont-input" type="text" placeholder="Default: System" value="\${savedEnFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                                </div>
                                <!-- Code Font -->
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">Code Font</span>
                                    <input id="rtl-codefont-input" type="text" placeholder="Default: System" value="\${savedCodeFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                                </div>

                                <!-- Line Height & Font Size -->
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">Line Height</span>
                                    <div class="flex items-center gap-1.5">
                                        <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${savedLH}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                        <button id="rtl-lh-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" title="Reset (1.6)">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">Font Size</span>
                                    <div class="flex items-center gap-1.5">
                                        <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${savedFS}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                        <button id="rtl-fs-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" title="Reset (16px)">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Shift+2 Fix -->
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-xs opacity-80">Shift+2 for @</span>
                                    <button id="rtl-at-btn" type="button" role="switch" aria-checked="\${fixAtSign}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${fixAtSign ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                        <span id="rtl-at-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${fixAtSign ? '24px' : '4px'});"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: UI & Styling View -->
                        <div id="rtl-view-ui" class="rtl-tab-view flex flex-col gap-2.5 \${activeMainTab === 'ui' ? 'rtl-tab-active' : ''}">
                            <!-- User Message Box Customizer with Dual Dark/Light Mode Tabs -->
                            <div class="flex flex-col gap-2">
                                <!-- Toggle Header with Reset Button -->
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        <span class="font-medium text-xs opacity-90">User Message Box</span>
                                    </div>
                                    <div class="flex items-center gap-1.5">
                                        <button id="rtl-usermsg-reset-btn" type="button" class="rtl-reset-icon-btn" title="Reset to Gentle Default">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        </button>
                                        <button id="rtl-usermsg-toggle-btn" type="button" role="switch" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-5 w-9 \${userMsgEnabled ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                            <span id="rtl-usermsg-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-3.5 w-3.5" style="transform: translateX(\${userMsgEnabled ? '18px' : '3px'});"></span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Manual Controls Container (Vibe UI Card) -->
                                <div id="rtl-usermsg-controls" class="rtl-card flex flex-col gap-2.5 p-2.5 transition-all duration-200 \${userMsgEnabled ? '' : 'opacity-40 pointer-events-none'}">
                                    
                                    <!-- Dark / Light Mode Segmented Tabs -->
                                    <div class="rtl-tab-group">
                                        <button id="rtl-tab-dark" type="button" class="rtl-tab-btn \${activeTab === 'dark' ? 'active' : ''}">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                                            <span>Dark Mode</span>
                                        </button>
                                        <button id="rtl-tab-light" type="button" class="rtl-tab-btn \${activeTab === 'light' ? 'active' : ''}">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                                            <span>Light Mode</span>
                                        </button>
                                    </div>

                                    <!-- Background Color Row -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="rtl-label">Background</span>
                                        <div class="flex items-center gap-1.5">
                                            <input type="color" id="rtl-usermsg-bg-color" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).bg}" class="rtl-color-input">
                                            <input type="text" id="rtl-usermsg-bg-hex" maxlength="7" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).bg}" class="rtl-hex-input">
                                        </div>
                                    </div>

                                    <!-- Text Color Row -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="rtl-label">Text Color</span>
                                        <div class="flex items-center gap-1.5">
                                            <input type="color" id="rtl-usermsg-text-color" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).text}" class="rtl-color-input">
                                            <input type="text" id="rtl-usermsg-text-hex" maxlength="7" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).text}" class="rtl-hex-input">
                                        </div>
                                    </div>

                                    <!-- Border Color Row -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="rtl-label">Border Color</span>
                                        <div class="flex items-center gap-1.5">
                                            <input type="color" id="rtl-usermsg-border-color" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).border}" class="rtl-color-input">
                                            <input type="text" id="rtl-usermsg-border-hex" maxlength="7" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).border}" class="rtl-hex-input">
                                        </div>
                                    </div>

                                    <!-- Border Width Row -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="rtl-label">Border Width</span>
                                        <div class="flex items-center gap-1.5">
                                            <input id="rtl-usermsg-bw-input" type="range" min="0" max="4" step="0.5" value="\${(activeTab === 'dark' ? userMsgDark : userMsgLight).borderWidth}" class="rtl-range-slider">
                                            <span id="rtl-usermsg-bw-val" class="rtl-badge-val">\${(activeTab === 'dark' ? userMsgDark : userMsgLight).borderWidth}px</span>
                                        </div>
                                    </div>

                                    <!-- Shadow Segmented Control Row (Single line) -->
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="rtl-label">Shadow</span>
                                        <div class="rtl-shadow-group" style="width: 175px;">
                                            <button id="rtl-shadow-none" type="button" class="rtl-shadow-btn \${(activeTab === 'dark' ? userMsgDark : userMsgLight).shadow === 'none' ? 'active' : ''}">None</button>
                                            <button id="rtl-shadow-soft" type="button" class="rtl-shadow-btn \${(activeTab === 'dark' ? userMsgDark : userMsgLight).shadow === 'soft' ? 'active' : ''}">Soft</button>
                                            <button id="rtl-shadow-3d" type="button" class="rtl-shadow-btn \${(activeTab === 'dark' ? userMsgDark : userMsgLight).shadow === '3d' || (activeTab === 'dark' ? userMsgDark : userMsgLight).shadow === 'medium' ? 'active' : ''}">3D</button>
                                            <button id="rtl-shadow-glow" type="button" class="rtl-shadow-btn \${(activeTab === 'dark' ? userMsgDark : userMsgLight).shadow === 'glow' ? 'active' : ''}">Glow</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Chat Input Box Card (toggle-only, inherits border from User Message) -->
                            <div class="rtl-card flex items-center justify-between p-2.5">
                                <div class="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-75">
                                        <rect width="20" height="16" x="2" y="4" rx="3" />
                                        <path d="M6 8h.01M10 8h.01M6 12h12M6 16h8" />
                                    </svg>
                                    <div class="flex flex-col gap-0.5">
                                        <span class="font-medium text-xs">Chat Input Box Border</span>
                                        <span class="text-[10px] opacity-50">Synced from User Message</span>
                                    </div>
                                </div>
                                <button id="rtl-inputbox-toggle-btn" type="button" role="switch" aria-checked="\${inputBoxEnabled}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${inputBoxEnabled ? 'bg-accent' : 'rtl-toggle-off'} cursor-pointer">
                                    <span id="rtl-inputbox-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${inputBoxEnabled ? '24px' : '4px'});"></span>
                                </button>
                            </div>

                            <!-- Compact Sidebar Toggle (Down to 160px with Mouse Drag) -->
                            <div class="flex flex-col gap-1">
                                <div class="rtl-card flex items-center justify-between p-2.5">
                                    <div class="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
                                        <div class="flex flex-col">
                                            <span class="rtl-label">Compact Sidebar (Min 160px)</span>
                                            <span class="text-[10.5px] opacity-60">امکان کوچک کردن سایدبار تا ۱۶۰px با موس</span>
                                        </div>
                                    </div>
                                    <button id="rtl-compact-sidebar-toggle-btn" type="button" role="switch" aria-checked="\${compactSidebar}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${compactSidebar ? 'bg-accent' : 'rtl-toggle-off'} cursor-pointer">
                                        <span id="rtl-compact-sidebar-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${compactSidebar ? '24px' : '4px'});"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pinned Bottom Footer (Fixed across all tab switches) -->
                    <div class="rtl-panel-footer-pinned">
                        <a href="https://github.com/omid-io/antigravity-rtl" target="_blank" class="rtl-github-link">
                            <svg height="13" width="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                            <span>Star on GitHub</span>
                        </a>
                    </div>
                </div>
            \`;

                // Append widget wrapper to document.body
                document.body.appendChild(widgetWrapper);
                bindWidgetControls();
            }

            function bindWidgetControls() {
                // References
                const panel = document.getElementById('rtl-settings-panel');
            const floatingTrigger = document.getElementById('rtl-floating-trigger');
            const panelCloseBtn = document.getElementById('rtl-panel-close-btn');
            const toggleBtn = document.getElementById('rtl-toggle-btn');
            const toggleKnob = document.getElementById('rtl-toggle-knob');
            const toggleLabel = document.getElementById('rtl-toggle-label');
            const engineControls = document.getElementById('rtl-engine-controls');
            const typoCard = document.getElementById('rtl-typo-card');
            const forceBtn = document.getElementById('rtl-force-btn');
            const forceKnob = document.getElementById('rtl-force-knob');
            const locSidebarBtn = document.getElementById('rtl-loc-sidebar-btn');
            const locFloatingBtn = document.getElementById('rtl-loc-floating-btn');
            const floatHeightRow = document.getElementById('rtl-float-height-row');
            const floatHeightInput = document.getElementById('rtl-float-height-input');
            const floatHeightVal = document.getElementById('rtl-float-height-val');
            
            const compactSidebarToggleBtn = document.getElementById('rtl-compact-sidebar-toggle-btn');
            const compactSidebarToggleKnob = document.getElementById('rtl-compact-sidebar-toggle-knob');

            const userMsgToggleBtn = document.getElementById('rtl-usermsg-toggle-btn');
            const userMsgToggleKnob = document.getElementById('rtl-usermsg-toggle-knob');
            const userMsgControls = document.getElementById('rtl-usermsg-controls');
            
            const tabDark = document.getElementById('rtl-tab-dark');
            const tabLight = document.getElementById('rtl-tab-light');
            const resetLabel = document.getElementById('rtl-usermsg-reset-label');

            const previewBox = document.getElementById('rtl-usermsg-preview');
            const previewText = document.getElementById('rtl-usermsg-preview-text');
            const previewTag = document.getElementById('rtl-preview-tag');

            const userMsgBgColor = document.getElementById('rtl-usermsg-bg-color');
            const userMsgBgHex = document.getElementById('rtl-usermsg-bg-hex');
            const userMsgTextColor = document.getElementById('rtl-usermsg-text-color');
            const userMsgTextHex = document.getElementById('rtl-usermsg-text-hex');
            const userMsgBorderColor = document.getElementById('rtl-usermsg-border-color');
            const userMsgBorderHex = document.getElementById('rtl-usermsg-border-hex');
            const userMsgBwInput = document.getElementById('rtl-usermsg-bw-input');
            const userMsgBwVal = document.getElementById('rtl-usermsg-bw-val');
            const userMsgResetBtn = document.getElementById('rtl-usermsg-reset-btn');

            const shadowBtns = {
                none: document.getElementById('rtl-shadow-none'),
                soft: document.getElementById('rtl-shadow-soft'),
                '3d': document.getElementById('rtl-shadow-3d'),
                glow: document.getElementById('rtl-shadow-glow')
            };

            const mainNavRtl = document.getElementById('rtl-main-nav-rtl');
            const mainNavUi = document.getElementById('rtl-main-nav-ui');
            const viewRtl = document.getElementById('rtl-view-rtl');
            const viewUi = document.getElementById('rtl-view-ui');

            function switchMainTab(tab) {
                if (activeMainTab === tab) return;
                const leaving = activeMainTab === 'rtl' ? viewRtl : viewUi;
                const entering = tab === 'rtl' ? viewRtl : viewUi;
                const navLeave = activeMainTab === 'rtl' ? mainNavRtl : mainNavUi;
                const navEnter = tab === 'rtl' ? mainNavRtl : mainNavUi;
                activeMainTab = tab;

                if (navLeave) navLeave.classList.remove('active');
                if (navEnter) navEnter.classList.add('active');

                if (leaving && entering) {
                    leaving.classList.remove('rtl-tab-active');
                    leaving.classList.add('rtl-tab-leaving');
                    
                    setTimeout(() => {
                        leaving.classList.remove('rtl-tab-leaving');
                        entering.classList.add('rtl-tab-entering');
                        
                        // Force layout reflow so the transition reliably animates from translateY(10px) to translateY(0)
                        void entering.offsetHeight;
                        
                        entering.classList.remove('rtl-tab-entering');
                        entering.classList.add('rtl-tab-active');
                    }, 120);
                }
                saveConfig();
            }

            if (mainNavRtl) mainNavRtl.addEventListener('click', () => switchMainTab('rtl'));
            if (mainNavUi) mainNavUi.addEventListener('click', () => switchMainTab('ui'));

            const inputBoxToggleBtn = document.getElementById('rtl-inputbox-toggle-btn');
            const inputBoxToggleKnob = document.getElementById('rtl-inputbox-toggle-knob');

            const faFontInput = document.getElementById('rtl-fafont-input');
            const enFontInput = document.getElementById('rtl-enfont-input');
            const codeFontInput = document.getElementById('rtl-codefont-input');
            const lhInput = document.getElementById('rtl-lh-input');
            const lhResetBtn = document.getElementById('rtl-lh-reset');
            const fsInput = document.getElementById('rtl-fs-input');
            const fsResetBtn = document.getElementById('rtl-fs-reset');
            const atBtn = document.getElementById('rtl-at-btn');
            const atKnob = document.getElementById('rtl-at-knob');

            // Synchronize panel theme with body class
            function syncPanelTheme() {
                if (!panel) return;
                panel.classList.toggle('rtl-is-dark', isAppDark());
            }
            syncPanelTheme();
            const themeObserver = new MutationObserver(syncPanelTheme);
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

            let isPanelOpen = false;
            function updatePanelPosition() {
                if (placement === 'sidebar') {
                    panel.style.bottom = '56px';
                    panel.style.left = '16px';
                    panel.style.right = 'auto';
                } else {
                    panel.style.bottom = (floatingBottom + 45) + 'px';
                    panel.style.right = '16px';
                    panel.style.left = 'auto';
                }
            }
            function setPanelOpen(open) {
                isPanelOpen = open;
                if (isPanelOpen) {
                    syncPanelTheme();
                    updatePanelPosition();
                    switchMainTab('rtl');
                    panel.classList.add('rtl-panel-open');
                } else {
                    panel.classList.remove('rtl-panel-open');
                }
            }

            floatingTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                setPanelOpen(!isPanelOpen);
            });
            panelCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setPanelOpen(false);
            });

            document.addEventListener('click', (e) => {
                if (!isPanelOpen) return;
                const sidebarBtn = document.getElementById('rtl-sidebar-btn');
                if (!panel.contains(e.target) && !floatingTrigger.contains(e.target) && (!sidebarBtn || !sidebarBtn.contains(e.target))) {
                    setPanelOpen(false);
                }
            }, { capture: true });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isPanelOpen) {
                    setPanelOpen(false);
                }
            });

            function attachSidebarButton() {
                const sidebar = document.querySelector('[role="navigation"][aria-label="Sidebar"]');
                if (!sidebar) return;
                let settingsBtn = null;
                sidebar.querySelectorAll('button').forEach(btn => {
                    if (btn.textContent.includes('Settings')) settingsBtn = btn;
                });
                if (!settingsBtn) return;
                if (document.getElementById('rtl-sidebar-btn')) return;

                const btn = document.createElement('button');
                btn.id = 'rtl-sidebar-btn';
                btn.className = settingsBtn.className;
                btn.setAttribute('type', 'button');
                btn.innerHTML = \`
                    <div class="flex items-center justify-center shrink-0 w-4 h-4 text-muted-foreground">
                        <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </div>
                    <span class="truncate text-xs font-medium">Antigravity RTL & UI</span>
                \`;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setPanelOpen(!isPanelOpen);
                });
                settingsBtn.parentElement.insertBefore(btn, settingsBtn);
            }
            attachSidebarButton();
            setInterval(attachSidebarButton, 1500);

            function saveConfig() {
                const cfg = {
                    faFont: faFontInput.value.trim(),
                    enFont: enFontInput.value.trim(),
                    codeFont: codeFontInput.value.trim(),
                    lh: lhInput.value,
                    fs: fsInput.value,
                    isRTL: isRTL,
                    forceRTL: forceRTL,
                    fixAtSign: fixAtSign,
                    placement: placement,
                    floatingBottom: floatingBottom,
                    sidebarWidth: sidebarWidth,
                    compactSidebar: compactSidebar,
                    userMsgEnabled: userMsgEnabled,
                    userMsgDark: userMsgDark,
                    userMsgLight: userMsgLight,
                    inputBoxEnabled: inputBoxEnabled,
                    inputBoxDark: inputBoxDark,
                    inputBoxLight: inputBoxLight
                };
                console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfg));
            }

            function refreshStyles() {
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth);
            }

            locSidebarBtn.addEventListener('click', () => {
                placement = 'sidebar';
                locSidebarBtn.classList.add('bg-background', 'text-foreground', 'shadow-sm');
                locSidebarBtn.classList.remove('text-muted-foreground');
                locFloatingBtn.classList.remove('bg-background', 'text-foreground', 'shadow-sm');
                locFloatingBtn.classList.add('text-muted-foreground');
                floatingTrigger.style.setProperty('display', 'none', 'important');
                floatingTrigger.classList.add('hidden');
                floatHeightRow.classList.add('hidden');
                updatePanelPosition();
                saveConfig();
            });

            locFloatingBtn.addEventListener('click', () => {
                placement = 'floating';
                locFloatingBtn.classList.add('bg-background', 'text-foreground', 'shadow-sm');
                locFloatingBtn.classList.remove('text-muted-foreground');
                locSidebarBtn.classList.remove('bg-background', 'text-foreground', 'shadow-sm');
                locSidebarBtn.classList.add('text-muted-foreground');
                floatingTrigger.style.setProperty('display', 'flex', 'important');
                floatingTrigger.classList.remove('hidden');
                floatHeightRow.classList.remove('hidden');
                updatePanelPosition();
                saveConfig();
            });

            floatHeightInput.addEventListener('input', (e) => {
                floatingBottom = parseInt(e.target.value);
                floatHeightVal.textContent = floatingBottom + 'px';
                widgetWrapper.style.bottom = floatingBottom + 'px';
                updatePanelPosition();
                saveConfig();
            });

            if (compactSidebarToggleBtn) {
                compactSidebarToggleBtn.addEventListener('click', () => {
                    compactSidebar = !compactSidebar;
                    compactSidebarToggleBtn.setAttribute('aria-checked', compactSidebar);
                    if (compactSidebar) {
                        compactSidebarToggleBtn.classList.add('bg-accent');
                        compactSidebarToggleBtn.classList.remove('rtl-toggle-off');
                        compactSidebarToggleKnob.style.transform = 'translateX(24px)';
                    } else {
                        compactSidebarToggleBtn.classList.remove('bg-accent');
                        compactSidebarToggleBtn.classList.add('rtl-toggle-off');
                        compactSidebarToggleKnob.style.transform = 'translateX(4px)';

                        // Snap back to default 256px if currently smaller
                        const sidebar = document.querySelector('[role="navigation"][aria-label="Sidebar"]');
                        const parent = sidebar ? sidebar.parentElement : null;
                        const grandParent = parent ? parent.parentElement : null;
                        if (grandParent && grandParent.offsetWidth < 256) {
                            grandParent.style.setProperty('width', '256px', 'important');
                            if (parent) parent.style.setProperty('width', '256px', 'important');
                            localStorage.setItem('sidebarWidth', '256');
                        }
                    }
                    saveConfig();
                });
            }

            function initSidebarResizer() {
                const resizer = document.querySelector('.cursor-col-resize');
                if (!resizer) return;
                if (resizer.dataset.rtlResizerInit) return;
                resizer.dataset.rtlResizerInit = 'true';

                const sidebar = document.querySelector('[role="navigation"][aria-label="Sidebar"]');
                const parent = sidebar ? sidebar.parentElement : null;
                const grandParent = parent ? parent.parentElement : null;

                // Restore saved compact width on startup if enabled
                if (compactSidebar && grandParent) {
                    const storedW = parseInt(localStorage.getItem('sidebarWidth'), 10);
                    if (storedW && storedW >= 160 && storedW < 256) {
                        grandParent.style.setProperty('width', storedW + 'px', 'important');
                        if (parent) parent.style.setProperty('width', storedW + 'px', 'important');
                    }
                }

                let isDragging = false;
                let startX = 0;
                let startW = 0;

                function onPointerMove(ev) {
                    if (!isDragging || !grandParent) return;
                    const delta = ev.clientX - startX;
                    let newW = Math.round(startW + delta);
                    const maxLimit = Math.min(420, Math.floor(window.innerWidth * 0.45));
                    if (newW < 160) newW = 160;
                    if (newW > maxLimit) newW = maxLimit;

                    grandParent.style.setProperty('width', newW + 'px', 'important');
                    if (parent) parent.style.setProperty('width', newW + 'px', 'important');
                }

                function onPointerEnd() {
                    if (!isDragging) return;
                    isDragging = false;
                    document.body.classList.remove('rtl-sidebar-resizing');

                    window.removeEventListener('pointermove', onPointerMove, true);
                    window.removeEventListener('pointerup', onPointerEnd, true);
                    window.removeEventListener('pointercancel', onPointerEnd, true);
                    window.removeEventListener('mousemove', onPointerMove, true);
                    window.removeEventListener('mouseup', onPointerEnd, true);
                    window.removeEventListener('blur', onPointerEnd);

                    if (grandParent) {
                        const finalW = grandParent.offsetWidth;
                        localStorage.setItem('sidebarWidth', finalW);
                        sidebarWidth = finalW;
                        saveConfig();
                    }
                }

                function onPointerStart(e) {
                    if (!compactSidebar) return; // If compact mode is OFF, let Antigravity handle native resize
                    if (e.button !== 0) return; // Primary left-click only

                    // Stop Antigravity's native handler to eliminate 60fps jitter/conflict
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    isDragging = true;
                    startX = e.clientX;
                    startW = grandParent ? grandParent.offsetWidth : 256;

                    document.body.classList.add('rtl-sidebar-resizing');

                    window.addEventListener('pointermove', onPointerMove, true);
                    window.addEventListener('pointerup', onPointerEnd, true);
                    window.addEventListener('pointercancel', onPointerEnd, true);
                    window.addEventListener('mousemove', onPointerMove, true);
                    window.addEventListener('mouseup', onPointerEnd, true);
                    window.addEventListener('blur', onPointerEnd);
                }

                resizer.addEventListener('pointerdown', onPointerStart, { capture: true });
                resizer.addEventListener('mousedown', onPointerStart, { capture: true });
            }

            initSidebarResizer();
            setInterval(initSidebarResizer, 1500);

            userMsgToggleBtn.addEventListener('click', () => {
                userMsgEnabled = !userMsgEnabled;
                userMsgToggleBtn.setAttribute('aria-checked', userMsgEnabled);
                if (userMsgEnabled) {
                    userMsgToggleBtn.classList.add('bg-accent');
                    userMsgToggleBtn.classList.remove('bg-gray-400', 'bg-opacity-40');
                    userMsgToggleKnob.style.transform = 'translateX(18px)';
                    userMsgControls.classList.remove('opacity-40', 'pointer-events-none');
                } else {
                    userMsgToggleBtn.classList.remove('bg-accent');
                    userMsgToggleBtn.classList.add('bg-gray-400', 'bg-opacity-40');
                    userMsgToggleKnob.style.transform = 'translateX(3px)';
                    userMsgControls.classList.add('opacity-40', 'pointer-events-none');
                }
                refreshStyles();
                saveConfig();
            });

            function updatePreview() {
                if (!previewBox) return;
                const cur = activeTab === 'dark' ? userMsgDark : userMsgLight;
                previewBox.style.backgroundColor = cur.bg;
                previewBox.style.borderColor = cur.border;
                previewBox.style.borderWidth = (cur.borderWidth || 0) + 'px';
                previewBox.style.borderStyle = 'solid';
                previewBox.style.boxShadow = getShadowCSS(cur.shadow, cur.border, activeTab);
                previewBox.style.color = cur.text;
                if (previewText) previewText.style.color = cur.text;
                if (previewTag) previewTag.textContent = activeTab === 'dark' ? 'Dark Preset' : 'Light Preset';
            }

            function updateShadowUI(selected) {
                const cur = activeTab === 'dark' ? userMsgDark : userMsgLight;
                cur.shadow = selected;
                Object.keys(shadowBtns).forEach(key => {
                    const b = shadowBtns[key];
                    if (b) b.classList.toggle('active', key === selected);
                });
                updatePreview();
                refreshStyles();
                saveConfig();
            }

            function syncInputsForActiveTab() {
                const cur = activeTab === 'dark' ? userMsgDark : userMsgLight;
                userMsgBgColor.value = cur.bg;
                userMsgBgHex.value = cur.bg;
                userMsgTextColor.value = cur.text;
                userMsgTextHex.value = cur.text;
                userMsgBorderColor.value = cur.border;
                userMsgBorderHex.value = cur.border;
                userMsgBwInput.value = cur.borderWidth;
                userMsgBwVal.textContent = cur.borderWidth + 'px';
                
                Object.keys(shadowBtns).forEach(key => {
                    const b = shadowBtns[key];
                    if (b) b.classList.toggle('active', key === cur.shadow || (key === '3d' && cur.shadow === 'medium'));
                });

                if (resetLabel) {
                    resetLabel.textContent = \`Reset \${activeTab === 'dark' ? 'Dark' : 'Light'} to Gentle Default\`;
                }
                if (userMsgResetBtn) {
                    userMsgResetBtn.title = \`Reset \${activeTab === 'dark' ? 'Dark' : 'Light'} to Gentle Default\`;
                }

                // (Chat Input Box border is synced automatically via refreshStyles)

                if (activeTab === 'dark') {
                    tabDark.classList.add('active');
                    tabLight.classList.remove('active');
                } else {
                    tabLight.classList.add('active');
                    tabDark.classList.remove('active');
                }

                updatePreview();
            }

            tabDark.addEventListener('click', () => {
                activeTab = 'dark';
                syncInputsForActiveTab();
            });

            tabLight.addEventListener('click', () => {
                activeTab = 'light';
                syncInputsForActiveTab();
            });

            function bindColorPair(colorInput, hexInput, setter) {
                colorInput.addEventListener('input', (e) => {
                    setter(e.target.value);
                    hexInput.value = e.target.value;
                    updatePreview();
                    refreshStyles();
                    saveConfig();
                });
                hexInput.addEventListener('input', (e) => {
                    let val = e.target.value.trim();
                    if (!val.startsWith('#')) val = '#' + val;
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setter(val);
                        colorInput.value = val;
                        updatePreview();
                        refreshStyles();
                        saveConfig();
                    }
                });
            }

            bindColorPair(userMsgBgColor, userMsgBgHex, (v) => { (activeTab === 'dark' ? userMsgDark : userMsgLight).bg = v; });
            bindColorPair(userMsgTextColor, userMsgTextHex, (v) => { (activeTab === 'dark' ? userMsgDark : userMsgLight).text = v; });
            bindColorPair(userMsgBorderColor, userMsgBorderHex, (v) => { (activeTab === 'dark' ? userMsgDark : userMsgLight).border = v; });

            userMsgBwInput.addEventListener('input', (e) => {
                const cur = activeTab === 'dark' ? userMsgDark : userMsgLight;
                cur.borderWidth = e.target.value;
                userMsgBwVal.textContent = cur.borderWidth + 'px';
                updatePreview();
                refreshStyles();
                saveConfig();
            });

            Object.keys(shadowBtns).forEach(key => {
                shadowBtns[key].addEventListener('click', () => {
                    updateShadowUI(key);
                });
            });

            userMsgResetBtn.addEventListener('click', () => {
                if (activeTab === 'dark') {
                    userMsgDark.bg = '#1e2433';
                    userMsgDark.text = '#f1f5f9';
                    userMsgDark.border = '#384c6e';
                    userMsgDark.borderWidth = '1.5';
                    userMsgDark.shadow = 'soft';
                } else {
                    userMsgLight.bg = '#f0f4ff';
                    userMsgLight.text = '#0f172a';
                    userMsgLight.border = '#cbd5e1';
                    userMsgLight.borderWidth = '1.5';
                    userMsgLight.shadow = 'soft';
                }
                syncInputsForActiveTab();
                refreshStyles();
                saveConfig();
            });

            // Chat Input Box Toggle (border synced from User Message settings)
            if (inputBoxToggleBtn) {
                inputBoxToggleBtn.addEventListener('click', () => {
                    inputBoxEnabled = !inputBoxEnabled;
                    inputBoxToggleBtn.setAttribute('aria-checked', inputBoxEnabled);
                    if (inputBoxEnabled) {
                        inputBoxToggleBtn.classList.add('bg-accent');
                        inputBoxToggleBtn.classList.remove('rtl-toggle-off');
                        inputBoxToggleKnob.style.transform = 'translateX(24px)';
                    } else {
                        inputBoxToggleBtn.classList.remove('bg-accent');
                        inputBoxToggleBtn.classList.add('rtl-toggle-off');
                        inputBoxToggleKnob.style.transform = 'translateX(4px)';
                    }
                    refreshStyles();
                    saveConfig();
                });
            }

            // Initial Sync
            syncInputsForActiveTab();

            // Main RTL Toggle
            function setRTLActive(active) {
                isRTL = active;
                saveConfig();
                toggleBtn.setAttribute('aria-checked', isRTL);
                if (isRTL) {
                    toggleLabel.innerText = 'RTL Engine Enabled';
                    if (engineControls) engineControls.classList.remove('opacity-40', 'pointer-events-none');
                    toggleBtn.classList.add('bg-accent');
                    toggleBtn.classList.remove('rtl-toggle-off');
                    toggleKnob.style.transform = 'translateX(24px)';
                    if (!rtlStyle.parentNode) document.head.appendChild(rtlStyle);
                    refreshStyles();
                } else {
                    toggleLabel.innerText = 'RTL Engine Disabled';
                    toggleBtn.classList.remove('bg-accent');
                    toggleBtn.classList.add('rtl-toggle-off');
                    toggleKnob.style.transform = 'translateX(4px)';
                    if (engineControls) engineControls.classList.add('opacity-40', 'pointer-events-none');
                    if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                    // uiStyle stays 100% active and untouched!
                }
            }

            toggleBtn.addEventListener('click', () => {
                setRTLActive(!isRTL);
            });

            forceBtn.addEventListener('click', () => {
                forceRTL = !forceRTL;
                saveConfig();
                forceBtn.setAttribute('aria-checked', forceRTL);
                if (forceRTL) {
                    forceBtn.classList.add('bg-accent');
                    forceBtn.classList.remove('bg-gray-400', 'bg-opacity-40');
                    forceKnob.style.transform = 'translateX(18px)';
                } else {
                    forceBtn.classList.remove('bg-accent');
                    forceBtn.classList.add('bg-gray-400', 'bg-opacity-40');
                    forceKnob.style.transform = 'translateX(3px)';
                }
                refreshStyles();
                updateDir();
            });

            atBtn.addEventListener('click', () => {
                fixAtSign = !fixAtSign;
                saveConfig();
                atBtn.setAttribute('aria-checked', fixAtSign);
                if (fixAtSign) {
                    atBtn.classList.add('bg-accent');
                    atBtn.classList.remove('bg-gray-400', 'bg-opacity-40');
                    atKnob.style.transform = 'translateX(24px)';
                } else {
                    atBtn.classList.remove('bg-accent');
                    atBtn.classList.add('bg-gray-400', 'bg-opacity-40');
                    atKnob.style.transform = 'translateX(4px)';
                }
            });

            [faFontInput, enFontInput, codeFontInput, lhInput, fsInput].forEach(inp => {
                inp.addEventListener('input', () => {
                    saveConfig();
                    refreshStyles();
                });
            });

            lhResetBtn.addEventListener('click', () => {
                lhInput.value = '1.6';
                saveConfig();
                refreshStyles();
            });

            fsResetBtn.addEventListener('click', () => {
                fsInput.value = '16';
                saveConfig();
                refreshStyles();
            });
        }

            // Initialize after defining all controllers
            // =========================================================================
            // 🚀 Reactive Mount Swarm
            // Wakes up instantly the exact millisecond React renders Antigravity's UI
            // Never mounts or renders anything on a white/unloaded screen
            // =========================================================================
            let isMounted = false;
            let checkTimer = null;
            let startupObserver = null;

            function tryMount() {
                if (isMounted) return;
                try {
                    if (isAntigravityReady()) {
                        isMounted = true;
                        if (checkTimer) {
                            clearInterval(checkTimer);
                            checkTimer = null;
                        }
                        if (startupObserver) {
                            try { startupObserver.disconnect(); } catch (_) {}
                            startupObserver = null;
                        }
                        mountExtension();
                    }
                } catch (_) {}
            }

            // 1. Immediate check in case UI is already present
            tryMount();

            // 2. Reactive mutation observer for zero-delay wakeup as soon as React mounts into DOM
            if (!isMounted) {
                try {
                    startupObserver = new MutationObserver(() => {
                        tryMount();
                    });
                    startupObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });
                } catch (_) {}

                // 3. Resilient fallback polling (250ms)
                checkTimer = setInterval(tryMount, 250);
            }
        })();`).catch(err => console.error('Failed to inject RTL features:', err));
    } catch(e) {
        console.error('Failed to read offline font', e);
    }
});
