/**
 * JSON String to JSON Converter
 * Modern ES6+ implementation without jQuery
 * @author Eder Rimarachin
 *
 * Security note: user-controlled text is only ever written with textContent.
 * Never use innerHTML here.
 */

import { formatJSON } from './json-core.js?v=20261001';

// Small DOM helper: el('span', 'cls', 'text')
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Stroke icons (24x24 grid, inherit currentColor so they follow the theme)
const ICON_PATHS = {
  check: ['M20 6L9 17l-5-5'],
  x: ['M18 6L6 18', 'M6 6l12 12'],
  alert: ['M21.73 18l-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3', 'M12 9v4', 'M12 17h.01'],
  circleX: ['M22 12a10 10 0 11-20 0 10 10 0 0120 0z', 'M15 9l-6 6', 'M9 9l6 6']
};

function icon(name, size = 16) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [attr, value] of Object.entries({
    class: 'icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true'
  })) {
    svg.setAttribute(attr, value);
  }
  for (const d of ICON_PATHS[name]) {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(message, type = 'success', duration = 3000) {
    const icons = {
      success: 'check',
      error: 'x',
      warning: 'alert'
    };

    const toast = el('div', `toast ${type}`);
    const closeBtn = el('button', 'toast-close');
    closeBtn.appendChild(icon('x', 16));
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    const toastIcon = el('span', 'toast-icon');
    toastIcon.appendChild(icon(icons[type] || icons.success, 20));
    toast.append(
      toastIcon,
      el('span', 'toast-message', message),
      closeBtn
    );

    this.container.appendChild(toast);

    // Close button handler
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }
}

// ============================================
// JSON OUTPUT RENDERER (highlighting + collapse)
// ============================================
class JSONRenderer {
  constructor(container) {
    this.container = container;
    this.reset();
  }

  reset() {
    this.lines = [];
    this.lineElements = [];
    this.collapsed = new Set();
    this.container.replaceChildren();
  }

  render(result) {
    this.reset();
    this.lines = result.lines;

    const fragment = document.createDocumentFragment();

    if (result.warnings.length) {
      const note = el('div', 'json-warning');
      const title = el('strong', null, 'Input was repaired:');
      title.prepend(icon('alert', 15));
      note.append(title, ' ' + result.warnings.join(' · '));
      fragment.appendChild(note);
    }

    result.lines.forEach((line, index) => {
      const row = el('div', 'json-line');
      row.dataset.lineIndex = index;

      if (line.end !== -1) {
        const toggle = el('button', 'toggle toggleIcon', '▼');
        toggle.type = 'button';
        toggle.dataset.line = index;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', `Collapse block at line ${index + 1}`);
        row.appendChild(toggle);
      } else {
        row.appendChild(el('span', 'toggle-spacer'));
      }

      row.appendChild(el('span', 'line-number', String(index + 1)));
      row.appendChild(document.createTextNode(' '.repeat(4 * line.depth)));

      for (const token of line.tokens) {
        row.appendChild(el('span', TOKEN_CLASSES[token.type], token.text));
      }

      this.lineElements.push(row);
      fragment.appendChild(row);
    });

    this.container.appendChild(fragment);
  }

  renderError(error) {
    this.reset();

    const box = el('div', 'json-error');
    const title = el('div', 'json-error-title', 'Invalid JSON');
    title.prepend(icon('circleX', 18));
    box.appendChild(title);
    box.appendChild(el('div', null, error.message));

    if (error.line !== null) {
      box.appendChild(el('div', 'json-error-location', `Line ${error.line}, column ${error.column}`));
      box.appendChild(el('pre', 'json-error-context', `${error.context}\n${error.pointer}`));
    }

    const tips = el('div', 'json-error-tips', 'Tips:');
    const list = el('ul');
    for (const tip of [
      'Check for missing commas or brackets',
      'Verify all quotes are properly closed',
      'Property names must use double quotes'
    ]) {
      list.appendChild(el('li', null, tip));
    }
    tips.appendChild(list);
    box.appendChild(tips);

    this.container.appendChild(box);
  }

  toggle(lineIndex) {
    if (this.collapsed.has(lineIndex)) {
      this.collapsed.delete(lineIndex);
    } else {
      this.collapsed.add(lineIndex);
    }
    this.updateVisibility();
  }

  setAll(collapsed) {
    this.collapsed = new Set(
      collapsed ? this.lines.flatMap((line, i) => (line.end !== -1 ? [i] : [])) : []
    );
    this.updateVisibility();
  }

  /** Single O(n) pass: a line is hidden if it lies inside any collapsed ancestor block */
  updateVisibility() {
    let hideUntil = -1;

    this.lines.forEach((line, i) => {
      const row = this.lineElements[i];
      const hidden = i <= hideUntil;
      const isCollapsed = this.collapsed.has(i);

      row.classList.toggle('hidden', hidden);
      row.classList.toggle('collapsed', isCollapsed);

      const toggle = row.querySelector('.toggleIcon');
      if (toggle) {
        toggle.textContent = isCollapsed ? '▶' : '▼';
        toggle.setAttribute('aria-expanded', String(!isCollapsed));
        toggle.setAttribute('aria-label', `${isCollapsed ? 'Expand' : 'Collapse'} block at line ${i + 1}`);
      }

      if (!hidden && isCollapsed) {
        hideUntil = line.end;
      }
    });
  }
}

