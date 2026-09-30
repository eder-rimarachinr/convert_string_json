/**
 * JSON formatting core (pure, DOM-free, testable in Node).
 *
 * A formatter must only change whitespace, never data: output is rebuilt from
 * the original tokens, so numbers, string escapes and key order are kept
 * exactly as typed (no JSON.parse/JSON.stringify round-trip).
 */

const WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const NUMBER_RE = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const HEX4_RE = /^[0-9a-fA-F]{4}$/;
const MAX_UNWRAP_DEPTH = 5;

class JSONSyntaxError extends Error {
  constructor(message, position) {
    super(message);
    this.position = position;
  }
}

// ============================================
// STRICT TOKENIZER (RFC 8259, iterative: no recursion limit)
// ============================================
function readString(text, start) {
  let i = start + 1;
  while (i < text.length) {
    const c = text[i];
    if (c === '"') return i + 1;
    if (c === '\\') {
      const n = text[i + 1];
      if (n !== undefined && '"\\/bfnrt'.includes(n)) {
        i += 2;
      } else if (n === 'u' && HEX4_RE.test(text.substr(i + 2, 4))) {
        i += 6;
      } else {
        throw new JSONSyntaxError('Invalid escape sequence in string', i);
      }
    } else if (c.charCodeAt(0) < 0x20) {
      throw new JSONSyntaxError('Unescaped control character in string', i);
    } else {
      i++;
    }
  }
  throw new JSONSyntaxError('Unterminated string', start);
}

function describeChar(c) {
  return c === undefined ? 'end of input' : `character ${JSON.stringify(c)}`;
}

export function tokenize(text) {
  const tokens = [];
  const stack = [];
  let expect = 'value';
  let i = 0;

  const push = (type, end) => {
    tokens.push({ type, text: text.slice(i, end) });
    i = end;
  };
  const afterValue = () => {
    expect = stack.length ? 'commaOrClose' : 'end';
  };
  const close = () => {
    push('close', i + 1);
    stack.pop();
    afterValue();
  };

  while (true) {
    while (i < text.length && WHITESPACE.has(text[i])) i++;
    const c = text[i];

    if (c === undefined) {
      if (expect === 'end') break;
      throw new JSONSyntaxError('Unexpected end of input', i);
    }

    switch (expect) {
      case 'value':
      case 'valueOrClose':
        if (expect === 'valueOrClose' && c === ']') {
          close();
        } else if (c === '{' || c === '[') {
          push('open', i + 1);
          stack.push(c);
          expect = c === '{' ? 'keyOrClose' : 'valueOrClose';
        } else if (c === '"') {
          push('string', readString(text, i));
          afterValue();
        } else if (c === '-' || (c >= '0' && c <= '9')) {
          NUMBER_RE.lastIndex = i;
          const m = NUMBER_RE.exec(text);
          if (!m) throw new JSONSyntaxError('Invalid number', i);
          push('number', i + m[0].length);
          afterValue();
        } else if (text.startsWith('true', i) || text.startsWith('false', i)) {
          push('boolean', i + (c === 't' ? 4 : 5));
          afterValue();
        } else if (text.startsWith('null', i)) {
          push('null', i + 4);
          afterValue();
        } else {
          throw new JSONSyntaxError(`Unexpected ${describeChar(c)}, expected a value`, i);
        }
        break;

      case 'key':
      case 'keyOrClose':
        if (expect === 'keyOrClose' && c === '}') {
          close();
        } else if (c === '"') {
          push('key', readString(text, i));
          expect = 'colon';
        } else {
          throw new JSONSyntaxError(`Unexpected ${describeChar(c)}, expected a property name in double quotes`, i);
        }
        break;

      case 'colon':
        if (c !== ':') throw new JSONSyntaxError(`Unexpected ${describeChar(c)}, expected ':'`, i);
        tokens.push({ type: 'colon', text: ': ' });
        i++;
        expect = 'value';
        break;

      case 'commaOrClose': {
        const closer = stack[stack.length - 1] === '{' ? '}' : ']';
        if (c === ',') {
          push('comma', i + 1);
          expect = closer === '}' ? 'key' : 'value';
        } else if (c === closer) {
          close();
        } else {
          throw new JSONSyntaxError(`Unexpected ${describeChar(c)}, expected ',' or '${closer}'`, i);
        }
        break;
      }

      default: // 'end'
        throw new JSONSyntaxError(`Unexpected ${describeChar(c)} after the end of the JSON value`, i);
    }
  }

  return tokens;
}

// ============================================
// STRING-ENCODED JSON ("{\"a\":1}", '{"a":1}', double-encoded...)
// ============================================

/** Decodes a JS/JSON string literal ("..." or '...'). Returns null if it is not one. */
function decodeStringLiteral(text) {
  const quote = text[0];
  const last = text.length - 1;
  const out = [];

  for (let i = 1; i < last; i++) {
    const c = text[i];
    if (c === '\\') {
      if (i + 1 >= last) return null; // escapes the closing quote
      const n = text[++i];
      out.push(n === "'" ? "'" : '\\' + n);
    } else if (c === quote) {
      return null; // unescaped quote: not a single literal
    } else if (c === '"') {
      out.push('\\"'); // bare double quote inside a single-quoted literal
    } else if (c === '\n') {
      out.push('\\n');
    } else if (c === '\r') {
      out.push('\\r');
    } else if (c === '\t') {
      out.push('\\t');
    } else {
      out.push(c);
    }
  }

  try {
    return JSON.parse('"' + out.join('') + '"');
  } catch {
    return null;
  }
}

