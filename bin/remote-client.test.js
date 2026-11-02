import assert from 'node:assert/strict';
import fs from 'fs';
import vm from 'vm';

const observers = [];

function el(tag) {
    return {
        nodeType: 1,
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        textContent: '',
        value: '',
        children: [],
        parentElement: null,
        style: { cssText: '' },
        attributes: {},
        appendChild(child) {
            child.parentElement = this;
            this.children.push(child);
            notify(this, child);
            return child;
        },
        prepend(child) {
            child.parentElement = this;
            this.children.unshift(child);
            notify(this, child);
            return child;
        },
        setAttribute(k, v) { this.attributes[k] = String(v); },
        getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; },
        hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); },
        removeAttribute(k) { delete this.attributes[k]; },
        addEventListener() {},
        get firstChild() { return this.children[0] || null; }
    };
}

function walk(node, out = []) {
    for (const child of node.children || []) {
        out.push(child);
        walk(child, out);
    }
    return out;
}

function matches(node, sel) {
    if (sel === '.leading-relaxed > *') return node.parentElement?.className === 'leading-relaxed';
    if (sel === '[data-testid="conversation-view"] p') {
        return node.tagName === 'P' && walkUp(node, n => n.attributes?.['data-testid'] === 'conversation-view');
    }
    if (sel === '[data-testid="conversation-view"] li') return node.tagName === 'LI' && walkUp(node, n => n.attributes?.['data-testid'] === 'conversation-view');
    if (sel === '[data-testid="user-input-step"]') return node.attributes?.['data-testid'] === 'user-input-step';
    if (sel === '[data-testid="user-input-step"] > *') return node.parentElement?.attributes?.['data-testid'] === 'user-input-step';
    if (sel === 'label[for^="ask-opt-"]') return node.tagName === 'LABEL' && String(node.attributes?.for || '').startsWith('ask-opt-');
    if (sel === '[contenteditable="true"]') return node.attributes?.contenteditable === 'true';
    if (sel === '[contenteditable="true"] p') return node.tagName === 'P' && walkUp(node, n => n.attributes?.contenteditable === 'true');
    if (sel === 'textarea[data-testid="ask-question-writein"]') return node.tagName === 'TEXTAREA' && node.attributes?.['data-testid'] === 'ask-question-writein';
    if (sel === '[data-testid="titlebar-more-actions"]') return node.attributes?.['data-testid'] === 'titlebar-more-actions';
    return false;
}

function walkUp(node, pred) {
    let n = node;
    while (n) {
        if (pred(n)) return true;
        n = n.parentElement;
    }
    return false;
}

function queryAll(root, selector) {
    return walk(root).filter(node => selector.split(',').some(part => matches(node, part.trim())));
}

function notify(parent, child) {
    for (const obs of observers) {
        let n = parent;
        while (n) {
            if (n === obs.root) obs.cb([{ type: 'childList', addedNodes: [child] }]);
            n = n.parentElement;
        }
    }
}

const head = el('head');
const body = el('body');
const document = {
    head,
    body,
    createElement: el,
    getElementById(id) { return walk({ children: [head, body] }).find(node => node.id === id) || null; },
    querySelector(sel) { return queryAll({ children: [head, body] }, sel)[0] || null; },
    querySelectorAll(sel) { return queryAll({ children: [head, body] }, sel); },
    addEventListener() {}
};
body.appendChild(Object.assign(el('div'), { id: 'root' }));

globalThis.MutationObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(root) { this.root = root; observers.push(this); }
    disconnect() {}
};

const context = {
    window: {},
    document,
    console,
    setTimeout,
    clearTimeout,
    MutationObserver: globalThis.MutationObserver,
    chrome: {
        runtime: { id: 'ext-test', getURL: (p) => 'chrome-extension://ext-test/' + p },
        storage: { local: { get(_key, cb) { cb({}); }, set() {} } }
    }
};
context.window = context;
vm.runInNewContext(fs.readFileSync(new URL('./remote-client.js', import.meta.url), 'utf8'), context, { filename: 'remote-client.js' });

const view = el('div');
view.setAttribute('data-testid', 'conversation-view');
const md = el('div');
md.className = 'leading-relaxed';
const fa = el('p');
fa.textContent = 'سلام دنیا';
const en = el('p');
en.textContent = 'Hello world';
const pre = el('pre');
pre.textContent = 'const x = 1';
md.appendChild(fa);
md.appendChild(en);
md.appendChild(pre);
view.appendChild(md);
body.appendChild(view);

await new Promise(r => setTimeout(r, 500));

assert.equal(fa.getAttribute('dir'), 'rtl');
assert.equal(en.getAttribute('dir'), 'ltr');
assert.equal(pre.getAttribute('dir'), null);
assert.equal(document.getElementById('antigravity-rtl-float-btn').textContent, 'RTL');
assert.match(document.getElementById('antigravity-rtl-style').textContent, /unicode-bidi:\s*plaintext/);
assert.match(document.getElementById('antigravity-rtl-style').textContent, /chrome-extension:\/\/ext-test\/Vazirmatn-Variable\.woff2/);
console.log('remote-client checks passed');
