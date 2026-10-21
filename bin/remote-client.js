/**
 * RTL for the Remote Control iframe. Extension only.
 */
(function () {
    if (window.__antigravity_rtl_injected) return;
    if (!document.getElementById('root')) return;
    window.__antigravity_rtl_injected = true;

    // ponytail: selectors match jetski 2.23. Add one when a bubble renders without dir.
    const BLOCKS = '.leading-relaxed > *, [data-testid="conversation-view"] p, [data-testid="conversation-view"] li, [data-testid="user-input-step"], [data-testid="user-input-step"] > *, label[for^="ask-opt-"]';
    const INPUTS = '[contenteditable="true"], [contenteditable="true"] p, textarea[data-testid="ask-question-writein"]';
    let isRTL = true;

    const style = document.createElement('style');
    style.id = 'antigravity-rtl-style';
    document.head.appendChild(style);

    const RTL_CHAR_RE = /(?=[\p{Script_Extensions=Arabic}\p{Script_Extensions=Hebrew}])\p{Letter}/gu;
    const LATIN_CHAR_RE = /(?=\p{Script=Latin})\p{Letter}/gu;

    function isRtl(text) {
        if (!text) return false;
        const withoutCodeAndUrls = text
            .replace(/https?:\/\/\S+/gi, ' ')
            .replace(/\x60[^\x60]+\x60/g, ' ');
        const clean = withoutCodeAndUrls.replace(/[\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, ' ').trim();
        if (!clean) return false;
        const rtlCount = (clean.match(RTL_CHAR_RE) || []).length;
        if (!rtlCount) return false;
        const latinCount = (clean.match(LATIN_CHAR_RE) || []).length;
        return rtlCount > latinCount * 0.4;
    }

    function textDir(text) {
        return isRtl(text) ? 'rtl' : 'ltr';
    }

    function setDir(el, dir) {
        if (dir == null) {
            if (el.hasAttribute('dir')) el.removeAttribute('dir');
        } else if (el.getAttribute('dir') !== dir) {
            el.setAttribute('dir', dir);
        }
    }

    function css() {
        const font = chrome.runtime.getURL('Vazirmatn-Variable.woff2');
        style.textContent = isRTL ? `
            @font-face {
                font-family: 'PersianOnlyFont';
                src: local('Vazirmatn'), url('${font}') format('woff2');
                font-weight: 100 900;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            ${BLOCKS}, ${INPUTS} {
                font-family: 'PersianOnlyFont', ui-sans-serif, system-ui, sans-serif !important;
                unicode-bidi: plaintext;
                text-align: start;
            }
            [contenteditable="true"] [contenteditable="false"],
            [contenteditable="true"] [data-lexical-decorator="true"] {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
                display: inline-flex !important;
            }
            pre:not([dir="rtl"]), code:not([dir="rtl"]),
            pre:not([dir="rtl"]) *, code:not([dir="rtl"]) * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }
            pre[dir="rtl"] .code-block,
            pre[dir="rtl"] .code-block *,
            pre[dir="rtl"] .code-line,
            pre[dir="rtl"] .code-line *,
            pre[dir="rtl"] .line-content,
            pre[dir="rtl"] .line-content *,
            pre[dir="rtl"] code,
            pre[dir="rtl"] code *,
            code[dir="rtl"],
            code[dir="rtl"] * {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
        ` : `
            ${BLOCKS}, ${INPUTS} {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: normal !important;
            }
        `;
    }

    function updateDir() {
        document.querySelectorAll(INPUTS).forEach(el => {
            const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
            const clean = (raw || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            if (!isRTL || !clean) return setDir(el, null);
            const rtl = /^[^a-zA-Z]*[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(clean);
            setDir(el, rtl ? 'rtl' : 'ltr');
        });
        document.querySelectorAll(BLOCKS).forEach(el => {
            if (el.tagName === 'PRE') {
                const langEl = el.querySelector ? el.querySelector('.font-sans, [class*="text-muted-foreground"], [data-language], code[class*="language-"]') : null;
                let lang = '';
                if (langEl) {
                    if (langEl.getAttribute && langEl.getAttribute('data-language')) {
                        lang = langEl.getAttribute('data-language');
                    } else if (langEl.className && typeof langEl.className === 'string' && langEl.className.includes('language-')) {
                        const m = langEl.className.match(/language-([a-z0-9_-]+)/i);
                        if (m) lang = m[1];
                    } else {
                        lang = (langEl.textContent || '').trim();
                    }
                }
                lang = (lang || '').toLowerCase();
                const isTextOrMd = !lang || ['markdown', 'md', 'text', 'txt', 'plaintext'].includes(lang);

                const contentEl = (el.querySelector ? el.querySelector('.code-block, code') : null) || el;
                const text = (contentEl.textContent || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
                if (isTextOrMd && isRtl(text)) {
                    setDir(el, isRTL ? 'rtl' : 'ltr');
                } else {
                    setDir(el, null);
                }
                return;
            }
            if (el.tagName === 'CODE') return;
            setDir(el, isRTL ? textDir(el.textContent) : 'ltr');
        });
    }

    function toggle() {
        isRTL = !isRTL;
        chrome.storage.local.set({ rtl: isRTL });
        const btn = document.getElementById('antigravity-rtl-float-btn');
        if (btn) btn.textContent = isRTL ? 'RTL' : 'LTR';
        css();
        updateDir();
    }

    function placeButton() {
        let btn = document.getElementById('antigravity-rtl-float-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'antigravity-rtl-float-btn';
            btn.type = 'button';
            btn.title = 'Antigravity RTL (Alt+R)';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            });
        }
        btn.textContent = isRTL ? 'RTL' : 'LTR';
        const cluster = document.querySelector('[data-testid="titlebar-more-actions"]')?.parentElement;
        if (cluster) {
            btn.style.cssText = 'cursor:pointer;border:1px solid var(--border, rgba(255,255,255,.15));background:transparent;color:inherit;border-radius:6px;height:28px;padding:0 8px;font:500 13px/1 ui-sans-serif,system-ui,sans-serif;margin-inline-end:6px;';
            if (cluster.firstChild !== btn) cluster.prepend(btn);
        } else if (document.body && btn.parentElement !== document.body) {
            btn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483646;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:#18181b;color:#f4f4f5;border-radius:8px;height:28px;padding:0 10px;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;';
            document.body.appendChild(btn);
        }
    }

    function start() {
        css();
        placeButton();
        updateDir();
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl excluded so Cmd+Alt+R and AltGr+R keep their own meaning.
            if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === 'KeyR') {
                e.preventDefault();
                toggle();
            }
        });
        let timer = null;
        const schedule = () => {
            if (timer) return;
            timer = setTimeout(() => {
                timer = null;
                updateDir();
                placeButton();
            }, 400);
        };
        document.body.addEventListener('input', schedule, { capture: true });
        const observer = new MutationObserver((mutations) => {
            const external = mutations.some(m => {
                if (m.type === 'characterData') return true;
                return [...m.addedNodes].some(node => !node.id || !node.id.startsWith('antigravity-rtl'));
            });
            if (external) schedule();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    chrome.storage.local.get('rtl', (stored) => {
        if (stored && typeof stored.rtl === 'boolean') isRTL = stored.rtl;
        start();
    });
})();