const isContainer = (s) => s.startsWith('{') || s.startsWith('[');
const isQuoted = (s) => s.length >= 2 && (s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0];

function unwrapStringLiterals(text) {
  for (let depth = 0; depth < MAX_UNWRAP_DEPTH && isQuoted(text); depth++) {
    const decoded = decodeStringLiteral(text);

    if (decoded === null) {
      // JSON pasted between unescaped outer quotes: "{"a":1}"
      const inner = text.slice(1, -1).trim();
      if (!isContainer(inner)) break;
      text = inner;
      continue;
    }

    const next = decoded.trim();
    if (!isContainer(next) && !isQuoted(next)) break; // a plain string value
    text = next;
  }
  return text;
}

// ============================================
// REPAIR (string-aware; every fix is reported)
// ============================================
function repair(text) {
  const out = [];
  const stack = [];
  const fixes = [];
  let inString = false;
  let lastComma = -1; // index in `out` of a structural comma not yet followed by a value
  let removedCommas = 0;

  const dropPendingComma = () => {
    if (lastComma >= 0) {
      out.splice(lastComma, 1);
      lastComma = -1;
      removedCommas++;
    }
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inString) {
      out.push(c);
      if (c === '\\' && i + 1 < text.length) out.push(text[++i]);
      else if (c === '"') inString = false;
      continue;
    }

    if (c === '"') {
      inString = true;
      lastComma = -1;
    } else if (c === '{' || c === '[') {
      stack.push(c === '{' ? '}' : ']');
      lastComma = -1;
    } else if (c === '}' || c === ']') {
      dropPendingComma();
      if (stack[stack.length - 1] === c) stack.pop();
    } else if (c === ',') {
      lastComma = out.length;
    } else if (!WHITESPACE.has(c)) {
      lastComma = -1;
    }
    out.push(c);
  }

  if (inString) {
    out.push('"');
    fixes.push('Closed an unterminated string');
  } else if (stack.length) {
    dropPendingComma();
  }
  if (removedCommas) fixes.unshift(`Removed ${removedCommas} trailing comma(s)`);

  if (stack.length) {
    const closers = stack.reverse().join('');
    out.push(closers);
    fixes.push(`Added missing closing bracket(s): ${closers}`);
  }

  return { text: out.join(''), fixes };
}

// ============================================
// LINE MODEL (drives both text output and highlighting/collapsing)
// ============================================
function buildLines(tokens) {
  const lines = [];
  const openLines = [];
  let depth = 0;
  let current;

  const newLine = () => {
    current = { depth, tokens: [], end: -1 };
    lines.push(current);
  };

  newLine();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'open') {
      current.tokens.push(token);
      if (tokens[i + 1].type === 'close') {
        current.tokens.push(tokens[++i]); // empty {} or []
        continue;
      }
      openLines.push(lines.length - 1);
      depth++;
      newLine();
    } else if (token.type === 'close') {
      depth--;
      newLine();
      current.tokens.push(token);
      lines[openLines.pop()].end = lines.length - 1;
    } else if (token.type === 'comma') {
      current.tokens.push(token);
      newLine();
    } else {
      current.tokens.push(token);
    }
  }

  return lines;
}

export function lineText(line, indent = 4) {
  return ' '.repeat(indent * line.depth) + line.tokens.map(t => t.text).join('');
}

// ============================================
// ERRORS
// ============================================
function describeError(text, error) {
  const position = Math.min(error.position, text.length);
  const before = text.slice(0, position);
  const line = before.split('\n').length;
  const lineStart = before.lastIndexOf('\n') + 1;
  const column = position - lineStart + 1;

  let lineEnd = text.indexOf('\n', position);
  if (lineEnd === -1) lineEnd = text.length;

  // Keep the context short on very long (e.g. minified) lines
  const from = Math.max(lineStart, position - 40);
  const to = Math.min(lineEnd, position + 40);
  const context = (from > lineStart ? '…' : '') + text.slice(from, to).replace(/\r/g, '') + (to < lineEnd ? '…' : '');
  const pointer = ' '.repeat(position - from + (from > lineStart ? 1 : 0)) + '^';

  return { message: error.message, line, column, context, pointer };
}

// ============================================
// PUBLIC API
// ============================================
export function formatJSON(input, { indent = 4 } = {}) {
  let text = unwrapStringLiterals(String(input).trim());

  if (!text) {
    return { success: false, warnings: [], error: { message: 'Input is empty', line: null, column: null, context: '', pointer: '' } };
  }

  let tokens;
  let warnings = [];
  try {
    tokens = tokenize(text);
  } catch (error) {
    if (!(error instanceof JSONSyntaxError)) throw error;

    const repaired = repair(text);
    try {
      if (!repaired.fixes.length) throw error;
      tokens = tokenize(repaired.text);
      warnings = repaired.fixes;
    } catch {
      // Report the error against what the user actually wrote, not the repair attempt
      return { success: false, warnings: [], error: describeError(text, error) };
    }
  }

  const lines = buildLines(tokens);
  const formatted = lines.map(line => lineText(line, indent)).join('\n');
  return { success: true, formatted, lines, warnings };
}
