/**
 * Antigravity RTL Client-Side Script for Antigravity IDE
 * Injected into workbench window
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
                // Strict LTR alignment when user explicitly disables RTL
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

        function el(tag, styles, children, attrs) {
            const element = document.createElement(tag);
            if (styles) element.style.cssText = styles;
            if (attrs) {
                for (const [k, v] of Object.entries(attrs)) {
                    if (k === 'id') element.id = v;
                    else if (k === 'type') element.type = v;
                    else if (k === 'title') element.title = v;
                    else if (k === 'value') element.value = v;
                    else if (k === 'placeholder') element.placeholder = v;
                    else if (k === 'href') element.href = v;
                    else if (k === 'target') element.target = v;
                    else if (k === 'min') element.min = v;
                    else if (k === 'max') element.max = v;
                    else if (k === 'step') element.step = v;
                    else element.setAttribute(k, v);
                }
            }
            if (children) {
                if (typeof children === 'string') {
                    element.textContent = children;
                } else if (Array.isArray(children)) {
                    for (const child of children) {
                        if (child) element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
                    }
                } else {
                    element.appendChild(children);
                }
            }
            return element;
        }

        // Settings Panel Creation (Pure DOM - immune to Trusted Types & CSP)
        function ensureSettingsPanel() {
            let panel = document.getElementById('antigravity-rtl-settings-panel');
            if (panel) return panel;

            panel = el('div', `
                display: none;
                position: fixed;
                z-index: 100000;
                bottom: 28px;
                right: 12px;
                width: 290px;
                background: var(--vscode-editorWidget-background, #1e293b);
                color: var(--vscode-editorWidget-foreground, #f3f4f6);
                border: 1px solid var(--vscode-widget-border, #334155);
                border-radius: 12px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 12px;
                padding: 14px;
                direction: ltr;
                box-sizing: border-box;
                user-select: none;
            `, null, { id: 'antigravity-rtl-settings-panel' });

            // 1. Header
            const headerTitle = el('div', null, [
                el('span', 'font-weight:600;font-size:13px;display:block;', 'Antigravity RTL'),
                el('span', 'font-size:10px;color:var(--vscode-descriptionForeground,#94a3b8);', 'Settings & Font Control')
            ]);
            const closeBtn = el('button', 'background:none;border:none;color:inherit;cursor:pointer;font-size:16px;line-height:1;opacity:0.7;padding:4px;', '✕', { id: 'rtl-panel-close-btn', type: 'button', title: 'Close' });
            const header = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--vscode-widget-border, rgba(255,255,255,0.15));', [headerTitle, closeBtn]);
            panel.appendChild(header);

            // 2. Master Toggle
            const toggleLabel = el('span', 'font-weight:500;font-size:12px;', state.isRTL ? 'Enabled' : 'Disabled', { id: 'rtl-panel-toggle-label' });
            const masterKnob = el('span', `display:block;width:16px;height:16px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.isRTL ? '21px' : '3px'};transition:left 0.2s;`, null, { id: 'rtl-panel-master-knob' });
            const masterBtn = el('button', `cursor:pointer;width:40px;height:22px;border-radius:11px;border:none;background:${state.isRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;`, [masterKnob], { id: 'rtl-panel-master-btn', type: 'button' });
            const masterRow = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;', [toggleLabel, masterBtn]);
            panel.appendChild(masterRow);

            // 3. Panel Body
            const panelBody = el('div', `display:flex;flex-direction:column;gap:9px;opacity:${state.isRTL ? '1' : '0.4'};pointer-events:${state.isRTL ? 'auto' : 'none'};transition:opacity 0.2s;`, null, { id: 'rtl-panel-body' });

            // Force RTL Toggle
            const forceLabel = el('span', 'font-size:11px;color:var(--vscode-descriptionForeground,#94a3b8);', 'Force RTL', { title: 'Force conversation text to RTL direction' });
            const forceKnob = el('span', `display:block;width:12px;height:12px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.forceRTL ? '19px' : '3px'};transition:left 0.2s;`, null, { id: 'rtl-panel-force-knob' });
            const forceBtn = el('button', `cursor:pointer;width:34px;height:18px;border-radius:9px;border:none;background:${state.forceRTL ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;`, [forceKnob], { id: 'rtl-panel-force-btn', type: 'button' });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;', [forceLabel, forceBtn]));

            panelBody.appendChild(el('div', 'height:1px;background:var(--vscode-widget-border,rgba(255,255,255,0.1));margin:2px 0;'));

            const inputStyle = 'width:140px;padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--vscode-input-border,#334155);background:var(--vscode-input-background,#0f172a);color:var(--vscode-input-foreground,#f3f4f6);outline:none;box-sizing:border-box;';

            // FA Font
            const faInput = el('input', inputStyle, null, { id: 'rtl-panel-fa-font', type: 'text', placeholder: 'Default: Vazirmatn', value: state.faFont });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;gap:8px;', [
                el('span', 'font-size:11px;white-space:nowrap;', 'FA Font', { title: 'Persian/Arabic Font' }),
                faInput
            ]));

            // EN Font
            const enInput = el('input', inputStyle, null, { id: 'rtl-panel-en-font', type: 'text', placeholder: 'Default: System', value: state.enFont });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;gap:8px;', [
                el('span', 'font-size:11px;white-space:nowrap;', 'EN Font', { title: 'English UI Font' }),
                enInput
            ]));

            // Code Font
            const codeInput = el('input', inputStyle, null, { id: 'rtl-panel-code-font', type: 'text', placeholder: 'Monaco, Consolas', value: state.codeFont });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;gap:8px;', [
                el('span', 'font-size:11px;white-space:nowrap;', 'Code Font', { title: 'Monaco Editor & Terminal Font' }),
                codeInput
            ]));

            // Line Height
            const lhInput = el('input', 'width:85px;cursor:pointer;', null, { id: 'rtl-panel-lh', type: 'range', min: '1.2', max: '2.5', step: '0.1', value: state.lh });
            const lhReset = el('button', 'background:none;border:none;color:inherit;opacity:0.6;cursor:pointer;padding:0;font-size:10px;', '↺', { id: 'rtl-panel-lh-reset', type: 'button', title: 'Reset to 1.6' });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;', [
                el('span', 'font-size:11px;', 'Line Height'),
                el('div', 'display:flex;align-items:center;gap:6px;', [lhInput, lhReset])
            ]));

            // Font Size
            const fsInput = el('input', 'width:85px;cursor:pointer;', null, { id: 'rtl-panel-fs', type: 'range', min: '11', max: '22', step: '1', value: state.fs });
            const fsReset = el('button', 'background:none;border:none;color:inherit;opacity:0.6;cursor:pointer;padding:0;font-size:10px;', '↺', { id: 'rtl-panel-fs-reset', type: 'button', title: 'Reset to 16px' });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;', [
                el('span', 'font-size:11px;', 'Font Size'),
                el('div', 'display:flex;align-items:center;gap:6px;', [fsInput, fsReset])
            ]));

            panelBody.appendChild(el('div', 'height:1px;background:var(--vscode-widget-border,rgba(255,255,255,0.1));margin:2px 0;'));

            // Shift+2 for @
            const atLabel = el('span', 'font-size:11px;color:var(--vscode-descriptionForeground,#94a3b8);', 'Shift+2 for @', { title: 'Type @ using Shift+2 in Persian layout' });
            const atKnob = el('span', `display:block;width:12px;height:12px;border-radius:50%;background:#ffffff;position:absolute;top:3px;left:${state.fixAtSign ? '19px' : '3px'};transition:left 0.2s;`, null, { id: 'rtl-panel-at-knob' });
            const atBtn = el('button', `cursor:pointer;width:34px;height:18px;border-radius:9px;border:none;background:${state.fixAtSign ? 'var(--vscode-button-background, #3b82f6)' : '#64748b'};position:relative;padding:0;outline:none;transition:background 0.2s;`, [atKnob], { id: 'rtl-panel-at-btn', type: 'button' });
            panelBody.appendChild(el('div', 'display:flex;align-items:center;justify-content:space-between;', [atLabel, atBtn]));

            panel.appendChild(panelBody);

            // 4. Footer
            const footerLink = el('a', 'font-size:10px;color:var(--vscode-textLink-foreground,#38bdf8);text-decoration:none;opacity:0.8;', '★ Star Antigravity RTL on GitHub', { href: 'https://github.com/mmnaderi/antigravity-rtl', target: '_blank' });
            const footer = el('div', 'margin-top:10px;padding-top:8px;border-top:1px solid var(--vscode-widget-border,rgba(255,255,255,0.1));text-align:center;', [footerLink]);
            panel.appendChild(footer);

            document.body.appendChild(panel);

            // Bind events
            closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
            masterBtn.addEventListener('click', () => { setRTLActive(!state.isRTL); });
            forceBtn.addEventListener('click', () => {
                state.forceRTL = !state.forceRTL;
                saveConfig();
                updateUI();
            });
            atBtn.addEventListener('click', () => {
                state.fixAtSign = !state.fixAtSign;
                saveConfig();
                updateUI();
            });

            faInput.addEventListener('input', (e) => {
                state.faFont = e.target.value.trim();
                saveConfig();
                updateDynamicCSS();
            });
            enInput.addEventListener('input', (e) => {
                state.enFont = e.target.value.trim();
                saveConfig();
                updateDynamicCSS();
            });
            codeInput.addEventListener('input', (e) => {
                state.codeFont = e.target.value.trim();
                saveConfig();
                updateDynamicCSS();
            });
            lhInput.addEventListener('input', (e) => {
                state.lh = e.target.value;
                saveConfig();
                updateDynamicCSS();
            });
            lhReset.addEventListener('click', () => {
                state.lh = '1.6';
                lhInput.value = '1.6';
                saveConfig();
                updateDynamicCSS();
            });
            fsInput.addEventListener('input', (e) => {
                state.fs = e.target.value;
                saveConfig();
                updateDynamicCSS();
            });
            fsReset.addEventListener('click', () => {
                state.fs = '16';
                fsInput.value = '16';
                saveConfig();
                updateDynamicCSS();
            });

            return panel;
        }

        function toggleSettingsPanel() {
            const panel = ensureSettingsPanel();
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
            } else {
                updateUI();
                panel.style.display = 'block';
            }
        }

        function updateUI() {
            updateDynamicCSS();
            updateDir();

            // Update Status Bar Item
            const statusLink = document.getElementById('antigravity-rtl-statusbar-link') || document.getElementById('antigravity-rtl-statusbar-btn');
            if (statusLink) {
                statusLink.textContent = state.isRTL ? '⇄ RTL: On' : '⇄ RTL: Off';
                statusLink.style.color = state.isRTL ? '#38bdf8' : 'inherit';
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

            const faInput = document.getElementById('rtl-panel-fa-font');
            if (faInput && document.activeElement !== faInput) faInput.value = state.faFont || '';
            const enInput = document.getElementById('rtl-panel-en-font');
            if (enInput && document.activeElement !== enInput) enInput.value = state.enFont || '';
            const codeInput = document.getElementById('rtl-panel-code-font');
            if (codeInput && document.activeElement !== codeInput) codeInput.value = state.codeFont || '';
            const lhInput = document.getElementById('rtl-panel-lh');
            if (lhInput && document.activeElement !== lhInput) lhInput.value = state.lh;
            const fsInput = document.getElementById('rtl-panel-fs');
            if (fsInput && document.activeElement !== fsInput) fsInput.value = state.fs;
        }

        function setRTLActive(active) {
            state.isRTL = active;
            saveConfig();
            updateUI();
        }

        // Clean up any remnants from previous chat header experiments
        function cleanupOldChatButtons() {
            const oldGroup = document.getElementById('antigravity-rtl-btn-group');
            if (oldGroup) oldGroup.remove();
            const oldBtn = document.getElementById('antigravity-chat-rtl-header-btn');
            if (oldBtn) oldBtn.remove();
            const oldGear = document.getElementById('antigravity-chat-rtl-gear-btn');
            if (oldGear) oldGear.remove();
        }

        function getStatusBarTarget() {
            return document.querySelector('.part.statusbar .right-items') || 
                   document.querySelector('.part.statusbar .items-container.right-items') ||
                   document.querySelector('[id="workbench.parts.statusbar"] .right-items') ||
                   document.querySelector('.part.statusbar') ||
                   document.querySelector('[id="workbench.parts.statusbar"]');
        }

        // Insert VS Code Status Bar Item (Right side)
        function tryInsertStatusBarItem() {
            cleanupOldChatButtons();

            const statusBar = getStatusBarTarget();
            if (!statusBar) return;

            let statusItem = document.getElementById('antigravity-rtl-statusbar-btn');
            if (!statusItem) {
                statusItem = document.createElement('a');
                statusItem.id = 'antigravity-rtl-statusbar-btn';
                statusItem.className = 'statusbar-item right';
                statusItem.href = '#';
                statusItem.style.cssText = `
                    cursor: pointer !important;
                    padding: 0 8px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 11px !important;
                    height: 100% !important;
                    line-height: 22px !important;
                    user-select: none !important;
                    text-decoration: none !important;
                    white-space: nowrap !important;
                    color: ${state.isRTL ? '#38bdf8' : 'inherit'} !important;
                    opacity: 0.95;
                    box-sizing: border-box !important;
                `;
                statusItem.title = 'Antigravity RTL (Click to open settings, Alt+R to toggle)';
                statusItem.textContent = state.isRTL ? '⇄ RTL: On' : '⇄ RTL: Off';

                statusItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSettingsPanel();
                });

                statusItem.addEventListener('mouseenter', () => {
                    statusItem.style.backgroundColor = 'var(--vscode-statusBarItem-hoverBackground, rgba(255,255,255,0.12))';
                });
                statusItem.addEventListener('mouseleave', () => {
                    statusItem.style.backgroundColor = 'transparent';
                });

                if (statusBar.firstChild) {
                    statusBar.insertBefore(statusItem, statusBar.firstChild);
                } else {
                    statusBar.appendChild(statusItem);
                }
            } else {
                if (statusItem.parentElement !== statusBar) {
                    if (statusBar.firstChild) {
                        statusBar.insertBefore(statusItem, statusBar.firstChild);
                    } else {
                        statusBar.appendChild(statusItem);
                    }
                } else if (statusBar.firstChild !== statusItem) {
                    statusBar.insertBefore(statusItem, statusBar.firstChild);
                }
            }
        }

        // Outside click & Escape to close settings panel
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('antigravity-rtl-settings-panel');
            const statusItem = document.getElementById('antigravity-rtl-statusbar-btn');
            if (panel && panel.style.display === 'block') {
                if (panel.contains(e.target)) return;
                if (statusItem && (statusItem === e.target || statusItem.contains(e.target))) return;
                panel.style.display = 'none';
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

        // Throttled dynamic UI updater
        let domUpdateTimer = null;
        let isUpdatingDOM = false;

        function scheduleDOMUpdate() {
            if (domUpdateTimer) return;
            domUpdateTimer = setTimeout(() => {
                domUpdateTimer = null;
                if (isUpdatingDOM) return;
                isUpdatingDOM = true;
                try {
                    updateDir();
                    tryInsertStatusBarItem();
                } finally {
                    isUpdatingDOM = false;
                }
            }, 400);
        }

        document.body.addEventListener('input', scheduleDOMUpdate, { capture: true });
        document.body.addEventListener('focusin', scheduleDOMUpdate, { capture: true });

        const observer = new MutationObserver((mutations) => {
            if (isUpdatingDOM) return;
            let hasExternal = false;
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!node.id || (!node.id.startsWith('antigravity-rtl') && node.id !== 'antigravity-chat-rtl-header-btn')) {
                        hasExternal = true;
                        break;
                    }
                }
                if (hasExternal) break;
            }
            if (hasExternal) {
                scheduleDOMUpdate();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial run
        updateUI();
        tryInsertStatusBarItem();

        // Startup retry loop ensures insertion when workbench statusbar appears
        let initRetries = 0;
        const initInterval = setInterval(() => {
            initRetries++;
            tryInsertStatusBarItem();
            const btn = document.getElementById('antigravity-rtl-statusbar-btn');
            const target = getStatusBarTarget();
            if (btn && target && btn.parentElement === target && target.classList.contains('right-items')) {
                if (initRetries > 8) {
                    clearInterval(initInterval);
                }
            }
            if (initRetries >= 25) {
                clearInterval(initInterval);
            }
        }, 300);

    } catch (e) {
        console.error('[Antigravity RTL Client Error]', e);
    }
})();
