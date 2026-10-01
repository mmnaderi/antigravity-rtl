/**
 * Antigravity RTL Client-Side Script for Antigravity IDE
 * Injected into workbench and jetski agent windows
 */
(function() {
    try {
        if (window.__antigravity_rtl_injected) return;
        window.__antigravity_rtl_injected = true;

    const fontBase64 = '__FONT_BASE64__';
    const rtlConfig = __RTL_CONFIG__;

    // In-memory reactive state
    const state = {
        isRTL: rtlConfig.isRTL !== false,
        forceRTL: Boolean(rtlConfig.forceRTL),
        fixAtSign: rtlConfig.fixAtSign !== false,
        faFont: rtlConfig.faFont || '',
        enFont: rtlConfig.enFont || '',
        codeFont: rtlConfig.codeFont || '',
        lh: rtlConfig.lh || '1.6',
        fs: rtlConfig.fs || '16'
    };

    // Style elements
    let rtlStyle = document.getElementById('antigravity-rtl-style');
    if (!rtlStyle) {
        rtlStyle = document.createElement('style');
        rtlStyle.id = 'antigravity-rtl-style';
        document.head.appendChild(rtlStyle);
    }

    let disabledStyle = document.getElementById('antigravity-rtl-disabled-style');
    if (!disabledStyle) {
        disabledStyle = document.createElement('style');
        disabledStyle.id = 'antigravity-rtl-disabled-style';
        document.head.appendChild(disabledStyle);
    }

    function updateDynamicCSS() {
        if (!state.isRTL) {
            rtlStyle.textContent = '';
            // Force strict LTR alignment when user explicitly disables RTL
            disabledStyle.textContent = `
                [data-testid="conversation-view"] p,
                [data-testid="conversation-view"] li,
                [data-testid="conversation-view"] span,
                .prose p, .prose li, .prose span,
                .markdown-body p, .markdown-body li,
                [data-testid="chat-message"] p,
                .leading-relaxed, .leading-relaxed p,
                [contenteditable="true"], [contenteditable="true"] p {
                    direction: ltr !important;
                    text-align: left !important;
                    unicode-bidi: normal !important;
                }
            `;
            return;
        }

        disabledStyle.textContent = '';

        let faFontRule = '';
        let faFontName = "'PersianOnlyFont'";

        if (state.faFont) {
            faFontName = "'UserPersianFont', 'PersianOnlyFont'";
            const baseFaFont = state.faFont.replace(/[-\s]?Regular$/i, '');
            faFontRule = `
                @font-face {
                    font-family: 'UserPersianFont';
                    src: local('${state.faFont}'), local('${baseFaFont}');
                    font-weight: 400;
                    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                }
                @font-face {
                    font-family: 'UserPersianFont';
                    src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'), local('${baseFaFont}Bold');
                    font-weight: 700;
                    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                }
            `;
        }

        const enFontStr = state.enFont ? `'${state.enFont}', ui-sans-serif, system-ui, sans-serif` : 'ui-sans-serif, system-ui, sans-serif';
        const fontStack = `${faFontName}, 'Vazirmatn', ${enFontStr}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
        const codeFontRule = state.codeFont ? `font-family: '${state.codeFont}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;` : '';

        const forceRtlStyle = state.forceRTL ? `
            .prose > *:not(pre):not(code), 
            [data-testid="chat-message"] > *:not(pre):not(code), 
            .markdown-body > *:not(pre):not(code), 
            .leading-relaxed > *:not(pre):not(code),
            [data-testid="user-input-step"],
            [data-testid="user-input-step"] > *:not(pre):not(code),
            div:has(> [role="radiogroup"]),
            label[for^="ask-opt-"],
            [data-testid="conversation-view"] > *:not(pre):not(code) {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
        ` : '';

        rtlStyle.textContent = `
            ${faFontRule}
            @font-face {
                font-family: 'PersianOnlyFont';
                src: local('Vazirmatn'), local('Vazirmatn Variable'), local('Vazir'),
                     url('./Vazirmatn-Variable.woff2') format('woff2'),
                     url('../../../../Vazirmatn-Variable.woff2') format('woff2'),
                     url('data:font/woff2;base64,${fontBase64}') format('woff2');
                font-weight: 100 900;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Vazirmatn';
                src: local('Vazirmatn'), local('Vazirmatn Variable'), local('Vazir'),
                     url('./Vazirmatn-Variable.woff2') format('woff2'),
                     url('../../../../Vazirmatn-Variable.woff2') format('woff2'),
                     url('data:font/woff2;base64,${fontBase64}') format('woff2');
                font-weight: 100 900;
            }

            :root {
                --vscode-chat-font-family: ${fontStack} !important;
            }
            :root, :host, html, body {
                font-family: ${fontStack} !important;
            }

            /* Apply Vazirmatn font to conversation and text elements */
            [dir="rtl"],
            [dir="rtl"] *:not(.codicon):not([class*="codicon-"]):not(.google-symbols):not(pre):not(code):not(.monaco-editor):not(.monaco-editor *),
            [data-testid="conversation-view"] p,
            [data-testid="conversation-view"] li,
            [data-testid="conversation-view"] span,
            [data-testid="conversation-view"] h1,
            [data-testid="conversation-view"] h2,
            [data-testid="conversation-view"] h3,
            [data-testid="conversation-view"] h4,
            [data-testid="conversation-view"] [contenteditable="true"],
            .leading-relaxed,
            .leading-relaxed p,
            .leading-relaxed li,
            .leading-relaxed span,
            .rendered-markdown,
            .rendered-markdown p,
            .rendered-markdown li,
            .rendered-markdown span,
            .prose,
            .prose p,
            .prose li,
            .markdown-body,
            .markdown-body p,
            .markdown-body li,
            [data-testid="chat-message"],
            [data-testid="chat-message"] p,
            [data-testid="user-input-step"],
            [data-testid="user-input-step"] *,
            [contenteditable="true"],
            [contenteditable="true"] p,
            [contenteditable="true"] span,
            [data-lexical-text="true"],
            label[for^="ask-opt-"],
            textarea[data-testid="ask-question-writein"] {
                font-family: ${fontStack} !important;
            }

            .prose, [data-testid="chat-message"], .markdown-body, .leading-relaxed, [contenteditable="true"], [contenteditable="true"] p, [data-testid="conversation-view"] {
                font-size: ${state.fs}px !important;
            }

            p, h1, h2, h3, h4, h5, h6, ul, ol {
                unicode-bidi: plaintext;
                text-align: start;
            }
            .prose > *, [data-testid="chat-message"] > *, .markdown-body > *, [data-testid="conversation-view"] * {
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

            ${forceRtlStyle}

            /* RTL List Padding Fix */
            ul:not(#_)[dir="rtl"], ol:not(#_)[dir="rtl"],
            [dir="rtl"] ul:not(#_), [dir="rtl"] ol:not(#_) {
                padding-left: 0 !important;
                padding-right: 1.25rem !important;
            }

            /* Thinking Blocks (Keep LTR) */
            .cursor-edit.text-secondary-foreground,
            .cursor-edit.text-secondary-foreground * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            /* AI Response & Chat Line Height */
            .leading-relaxed,
            .prose p, .prose li, .markdown-body p, [data-testid="chat-message"] p,
            [data-testid="chat-message"] .leading-relaxed, [data-testid="user-input-step"],
            [data-testid="user-input-step"] div, [data-lexical-text="true"],
            [contenteditable="true"], [contenteditable="true"] p,
            label[for^="ask-opt-"], [data-testid="conversation-view"] p {
                line-height: ${state.lh} !important;
            }

            [contenteditable="true"], [contenteditable="true"] * {
                unicode-bidi: isolate !important;
                text-align: start !important;
            }

            /* Protect icon fonts from override */
            .codicon, [class*="codicon-"] {
                font-family: codicon !important;
            }
            .google-symbols {
                font-family: "Google Symbols" !important;
            }

            /* Strict Protection & Custom Font for Monaco Code Editor, Diff Editor, and Terminal */
            pre, code, pre *, code *,
            .monaco-editor, .monaco-editor *,
            .monaco-diff-editor, .monaco-diff-editor *,
            .part.terminal, .part.terminal *,
            .terminal-wrapper, .terminal-wrapper *,
            .xterm, .xterm * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: normal !important;
                ${codeFontRule}
            }
        `;
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('resize'));
        }
    }

    function saveConfig() {
        try {
            const payload = JSON.stringify(state);
            console.log("SAVE_RTL_CONFIG|" + payload);
        } catch (e) {
            console.error('[Antigravity RTL] Save config error:', e);
        }
    }

    // Input & DOM Direction Logic
    function updateDir() {
        if (!state.isRTL) {
            document.querySelectorAll(`
                .prose > *, [data-testid="chat-message"] > *, .markdown-body > *,
                .leading-relaxed > *, [data-testid="conversation-view"] p, [data-testid="conversation-view"] li,
                [contenteditable="true"], [contenteditable="true"] p
            `).forEach(el => {
                if (el.getAttribute('dir') !== 'ltr') el.setAttribute('dir', 'ltr');
            });
            return;
        }

        // Editable inputs
        document.querySelectorAll('[contenteditable="true"] p, [contenteditable="true"], textarea[data-testid="ask-question-writein"]').forEach(el => {
            const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
            const text = (raw || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            if (text.length > 0) {
                const isRtlText = /^[^a-zA-Z]*[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);
                const newDir = isRtlText ? 'rtl' : 'ltr';
                if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
            } else {
                if (el.hasAttribute('dir')) el.removeAttribute('dir');
            }
        });

        // Chat Output, Conversation View & Options
        document.querySelectorAll(`
            .prose > *, 
            [data-testid="chat-message"] > *, 
            .markdown-body > *, 
            .leading-relaxed > *,
            [data-testid="user-input-step"],
            [data-testid="user-input-step"] > *,
            [data-testid="conversation-view"] p,
            [data-testid="conversation-view"] li,
            div:has(> [role="radiogroup"]),
            label[for^="ask-opt-"]
        `).forEach(el => {
            if (el.tagName === 'PRE' || el.tagName === 'CODE' || el.closest('.monaco-editor') || el.closest('.terminal')) return;

            const text = (el.textContent || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            let dir = 'auto';

            if (state.forceRTL) {
                dir = 'rtl';
            } else if (text) {
                const firstChar = text.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/);
                if (firstChar) {
                    const isPersianOrArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(firstChar[0]);
                    dir = isPersianOrArabic ? 'rtl' : 'ltr';
                }
            }

            if (el.getAttribute('dir') !== dir) {
                el.setAttribute('dir', dir);
            }
        });
    }

    // Settings Panel Creation
    function ensureSettingsPanel() {
        let panel = document.getElementById('antigravity-rtl-settings-panel');
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = 'antigravity-rtl-settings-panel';
        panel.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000000;
            width: 290px;
            background: var(--vscode-editorWidget-background, #1e293b);
            color: var(--vscode-editorWidget-foreground, #f3f4f6);
            border: 1px solid var(--vscode-widget-border, #334155);
            border-radius: 12px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            padding: 14px;
            direction: ltr;
            box-sizing: border-box;
            user-select: none;
        `;

        panel.innerHTML = `
            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--vscode-widget-border, rgba(255,255,255,0.15));">
                <div>
                    <span style="font-weight:600;font-size:13px;display:block;">Antigravity RTL</span>
                    <span style="font-size:10px;color:var(--vscode-descriptionForeground,#94a3b8);">IDE Settings</span>
                </div>
                <button id="rtl-panel-close-btn" type="button" style="background:none;border:none;color:inherit;cursor:pointer;font-size:16px;line-height:1;opacity:0.7;padding:4px;" title="Close">✕</button>
            </div>

            <!-- Master Toggle -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span id="rtl-panel-toggle-label" style="font-weight:500;font-size:12px;">${state.isRTL ? 'Enabled' : 'Disabled'}</span>
                <button id="rtl-panel-master-btn" type="button" style="cursor:pointer;width:40px;height:22px;border-radius:11px;border:none;background:${state.isRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;">
                    <span id="rtl-panel-master-knob" style="display:block;width:16px;height:16px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.isRTL ? '21px' : '3px'};transition:left 0.2s;"></span>
                </button>
            </div>

            <div id="rtl-panel-body" style="display:flex;flex-direction:column;gap:9px;opacity:${state.isRTL ? '1' : '0.4'};pointer-events:${state.isRTL ? 'auto' : 'none'};transition:opacity 0.2s;">
                <!-- Force RTL Toggle -->
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:11px;color:var(--vscode-descriptionForeground,#94a3b8);" title="Force conversation text to RTL direction">Force RTL</span>
                    <button id="rtl-panel-force-btn" type="button" style="cursor:pointer;width:34px;height:18px;border-radius:9px;border:none;background:${state.forceRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;">
                        <span id="rtl-panel-force-knob" style="display:block;width:12px;height:12px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.forceRTL ? '19px' : '3px'};transition:left 0.2s;"></span>
                    </button>
                </div>

                <div style="height:1px;background:var(--vscode-widget-border,rgba(255,255,255,0.1));margin:2px 0;"></div>

                <!-- FA/AR Font -->
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <span style="font-size:11px;white-space:nowrap;" title="Persian/Arabic Font">FA Font</span>
                    <input id="rtl-panel-fa-font" type="text" placeholder="Default: Vazirmatn" value="${state.faFont}" style="width:140px;padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--vscode-input-border,#334155);background:var(--vscode-input-background,#0f172a);color:var(--vscode-input-foreground,#f3f4f6);outline:none;">
                </div>

                <!-- EN Font -->
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <span style="font-size:11px;white-space:nowrap;" title="English UI Font">EN Font</span>
                    <input id="rtl-panel-en-font" type="text" placeholder="Default: System" value="${state.enFont}" style="width:140px;padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--vscode-input-border,#334155);background:var(--vscode-input-background,#0f172a);color:var(--vscode-input-foreground,#f3f4f6);outline:none;">
                </div>

                <!-- Code / Terminal Font -->
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <span style="font-size:11px;white-space:nowrap;" title="Monaco Editor & Terminal Font">Code Font</span>
                    <input id="rtl-panel-code-font" type="text" placeholder="Monaco, Consolas" value="${state.codeFont}" style="width:140px;padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--vscode-input-border,#334155);background:var(--vscode-input-background,#0f172a);color:var(--vscode-input-foreground,#f3f4f6);outline:none;">
                </div>

                <!-- Line Height -->
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:11px;">Line Height</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <input id="rtl-panel-lh" type="range" min="1.2" max="2.5" step="0.1" value="${state.lh}" style="width:85px;cursor:pointer;">
                        <button id="rtl-panel-lh-reset" type="button" style="background:none;border:none;color:inherit;opacity:0.6;cursor:pointer;padding:0;font-size:10px;" title="Reset to 1.6">↺</button>
                    </div>
                </div>

                <!-- Font Size -->
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:11px;">Font Size</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <input id="rtl-panel-fs" type="range" min="11" max="22" step="1" value="${state.fs}" style="width:85px;cursor:pointer;">
                        <button id="rtl-panel-fs-reset" type="button" style="background:none;border:none;color:inherit;opacity:0.6;cursor:pointer;padding:0;font-size:10px;" title="Reset to 16px">↺</button>
                    </div>
                </div>

                <div style="height:1px;background:var(--vscode-widget-border,rgba(255,255,255,0.1));margin:2px 0;"></div>

                <!-- Shift + 2 for @ -->
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:11px;color:var(--vscode-descriptionForeground,#94a3b8);" title="Type @ using Shift+2 in Persian layout">Shift+2 for @</span>
                    <button id="rtl-panel-at-btn" type="button" style="cursor:pointer;width:34px;height:18px;border-radius:9px;border:none;background:${state.fixAtSign ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;">
                        <span id="rtl-panel-at-knob" style="display:block;width:12px;height:12px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.fixAtSign ? '19px' : '3px'};transition:left 0.2s;"></span>
                    </button>
                </div>
            </div>

            <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--vscode-widget-border,rgba(255,255,255,0.1));text-align:center;">
                <a href="https://github.com/mmnaderi/antigravity-rtl" target="_blank" style="font-size:10px;color:var(--vscode-textLink-foreground,#38bdf8);text-decoration:none;opacity:0.8;">★ Star Antigravity RTL on GitHub</a>
            </div>
        `;

        document.body.appendChild(panel);

        // Bind panel events
        const closeBtn = document.getElementById('rtl-panel-close-btn');
        closeBtn?.addEventListener('click', () => { panel.style.display = 'none'; });

        const masterBtn = document.getElementById('rtl-panel-master-btn');
        masterBtn?.addEventListener('click', () => { setRTLActive(!state.isRTL); });

        const forceBtn = document.getElementById('rtl-panel-force-btn');
        forceBtn?.addEventListener('click', () => {
            state.forceRTL = !state.forceRTL;
            saveConfig();
            updateUI();
        });

        const atBtn = document.getElementById('rtl-panel-at-btn');
        atBtn?.addEventListener('click', () => {
            state.fixAtSign = !state.fixAtSign;
            saveConfig();
            updateUI();
        });

        const faInput = document.getElementById('rtl-panel-fa-font');
        faInput?.addEventListener('input', (e) => {
            state.faFont = e.target.value.trim();
            saveConfig();
            updateDynamicCSS();
        });

        const enInput = document.getElementById('rtl-panel-en-font');
        enInput?.addEventListener('input', (e) => {
            state.enFont = e.target.value.trim();
            saveConfig();
            updateDynamicCSS();
        });

        const codeInput = document.getElementById('rtl-panel-code-font');
        codeInput?.addEventListener('input', (e) => {
            state.codeFont = e.target.value.trim();
            saveConfig();
            updateDynamicCSS();
        });

        const lhInput = document.getElementById('rtl-panel-lh');
        lhInput?.addEventListener('input', (e) => {
            state.lh = e.target.value;
            saveConfig();
            updateDynamicCSS();
        });

        const lhReset = document.getElementById('rtl-panel-lh-reset');
        lhReset?.addEventListener('click', () => {
            state.lh = '1.6';
            if (lhInput) lhInput.value = '1.6';
            saveConfig();
            updateDynamicCSS();
        });

        const fsInput = document.getElementById('rtl-panel-fs');
        fsInput?.addEventListener('input', (e) => {
            state.fs = e.target.value;
            saveConfig();
            updateDynamicCSS();
        });

        const fsReset = document.getElementById('rtl-panel-fs-reset');
        fsReset?.addEventListener('click', () => {
            state.fs = '16';
            if (fsInput) fsInput.value = '16';
            saveConfig();
            updateDynamicCSS();
        });

        return panel;
    }

    function toggleSettingsPanel(anchorElement) {
        const panel = ensureSettingsPanel();
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';

        if (anchorElement && anchorElement.getBoundingClientRect) {
            const rect = anchorElement.getBoundingClientRect();
            // If anchor is near bottom (e.g. status bar):
            if (rect.top > window.innerHeight / 2) {
                panel.style.bottom = Math.max(10, window.innerHeight - rect.top + 6) + 'px';
                panel.style.top = 'auto';
                panel.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 310)) + 'px';
                panel.style.right = 'auto';
            } else {
                // Near top (e.g. chat header):
                panel.style.top = (rect.bottom + 6) + 'px';
                panel.style.bottom = 'auto';
                panel.style.right = Math.max(10, window.innerWidth - rect.right) + 'px';
                panel.style.left = 'auto';
            }
        } else {
            panel.style.top = '50px';
            panel.style.right = '20px';
        }
    }

    function updateUI() {
        updateDynamicCSS();
        updateDir();

        // Update Chat Header Button
        const headerBtn = document.getElementById('antigravity-chat-rtl-header-btn');
        if (headerBtn) {
            headerBtn.style.color = state.isRTL ? '#38bdf8' : 'inherit';
            headerBtn.style.opacity = state.isRTL ? '1' : '0.45';
            headerBtn.title = `Antigravity RTL: ${state.isRTL ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}`;
        }

        // Update Status Bar Item
        const statusItem = document.getElementById('antigravity-rtl-statusbar-btn');
        if (statusItem) {
            statusItem.textContent = state.isRTL ? '⇄ RTL: On' : '⇄ RTL: Off';
            statusItem.style.color = state.isRTL ? '#38bdf8' : 'inherit';
        }

        // Update Panel State
        const toggleLabel = document.getElementById('rtl-panel-toggle-label');
        if (toggleLabel) toggleLabel.textContent = state.isRTL ? 'Enabled' : 'Disabled';

        const masterBtn = document.getElementById('rtl-panel-master-btn');
        const masterKnob = document.getElementById('rtl-panel-master-knob');
        if (masterBtn && masterKnob) {
            masterBtn.style.background = state.isRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b';
            masterKnob.style.left = state.isRTL ? '21px' : '3px';
        }

        const panelBody = document.getElementById('rtl-panel-body');
        if (panelBody) {
            panelBody.style.opacity = state.isRTL ? '1' : '0.4';
            panelBody.style.pointerEvents = state.isRTL ? 'auto' : 'none';
        }

        const forceBtn = document.getElementById('rtl-panel-force-btn');
        const forceKnob = document.getElementById('rtl-panel-force-knob');
        if (forceBtn && forceKnob) {
            forceBtn.style.background = state.forceRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b';
            forceKnob.style.left = state.forceRTL ? '19px' : '3px';
        }

        const atBtn = document.getElementById('rtl-panel-at-btn');
        const atKnob = document.getElementById('rtl-panel-at-knob');
        if (atBtn && atKnob) {
            atBtn.style.background = state.fixAtSign ? 'var(--vscode-button-background, #3b82f6)' : '#64748b';
            atKnob.style.left = state.fixAtSign ? '19px' : '3px';
        }
    }

    function setRTLActive(active) {
        state.isRTL = active;
        saveConfig();
        updateUI();
    }

    // Insert Chat Header Buttons (Toggle + Settings Gear)
    function tryInsertChatHeaderButtons() {
        const newChatBtn = document.querySelector('a[data-tooltip-id="new-conversation-tooltip"]');
        if (!newChatBtn || !newChatBtn.parentElement) return;

        // 1. Toggle Button
        if (!document.getElementById('antigravity-chat-rtl-header-btn')) {
            const toggleBtn = document.createElement('a');
            toggleBtn.id = 'antigravity-chat-rtl-header-btn';
            toggleBtn.className = newChatBtn.className.replace(/cursor-not-allowed|opacity-\d+/g, '').trim();
            toggleBtn.href = '#';
            toggleBtn.textContent = '⇄';
            toggleBtn.style.margin = '0 2px';
            toggleBtn.style.display = 'inline-flex';
            toggleBtn.style.alignItems = 'center';
            toggleBtn.style.justifyContent = 'center';
            toggleBtn.style.fontWeight = 'bold';
            toggleBtn.style.fontSize = '14px';
            toggleBtn.style.cursor = 'pointer';
            toggleBtn.style.userSelect = 'none';

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setRTLActive(!state.isRTL);
            });

            newChatBtn.parentElement.insertBefore(toggleBtn, newChatBtn.nextSibling);
        }

        // 2. Settings Gear Button
        if (!document.getElementById('antigravity-chat-rtl-gear-btn')) {
            const toggleBtn = document.getElementById('antigravity-chat-rtl-header-btn');
            const gearBtn = document.createElement('a');
            gearBtn.id = 'antigravity-chat-rtl-gear-btn';
            gearBtn.className = newChatBtn.className.replace(/cursor-not-allowed|opacity-\d+/g, '').trim();
            gearBtn.href = '#';
            gearBtn.innerHTML = '⚙';
            gearBtn.title = 'Antigravity RTL Settings';
            gearBtn.style.margin = '0 2px';
            gearBtn.style.display = 'inline-flex';
            gearBtn.style.alignItems = 'center';
            gearBtn.style.justifyContent = 'center';
            gearBtn.style.fontSize = '12px';
            gearBtn.style.opacity = '0.75';
            gearBtn.style.cursor = 'pointer';
            gearBtn.style.userSelect = 'none';

            gearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSettingsPanel(gearBtn);
            });

            if (toggleBtn && toggleBtn.nextSibling) {
                toggleBtn.parentElement.insertBefore(gearBtn, toggleBtn.nextSibling);
            } else if (toggleBtn) {
                toggleBtn.parentElement.appendChild(gearBtn);
            }
        }

        updateUI();
    }

    // Insert VS Code Status Bar Item
    function tryInsertStatusBarItem() {
        if (document.getElementById('antigravity-rtl-statusbar-btn')) return;

        const statusBar = document.querySelector('.part.statusbar .left-items') || 
                          document.querySelector('.part.statusbar') || 
                          document.querySelector('footer');
        if (!statusBar) return;

        const statusItem = document.createElement('div');
        statusItem.id = 'antigravity-rtl-statusbar-btn';
        statusItem.className = 'statusbar-item left';
        statusItem.style.cssText = `
            cursor: pointer;
            padding: 0 8px;
            display: inline-flex;
            align-items: center;
            font-size: 11px;
            height: 100%;
            user-select: none;
        `;
        statusItem.title = 'Antigravity RTL (Click to toggle, right-click for settings)';

        statusItem.addEventListener('click', () => {
            setRTLActive(!state.isRTL);
        });

        statusItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSettingsPanel(statusItem);
        });

        statusBar.appendChild(statusItem);
        updateUI();
    }

    // Outside click & Escape to close settings panel
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('antigravity-rtl-settings-panel');
        const gearBtn = document.getElementById('antigravity-chat-rtl-gear-btn');
        if (panel && panel.style.display === 'block') {
            if (!panel.contains(e.target) && e.target !== gearBtn && !gearBtn?.contains(e.target)) {
                panel.style.display = 'none';
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const panel = document.getElementById('antigravity-rtl-settings-panel');
            if (panel && panel.style.display === 'block') {
                panel.style.display = 'none';
            }
        }
    });

    // Keyboard layout shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + R to toggle RTL
        if (e.altKey && e.code === 'KeyR') {
            e.preventDefault();
            setRTLActive(!state.isRTL);
        }
    });

    // Persian Keyboard Shift + 2 fix for @
    document.addEventListener('keydown', (e) => {
        if (!state.fixAtSign) return;
        if (e.code === 'Digit2' && e.shiftKey) {
            if (e.key === '٬' || e.key === '،') {
                e.preventDefault();
                document.execCommand('insertText', false, '@');
            }
        }
    }, { capture: true });

    // Observers and intervals for dynamic UI
    document.body.addEventListener('input', updateDir, { capture: true });
    document.body.addEventListener('focusin', updateDir, { capture: true });

    const observer = new MutationObserver(() => {
        updateDir();
        tryInsertChatHeaderButtons();
        tryInsertStatusBarItem();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        updateDir();
        tryInsertChatHeaderButtons();
        tryInsertStatusBarItem();
    }, 600);

    // Initial run
    updateUI();
    tryInsertChatHeaderButtons();
    tryInsertStatusBarItem();
    } catch (e) {
        console.error('[Antigravity RTL Client Error]', e);
    }
})();
