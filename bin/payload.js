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
        // Strict Guard: only inject into local application server
        const currentURL = win.webContents.getURL();
        if (!currentURL || !/^https?:\/\/127\.0\.0\.1:\d+/i.test(currentURL)) {
            return;
        }
        try {
            const fontPath = require('path').join(__dirname, 'Vazirmatn-Variable.woff2');
            const fontBase64 = require('fs').readFileSync(fontPath).toString('base64');
            // Read config
            let rtlConfig = { faFont: '', enFont: '', codeFont: '', lh: '1.6', isRTL: true, forceRTL: false };
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
                let isRTL = rtlConfig.isRTL;
                let forceRTL = rtlConfig.forceRTL || false;
                
                // Inject permanent widget styles
                if (!document.getElementById('rtl-widget-style')) {
                    let widgetStyle = document.createElement('style');
                    widgetStyle.id = 'rtl-widget-style';
                    widgetStyle.innerHTML = \`
                        #rtl-dropdown-panel {
                            transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
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
                            background-color: var(--muted, var(--input, #27272a)) !important;
                            color: var(--foreground, #f4f4f5) !important;
                            border: 1px solid var(--border, rgba(255, 255, 255, 0.15)) !important;
                        }
                        .rtl-theme-input:focus {
                            border-color: var(--ring, var(--vscode-button-background, #3b82f6)) !important;
                        }
                        /* Missing Tailwind Utilities */
                        .w-11 { width: 44px !important; }
                        .h-6 { height: 24px !important; }
                        .w-4 { width: 16px !important; }
                        .h-4 { height: 16px !important; }
                        .translate-x-6 { transform: translateX(20px) !important; }
                        .translate-x-1 { transform: translateX(4px) !important; }
                        .bg-accent { background-color: var(--vscode-button-background, #2563eb) !important; }
                        
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
                        
                        /* GitHub Link Hover */
                        .rtl-github-link {
                            transition: all 0.1s ease-in-out !important;
                        }
                        .rtl-github-link:hover {
                            color: #eab308 !important; /* Tailwind yellow-500 */
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
                    <button id="rtl-topbar-btn" type="button" class="inline-flex items-center font-medium transition-colors select-none outline-none cursor-pointer justify-center border border-border bg-transparent text-secondary-foreground hover:text-foreground hover:bg-secondary h-6 text-[13px] rounded-md gap-1.5 px-2 whitespace-nowrap" style="app-region: no-drag;" title="Antigravity RTL (\${isMac ? '⌥R' : 'Alt+R'})"><span class="relative flex items-center justify-center shrink-0" style="width: 14px; height: 14px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg><span id="rtl-status-dot" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full \${isRTL ? 'bg-emerald-500' : 'hidden'}"></span></span><span>RTL</span></button>
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
                      <div class="flex items-center justify-between gap-2 px-1">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Fallback: Vazirmatn">FA/AR Font</span>
                        <input id="rtl-fafont-input" type="text" placeholder="Default: Vazirmatn" value="\${savedFaFont}" class="rtl-theme-input text-xs rounded px-2 py-1 w-28">
                      </div>
                      
                      <!-- English Font -->
                      <div class="flex items-center justify-between gap-2 px-1">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Fallback: System Font">EN Font</span>
                        <input id="rtl-enfont-input" type="text" placeholder="Default: System" value="\${savedEnFont}" class="rtl-theme-input text-xs rounded px-2 py-1 w-28">
                      </div>
                      
                      <!-- Code Font -->
                      <div class="flex items-center justify-between gap-2 px-1">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Fallback: Monospace">Code Font</span>
                        <input id="rtl-codefont-input" type="text" placeholder="Default: System" value="\${savedCodeFont}" class="rtl-theme-input text-xs rounded px-2 py-1 w-28">
                      </div>
                      
                      <!-- Line Height -->
                      <div class="flex items-center justify-between gap-2 px-1">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Paragraph spacing">Line Height</span>
                        <div class="flex items-center gap-2">
                          <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${savedLH}" class="h-1 w-20 cursor-pointer" style="accent-color: var(--vscode-button-background);">
                          <button id="rtl-lh-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-0.5" data-rtl-tooltip="Reset to 1.6" data-rtl-tooltip-pos="left">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        </div>
                      </div>

                      <!-- Font Size -->
                      <div class="flex items-center justify-between gap-2 px-1">
                        <span class="font-medium text-xs opacity-80 whitespace-nowrap cursor-help" data-rtl-tooltip="Chat message font size">Font Size</span>
                        <div class="flex items-center gap-2">
                          <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${savedFS}" class="h-1 w-20 cursor-pointer" style="accent-color: var(--vscode-button-background);">
                          <button id="rtl-fs-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-0.5" data-rtl-tooltip="Reset to 16px" data-rtl-tooltip-pos="left">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="rtl-separator"></div>
                    
                    <!-- GitHub -->
                    <a href="https://github.com/mmnaderi/antigravity-rtl" target="_blank" class="rtl-github-link flex items-center justify-center gap-2 text-xs font-semibold opacity-70 no-underline pt-1 pb-0.5">
                      <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                      Star on GitHub
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

                const saveConfig = () => {
                    console.log("SAVE_RTL_CONFIG|" + JSON.stringify({
                        faFont: faFontInput.value.trim(),
                        enFont: enFontInput.value.trim(),
                        codeFont: codeFontInput.value.trim(),
                        lh: lhInput.value,
                        fs: fsInput.value,
                        isRTL: isRTL,
                        forceRTL: forceRTL
                    }));
                };

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
                        updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
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
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                    updateDir();
                });

                // Event Listeners
                faFontInput.addEventListener('input', (e) => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });
                
                enFontInput.addEventListener('input', (e) => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });
                
                codeFontInput.addEventListener('input', (e) => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });
                
                lhInput.addEventListener('input', (e) => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });
                
                lhResetBtn.addEventListener('click', () => {
                    lhInput.value = '1.6';
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });

                fsInput.addEventListener('input', (e) => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
                });
                
                fsResetBtn.addEventListener('click', () => {
                    fsInput.value = '16';
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value);
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

