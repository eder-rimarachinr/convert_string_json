/**
 * Theme switch (light by default, dark opt-in).
 * Loaded as a classic blocking script in <head> so the saved theme is applied
 * before first paint (no flash). External file because the CSP forbids inline scripts.
 */
(function () {
  var STORAGE_KEY = 'theme';
  var THEME_COLORS = { light: '#e8ecf0', dark: '#1a2029' };
  var root = document.documentElement;

  function readSaved() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null; // storage blocked (private mode, disabled cookies...)
    }
  }

  function apply(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);

    var button = document.getElementById('theme_toggle');
    if (button) {
      var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
  }

  var current = readSaved() === 'dark' ? 'dark' : 'light';
  apply(current);

  document.addEventListener('DOMContentLoaded', function () {
    apply(current);

    var button = document.getElementById('theme_toggle');
    if (!button) return;

    button.addEventListener('click', function () {
      current = current === 'dark' ? 'light' : 'dark';
      apply(current);
      try {
        localStorage.setItem(STORAGE_KEY, current);
      } catch (e) {
        // Not persisted; the switch still works for this visit
      }
    });
  });
})();
