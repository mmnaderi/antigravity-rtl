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
                let merged = JSON.parse(data);
                if (require('fs').existsSync(configPath)) {
                    try {
                        const existing = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
                        merged = { ...existing, ...merged };
                    } catch (_) {}
                }
                require('fs').writeFileSync(configPath, JSON.stringify(merged, null, 2));
            } catch (e) {}
        }
    });
    void win.loadURL(url);
    
    win.webContents.on('dom-ready', () => {
        // Strict Guard: only inject into local application server
        const currentURL = win.webContents.getURL();
        if (!currentURL || !/^https?:\/\/127\.0\.0\.1:\d+/i.test(currentURL)) {
            return;
        }
        try {
            const fontPath = require('path').join(__dirname, 'Vazirmatn-Variable.woff2');
            const fontBase64 = require('fs').readFileSync(fontPath).toString('base64');
            // Read config
            let rtlConfig = { faFont: '', enFont: '', codeFont: '', lh: '1.6', fs: '16', isRTL: true, forceRTL: false, starred: false, snoozeUntil: 0, toastStage: 0, cachedStars: '129' };
            try {
                const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
                if (require('fs').existsSync(configPath)) {
                    const cfg = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
                    rtlConfig = { ...rtlConfig, ...cfg };
                }
            } catch (e) {}

            // Unified injection for RTL Toggle, CSS, and JS
            win.webContents.executeJavaScript(`(() => {
                if (window.__ANTIGRAVITY_RTL_LOADED__) return;
                window.__ANTIGRAVITY_RTL_LOADED__ = true;

                // 🛡️ True App-Ready Guard: ensures React mounted the UI shell before touching DOM
                function isAntigravityReady() {
                    try {
                        if (!document || !document.body) return false;
                        const root = document.getElementById('root');
                        if (!root || !root.children || root.children.length === 0) return false;
                        return Boolean(document.querySelector('[role="navigation"]') || 
                                       document.querySelector('[role="main"]') || 
                                       document.querySelector('[contenteditable="true"]'));
                    } catch (_) {
                        return false;
                    }
                }

                function init() {
                    const fontBase64 = '${fontBase64}';
                const rtlConfig = ${JSON.stringify(rtlConfig)};
                
                // 2. Observer Logic
                let isRTL = rtlConfig.isRTL !== false;
                let forceRTL = Boolean(rtlConfig.forceRTL);
                let isStarred = Boolean(rtlConfig.starred);
                let snoozeUntil = Number(rtlConfig.snoozeUntil) || 0;
                let toastStage = Number(rtlConfig.toastStage) || 0;
                let cachedStars = rtlConfig.cachedStars || '129';
                
                // Inject permanent widget styles
                if (!document.getElementById('rtl-widget-style')) {
                    let widgetStyle = document.createElement('style');
                    widgetStyle.id = 'rtl-widget-style';
                    widgetStyle.innerHTML = \`
                        #rtl-dropdown-panel {
                            transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
                        }
                        #rtl-topbar-btn {
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                            line-height: 1 !important;
                        }
                        /* Native Antigravity Theme Tokens */
                        .rtl-theme-panel {
                            background-color: var(--popover, var(--card, #18181b)) !important;
                            color: var(--popover-foreground, var(--foreground, #f4f4f5)) !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.1)) !important;
                            box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
                        }
                        .rtl-separator {
                            height: 1px !important;
                            background-color: var(--border, rgba(255, 255, 255, 0.1)) !important;
                            margin: 8px -12px !important;
                            width: calc(100% + 24px) !important;
                            box-sizing: border-box !important;
                        }
                        .rtl-theme-input {
                            font-size: 12px !important;
                            border-radius: 4px !important;
                            padding: 4px 8px !important;
                            height: 24px !important;
                            background-color: var(--muted, #27272a) !important;
                            color: var(--foreground, #f4f4f5) !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.15)) !important;
                            box-shadow: none !important;
                            transition: all 0.15s ease !important;
                        }
                        .rtl-theme-input:focus {
                            outline: none !important;
                            box-shadow: none !important;
                            border-color: var(--color-primary, var(--ring, var(--vscode-button-background, #3b82f6))) !important;
                        }
                        .rtl-theme-input::placeholder {
                            color: var(--placeholder, rgba(255, 255, 255, 0.4)) !important;
                        }
                        /* Missing Tailwind Utilities */
                        .w-11 { width: 44px !important; }
                        .h-6 { height: 24px !important; }
                        .h-7 { height: 28px !important; }
                        .w-4 { width: 16px !important; }
                        .h-4 { height: 16px !important; }
                        .bg-accent { background-color: var(--color-primary, var(--primary, var(--vscode-button-background, #2563eb))) !important; }
                        /* Modern Seamless Range Slider */
                        .rtl-theme-range {
                            -webkit-appearance: none !important;
                            appearance: none !important;
                            width: 80px !important;
                            height: 14px !important;
                            background: transparent !important;
                            cursor: pointer !important;
                            outline: none !important;
                            border: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        .rtl-theme-range::-webkit-slider-runnable-track {
                            width: 100% !important;
                            height: 5px !important;
                            border-radius: 9999px !important;
                            border: none !important;
                            box-shadow: none !important;
                            background: linear-gradient(
                                to right,
                                var(--color-primary, var(--primary, var(--vscode-button-background, #2563eb))) 0%,
                                var(--color-primary, var(--primary, var(--vscode-button-background, #2563eb))) var(--range-pct, 50%),
                                var(--muted, rgba(255, 255, 255, 0.15)) var(--range-pct, 50%),
                                var(--muted, rgba(255, 255, 255, 0.15)) 100%
                            ) !important;
                        }
                        .rtl-theme-range::-webkit-slider-thumb {
                            -webkit-appearance: none !important;
                            appearance: none !important;
                            width: 13px !important;
                            height: 13px !important;
                            border-radius: 50% !important;
                            background: var(--color-primary, var(--primary, var(--vscode-button-background, #2563eb))) !important;
                            border: 2px solid var(--popover, var(--card, #18181b)) !important;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35) !important;
                            cursor: pointer !important;
                            margin-top: -4px !important;
                        }
                        
                        /* Toggle Button CSS Reset */
                        .rtl-toggle-btn-reset {
                            padding: 0 !important;
                            border: none !important;
                            box-sizing: border-box !important;
                            min-width: 44px !important;
                            outline: none !important;
                            display: inline-flex !important;
                            align-items: center !important;
                        }
                        
                        /* Shortcut KBD Badge */
                        .rtl-kbd {
                            display: inline-flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            min-width: 17px !important;
                            height: 17px !important;
                            padding: 0 4px !important;
                            font-size: 10px !important;
                            font-weight: 600 !important;
                            line-height: 1 !important;
                            color: var(--muted-foreground, #a1a1aa) !important;
                            background-color: var(--muted, rgba(255, 255, 255, 0.08)) !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.15)) !important;
                            border-radius: 4px !important;
                            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2) !important;
                        }
                        
                        /* RTL Tooltips */
                        [data-rtl-tooltip] {
                            position: relative;
                            display: inline-flex;
                            align-items: center;
                        }
                        [data-rtl-tooltip]::after {
                            content: attr(data-rtl-tooltip);
                            position: absolute;
                            bottom: calc(100% + 7px);
                            left: 50%;
                            transform: translate(-50%, 2px);
                            background-color: var(--secondary, #2a2c33) !important;
                            color: var(--secondary-foreground, #f4f4f5) !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.18)) !important;
                            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
                            font-size: 11px;
                            font-weight: 500;
                            line-height: 1.35;
                            padding: 5px 9px;
                            border-radius: 6px;
                            white-space: normal;
                            width: max-content;
                            max-width: 190px;
                            text-align: center;
                            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
                            pointer-events: none;
                            opacity: 0;
                            visibility: hidden;
                            transition: opacity 0.12s ease, transform 0.12s ease;
                            z-index: 10000000;
                        }
                        [data-rtl-tooltip]:not([data-rtl-tooltip-pos])::before {
                            content: '';
                            position: absolute;
                            bottom: calc(100% + 2px);
                            left: 50%;
                            transform: translate(-50%, 2px);
                            border-width: 5px 5px 0 5px;
                            border-style: solid;
                            border-color: var(--secondary, #2a2c33) transparent transparent transparent;
                            opacity: 0;
                            visibility: hidden;
                            transition: opacity 0.12s ease, transform 0.12s ease;
                            z-index: 10000001;
                            pointer-events: none;
                        }
                        [data-rtl-tooltip]:hover::after {
                            opacity: 1 !important;
                            visibility: visible !important;
                            transform: translate(-50%, 0) !important;
                        }
                        [data-rtl-tooltip]:not([data-rtl-tooltip-pos]):hover::before {
                            opacity: 1 !important;
                            visibility: visible !important;
                            transform: translate(-50%, 0) !important;
                        }
                        [data-rtl-tooltip-pos="left"]::after {
                            left: auto;
                            right: 0;
                            transform: translateY(2px);
                        }
                        [data-rtl-tooltip-pos="left"]:hover::after {
                            opacity: 1 !important;
                            visibility: visible !important;
                            transform: translateY(0) !important;
                        }
                        
                        /* Minimal Star Button in Dropdown Panel */
                        .rtl-star-btn {
                            display: inline-flex !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            width: 100% !important;
                            height: 32px !important;
                            padding: 0 10px !important;
                            border-radius: 6px !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.12)) !important;
                            background-color: transparent !important;
                            color: var(--secondary-foreground, #f4f4f5) !important;
                            text-decoration: none !important;
                            transition: background-color 0.15s ease, border-color 0.15s ease !important;
                        }
                        .rtl-star-btn:hover {
                            background-color: var(--secondary, #2a2c33) !important;
                            border-color: var(--border, rgba(255, 255, 255, 0.22)) !important;
                        }
                        .rtl-star-badge {
                            display: inline-flex !important;
                            align-items: center !important;
                            font-size: 12px !important;
                            font-weight: 600 !important;
                            color: #fbbf24 !important;
                            background: transparent !important;
                            border: none !important;
                            padding: 0 2px !important;
                            line-height: 1 !important;
                            letter-spacing: 0.2px !important;
                            transition: color 0.15s ease !important;
                        }
                        .rtl-star-btn:hover .rtl-star-badge {
                            color: #f59e0b !important;
                        }
                        #rtl-toast-star {
                            background-color: #f59e0b !important;
                            color: #000000 !important;
                            border: 1px solid rgba(245, 158, 11, 0.6) !important;
                            transition: all 0.15s ease !important;
                        }
                        #rtl-toast-star:hover {
                            background-color: #fbbf24 !important;
                            box-shadow: 0 0 14px rgba(245, 158, 11, 0.45) !important;
                            transform: translateY(-0.5px);
                        }
                        #rtl-toast-star svg, #rtl-toast-star span {
                            color: #000000 !important;
                            fill: #000000 !important;
                        }
                        /* Eye-catching Golden Star Twinkle Pulse */
                        @keyframes rtl-star-twinkle {
                            0%, 70%, 100% {
                                transform: scale(1) rotate(0deg);
                                filter: drop-shadow(0 0 0px transparent);
                                opacity: 0.85;
                            }
                            78% {
                                transform: scale(1.4) rotate(-12deg);
                                filter: drop-shadow(0 0 5px #f59e0b) drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
                                opacity: 1;
                            }
                            86% {
                                transform: scale(1.05) rotate(0deg);
                                filter: drop-shadow(0 0 1px #f59e0b);
                                opacity: 0.9;
                            }
                            92% {
                                transform: scale(1.3) rotate(8deg);
                                filter: drop-shadow(0 0 6px #f59e0b) drop-shadow(0 0 10px rgba(245, 158, 11, 0.5));
                                opacity: 1;
                            }
                        }
                        .rtl-star-pulse {
                            animation: rtl-star-twinkle 3.2s infinite ease-in-out;
                            display: inline-flex !important;
                            align-items: center;
                            justify-content: center;
                            transform-origin: center;
                        }
                        @keyframes rtl-toast-in {
                            from { opacity: 0; transform: translateY(12px) scale(0.96); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        @keyframes rtl-sparkle-pop {
                            0% {
                                transform: translate(0, 0) scale(0.3);
                                opacity: 1;
                            }
                            60% {
                                opacity: 1;
                            }
                            100% {
                                transform: translate(var(--tx), var(--ty)) scale(1.1) rotate(var(--rot));
                                opacity: 0;
                            }
                        }
                        .rtl-sparkle-p {
                            position: fixed;
                            z-index: 99999999;
                            pointer-events: none;
                            user-select: none;
                            animation: rtl-sparkle-pop 0.9s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
                        }
                    \`;
                    document.head.appendChild(widgetStyle);
                }
                const savedFaFont = rtlConfig.faFont || '';
                const savedEnFont = rtlConfig.enFont || '';
                const savedCodeFont = rtlConfig.codeFont || '';
                const savedLH = rtlConfig.lh || '1.6';
                const savedFS = rtlConfig.fs || '16';
                
                // 1. Create Style Tag
                const rtlStyle = document.createElement('style');
                rtlStyle.id = 'antigravity-rtl-style';
                
                const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs) => {
                    let faFontRule = '';
                    let faFontName = "'PersianOnlyFont'";
                    
                    if (faFont) {
                        faFontName = "'UserPersianFont', 'PersianOnlyFont'";
                        // Remove '-Regular' or ' Regular' if user typed it, to find the base family name
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
                    
                    let forceRtlStyle = (isRTL && forceRTL) ? \`
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
                        [dir="rtl"], [dir="rtl"] *:not(pre):not(code),
                        .prose, .prose *, [data-testid="chat-message"], [data-testid="chat-message"] *,
                        .markdown-body, .markdown-body *, .leading-relaxed, .leading-relaxed *,
                        [contenteditable="true"], [contenteditable="true"] *, [data-lexical-text="true"],
                        label[for^="ask-opt-"], textarea[data-testid="ask-question-writein"] {
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
                        
                        /* Custom CSS removed to rely on Tailwind completely */
                        
                        /* Code Blocks & Terminal */
                        pre, code, pre *, code *,
                        .xterm, .xterm * {
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
                    if (isRTL) {
                        if (!rtlStyle.parentNode) document.head.appendChild(rtlStyle);
                    } else {
                        if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                    }
                    window.dispatchEvent(new Event('resize'));
                };
                
                if (isRTL) {
                    document.head.appendChild(rtlStyle);
                    updateDynamicCSS(savedFaFont, savedEnFont, savedCodeFont, savedLH, savedFS);
                }
                
                // 2. Input Observer Logic
                function updateDir() {
                    if (!isRTL) return;
                    
                    // Inputs
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
                    
                    // Chat Output & Artifact Viewer (Respects Force RTL)
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
                        // Skip code blocks
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
                
                // Keyboard layout fixes & shortcuts
                document.addEventListener('keydown', (e) => {
                    // Alt + R to toggle RTL
                    if (e.altKey && e.code === 'KeyR') {
                        e.preventDefault();
                        setRTLActive(!isRTL);
                    }
                });
                
                const isMac = /Mac/i.test(navigator.userAgent || navigator.platform);
                const shortcutKbdHtml = isMac 
                    ? '<span class="flex items-center gap-1"><kbd class="rtl-kbd">⌥</kbd><kbd class="rtl-kbd">R</kbd></span>'
                    : '<span class="flex items-center gap-0.5"><kbd class="rtl-kbd">Alt</kbd><span class="opacity-40 text-[9px] mx-0.5">+</span><kbd class="rtl-kbd">R</kbd></span>';

                // 3. Create Topbar Widget Trigger
                const widgetWrapper = document.createElement('div');
                widgetWrapper.id = 'rtl-topbar-wrapper';
                widgetWrapper.className = 'relative inline-flex items-center';
                widgetWrapper.style.appRegion = 'no-drag';
                widgetWrapper.innerHTML = \`
                    <!-- Topbar Button (Twin of Install IDE button) -->
                    <button id="rtl-topbar-btn" type="button" class="inline-flex items-center font-medium transition-colors select-none outline-none cursor-pointer justify-center disabled:opacity-50 border border-border bg-transparent text-secondary-foreground hover:text-foreground hover:bg-secondary h-7 rounded-md gap-1.5 px-2.5 text-[13px] whitespace-nowrap" style="app-region: no-drag;" title="Antigravity RTL (\${isMac ? '⌥R' : 'Alt+R'})"><div class="relative flex items-center justify-center shrink-0 w-[14px] h-[14px]" style="width: 14px; height: 14px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg><span id="rtl-status-dot" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full \${isRTL ? 'bg-emerald-500' : 'hidden'}"></span></div><span>RTL</span>\${!isStarred ? '<span id="rtl-topbar-star" class="rtl-star-pulse ml-0.5 leading-none" title="Star on GitHub"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-amber-400 shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>' : ''}</button>
                \`;

                // 4. Create Dropdown Panel (Portaled to document.body to escape topbar overflow:hidden)
                const dropdownPanel = document.createElement('div');
                dropdownPanel.id = 'rtl-dropdown-panel';
                dropdownPanel.className = 'rtl-theme-panel fixed flex flex-col rounded-lg text-sm w-64 origin-top-right scale-0 opacity-0 pointer-events-none p-3';
                dropdownPanel.style.direction = 'ltr';
                dropdownPanel.style.zIndex = '999999';
                dropdownPanel.innerHTML = \`
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-1">
                      <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Antigravity RTL</span>
                      \${shortcutKbdHtml}
                    </div>
                    
                    <div class="rtl-separator"></div>
                    
                    <!-- Toggles Category (Enable & Force RTL) -->
                    <div class="flex flex-col gap-1.5">
                      <!-- Enable Toggle -->
                      <div class="flex items-center justify-between gap-4 px-1 h-7">
                        <span id="rtl-toggle-label" class="font-medium text-xs opacity-90">\${isRTL ? 'Enabled' : 'Disabled'}</span>
                        <button id="rtl-toggle-btn" type="button" role="switch" aria-checked="\${isRTL}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${isRTL ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                          <span id="rtl-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${isRTL ? '24px' : '4px'});"></span>
                        </button>
                      </div>

                      <!-- Force RTL Toggle -->
                      <div id="rtl-force-row" class="flex items-center justify-between gap-2 px-1 h-7 transition-opacity \${isRTL ? '' : 'opacity-40 pointer-events-none'}">
                        <div class="flex items-center">
                          <span class="font-medium text-xs opacity-80 whitespace-nowrap">Force RTL</span>
                          <span class="cursor-pointer inline-flex items-center text-muted-foreground hover:text-foreground ml-1.5" data-rtl-tooltip="Forces Chat &amp; Artifacts to RTL layout even if paragraph starts with English">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path></svg>
                          </span>
                        </div>
                        <button id="rtl-force-btn" type="button" role="switch" aria-checked="\${forceRTL}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${forceRTL ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                          <span id="rtl-force-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${forceRTL ? '24px' : '4px'});"></span>
                        </button>
                      </div>
                    </div>

                    <div class="rtl-separator"></div>
                    
                    <!-- Grouped Settings -->
                    <div id="rtl-settings-wrapper" class="flex flex-col gap-1.5 transition-all duration-300 \${isRTL ? '' : 'opacity-40 pointer-events-none'}">
                      
                      <!-- Persian Font -->
                      <!-- Tooltip example if needed later: <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Fallback: Vazirmatn">FA/AR Font</span> -->
                      <div class="flex items-center justify-between gap-2 px-1 h-7">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap">FA/AR Font</span>
                        <input id="rtl-fafont-input" type="text" placeholder="Default: Vazirmatn" value="\${savedFaFont}" class="rtl-theme-input placeholder:text-placeholder focus:!outline-none focus:!ring-0 transition-all !border !border-border !bg-muted disabled:opacity-50 !shadow-none w-28" style="font-size: 12px; border-radius: 4px; padding: 4px 8px;">
                      </div>
                      
                      <!-- English Font -->
                      <div class="flex items-center justify-between gap-2 px-1 h-7">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap">EN Font</span>
                        <input id="rtl-enfont-input" type="text" placeholder="Default: System" value="\${savedEnFont}" class="rtl-theme-input placeholder:text-placeholder focus:!outline-none focus:!ring-0 transition-all !border !border-border !bg-muted disabled:opacity-50 !shadow-none w-28" style="font-size: 12px; border-radius: 4px; padding: 4px 8px;">
                      </div>
                      
                      <!-- Code Font -->
                      <div class="flex items-center justify-between gap-2 px-1 h-7">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap">Code Font</span>
                        <input id="rtl-codefont-input" type="text" placeholder="Default: System" value="\${savedCodeFont}" class="rtl-theme-input placeholder:text-placeholder focus:!outline-none focus:!ring-0 transition-all !border !border-border !bg-muted disabled:opacity-50 !shadow-none w-28" style="font-size: 12px; border-radius: 4px; padding: 4px 8px;">
                      </div>
                      
                      <!-- Line Height -->
                      <div class="flex items-center justify-between gap-2 px-1 h-7">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap">Line Height</span>
                        <div class="flex items-center gap-2">
                          <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${savedLH}" class="rtl-theme-range w-20 cursor-pointer">
                          <button id="rtl-lh-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-0.5" data-rtl-tooltip="Reset to 1.6" data-rtl-tooltip-pos="left">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        </div>
                      </div>

                      <!-- Font Size -->
                      <div class="flex items-center justify-between gap-2 px-1 h-7">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap">Font Size</span>
                        <div class="flex items-center gap-2">
                          <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${savedFS}" class="rtl-theme-range w-20 cursor-pointer">
                          <button id="rtl-fs-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-0.5" data-rtl-tooltip="Reset to 16px" data-rtl-tooltip-pos="left">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="rtl-separator"></div>
                    
                    <!-- GitHub Star Button (Minimal & Single Star) -->
                    <a id="rtl-github-star" href="https://github.com/mmnaderi/antigravity-rtl" target="_blank" class="rtl-star-btn group">
                      <div class="flex items-center gap-2">
                        <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor" class="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                        <span class="text-xs font-medium text-secondary-foreground group-hover:text-foreground">Star on GitHub</span>
                      </div>
                      <span id="rtl-star-num" class="rtl-star-badge">★ \${cachedStars}</span>
                    </a>
                \`;

                function attachElements() {
                    if (!document.getElementById('rtl-topbar-wrapper')) {
                        const actionsCluster = document.querySelector('[data-testid="titlebar-more-actions"]')?.parentElement
                            || document.querySelector('[data-testid="install-editor"]')?.parentElement;
                        if (actionsCluster) {
                            actionsCluster.appendChild(widgetWrapper);
                        }
                    }
                    if (!document.getElementById('rtl-dropdown-panel')) {
                        document.body.appendChild(dropdownPanel);
                    }
                }
                attachElements();

                const topbarObserver = new MutationObserver(() => {
                    if (!document.getElementById('rtl-topbar-wrapper') || !document.getElementById('rtl-dropdown-panel')) {
                        attachElements();
                    }
                });
                topbarObserver.observe(document.body, { childList: true, subtree: true });
                
                const topbarBtn = widgetWrapper.querySelector('#rtl-topbar-btn');
                const statusDot = widgetWrapper.querySelector('#rtl-status-dot');
                const toggleBtn = dropdownPanel.querySelector('#rtl-toggle-btn');
                const toggleKnob = dropdownPanel.querySelector('#rtl-toggle-knob');
                const toggleLabel = dropdownPanel.querySelector('#rtl-toggle-label');
                const settingsWrapper = dropdownPanel.querySelector('#rtl-settings-wrapper');
                const faFontInput = dropdownPanel.querySelector('#rtl-fafont-input');
                const enFontInput = dropdownPanel.querySelector('#rtl-enfont-input');
                const codeFontInput = dropdownPanel.querySelector('#rtl-codefont-input');
                const lhInput = dropdownPanel.querySelector('#rtl-lh-input');
                const lhResetBtn = dropdownPanel.querySelector('#rtl-lh-reset');
                const fsInput = dropdownPanel.querySelector('#rtl-fs-input');
                const fsResetBtn = dropdownPanel.querySelector('#rtl-fs-reset');
                const forceBtn = dropdownPanel.querySelector('#rtl-force-btn');
                const forceKnob = dropdownPanel.querySelector('#rtl-force-knob');
                const forceRow = dropdownPanel.querySelector('#rtl-force-row');
                const refreshCSS = () => updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);

                function clearRTL() {
                    if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                    document.querySelectorAll('[dir]').forEach(el => {
                        el.removeAttribute('dir');
                    });
                    window.dispatchEvent(new Event('resize'));
                }

                // Initialize Toggle State
                if (!isRTL) {
                    toggleBtn.setAttribute('aria-checked', 'false');
                    toggleBtn.classList.remove('bg-accent');
                    toggleBtn.style.backgroundColor = 'rgba(156, 163, 175, 0.4)';
                    toggleKnob.style.transform = 'translateX(4px)';
                    if (statusDot) statusDot.className = 'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full hidden';
                    if (forceRow) forceRow.classList.add('opacity-40', 'pointer-events-none');
                    settingsWrapper.classList.add('opacity-40', 'pointer-events-none');
                    clearRTL();
                } else {
                    updateDir();
                }

                function saveConfig() {
                    try {
                        const cfgObj = {
                            faFont: faFontInput.value.trim(),
                            enFont: enFontInput.value.trim(),
                            codeFont: codeFontInput.value.trim(),
                            lh: lhInput.value,
                            fs: fsInput.value,
                            isRTL: isRTL,
                            forceRTL: forceRTL,
                            starred: isStarred,
                            snoozeUntil: snoozeUntil,
                            toastStage: toastStage,
                            cachedStars: cachedStars
                        };
                        console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfgObj));
                    } catch (_) {}
                }

                const SNOOZE_DAYS = [2, 3, 5, 8, 12, 16, 21];
                function getNextSnoozeMs(stageIndex) {
                    const days = SNOOZE_DAYS[Math.min(Math.max(0, stageIndex), SNOOZE_DAYS.length - 1)];
                    return days * 24 * 60 * 60 * 1000;
                }

                function markStarred() {
                    isStarred = true;
                    toastStage = Math.max(toastStage + 1, 3);
                    snoozeUntil = Date.now() + getNextSnoozeMs(toastStage);
                    saveConfig();
                    const badge = document.getElementById('rtl-topbar-star');
                    if (badge) badge.remove();
                    const numEl = document.getElementById('rtl-star-num');
                    if (numEl) numEl.textContent = '★ Starred!';
                }

                function setRTLActive(active) {
                    isRTL = active;
                    saveConfig();
                    toggleBtn.setAttribute('aria-checked', isRTL);
                    
                    if (isRTL) {
                        toggleLabel.innerText = 'Enabled';
                        if (forceRow) forceRow.classList.remove('opacity-40', 'pointer-events-none');
                        settingsWrapper.classList.remove('opacity-40', 'pointer-events-none');
                        toggleBtn.classList.add('bg-accent');
                        toggleBtn.style.backgroundColor = ''; 
                        toggleKnob.style.transform = 'translateX(24px)';
                        if (statusDot) statusDot.className = 'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500';
                        document.head.appendChild(rtlStyle);
                        refreshCSS();
                        updateDir();
                    } else {
                        toggleLabel.innerText = 'Disabled';
                        toggleBtn.classList.remove('bg-accent');
                        toggleBtn.style.backgroundColor = 'rgba(156, 163, 175, 0.4)';
                        toggleKnob.style.transform = 'translateX(4px)';
                        if (statusDot) statusDot.className = 'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full hidden';
                        if (forceRow) forceRow.classList.add('opacity-40', 'pointer-events-none');
                        settingsWrapper.classList.add('opacity-40', 'pointer-events-none');
                        clearRTL();
                    }
                }

                // Force RTL Event
                forceBtn.addEventListener('click', () => {
                    if (!isRTL) return;
                    forceRTL = !forceRTL;
                    saveConfig();
                    forceBtn.setAttribute('aria-checked', forceRTL);
                    
                    if (forceRTL) {
                        forceBtn.classList.add('bg-accent');
                        forceBtn.classList.remove('bg-gray-400', 'bg-opacity-40');
                        forceKnob.style.transform = 'translateX(24px)';
                    } else {
                        forceBtn.classList.remove('bg-accent');
                        forceBtn.classList.add('bg-gray-400', 'bg-opacity-40');
                        forceKnob.style.transform = 'translateX(4px)';
                    }
                    refreshCSS();
                    updateDir();
                });

                // Event Listeners
                [faFontInput, enFontInput, codeFontInput].forEach(input => {
                    input.addEventListener('input', () => {
                        saveConfig();
                        refreshCSS();
                    });
                });

                const updateSlider = s => s && s.style.setProperty('--range-pct', ((s.value - s.min) / (s.max - s.min) * 100) + '%');
                updateSlider(lhInput);
                updateSlider(fsInput);

                [[lhInput, lhResetBtn, '1.6'], [fsInput, fsResetBtn, '16']].forEach(([input, resetBtn, defaultValue]) => {
                    input.addEventListener('input', () => {
                        updateSlider(input);
                        saveConfig();
                        refreshCSS();
                    });
                    resetBtn.addEventListener('click', () => {
                        input.value = defaultValue;
                        updateSlider(input);
                        saveConfig();
                        refreshCSS();
                    });
                });
                
                // Toggle Event
                toggleBtn.addEventListener('click', () => {
                    setRTLActive(!isRTL);
                });

                // Dropdown Toggle & Click-Outside Handlers
                function updateDropdownPosition() {
                    if (!topbarBtn || !dropdownPanel) return;
                    const rect = topbarBtn.getBoundingClientRect();
                    dropdownPanel.style.top = (rect.bottom + 6) + 'px';
                    dropdownPanel.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
                    dropdownPanel.style.left = 'auto';
                }

                function toggleDropdown(show) {
                    if (!dropdownPanel || !topbarBtn) return;
                    const isVisible = dropdownPanel.classList.contains('scale-100');
                    const nextState = show !== undefined ? show : !isVisible;
                    if (nextState) {
                        updateDropdownPosition();
                        dropdownPanel.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
                        dropdownPanel.classList.add('scale-100', 'opacity-100', 'pointer-events-auto');
                        topbarBtn.classList.add('bg-secondary');
                        topbarBtn.setAttribute('aria-expanded', 'true');

                        // Fire celebratory star sparkle once per app session!
                        if (!sessionStorage.getItem('rtl_sparkle_seen')) {
                            sessionStorage.setItem('rtl_sparkle_seen', '1');
                            setTimeout(() => {
                                const starCta = dropdownPanel.querySelector('#rtl-github-star');
                                if (starCta) {
                                    const rect = starCta.getBoundingClientRect();
                                    const x = rect.left > 0 ? (rect.left + rect.width / 2) : (window.innerWidth - 120);
                                    const y = rect.top > 0 ? (rect.top + rect.height / 2) : 250;
                                    triggerPanelCelebration(x, y);
                                }
                            }, 180);
                        }
                    } else {
                        dropdownPanel.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto');
                        dropdownPanel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
                        topbarBtn.classList.remove('bg-secondary');
                        topbarBtn.setAttribute('aria-expanded', 'false');
                    }
                }

                if (topbarBtn) {
                    topbarBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleDropdown();
                    });
                }

                dropdownPanel.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                document.addEventListener('click', (e) => {
                    if (dropdownPanel && !dropdownPanel.contains(e.target) && topbarBtn && !topbarBtn.contains(e.target)) {
                        toggleDropdown(false);
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') toggleDropdown(false);
                });

                window.addEventListener('resize', () => {
                    if (dropdownPanel && dropdownPanel.classList.contains('scale-100')) {
                        updateDropdownPosition();
                    }
                });

                // 5. GitHub Star Handling, Live Count & Panel Open Celebration
                function triggerPanelCelebration(originX, originY) {
                    const colors = ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7', '#34d399', '#f43f5e'];
                    const shapes = ['★', '✦', '⭐', '◆'];
                    const x = originX || (window.innerWidth - 120);
                    const y = originY || 200;
                    for (let i = 0; i < 24; i++) {
                        const p = document.createElement('span');
                        const color = colors[i % colors.length];
                        const shape = shapes[i % shapes.length];
                        const rad = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.3;
                        const dist = 35 + Math.random() * 70;
                        const tx = Math.round(Math.cos(rad) * dist);
                        const ty = Math.round(Math.sin(rad) * dist - 18);
                        const rot = Math.round(Math.random() * 180 - 90);

                        p.className = 'rtl-sparkle-p';
                        p.textContent = shape;
                        p.style.setProperty('--tx', tx + 'px');
                        p.style.setProperty('--ty', ty + 'px');
                        p.style.setProperty('--rot', rot + 'deg');
                        p.style.left = x + 'px';
                        p.style.top = y + 'px';
                        p.style.color = color;
                        p.style.fontSize = (shape === '⭐' ? 14 : 12) + 'px';
                        document.body.appendChild(p);

                        setTimeout(() => p.remove(), 950);
                    }
                }

                const starCta = dropdownPanel.querySelector('#rtl-github-star');
                if (starCta) {
                    starCta.addEventListener('click', () => {
                        markStarred();
                    });
                }

                // Fetch Live GitHub Stars
                try {
                    fetch('https://api.github.com/repos/mmnaderi/antigravity-rtl')
                        .then(r => r.json())
                        .then(d => {
                            if (d && typeof d.stargazers_count === 'number') {
                                cachedStars = d.stargazers_count.toString();
                                saveConfig();
                                const numEl = document.getElementById('rtl-star-num');
                                if (numEl && numEl.textContent !== '★ Starred!') {
                                    numEl.textContent = '★ ' + d.stargazers_count;
                                }
                            }
                        }).catch(() => {});
                } catch (_) {}

                // Periodic Reminder & Community Toast (Gentle slope: 2 -> 3 -> 5 -> 8 -> 12 -> 16 -> 21 days)
                const now = Date.now();
                if (now >= snoozeUntil) {
                    setTimeout(() => {
                        if (Date.now() < snoozeUntil) return;
                        if (document.getElementById('rtl-star-toast')) return;

                        let stage = toastStage;
                        let curTitle = '';
                        let curDesc = '';
                        let buttonsHtml = '';

                        if (!isStarred) {
                            const unstarredTitles = [
                                'از فارسی‌نویسی راضی هستید؟',
                                'همچنان همراه Antigravity RTL هستید؟',
                                'یک ثانیه وقت برای حمایت از RTL؟'
                            ];
                            const unstarredDescriptions = [
                                'حمایت شما با ثبت یک استار در گیت‌هاب، به توسعه و بهبود این افزونه انرژی میده!',
                                'اگر این افزونه براتون مفید بوده، ثبت یک ستاره در گیت‌هاب خستگی رو از تنمون درمیاره!',
                                'با ثبت یک ستاره در مخزن گیت‌هاب، به توسعه و به‌روزرسانی مداوم افزونه کمک کنید.'
                            ];
                            curTitle = unstarredTitles[stage % unstarredTitles.length];
                            curDesc = unstarredDescriptions[stage % unstarredDescriptions.length];
                            buttonsHtml = \`
                                <a id="rtl-toast-star" href="https://github.com/mmnaderi/antigravity-rtl" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold no-underline transition-all shadow-sm cursor-pointer" style="background-color: #f59e0b !important; color: #000000 !important; border: 1px solid rgba(245, 158, 11, 0.6) !important;">
                                    <svg height="12" width="12" viewBox="0 0 16 16" fill="#000000" class="shrink-0" style="color: #000000 !important;"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                                    <span style="color: #000000 !important; font-weight: 700 !important;">ثبت استار در گیت‌هاب</span>
                                </a>
                                <button id="rtl-toast-already" class="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">قبلاً استار دادم</button>
                            \`;
                        } else {
                            const starredTitles = [
                                'ممنون که Star دادی!',
                                'مشکلی در نمایش متن‌ها می‌بینی؟',
                                'پیشنهادی برای بهبود Antigravity RTL داری؟'
                            ];
                            const starredDescriptions = [
                                'پیشنهادی برای بهبود فونت‌ها یا RTL داری؟ خوشحال میشیم نظرت رو با ما در میان بذاری.',
                                'به گفتگوی توسعه‌دهندگان در گیت‌هاب ملحق شو و نظراتت رو با ما به اشتراک بذار!',
                                'گزارش‌های شما به سریع‌تر شدن روند رفع اشکالات و آپدیت‌های افزونه کمک می‌کنه.'
                            ];
                            curTitle = starredTitles[stage % starredTitles.length];
                            curDesc = starredDescriptions[stage % starredDescriptions.length];
                            buttonsHtml = \`
                                <a id="rtl-toast-feedback" href="https://github.com/mmnaderi/antigravity-rtl/issues" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold no-underline transition-all shadow-sm cursor-pointer" style="background-color: var(--color-primary, var(--primary, #3b82f6)) !important; color: #ffffff !important;">
                                    <svg height="12" width="12" viewBox="0 0 16 16" fill="#ffffff" class="shrink-0"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>
                                    <span style="color: #ffffff !important; font-weight: 700 !important;">ثبت نظر یا پیشنهاد</span>
                                </a>
                                <button id="rtl-toast-ok" class="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">عالیه، ممنون</button>
                            \`;
                        }

                        const toast = document.createElement('div');
                        toast.id = 'rtl-star-toast';
                        toast.className = 'rtl-theme-panel fixed bottom-4 right-4 z-[999999] flex flex-col gap-2.5 p-3.5 rounded-xl border border-border shadow-xl bg-card text-foreground transition-all duration-300';
                        toast.style.cssText = 'direction: rtl; width: 310px; animation: rtl-toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);';
                        toast.innerHTML = \`
                            <div class="flex items-start justify-between gap-2">
                                <span class="font-bold text-xs">\${curTitle}</span>
                                <button id="rtl-toast-close" class="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-0.5 leading-none transition-colors" title="بعداً">✕</button>
                            </div>
                            <div class="text-[11px] opacity-80 leading-relaxed">
                                \${curDesc}
                            </div>
                            <div class="flex items-center justify-start gap-2 pt-1">
                                \${buttonsHtml}
                            </div>
                        \`;
                        document.body.appendChild(toast);

                        const closeToastAndSnooze = () => {
                            toastStage = stage + 1;
                            snoozeUntil = Date.now() + getNextSnoozeMs(toastStage);
                            saveConfig();
                            toast.remove();
                        };

                        const closeBtn = toast.querySelector('#rtl-toast-close');
                        if (closeBtn) closeBtn.addEventListener('click', closeToastAndSnooze);

                        const alreadyBtn = toast.querySelector('#rtl-toast-already');
                        if (alreadyBtn) {
                            alreadyBtn.addEventListener('click', () => {
                                markStarred();
                                toast.remove();
                            });
                        }

                        const toastStar = toast.querySelector('#rtl-toast-star');
                        if (toastStar) {
                            toastStar.addEventListener('click', () => {
                                markStarred();
                                toast.remove();
                            });
                        }

                        const feedbackBtn = toast.querySelector('#rtl-toast-feedback');
                        if (feedbackBtn) feedbackBtn.addEventListener('click', closeToastAndSnooze);

                        const okBtn = toast.querySelector('#rtl-toast-ok');
                        if (okBtn) okBtn.addEventListener('click', closeToastAndSnooze);
                    }, 35000);
                }
            }

            let isMounted = false;
            let checkTimer = null;
            let startupObserver = null;

            function tryMount() {
                if (isMounted) return;
                if (isAntigravityReady()) {
                    isMounted = true;
                    if (checkTimer) clearInterval(checkTimer);
                    if (startupObserver) try { startupObserver.disconnect(); } catch (_) {}
                    init();
                }
            }

            tryMount();
            if (!isMounted) {
                try {
                    startupObserver = new MutationObserver(() => tryMount());
                    startupObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });
                } catch (_) {}
                checkTimer = setInterval(tryMount, 250);
            }
        })();`).catch(err => console.error("Failed to inject RTL features:", err));

        } catch(e) {
            console.error("Failed to read offline font", e);
        }
    });

