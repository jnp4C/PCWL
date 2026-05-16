'use strict';

(function () {
  const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 8;

  const form = document.getElementById('create-account-form');
  const emailInput = document.getElementById('new-email');
  const usernameInput = document.getElementById('new-username');
  const passwordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const backButton = document.getElementById('back-to-login');
  const messageBox = document.getElementById('account-message');
  const homeDistrictSelect = document.getElementById('home-district-select');
  const homeDistrictHint = document.getElementById('home-district-hint');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const templateDataset =
    typeof document !== 'undefined' && document.body && document.body.dataset
      ? document.body.dataset
      : null;
  const pageConfig =
    typeof window !== 'undefined' &&
    window.__PCWL_PAGE_CONFIG__ &&
    typeof window.__PCWL_PAGE_CONFIG__ === 'object'
      ? window.__PCWL_PAGE_CONFIG__
      : null;
  let homeUrl =
    (backButton && backButton.dataset.homeUrl) ||
    (templateDataset && templateDataset.appHomeUrl) ||
    (pageConfig && pageConfig.homeUrl) ||
    '/';
  let apiBaseUrl =
    (pageConfig && pageConfig.apiBaseUrl) ||
    (templateDataset && templateDataset.apiBaseUrl) ||
    '/api';

  function normalizeApiBase(base) {
    if (!base) {
      return '/api';
    }
    let normalized = String(base).trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.replace(/\/+$/, '');
    }
    return normalized || '/api';
  }

  apiBaseUrl = normalizeApiBase(apiBaseUrl);

  let districtOptions = [];

  function buildApiUrl(path) {
    if (!path) {
      return apiBaseUrl;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const trimmed = path.startsWith('/') ? path.slice(1) : path;
    return `${apiBaseUrl}/${trimmed}`;
  }

  function setHomeDistrictStatus(text) {
    if (homeDistrictHint) {
      homeDistrictHint.textContent = text;
    }
  }

  async function loadDistricts() {
    if (!homeDistrictSelect) {
      return;
    }
    try {
      setHomeDistrictStatus('Loading districts…');
      const response = await fetch(buildApiUrl('districts/catalog/'), {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Failed to load districts (${response.status})`);
      }
      const data = await response.json();
      const districts = Array.isArray(data?.districts) ? data.districts : [];
      districtOptions = districts
        .filter((d) => d && d.code && d.name)
        .map((d) => ({ code: String(d.code), name: String(d.name) }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      homeDistrictSelect.innerHTML = '<option value=\"\">Choose a home district…</option>';
      districtOptions.forEach((entry) => {
        const option = document.createElement('option');
        option.value = entry.code;
        option.textContent = `${entry.name} (${entry.code})`;
        option.dataset.name = entry.name;
        homeDistrictSelect.appendChild(option);
      });
      setHomeDistrictStatus(districtOptions.length ? 'Pick your home to boost scoring there.' : 'No districts available.');
    } catch (error) {
      console.warn('Failed to load district catalog', error);
      setHomeDistrictStatus('Unable to load districts. You can set a home later in the app.');
      if (homeDistrictSelect) {
        homeDistrictSelect.disabled = true;
      }
    }
  }

  if (window.__PCWL_CONFIG_READY__ && typeof window.__PCWL_CONFIG_READY__.then === 'function') {
    window.__PCWL_CONFIG_READY__
      .then((config) => {
        if (config && typeof config === 'object') {
          if (config.homeUrl) {
            homeUrl = config.homeUrl;
          }
          if (config.apiBaseUrl) {
            apiBaseUrl = normalizeApiBase(config.apiBaseUrl);
          }
        }
        return loadDistricts();
      })
      .catch(() => {
        loadDistricts();
      });
  } else {
    loadDistricts();
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = homeUrl;
    });
  }

  if (!form || !emailInput || !usernameInput || !passwordInput || !confirmPasswordInput || !messageBox) {
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
    const response = await fetch(buildApiUrl('players/'), {
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
      if (Array.isArray(error.data.email) && error.data.email.length) {
        return error.data.email[0];
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

    const email = emailInput.value.trim().toLowerCase();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!USERNAME_PATTERN.test(username)) {
      setMessage('Invalid username. Use 3-32 letters, numbers, or underscores.', 'error');
      usernameInput.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setMessage('Enter a valid email address.', 'error');
      emailInput.focus();
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
    if (!homeDistrictSelect || !homeDistrictSelect.value) {
      setMessage('Choose your home district to create the account.', 'error');
      if (homeDistrictSelect) {
        homeDistrictSelect.focus();
      }
      return;
    }

    form.classList.add('is-submitting');
    if (submitButton) {
      submitButton.disabled = true;
    }
    setMessage('Creating your account…', 'info');

    try {
      const homeCode = homeDistrictSelect && homeDistrictSelect.value ? homeDistrictSelect.value : '';
      let homeName = '';
      if (homeCode && districtOptions.length) {
        const match = districtOptions.find((d) => d.code === homeCode);
        homeName = match ? match.name : '';
      } else if (homeCode && homeDistrictSelect) {
        const selectedOption = homeDistrictSelect.options[homeDistrictSelect.selectedIndex];
        homeName = selectedOption && selectedOption.dataset.name ? selectedOption.dataset.name : '';
      }

      const payload = { email, username, password };
      if (homeCode) {
        payload.home_district_code = homeCode;
      }
      if (homeName) {
        payload.home_district_name = homeName;
      }

      await createAccount(payload);
      setMessage('Account created. Check your email to verify it before signing in.', 'success');
      emailInput.value = '';
      usernameInput.value = '';
      passwordInput.value = '';
      confirmPasswordInput.value = '';
      if (homeDistrictSelect) {
        homeDistrictSelect.value = '';
      }
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
