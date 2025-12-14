/**
 * JSON String to JSON Converter
 * Modern ES6+ implementation without jQuery
 * @author Eder Rimarachin
 */

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.success}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    this.container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
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
// JSON FORMATTER & PARSER
// ============================================
class JSONFormatter {
  constructor() {
    this.formattedJSON = null;
  }

  /**
   * Corrects common JSON string formatting issues
   */
  correctFormat(jsonString) {
    let corrected = jsonString.trim();

    // First, try to detect if it's a JSON string (wrapped in quotes)
    const isJSONString = (corrected.startsWith('"') && corrected.endsWith('"')) ||
                         (corrected.startsWith("'") && corrected.endsWith("'"));

    if (isJSONString) {
      // Remove outer quotes
      corrected = corrected.slice(1, -1);

      // Unescape quotes
      corrected = corrected.replace(/\\"/g, '"');
      corrected = corrected.replace(/\\'/g, "'");

      // Remove unnecessary escapes (but keep \n, \t, \r, \\)
      corrected = corrected.replace(/\\([^"'\\ntr])/g, '$1');
    }

    // Remove trailing commas before closing braces/brackets (common error)
    corrected = corrected.replace(/,(\s*[}\]])/g, '$1');

    return corrected;
  }

  /**
   * Get better error message with context
   */
  getErrorContext(input, position) {
    const start = Math.max(0, position - 30);
    const end = Math.min(input.length, position + 30);
    const context = input.substring(start, end);
    const pointer = ' '.repeat(Math.min(30, position - start)) + '^';
    return `\n\nError cerca de:\n...${context}...\n   ${pointer}`;
  }

  /**
   * Parse and format JSON string
   */
  format(jsonString) {
    const input = jsonString.trim();

    // First, detect if it's a JSON string (wrapped in quotes with escaped content)
    const isJSONString = (input.startsWith('"') && input.endsWith('"') && input.includes('\\')) ||
                         (input.startsWith("'") && input.endsWith("'") && input.includes('\\'));

    // If it's a JSON string, try to unescape it first
    if (isJSONString) {
      try {
        const corrected = this.correctFormat(input);
        const parsed = JSON.parse(corrected);
        this.formattedJSON = JSON.stringify(parsed, null, 4);
        return {
          success: true,
          formatted: this.formattedJSON,
          parsed: parsed
        };
      } catch (escapedError) {
        // If unescaping fails, continue to try direct parse
      }
    }

    // Try parsing the input directly (for regular JSON)
    try {
      const parsed = JSON.parse(input);
      this.formattedJSON = JSON.stringify(parsed, null, 4);
      return {
        success: true,
        formatted: this.formattedJSON,
        parsed: parsed
      };
    } catch (directError) {
      // Last attempt: try with corrections (trailing commas, etc)
      try {
        const corrected = this.correctFormat(input);
        const parsed = JSON.parse(corrected);
        this.formattedJSON = JSON.stringify(parsed, null, 4);
        return {
          success: true,
          formatted: this.formattedJSON,
          parsed: parsed
        };
      } catch (finalError) {
        // Último intento: usar repairJSON para corregir errores comunes
        try {
          const repaired = this.repairJSON(input);
          const parsed = JSON.parse(repaired);
          this.formattedJSON = JSON.stringify(parsed, null, 4);
          return {
            success: true,
            formatted: this.formattedJSON,
            parsed: parsed
          };
        } catch (repairError) {
          // Si falla incluso después de reparar, devolver el error
          const match = repairError.message.match(/position (\d+)/);
          const position = match ? parseInt(match[1]) : -1;

          let errorMsg = repairError.message;
          if (position >= 0) {
            errorMsg += this.getErrorContext(input, position);
          }

          return {
            success: false,
            error: errorMsg
          };
        }
      }
    }
  }

  /**
   * Repairs common JSON issues to make it parseable
   */
  repairJSON(str) {
    // A. If it's a JS string wrapped in quotes, clean it
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      str = str.slice(1, -1).replace(/\\"/g, '"');
    }

    // B. Remove trailing commas (e.g., {"a":1,} -> {"a":1})
    str = str.replace(/,\s*([\]}])/g, '$1');

    // C. BALANCE BRACES (Fixes EOF errors)
    // Count how many open and close braces/brackets exist
    const openBraces = (str.match(/{/g) || []).length;
    const closeBraces = (str.match(/}/g) || []).length;
    const openBrackets = (str.match(/\[/g) || []).length;
    const closeBrackets = (str.match(/\]/g) || []).length;

    // Add missing closing braces/brackets at the end
    const missingBraces = openBraces - closeBraces;
    const missingBrackets = openBrackets - closeBraces;

    if (missingBraces > 0) {
      str += '}'.repeat(missingBraces);
    }
    if (missingBrackets > 0) {
      str += ']'.repeat(missingBrackets);
    }

    return str;
  }

  /**
   * Apply syntax highlighting to formatted JSON
   */
  syntaxHighlight(json) {
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split('\n');
    let result = '';

    lines.forEach((line, index) => {
      const hasToggle = /[{\[]/.test(line);
      const toggleHTML = hasToggle
        ? `<span class="toggle toggleIcon" data-line="${index}">▼</span>`
        : '';

      const lineNumber = `<span class="line-number">${index + 1}</span>`;

      // Highlight keys, values, and literals
      const highlightedLine = line.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls;
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'key' : 'string';
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          } else {
            cls = 'number';
          }
          return `<span class="${cls}" data-line="${index}">${match}</span>`;
        }
      );

      // Highlight commas
      const withCommas = highlightedLine.replace(/,/g, '<span class="comma">,</span>');

      // Highlight braces and brackets
      const withBraces = withCommas
        .replace(/\{/g, '<span class="curly-brace-open">{</span>')
        .replace(/\}/g, '<span class="curly-brace-close">}</span>')
        .replace(/\[/g, '<span class="square-brace-open">[</span>')
        .replace(/\]/g, '<span class="square-brace-close">]</span>');

      // Wrap each line in a div for better collapse control
      result += `<div class="json-line" data-line-index="${index}">${toggleHTML}${lineNumber}${withBraces}</div>`;
    });

    return result;
  }

