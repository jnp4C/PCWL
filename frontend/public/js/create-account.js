'use strict';

(function () {
  const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;
  const MIN_PASSWORD_LENGTH = 4;

  const form = document.getElementById('create-account-form');
  const usernameInput = document.getElementById('new-username');
  const passwordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const backButton = document.getElementById('back-to-login');
  const messageBox = document.getElementById('account-message');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const templateDataset =
    typeof document !== 'undefined' && document.body && document.body.dataset
      ? document.body.dataset
      : null;
  const homeUrl =
    (backButton && backButton.dataset.homeUrl) ||
    (templateDataset && templateDataset.appHomeUrl) ||
    '/';

  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = homeUrl;
    });
  }

  if (!form || !usernameInput || !passwordInput || !confirmPasswordInput || !messageBox) {
    return;
  }

  function setMessage(text, variant = 'info') {
    messageBox.textContent = text;
    messageBox.classList.remove('info', 'error', 'success');
    messageBox.classList.add(variant);
  }

  function getCookie(name) {
    if (!name || typeof document === 'undefined') {
      return null;
    }
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (!trimmed) {
        continue;
      }
      if (trimmed.startsWith(`${name}=`)) {
        return decodeURIComponent(trimmed.substring(name.length + 1));
      }
    }
    return null;
  }

  async function createAccount(payload) {
    const csrfToken = getCookie('csrftoken');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    const response = await fetch('/api/players/', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('Content-Type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      const error = new Error('Unable to create account.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  function extractErrorMessage(error) {
    if (!error || typeof error !== 'object') {
      return 'Unable to create account. Try again.';
    }
    if (error.status === 400 && error.data && typeof error.data === 'object') {
      if (Array.isArray(error.data.username) && error.data.username.length) {
        return error.data.username[0];
      }
      if (Array.isArray(error.data.password) && error.data.password.length) {
        return error.data.password[0];
      }
      if (typeof error.data.detail === 'string') {
        return error.data.detail;
      }
    }
    if (error.status === 409) {
      return 'That username is already taken. Choose another.';
    }
    if (error.cause) {
      return 'Network error. Check your connection and try again.';
    }
    return error.message || 'Unable to create account. Try again.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!USERNAME_PATTERN.test(username)) {
      setMessage('Invalid username. Use 3-32 letters, numbers, or underscores.', 'error');
      usernameInput.focus();
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, 'error');
      passwordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Try again.', 'error');
      confirmPasswordInput.focus();
      return;
    }

    form.classList.add('is-submitting');
    if (submitButton) {
      submitButton.disabled = true;
    }
    setMessage('Creating your account…', 'info');

    try {
      await createAccount({ username, password });
      setMessage('Account created! Redirecting to login…', 'success');
      usernameInput.value = '';
      passwordInput.value = '';
      confirmPasswordInput.value = '';
      window.setTimeout(() => {
        window.location.href = homeUrl;
      }, 1200);
    } catch (error) {
      console.warn('Account creation failed', error);
      setMessage(extractErrorMessage(error), 'error');
      passwordInput.value = '';
      confirmPasswordInput.value = '';
      passwordInput.focus();
    } finally {
      form.classList.remove('is-submitting');
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
})();
