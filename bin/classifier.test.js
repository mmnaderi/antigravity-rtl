import assert from 'node:assert/strict';
import test from 'node:test';

const RTL_CHAR_RE = /(?=[\p{Script_Extensions=Arabic}\p{Script_Extensions=Hebrew}])\p{Letter}/gu;
const LATIN_CHAR_RE = /(?=\p{Script=Latin})\p{Letter}/gu;

function isRtl(text) {
    if (!text) return false;
    const clean = text.replace(/[\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, ' ').trim();
    if (!clean) return false;
    const rtlCount = (clean.match(RTL_CHAR_RE) || []).length;
    if (!rtlCount) return false;
    const latinCount = (clean.match(LATIN_CHAR_RE) || []).length;
    return rtlCount > latinCount * 0.5;
}

test('isRtl: pure Persian text is RTL', () => {
    assert.equal(isRtl('سلام این یک پیام تست است'), true);
});

test('isRtl: pure English text is LTR', () => {
    assert.equal(isRtl('Hello world this is a test'), false);
});

test('isRtl: starts with English word but majority is Persian (Bug 2 reproduction)', () => {
    assert.equal(isRtl('salam\nیکی اینکه این markdown های داخلی چت به درستی rtl نمیشن و فقط فونت روشون اعمال میشه'), true);
});

test('isRtl: CLI command with Persian message is RTL', () => {
    assert.equal(isRtl('git commit -m "پیام ثبت تغییرات مخزن"'), true);
});

test('isRtl: Persian sentence with multiple English tech terms is RTL', () => {
    assert.equal(isRtl('پروژه با React، TypeScript و Vite به درستی بیلد شد.'), true);
});

test('isRtl: Programming code with Persian comments remains LTR', () => {
    const pyCode = `
    def calculate_total(items):
        # محاسبه قیمت کل اقلام
        total = sum(item.price for item in items)
        return total
    `;
    assert.equal(isRtl(pyCode), false);
});

test('isRtl: Hebrew text is RTL', () => {
    assert.equal(isRtl('שלום עולם זה מבחן'), true);
});

test('isRtl: empty or whitespace is not RTL', () => {
    assert.equal(isRtl(''), false);
    assert.equal(isRtl('   \n  \t '), false);
    assert.equal(isRtl('\u200B\uFEFF'), false);
});
