/**
 * Antigravity RTL shared direction engine.
 * Injected before the standalone app payload (patch-app.js) and the IDE client (patch-ide.js).
 */
window.__antigravityRtlCore = window.__antigravityRtlCore || (() => {
    const ZERO_WIDTH = /[\u200B-\u200F\uFEFF]/g;
    const RTL_CHAR_RE = /(?=[\p{Script_Extensions=Arabic}\p{Script_Extensions=Hebrew}])\p{Letter}/gu;
    const LATIN_CHAR_RE = /(?=\p{Script=Latin})\p{Letter}/gu;
    const BLOCKS = `
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
    `;

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

    function setDir(el, dir) {
        if (el.getAttribute('dir') !== dir) el.setAttribute('dir', dir);
    }

    function updateDir(forceRTL) {
        document.querySelectorAll('[contenteditable="true"] p, [contenteditable="true"], textarea[data-testid="ask-question-writein"]').forEach(el => {
            const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
            const text = (raw || '').replace(ZERO_WIDTH, '').trim();
            if (text.length > 0) {
                setDir(el, (forceRTL || isRtl(text)) ? 'rtl' : 'ltr');
            } else if (el.hasAttribute('dir')) {
                el.removeAttribute('dir');
            }
        });

        document.querySelectorAll(BLOCKS).forEach(el => {
            if (el.closest && (el.closest('.monaco-editor') || el.closest('.terminal') || el.closest('.xterm'))) return;

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
                const text = (contentEl.textContent || '').replace(ZERO_WIDTH, '').trim();
                if (isTextOrMd && isRtl(text)) {
                    setDir(el, 'rtl');
                } else if (el.getAttribute('dir') === 'rtl') {
                    el.removeAttribute('dir');
                }
                return;
            }

            if (el.tagName === 'CODE') return;

            let dir = 'auto';
            if (forceRTL) {
                dir = 'rtl';
            } else {
                const text = (el.textContent || '').replace(ZERO_WIDTH, '').trim();
                if (text) dir = isRtl(text) ? 'rtl' : 'ltr';
            }
            setDir(el, dir);
        });
    }

    function watch(fn) {
        let timer = null;
        const schedule = () => {
            if (timer) return;
            timer = setTimeout(() => {
                timer = null;
                fn();
            }, 400);
        };
        document.body.addEventListener('input', schedule, { capture: true });
        document.body.addEventListener('focusin', schedule, { capture: true });
        new MutationObserver((mutations) => {
            const hasExternal = mutations.some(m => [...m.addedNodes].some(node => !node.id || !node.id.startsWith('antigravity-rtl')));
            if (hasExternal) schedule();
        }).observe(document.body, { childList: true, subtree: true });
    }

    function onToggleShortcut(fn) {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === 'KeyR') {
                e.preventDefault();
                fn();
            }
        });
    }

    return { updateDir, watch, onToggleShortcut, isRtl };
})();