  /**
   * Find the start and end indices of a JSON block
   */
  findJsonBlock(lineIndex, jsonString) {
    const lines = jsonString.split('\n');
    let startIndex = lineIndex;
    let endIndex = -1;
    let stack = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const openMatches = lines[i].match(/[{\[]/g);
      const closeMatches = lines[i].match(/[}\]]/g);

      stack += (openMatches ? openMatches.length : 0);
      stack -= (closeMatches ? closeMatches.length : 0);

      if (stack === 0) {
        endIndex = i;
        break;
      }
    }

    return [startIndex, endIndex];
  }
}

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

  /**
   * Copy content removing line numbers
   */
  async copyFromElement(element) {
    const clone = element.cloneNode(true);

    // Remove line numbers
    const lineNumbers = clone.querySelectorAll('.line-number');
    lineNumbers.forEach(ln => ln.remove());

    // Remove toggle icons
    const toggles = clone.querySelectorAll('.toggle');
    toggles.forEach(t => t.remove());

    const text = clone.textContent || clone.innerText;
    return await this.copy(text);
  }
}

// ============================================
// JSON CONVERTER APP
// ============================================
class JSONConverterApp {
  constructor() {
    this.toast = new ToastManager();
    this.formatter = new JSONFormatter();
    this.clipboard = new ClipboardManager(this.toast);

    this.elements = {
      inputTextarea: document.getElementById('input_string'),
      outputPre: document.getElementById('output_json'),
      convertBtn: document.getElementById('btn_convertir'),
      copyInputBtn: document.getElementById('copy_input'),
      copyOutputBtn: document.getElementById('copy_output'),
      clearInputBtn: document.getElementById('clear_input'),
      collapseAllBtn: document.getElementById('collapse_all'),
      expandAllBtn: document.getElementById('expand_all')
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.elements.inputTextarea.focus();
  }

  bindEvents() {
    // Convert button
    this.elements.convertBtn.addEventListener('click', () => this.handleConvert());

    // Enter key in textarea
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
    this.elements.collapseAllBtn.addEventListener('click', () => this.handleCollapseAll());
    this.elements.expandAllBtn.addEventListener('click', () => this.handleExpandAll());

    // Toggle icons (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggleIcon')) {
        this.handleToggle(e.target);
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
      const result = this.formatter.format(input);

      if (result.success) {
        const highlighted = this.formatter.syntaxHighlight(result.formatted);
        this.elements.outputPre.innerHTML = highlighted;
        this.toast.success('JSON converted successfully!');
      } else {
        // Show error in output for better visibility
        const errorDisplay = `<div style="color: #f56565; padding: 16px; font-family: monospace; white-space: pre-wrap; line-height: 1.6;">❌ Invalid JSON\n\n${result.error}\n\n💡 Tips:\n• Check for missing commas or brackets\n• Verify all quotes are properly closed\n• Use a JSON validator if needed</div>`;
        this.elements.outputPre.innerHTML = errorDisplay;
        this.toast.error('Invalid JSON - Check output for details', 6000);
      }

      // Remove loading state
      this.elements.convertBtn.classList.remove('loading');
      this.elements.convertBtn.disabled = false;
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
    if (this.elements.outputPre.textContent) {
      this.clipboard.copyFromElement(this.elements.outputPre);
    } else {
      this.toast.warning('No output to copy');
    }
  }

  handleClear() {
    this.elements.inputTextarea.value = '';
    this.elements.outputPre.innerHTML = '';
    this.elements.inputTextarea.focus();
    this.toast.success('Cleared!');
  }

  handleToggle(toggleIcon) {
    const lineIndex = parseInt(toggleIcon.getAttribute('data-line'));
    const currentIcon = toggleIcon.textContent;
    const isCollapsed = currentIcon === '▶';

    // Toggle icon
    toggleIcon.textContent = isCollapsed ? '▼' : '▶';

    if (!this.formatter.formattedJSON) return;

    const [startIndex, endIndex] = this.formatter.findJsonBlock(
      lineIndex,
      this.formatter.formattedJSON
    );

    // Toggle visibility of entire lines using the json-line containers
    for (let i = startIndex + 1; i <= endIndex; i++) {
      const lineContainer = document.querySelector(`.json-line[data-line-index="${i}"]`);
      if (lineContainer) {
        if (isCollapsed) {
          // Expandir: mostrar las líneas
          lineContainer.classList.remove('hidden');
        } else {
          // Colapsar: ocultar las líneas
          lineContainer.classList.add('hidden');
        }
      }
    }
  }

  handleCollapseAll() {
    const toggles = document.querySelectorAll('.toggleIcon');
    toggles.forEach(toggle => {
      if (toggle.textContent === '▼') {
        toggle.click();
      }
    });
  }

  handleExpandAll() {
    const toggles = document.querySelectorAll('.toggleIcon');
    toggles.forEach(toggle => {
      if (toggle.textContent === '▶') {
        toggle.click();
      }
    });
  }
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new JSONConverterApp();


  // Add global reference for debugging (optional)
  window.jsonConverterApp = app;

  console.log('%cJSON Converter Ready! 🚀', 'color: #667eea; font-size: 16px; font-weight: bold;');
});

