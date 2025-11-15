'use strict';

// Lightweight global error reporter to make console errors easy to find and share
(function () {
  if (window.__pcwlErrorReporterInstalled__) return;
  window.__pcwlErrorReporterInstalled__ = true;

  const MAX_LOGS = 20;
  const logs = [];

  function pushLog(entry) {
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs.pop();
  }

  function fmtNow() {
    try {
      return new Date().toISOString();
    } catch (_) {
      return '';
    }
  }

  function toPlainObject(value) {
    if (!value) return value;
    if (value instanceof Error) {
      return {
        name: value.name || 'Error',
        message: String(value.message || ''),
        stack: String(value.stack || ''),
      };
    }
    if (typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (_) {
        return { type: Object.prototype.toString.call(value) };
      }
    }
    return value;
  }

  function logToConsole(prefix, data) {
    try {
      // Use console.groupCollapsed for readability if available
      if (console.groupCollapsed) {
        console.groupCollapsed(prefix);
        console.error(data.summary);
        if (data.details) console.error(data.details);
        if (data.context) console.error('Context:', data.context);
        console.groupEnd();
      } else {
        console.error(prefix, data.summary, data.details || '', data.context || '');
      }
    } catch (_) {
      // ignore console errors
    }
  }

  // Create a small floating banner that appears when an error is captured
  let banner, panel, toggleBtn;
  function ensureUi() {
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'pcwl-error-banner';
    banner.setAttribute('role', 'status');
    banner.style.cssText = [
      'position:fixed',
      'bottom:8px',
      'right:8px',
      'z-index:2147483647',
      'background:#fee2e2',
      'color:#991b1b',
      'border:1px solid #fecaca',
      'border-radius:8px',
      'box-shadow:0 2px 8px rgba(0,0,0,.15)',
      'font:13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      'padding:8px 10px',
      'max-width: min(90vw, 520px)',
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'An error occurred — open console for details';
    title.style.fontWeight = '600';

    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Show';
    toggleBtn.style.cssText = [
      'margin-left:8px',
      'background:#991b1b',
      'color:white',
      'border:0',
      'border-radius:5px',
      'padding:4px 8px',
      'cursor:pointer',
    ].join(';');

    const head = document.createElement('div');
    head.style.display = 'flex';
    head.style.alignItems = 'center';
    head.appendChild(title);
    head.appendChild(toggleBtn);

    panel = document.createElement('pre');
    panel.style.cssText = [
      'margin:8px 0 0 0',
      'padding:8px',
      'background:#fff',
      'color:#111827',
      'border-radius:6px',
      'max-height:40vh',
      'overflow:auto',
      'display:none',
      'white-space:pre-wrap',
    ].join(';');

    toggleBtn.addEventListener('click', () => {
      const visible = panel.style.display !== 'none';
      panel.style.display = visible ? 'none' : 'block';
      toggleBtn.textContent = visible ? 'Show' : 'Hide';
      if (!visible) renderPanel();
    });

    banner.appendChild(head);
    banner.appendChild(panel);
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(banner));
  }

  function renderPanel() {
    try {
      const lines = logs.map((e) => {
        const ctx = e.context ? `\nContext: ${JSON.stringify(e.context)}` : '';
        const details = e.details ? `\n${e.details}` : '';
        return `[${e.time}] ${e.summary}${details}${ctx}`;
      });
      panel.textContent = lines.join('\n\n');
    } catch (_) {}
  }

  function handleError(data) {
    ensureUi();
    pushLog(data);
    logToConsole('[PCWL Error]', data);
  }

  window.addEventListener('error', (event) => {
    try {
      const { message, filename, lineno, colno, error } = event;
      const summary = message || (error && error.message) || 'Unknown script error';
      const details = [
        filename ? `at ${filename}:${lineno || 0}:${colno || 0}` : null,
        error && error.stack ? String(error.stack) : null,
      ].filter(Boolean).join('\n');
      handleError({
        time: fmtNow(),
        summary,
        details,
        context: undefined,
      });
    } catch (_) {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const info = toPlainObject(reason);
      const summary = (info && (info.message || info.name)) || 'Unhandled promise rejection';
      const details = info && info.stack ? String(info.stack) : JSON.stringify(info);
      handleError({
        time: fmtNow(),
        summary,
        details,
        context: { type: 'unhandledrejection' },
      });
    } catch (_) {}
  });

  // Report browser-enforced Content Security Policy violations to aid debugging.
  window.addEventListener('securitypolicyviolation', (event) => {
    try {
      const blockedURI = event.blockedURI || '';
      const violatedDirective = event.violatedDirective || '';
      const effectiveDirective = event.effectiveDirective || '';
      const sourceFile = event.sourceFile || '';
      const lineNumber = event.lineNumber || 0;
      const columnNumber = event.columnNumber || 0;
      const disposition = event.disposition || '';
      const sample = event.sample || '';
      const summary = `CSP violation: blocked ${effectiveDirective || violatedDirective} → ${blockedURI || '(unknown)'}`;
      const details = [
        sourceFile ? `at ${sourceFile}:${lineNumber}:${columnNumber}` : null,
        violatedDirective ? `violated-directive: ${violatedDirective}` : null,
        disposition ? `disposition: ${disposition}` : null,
        sample ? `sample: ${sample}` : null,
      ].filter(Boolean).join('\n');
      handleError({
        time: fmtNow(),
        summary,
        details,
        context: { type: 'securitypolicyviolation', blockedURI, violatedDirective, effectiveDirective },
      });
    } catch (_) {}
  });
})();