const TOKEN_CLASSES = {
  key: 'key',
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  null: 'null',
  colon: 'colon',
  comma: 'comma',
  open: 'brace',
  close: 'brace'
};

// ============================================
// CLIPBOARD MANAGER
// ============================================
class ClipboardManager {
  constructor(toast) {
    this.toast = toast;
  }

  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success('Copied to clipboard!');
      return true;
    } catch (error) {
      this.toast.error('Failed to copy to clipboard');
      console.error('Clipboard error:', error);
      return false;
    }
  }
}

// ============================================
// JSON CONVERTER APP
// ============================================
class JSONConverterApp {
  constructor() {
    this.toast = new ToastManager();
    this.clipboard = new ClipboardManager(this.toast);

    this.elements = {
      inputTextarea: document.getElementById('input_string'),
      outputPre: document.getElementById('output_json'),
      convertBtn: document.getElementById('btn_convertir'),
      copyInputBtn: document.getElementById('copy_input'),
      copyOutputBtn: document.getElementById('copy_output'),
      clearInputBtn: document.getElementById('clear_input'),
      collapseAllBtn: document.getElementById('collapse_all'),
      expandAllBtn: document.getElementById('expand_all'),
      status: document.getElementById('output_status')
    };

    this.renderer = new JSONRenderer(this.elements.outputPre);
    this.formatted = '';

    this.init();
  }

  init() {
    this.bindEvents();
    this.elements.inputTextarea.focus();
  }

  bindEvents() {
    // Convert button
    this.elements.convertBtn.addEventListener('click', () => this.handleConvert());

    // Ctrl+Enter in textarea
    this.elements.inputTextarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.handleConvert();
      }
    });

    // Copy buttons
    this.elements.copyInputBtn.addEventListener('click', () => this.handleCopyInput());
    this.elements.copyOutputBtn.addEventListener('click', () => this.handleCopyOutput());

    // Clear button
    this.elements.clearInputBtn.addEventListener('click', () => this.handleClear());

    // Collapse/Expand buttons
    this.elements.collapseAllBtn.addEventListener('click', () => this.renderer.setAll(true));
    this.elements.expandAllBtn.addEventListener('click', () => this.renderer.setAll(false));

    // Toggle icons (event delegation)
    this.elements.outputPre.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggleIcon');
      if (toggle) {
        this.renderer.toggle(Number(toggle.dataset.line));
      }
    });
  }

  handleConvert() {
    const input = this.elements.inputTextarea.value.trim();

    if (!input) {
      this.toast.warning('Please enter a JSON string');
      return;
    }

    // Show loading state
    this.elements.convertBtn.classList.add('loading');
    this.elements.convertBtn.disabled = true;

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const result = formatJSON(input);

        if (result.success) {
          this.formatted = result.formatted;
          this.renderer.render(result);
          const lines = `${result.lines.length} line${result.lines.length === 1 ? '' : 's'}`;

          if (result.warnings.length) {
            this.setStatus(`Repaired, ${lines}. Review the changes before using it`, 'warn');
            this.toast.warning('JSON repaired - review the changes before using it', 6000);
          } else {
            this.setStatus(`Valid JSON, ${lines}`, 'ok');
            this.toast.success('JSON converted successfully!');
          }
        } else {
          this.formatted = '';
          this.renderer.renderError(result.error);
          this.setStatus(
            result.error.line !== null
              ? `Invalid JSON at line ${result.error.line}, column ${result.error.column}`
              : result.error.message,
            'error'
          );
          this.toast.error('Invalid JSON - Check output for details', 6000);
        }
      } catch (error) {
        // e.g. output too large to build as a string
        this.formatted = '';
        this.renderer.reset();
        this.setStatus('Could not process this input', 'error');
        this.toast.error('Could not process this input');
        console.error('Format error:', error);
      } finally {
        // Remove loading state
        this.elements.convertBtn.classList.remove('loading');
        this.elements.convertBtn.disabled = false;
      }
    }, 100);
  }

  handleCopyInput() {
    const text = this.elements.inputTextarea.value;
    if (text) {
      this.clipboard.copy(text);
    } else {
      this.toast.warning('Nothing to copy');
    }
  }

  handleCopyOutput() {
    if (this.formatted) {
      this.clipboard.copy(this.formatted);
    } else {
      this.toast.warning('No output to copy');
    }
  }

  handleClear() {
    this.elements.inputTextarea.value = '';
    this.formatted = '';
    this.renderer.reset();
    this.setStatus('Nothing converted yet');
    this.elements.inputTextarea.focus();
    this.toast.success('Cleared!');
  }

  setStatus(text, kind = '') {
    this.elements.status.textContent = text;
    this.elements.status.className = kind ? `status is-${kind}` : 'status';
  }
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new JSONConverterApp();
});
