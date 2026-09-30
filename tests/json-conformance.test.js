import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, formatJSON } from '../js/json-core.js';

const accepts = (fn) => { try { fn(); return true; } catch { return false; } };

const VALID = [
  '0', '-0', '1.5e-3', '-12E+2', 'true', 'false', 'null', '""', '"\\u00e9\\n\\t\\/"',
  '[]', '{}', '[1,[2,[3]]]', '{"a":{"b":{"c":[]}}}', ' \n\t{ "a" : 1 } \r\n',
  '{"a":1,"a":2}', '"\\ud83d\\ude00"', '[1e10,0.0,-0.5]',
];

const INVALID = [
  '01', '1.', '.5', '+1', '1e', '-', 'tru', 'nul', 'NaN', 'Infinity', "'a'",
  '"\\x41"', '"\\u12"', '"a\tb"', '[1 2]', '{"a" 1}', '{a:1}', '[1,]', '{"a":1,}',
  '[', ']', '{"a":1}}', '1 2', '{"a":1', '["a"', '[,1]', '{,}',
];

test('tokenizer accepts exactly what JSON.parse accepts (valid cases)', () => {
  for (const s of VALID) {
    assert.equal(accepts(() => tokenize(s)), true, `should accept: ${s}`);
    assert.equal(accepts(() => JSON.parse(s)), true, `sanity: ${s}`);
  }
});

test('tokenizer rejects exactly what JSON.parse rejects (invalid cases)', () => {
  for (const s of INVALID) {
    assert.equal(accepts(() => tokenize(s)), false, `should reject: ${s}`);
    assert.equal(accepts(() => JSON.parse(s)), false, `sanity: ${s}`);
  }
});

test('formatted output is semantically identical to the input', () => {
  const sample = {
    s: 'café "quoted" \\ back / slash \n newline',
    n: [0, -1.25, 3e-7, 42],
    nested: { a: [{}, [], [[null]]], b: true, c: false },
    'weird key {[,]}': 'value with , and } ]',
  };
  for (const input of [JSON.stringify(sample), JSON.stringify(sample, null, 2)]) {
    const result = formatJSON(input);
    assert.equal(result.success, true);
    assert.deepEqual(JSON.parse(result.formatted), sample);
  }
});

test('tokenizer handles very deep nesting without stack overflow', () => {
  const depth = 100000;
  assert.equal(tokenize('['.repeat(depth) + ']'.repeat(depth)).length, depth * 2);
});

test('formats deeply nested input', () => {
  // Pretty output grows quadratically with depth (indentation), so keep it realistic
  const depth = 2000;
  assert.equal(formatJSON('['.repeat(depth) + ']'.repeat(depth)).success, true);
});
