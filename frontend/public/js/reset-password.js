'use strict';

(function () {
  const MIN_PASSWORD_LENGTH = 8;
  const form = document.getElementById('reset-password-form');
  const passwordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const messageBox = document.getElementById('reset-message');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const pageConfig =
    typeof window !== 'undefined' &&
    window.__PCWL_PAGE_CONFIG__ &&
    typeof window.__PCWL_PAGE_CONFIG__ === 'object'
      ? window.__PCWL_PAGE_CONFIG__
      : null;
  let apiBaseUrl = (pageConfig && pageConfig.apiBaseUrl) || '/api';

  function normalizeApiBase(base) {
    let normalized = String(base || '/api').trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.replace(/\/+$/, '');
    }
    return normalized || '/api';
  }

  function buildApiUrl(path) {
    const trimmed = String(path || '').replace(/^\/+/, '');
    return `${apiBaseUrl}/${trimmed}`;
  }

  function setMessage(text, variant = 'info') {
    if (!messageBox) {
      return;
    }
    messageBox.textContent = text;
    messageBox.classList.remove('info', 'error', 'success');
    messageBox.classList.add(variant);
  }

  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${name}=`)) {
        return decodeURIComponent(trimmed.substring(name.length + 1));
      }
    }
    return null;
  }

  apiBaseUrl = normalizeApiBase(apiBaseUrl);

  if (window.__PCWL_CONFIG_READY__ && typeof window.__PCWL_CONFIG_READY__.then === 'function') {
    window.__PCWL_CONFIG_READY__.then((config) => {
      if (config && config.apiBaseUrl) {
        apiBaseUrl = normalizeApiBase(config.apiBaseUrl);
      }
    }).catch(() => null);
  }

  if (!form || !passwordInput || !confirmPasswordInput) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  if (!uid || !token) {
    setMessage('This password reset link is missing required data.', 'error');
    if (submitButton) submitButton.disabled = true;
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, 'error');
      passwordInput.focus();
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.', 'error');
      confirmPasswordInput.focus();
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setMessage('Resetting password…', 'info');
    try {
      const csrfToken = getCookie('csrftoken');
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (csrfToken) headers['X-CSRFToken'] = csrfToken;
      const response = await fetch(buildApiUrl(`auth/password-reset/confirm/${uid}/${token}/`), {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data = response.headers.get('Content-Type')?.includes('application/json') ? await response.json() : {};
      if (!response.ok) {
        const detail =
          (Array.isArray(data.password) && data.password[0]) ||
          data.detail ||
          'Unable to reset password.';
        throw new Error(detail);
      }
      setMessage('Password reset. Redirecting to login…', 'success');
      window.setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (error) {
      setMessage(error.message || 'Unable to reset password.', 'error');
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
