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
            userMsgTheme: 'blue'
        };
        try {
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            if (require('fs').existsSync(configPath)) {
                const cfg = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
                rtlConfig = { ...rtlConfig, ...cfg };
            }
        } catch (e) {}

        win.webContents.executeJavaScript(`
            const fontBase64 = '${fontBase64}';
            const rtlConfig = ${JSON.stringify(rtlConfig)};
            
            let isRTL = rtlConfig.isRTL;
            let forceRTL = rtlConfig.forceRTL || false;
            let fixAtSign = rtlConfig.fixAtSign !== false;
            let placement = rtlConfig.placement || 'sidebar';
            let floatingBottom = parseInt(rtlConfig.floatingBottom) || 24;
            let sidebarWidth = parseInt(rtlConfig.sidebarWidth) || 256;
            let userMsgTheme = rtlConfig.userMsgTheme || 'blue';

            const MSG_THEMES = {
                blue: {
                    name: 'Blue',
                    light: { bg: '#eff6ff', border: '#93c5fd', hover: '#3b82f6', shadow: '0 2px 8px -2px rgba(59, 130, 246, 0.15)' },
                    dark: { bg: '#172554', border: '#2563eb', hover: '#60a5fa', shadow: '0 4px 14px -2px rgba(37, 99, 235, 0.25)' }
                },
                indigo: {
                    name: 'Indigo',
                    light: { bg: '#eef2ff', border: '#a5b4fc', hover: '#6366f1', shadow: '0 2px 8px -2px rgba(99, 102, 241, 0.15)' },
                    dark: { bg: '#1e1b4b', border: '#4f46e5', hover: '#818cf8', shadow: '0 4px 14px -2px rgba(79, 70, 229, 0.25)' }
                },
                purple: {
                    name: 'Purple',
                    light: { bg: '#faf5ff', border: '#d8b4fe', hover: '#a855f7', shadow: '0 2px 8px -2px rgba(168, 85, 247, 0.15)' },
                    dark: { bg: '#2e1065', border: '#7c3aed', hover: '#c084fc', shadow: '0 4px 14px -2px rgba(124, 58, 237, 0.25)' }
                },
                slate: {
                    name: 'Slate',
                    light: { bg: '#f1f5f9', border: '#cbd5e1', hover: '#64748b', shadow: '0 2px 8px -2px rgba(100, 116, 139, 0.15)' },
                    dark: { bg: '#1e293b', border: '#475569', hover: '#94a3b8', shadow: '0 4px 14px -2px rgba(71, 85, 105, 0.25)' }
                },
                none: {
                    name: 'Default',
                    light: { bg: 'transparent', border: 'transparent', hover: 'transparent', shadow: 'none' },
                    dark: { bg: 'transparent', border: 'transparent', hover: 'transparent', shadow: 'none' }
                }
            };

            // 1. Inject permanent widget styles
            if (!document.getElementById('rtl-widget-style')) {
                let widgetStyle = document.createElement('style');
                widgetStyle.id = 'rtl-widget-style';
                widgetStyle.innerHTML = \`
                    .rtl-tooltip {
                        visibility: hidden;
                        opacity: 0;
                        transition: opacity 0.2s ease-in-out;
                        pointer-events: none;
                    }
                    .rtl-info-icon:hover .rtl-tooltip {
                        visibility: visible;
                        opacity: 1;
                    }
                    .rtl-widget-panel {
                        transform: scale(0.95);
                        opacity: 0;
                        pointer-events: none;
                        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
                        transform-origin: bottom right;
                    }
                    .rtl-widget-panel.rtl-panel-open {
                        transform: scale(1) !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }
                    /* Theme Colors */
                    :root {
                        --rtl-bg: #ffffff;
                        --rtl-text: #111827;
                        --rtl-border: #e5e7eb;
                        --rtl-input-bg: #f3f4f6;
                    }
                    :root.dark, .dark {
                        --rtl-bg: #1e293b;
                        --rtl-text: #f3f4f6;
                        --rtl-border: #334155;
                        --rtl-input-bg: #334155;
                    }
                    @media (prefers-color-scheme: dark) {
                        :root:not(.light) {
                            --rtl-bg: #1e293b;
                            --rtl-text: #f3f4f6;
                            --rtl-border: #334155;
                            --rtl-input-bg: #334155;
                        }
                    }
                    .rtl-theme-panel {
                        background-color: var(--rtl-bg) !important;
                        color: var(--rtl-text) !important;
                        border: 1px solid var(--rtl-border) !important;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15) !important;
                    }
                    .rtl-theme-input {
                        background-color: var(--rtl-input-bg) !important;
                        color: var(--rtl-text) !important;
                        border: 1px solid var(--rtl-border) !important;
                    }
                    .w-11 { width: 44px !important; }
                    .h-6 { height: 24px !important; }
                    .w-4 { width: 16px !important; }
                    .h-4 { height: 16px !important; }
                    .bg-accent { background-color: #4f46e5 !important; }
                    
                    .rtl-toggle-btn-reset {
                        padding: 0 !important;
                        border: none !important;
                        box-sizing: border-box !important;
                        min-width: 44px !important;
                        outline: none !important;
                        display: inline-flex !important;
                        align-items: center !important;
                    }
                    
                    .rtl-github-link {
                        transition: all 0.1s ease-in-out !important;
                    }
                    .rtl-github-link:hover {
                        color: #eab308 !important;
                        opacity: 1 !important;
                    }
                    .rtl-theme-chip {
                        height: 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }
                    .rtl-theme-chip:hover {
                        transform: scale(1.08);
                    }
                    .rtl-theme-chip.active {
                        outline: 2px solid #3b82f6;
                        outline-offset: 1px;
                    }
                \`;
                document.head.appendChild(widgetStyle);
            }

            const savedFaFont = rtlConfig.faFont || '';
            const savedEnFont = rtlConfig.enFont || '';
            const savedCodeFont = rtlConfig.codeFont || '';
            const savedLH = rtlConfig.lh || '1.6';
            const savedFS = rtlConfig.fs || '16';
            
            // 2. Dynamic Style Tag
            const rtlStyle = document.createElement('style');
            rtlStyle.id = 'antigravity-rtl-style';
            
            const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs, sWidth, themeKey) => {
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

                const currentTheme = MSG_THEMES[themeKey] || MSG_THEMES.blue;
                
                rtlStyle.textContent = \`
                    \${faFontRule}
                    @font-face {
                        font-family: 'PersianOnlyFont';
                        src: url('data:font/woff2;base64,\${fontBase64}') format('woff2');
                        font-weight: 100 900;
                        unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                    }
                    :root {
                        --antigravity-sidebar-width: \${sWidth}px;
                        --user-box-bg: \${currentTheme.light.bg};
                        --user-box-border: \${currentTheme.light.border};
                        --user-box-hover: \${currentTheme.light.hover};
                        --user-box-shadow: \${currentTheme.light.shadow};
                    }
                    :root.dark, .dark {
                        --user-box-bg: \${currentTheme.dark.bg};
                        --user-box-border: \${currentTheme.dark.border};
                        --user-box-hover: \${currentTheme.dark.hover};
                        --user-box-shadow: \${currentTheme.dark.shadow};
                    }
                    @media (prefers-color-scheme: dark) {
                        :root:not(.light) {
                            --user-box-bg: \${currentTheme.dark.bg};
                            --user-box-border: \${currentTheme.dark.border};
                            --user-box-hover: \${currentTheme.dark.hover};
                            --user-box-shadow: \${currentTheme.dark.shadow};
                        }
                    }

                    /* Sidebar Width Override */
                    div:has(> div > [role="navigation"][aria-label="Sidebar"]),
                    div:has(> [role="navigation"][aria-label="Sidebar"]) {
                        width: var(--antigravity-sidebar-width, 256px) !important;
                    }

                    /* User Message Contrast Styling */
                    \${themeKey !== 'none' ? \`
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] {
                        background-color: var(--user-box-border) !important;
                        box-shadow: var(--user-box-shadow) !important;
                        transition: all 0.2s ease !important;
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"] > div {
                        background-color: var(--user-box-bg) !important;
                    }
                    [data-testid="user-input-step"] [data-testid="lifted-context-menu-trigger"]:hover {
                        background-color: var(--user-box-hover) !important;
                    }
                    \` : ''}

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
            
            document.head.appendChild(rtlStyle);
            updateDynamicCSS(savedFaFont, savedEnFont, savedCodeFont, savedLH, savedFS, sidebarWidth, userMsgTheme);
            
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
            const widgetWrapper = document.createElement('div');
            widgetWrapper.className = 'rtl-widget-container group fixed';
            widgetWrapper.style.cssText = \`direction: ltr; z-index: 999999; overflow: visible !important; bottom: \${floatingBottom}px; right: 16px;\`;
            
            widgetWrapper.innerHTML = \`
                <!-- Floating Trigger Icon -->
                <div id="rtl-floating-trigger" class="relative w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:text-foreground cursor-pointer opacity-80 hover:opacity-100 transition-all duration-200 shadow-md \${placement === 'sidebar' ? 'hidden' : ''}">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                
                <!-- Settings Panel -->
                <div id="rtl-settings-panel" class="rtl-widget-panel rtl-theme-panel fixed p-px rounded-2xl text-sm w-72" style="bottom: \${placement === 'sidebar' ? '60px' : (floatingBottom + 45) + 'px'}; \${placement === 'sidebar' ? 'left: 16px;' : 'right: 16px;'}">
                    <div class="flex flex-col gap-2 p-3.5 rounded-[15px] w-full h-full max-h-[85vh] overflow-y-auto">
                        
                        <!-- Header with Close Button -->
                        <div class="flex items-center justify-between px-1 pb-2 border-b border-border border-opacity-50">
                            <div class="flex items-center gap-1.5 font-semibold text-sm">
                                <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <span>Antigravity RTL & UI</span>
                            </div>
                            <button id="rtl-panel-close-btn" type="button" class="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer" title="Close (Esc)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <!-- Main RTL Toggle -->
                        <div class="flex items-center justify-between gap-4 px-1 pt-1">
                            <span id="rtl-toggle-label" class="font-medium text-xs opacity-90">\${isRTL ? 'RTL Engine Enabled' : 'RTL Engine Disabled'}</span>
                            <button id="rtl-toggle-btn" type="button" role="switch" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${isRTL ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                <span id="rtl-toggle-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${isRTL ? '24px' : '4px'});"></span>
                            </button>
                        </div>
                        
                        <!-- Settings Body -->
                        <div id="rtl-settings-wrapper" class="flex flex-col gap-2.5 transition-all duration-300 \${isRTL ? '' : 'opacity-40 pointer-events-none'}">
                            
                            <!-- Force RTL -->
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">Force Full RTL</span>
                                <button id="rtl-force-btn" type="button" role="switch" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${forceRTL ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                    <span id="rtl-force-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${forceRTL ? '24px' : '4px'});"></span>
                                </button>
                            </div>
                            
                            <div class="h-px bg-border border-opacity-30 w-full"></div>
                            
                            <!-- Placement: Sidebar vs Floating -->
                            <div class="flex flex-col gap-1 px-1">
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
                            <div id="rtl-float-height-row" class="flex items-center justify-between gap-2 px-1 \${placement === 'floating' ? '' : 'hidden'}">
                                <span class="font-medium text-xs opacity-80" title="Floating button bottom offset">Float Height</span>
                                <div class="flex items-center gap-1.5">
                                    <input id="rtl-float-height-input" type="range" min="16" max="220" step="4" value="\${floatingBottom}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                    <span id="rtl-float-height-val" class="text-[10px] font-mono text-muted-foreground w-8 text-right">\${floatingBottom}px</span>
                                </div>
                            </div>

                            <!-- Sidebar Width Control -->
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80" title="Custom Sidebar Width">Sidebar Width</span>
                                <div class="flex items-center gap-1.5">
                                    <input id="rtl-sidebar-width-input" type="range" min="220" max="420" step="4" value="\${sidebarWidth}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                    <span id="rtl-sidebar-width-val" class="text-[10px] font-mono text-muted-foreground w-8 text-right">\${sidebarWidth}px</span>
                                    <button id="rtl-sidebar-width-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" title="Reset (256px)">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                    </button>
                                </div>
                            </div>

                            <div class="h-px bg-border border-opacity-30 w-full"></div>

                            <!-- User Message Box Theming -->
                            <div class="flex flex-col gap-1.5 px-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium text-xs opacity-80">User Box Theme</span>
                                    <span id="rtl-theme-label" class="text-[10px] font-mono text-blue-500 font-semibold uppercase">\${userMsgTheme}</span>
                                </div>
                                <div class="grid grid-cols-5 gap-1.5 pt-0.5">
                                    <button type="button" class="rtl-theme-chip \${userMsgTheme === 'blue' ? 'active' : ''}" data-theme="blue" title="Blue (High Contrast)" style="background: linear-gradient(135deg, #eff6ff 50%, #172554 50%); border: 1px solid #3b82f6;"></button>
                                    <button type="button" class="rtl-theme-chip \${userMsgTheme === 'indigo' ? 'active' : ''}" data-theme="indigo" title="Indigo (Modern Royal)" style="background: linear-gradient(135deg, #eef2ff 50%, #1e1b4b 50%); border: 1px solid #6366f1;"></button>
                                    <button type="button" class="rtl-theme-chip \${userMsgTheme === 'purple' ? 'active' : ''}" data-theme="purple" title="Purple (Luxury)" style="background: linear-gradient(135deg, #faf5ff 50%, #2e1065 50%); border: 1px solid #a855f7;"></button>
                                    <button type="button" class="rtl-theme-chip \${userMsgTheme === 'slate' ? 'active' : ''}" data-theme="slate" title="Slate (Minimal)" style="background: linear-gradient(135deg, #f1f5f9 50%, #1e293b 50%); border: 1px solid #64748b;"></button>
                                    <button type="button" class="rtl-theme-chip \${userMsgTheme === 'none' ? 'active' : ''}" data-theme="none" title="Default Antigravity" style="background: #94a3b8; border: 1px solid #64748b;"></button>
                                </div>
                            </div>

                            <div class="h-px bg-border border-opacity-30 w-full"></div>

                            <!-- Typography -->
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">FA/AR Font</span>
                                <input id="rtl-fafont-input" type="text" placeholder="Default: Vazirmatn" value="\${savedFaFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                            </div>
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">EN Font</span>
                                <input id="rtl-enfont-input" type="text" placeholder="Default: System" value="\${savedEnFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                            </div>
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">Code Font</span>
                                <input id="rtl-codefont-input" type="text" placeholder="Default: System" value="\${savedCodeFont}" class="rtl-theme-input text-[11px] px-2 py-0.5 rounded-md w-32 focus:outline-none">
                            </div>

                            <!-- Line Height & Font Size -->
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">Line Height</span>
                                <div class="flex items-center gap-1.5">
                                    <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${savedLH}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                    <button id="rtl-lh-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" title="Reset (1.6)">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d="M3 3v5h5\"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">Font Size</span>
                                <div class="flex items-center gap-1.5">
                                    <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${savedFS}" class="h-1 w-20 cursor-pointer" style="accent-color: #3b82f6;">
                                    <button id="rtl-fs-reset" type="button" class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" title="Reset (16px)">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d="M3 3v5h5\"/></svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Shift+2 Fix -->
                            <div class="flex items-center justify-between gap-2 px-1">
                                <span class="font-medium text-xs opacity-80">Shift+2 for @</span>
                                <button id="rtl-at-btn" type="button" role="switch" aria-checked="\${fixAtSign}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 \${fixAtSign ? 'bg-accent' : 'bg-gray-400 bg-opacity-40'} cursor-pointer">
                                    <span id="rtl-at-knob" class="inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm h-4 w-4" style="transform: translateX(\${fixAtSign ? '24px' : '4px'});"></span>
                                </button>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="h-px bg-card-border w-full mt-1"></div>
                        <a href="https://github.com/omid-io/antigravity-rtl" target="_blank" class="rtl-github-link flex items-center justify-center gap-1.5 text-xs font-semibold opacity-70 no-underline pt-0.5">
                            <svg height="13" width="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                            Star on GitHub
                        </a>
                    </div>
                </div>
            \`;
            document.body.appendChild(widgetWrapper);

            // References
            const panel = document.getElementById('rtl-settings-panel');
            const floatingTrigger = document.getElementById('rtl-floating-trigger');
            const panelCloseBtn = document.getElementById('rtl-panel-close-btn');
            const toggleBtn = document.getElementById('rtl-toggle-btn');
            const toggleKnob = document.getElementById('rtl-toggle-knob');
            const toggleLabel = document.getElementById('rtl-toggle-label');
            const settingsWrapper = document.getElementById('rtl-settings-wrapper');
            const forceBtn = document.getElementById('rtl-force-btn');
            const forceKnob = document.getElementById('rtl-force-knob');
            const locSidebarBtn = document.getElementById('rtl-loc-sidebar-btn');
            const locFloatingBtn = document.getElementById('rtl-loc-floating-btn');
            const floatHeightRow = document.getElementById('rtl-float-height-row');
            const floatHeightInput = document.getElementById('rtl-float-height-input');
            const floatHeightVal = document.getElementById('rtl-float-height-val');
            const sidebarWidthInput = document.getElementById('rtl-sidebar-width-input');
            const sidebarWidthVal = document.getElementById('rtl-sidebar-width-val');
            const sidebarWidthReset = document.getElementById('rtl-sidebar-width-reset');
            const themeLabel = document.getElementById('rtl-theme-label');
            const themeChips = document.querySelectorAll('.rtl-theme-chip');

            const faFontInput = document.getElementById('rtl-fafont-input');
            const enFontInput = document.getElementById('rtl-enfont-input');
            const codeFontInput = document.getElementById('rtl-codefont-input');
            const lhInput = document.getElementById('rtl-lh-input');
            const lhResetBtn = document.getElementById('rtl-lh-reset');
            const fsInput = document.getElementById('rtl-fs-input');
            const fsResetBtn = document.getElementById('rtl-fs-reset');
            const atBtn = document.getElementById('rtl-at-btn');
            const atKnob = document.getElementById('rtl-at-knob');

            // Click-to-toggle panel logic
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
                    updatePanelPosition();
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

            // Close on click outside & Escape
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

            // Mount sidebar button
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

            // Save config function
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
                    userMsgTheme: userMsgTheme
                };
                console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfg));
            }

            // Placement Buttons
            locSidebarBtn.addEventListener('click', () => {
                placement = 'sidebar';
                locSidebarBtn.classList.add('bg-background', 'text-foreground', 'shadow-sm');
                locSidebarBtn.classList.remove('text-muted-foreground');
                locFloatingBtn.classList.remove('bg-background', 'text-foreground', 'shadow-sm');
                locFloatingBtn.classList.add('text-muted-foreground');
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
                floatingTrigger.classList.remove('hidden');
                floatHeightRow.classList.remove('hidden');
                updatePanelPosition();
                saveConfig();
            });

            // Floating Bottom Slider
            floatHeightInput.addEventListener('input', (e) => {
                floatingBottom = parseInt(e.target.value);
                floatHeightVal.textContent = floatingBottom + 'px';
                widgetWrapper.style.bottom = floatingBottom + 'px';
                updatePanelPosition();
                saveConfig();
            });

            // Sidebar Width Slider
            sidebarWidthInput.addEventListener('input', (e) => {
                sidebarWidth = parseInt(e.target.value);
                sidebarWidthVal.textContent = sidebarWidth + 'px';
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                saveConfig();
            });

            sidebarWidthReset.addEventListener('click', () => {
                sidebarWidth = 256;
                sidebarWidthInput.value = '256';
                sidebarWidthVal.textContent = '256px';
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                saveConfig();
            });

            // User Message Theme Chips
            themeChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const selected = chip.getAttribute('data-theme');
                    userMsgTheme = selected;
                    themeChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    themeLabel.textContent = selected;
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                    saveConfig();
                });
            });

            // Main RTL Toggle
            function setRTLActive(active) {
                isRTL = active;
                saveConfig();
                toggleBtn.setAttribute('aria-checked', isRTL);
                if (isRTL) {
                    toggleLabel.innerText = 'RTL Engine Enabled';
                    settingsWrapper.classList.remove('opacity-40', 'pointer-events-none');
                    toggleBtn.classList.add('bg-accent');
                    toggleKnob.style.transform = 'translateX(24px)';
                    document.head.appendChild(rtlStyle);
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                } else {
                    toggleLabel.innerText = 'RTL Engine Disabled';
                    toggleBtn.classList.remove('bg-accent');
                    toggleKnob.style.transform = 'translateX(4px)';
                    settingsWrapper.classList.add('opacity-40', 'pointer-events-none');
                    if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                }
            }

            toggleBtn.addEventListener('click', () => {
                setRTLActive(!isRTL);
            });

            // Force RTL Event
            forceBtn.addEventListener('click', () => {
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
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                updateDir();
            });

            // At Sign Fix Event
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

            // Inputs
            [faFontInput, enFontInput, codeFontInput, lhInput, fsInput].forEach(inp => {
                inp.addEventListener('input', () => {
                    saveConfig();
                    updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
                });
            });

            lhResetBtn.addEventListener('click', () => {
                lhInput.value = '1.6';
                saveConfig();
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
            });

            fsResetBtn.addEventListener('click', () => {
                fsInput.value = '16';
                saveConfig();
                updateDynamicCSS(faFontInput.value.trim(), enFontInput.value.trim(), codeFontInput.value.trim(), lhInput.value, fsInput.value, sidebarWidth, userMsgTheme);
            });
        `).catch(err => console.error('Failed to inject RTL features:', err));
    } catch(e) {
        console.error('Failed to read offline font', e);
    }
});
