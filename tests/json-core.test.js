import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatJSON } from '../js/json-core.js';

// Helper: formatted text of a successful result
const fmt = (input) => {
  const result = formatJSON(input);
  assert.equal(result.success, true, `expected success, got: ${result.error && result.error.message}`);
  return result.formatted;
};

// ---------------------------------------------------------------
// Basic formatting
// ---------------------------------------------------------------
test('formats a plain object with 4-space indentation', () => {
  assert.equal(fmt('{"a":1,"b":[true,null]}'),
    '{\n    "a": 1,\n    "b": [\n        true,\n        null\n    ]\n}');
});

test('keeps empty objects and arrays inline', () => {
  assert.equal(fmt('{"a":{},"b":[ ]}'), '{\n    "a": {},\n    "b": []\n}');
});

test('formats top-level primitives', () => {
  assert.equal(fmt('42'), '42');
  assert.equal(fmt('"hello"'), '"hello"');
});

// ---------------------------------------------------------------
// Data integrity: a formatter must never change values
// ---------------------------------------------------------------
test('preserves big integers exactly', () => {
  assert.equal(fmt('{"id":12345678901234567890}'), '{\n    "id": 12345678901234567890\n}');
});

test('preserves number lexemes (decimals and exponents)', () => {
  assert.equal(fmt('[1.50,1e10,-0.0]'), '[\n    1.50,\n    1e10,\n    -0.0\n]');
});

test('does not touch commas or braces inside string values', () => {
  assert.equal(fmt('{"a":"x,}"}'), '{\n    "a": "x,}"\n}');
});

test('trailing-comma repair ignores commas inside strings', () => {
  const result = formatJSON('{"a":"x,]","b":1,}');
  assert.equal(result.success, true);
  assert.equal(result.formatted, '{\n    "a": "x,]",\n    "b": 1\n}');
});

// ---------------------------------------------------------------
// Stringified JSON (the main use case)
// ---------------------------------------------------------------
test('decodes a JSON-encoded string', () => {
  assert.equal(fmt(String.raw`"{\"name\":\"John\"}"`), '{\n    "name": "John"\n}');
});

test('keeps unicode escapes intact when decoding a JSON string', () => {
  // outer literal decodes \\u00e9 -> \u00e9 (still an escape in the inner JSON)
  assert.equal(fmt(String.raw`"{\"a\":\"caf\\u00e9\"}"`), '{\n    "a": "caf\\u00e9"\n}');
  // outer literal decodes \u00e9 -> é
  assert.equal(fmt(String.raw`"{\"a\":\"caf\u00e9\"}"`), '{\n    "a": "café"\n}');
});

test('keeps escaped quotes and backslashes inside decoded values', () => {
  assert.equal(fmt(String.raw`"{\"q\":\"say \\\"hi\\\"\",\"p\":\"C:\\\\tmp\"}"`),
    '{\n    "q": "say \\"hi\\"",\n    "p": "C:\\\\tmp"\n}');
});

test('decodes double-encoded JSON strings', () => {
  const doubly = JSON.stringify(JSON.stringify({ a: 1 }));
  assert.equal(fmt(doubly), '{\n    "a": 1\n}');
});

test('decodes single-quoted JS string literals', () => {
  assert.equal(fmt(`'{"a":"it\\'s"}'`), '{\n    "a": "it\'s"\n}');
  assert.equal(fmt(String.raw`'{\"a\":1}'`), '{\n    "a": 1\n}');
});

test('accepts JSON wrapped in unescaped outer quotes', () => {
  assert.equal(fmt('"{"a":1}"'), '{\n    "a": 1\n}');
});

test('a plain string value is not treated as encoded JSON', () => {
  assert.equal(fmt('"hello, world"'), '"hello, world"');
});

// ---------------------------------------------------------------
// Repairs are reported as warnings, never silent
// ---------------------------------------------------------------
test('valid input produces no warnings', () => {
  assert.deepEqual(formatJSON('{"a":1}').warnings, []);
});

test('reports removed trailing commas', () => {
  const result = formatJSON('{"a":[1,2,],}');
  assert.equal(result.formatted, '{\n    "a": [\n        1,\n        2\n    ]\n}');
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /2 trailing comma/);
});

test('closes missing brackets in the correct nesting order', () => {
  const result = formatJSON('{"a":[1,{"b":2');
  assert.equal(result.success, true);
  assert.equal(result.formatted,
    '{\n    "a": [\n        1,\n        {\n            "b": 2\n        }\n    ]\n}');
  assert.ok(result.warnings.some(w => w.includes('}]}')));
});

test('does not count brackets inside strings when balancing', () => {
  const result = formatJSON('{"a":"{[{["');
  assert.equal(result.success, true);
  assert.equal(result.formatted, '{\n    "a": "{[{["\n}');
});

// ---------------------------------------------------------------
// Errors
// ---------------------------------------------------------------
test('reports line, column and context for invalid JSON', () => {
  const result = formatJSON('{\n  "a": 1\n  "b": 2\n}');
  assert.equal(result.success, false);
  assert.equal(result.error.line, 3);
  assert.equal(result.error.column, 3);
  assert.ok(result.error.context.includes('"b"'));
});

test('locates errors even when the engine message has no position', () => {
  const result = formatJSON('{"a": <img src=x onerror=alert(1)>}');
  assert.equal(result.success, false);
  assert.equal(result.error.line, 1);
  assert.equal(result.error.column, 7);
});

test('error context returns raw text, never markup (rendering must escape it)', () => {
  const payload = '{"a":1 "b<svg onload=alert(1)>":2}';
  const result = formatJSON(payload);
  assert.equal(result.success, false);
  assert.equal(typeof result.error.context, 'string');
  assert.equal(typeof result.error.message, 'string');
});

test('rejects empty input', () => {
  assert.equal(formatJSON('   ').success, false);
});

// ---------------------------------------------------------------
// Line model used for highlighting and collapsing
// ---------------------------------------------------------------
test('line model marks block start/end lines', () => {
  const { lines } = formatJSON('{"a":{"b":1},"c":[2]}');
  // 0 {   1 "a": {   2 "b": 1   3 },   4 "c": [   5 2   6 ]   7 }
  assert.equal(lines.length, 8);
  assert.equal(lines[0].end, 7);
  assert.equal(lines[1].end, 3);
  assert.equal(lines[4].end, 6);
  assert.equal(lines[2].end, -1);
});

test('braces inside strings do not create collapsible blocks', () => {
  const { lines } = formatJSON('{"a":"{ not a block ["}');
  assert.equal(lines.filter(l => l.end !== -1).length, 1);
});

test('line tokens are classified for highlighting', () => {
  const { lines } = formatJSON('{"k":"v","n":1,"t":true,"z":null}');
  const types = lines[1].tokens.map(t => t.type);
  assert.deepEqual(types, ['key', 'colon', 'string', 'comma']);
  assert.deepEqual(lines[2].tokens.map(t => t.type), ['key', 'colon', 'number', 'comma']);
  assert.deepEqual(lines[3].tokens.map(t => t.type), ['key', 'colon', 'boolean', 'comma']);
  assert.deepEqual(lines[4].tokens.map(t => t.type), ['key', 'colon', 'null']);
});
