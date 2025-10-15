'use strict';

(function () {
  const STORAGE_KEY = 'pragueExplorerPlayers';
  const LAST_SIGNED_IN_USER_KEY = 'pragueExplorerLastUser';
  const MIN_PASSWORD_LENGTH = 4;
  const DEV_USERNAME = 'dev';
  const DEV_DEFAULT_PASSWORD = 'deve';
  const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

  const form = document.getElementById('create-account-form');
  const usernameInput = document.getElementById('new-username');
  const passwordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const backButton = document.getElementById('back-to-login');
  const messageBox = document.getElementById('account-message');

  if (!form || !usernameInput || !passwordInput || !confirmPasswordInput) {
    return;
  }

  function setMessage(text, variant = 'info') {
    if (!messageBox) {
      return;
    }
    messageBox.textContent = text;
    messageBox.classList.remove('info', 'error', 'success');
    messageBox.classList.add(variant);
  }

  function isValidUsername(value) {
    return USERNAME_PATTERN.test(value);
  }

  function arrayBufferToBase64(buffer) {
    if (!buffer) {
      return '';
    }
    let bytes;
    if (buffer instanceof ArrayBuffer) {
      bytes = new Uint8Array(buffer);
    } else if (ArrayBuffer.isView(buffer)) {
      bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    } else {
      return '';
    }
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(binary);
    }
    return binary;
  }

  function getCrypto() {
    if (typeof window !== 'undefined' && window.crypto) {
      return window.crypto;
    }
    if (typeof self !== 'undefined' && self.crypto) {
      return self.crypto;
    }
    if (typeof crypto !== 'undefined') {
      return crypto;
    }
    return null;
  }

  function generateSalt() {
    const cryptoObj = getCrypto();
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      cryptoObj.getRandomValues(bytes);
      return arrayBufferToBase64(bytes);
    }
    const entropy = `${Date.now()}-${Math.random()}-${Math.random()}`;
    if (typeof TextEncoder !== 'undefined') {
      return arrayBufferToBase64(new TextEncoder().encode(entropy));
    }
    const fallbackBytes = new Uint8Array(entropy.split('').map((char) => char.charCodeAt(0)));
    return arrayBufferToBase64(fallbackBytes);
  }

  async function hashPassword(password, salt) {
    const cryptoObj = getCrypto();
    const material = `${salt}:${password}`;
    if (cryptoObj && cryptoObj.subtle && typeof cryptoObj.subtle.digest === 'function' && typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const data = encoder.encode(material);
      const digest = await cryptoObj.subtle.digest('SHA-256', data);
      return arrayBufferToBase64(digest);
    }
    if (typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      return arrayBufferToBase64(encoder.encode(material));
    }
    const fallbackBytes = material.split('').map((char) => char.charCodeAt(0));
    return arrayBufferToBase64(new Uint8Array(fallbackBytes));
  }

  function loadPlayers() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {};
      }
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load players from storage', error);
    }
    return {};
  }

  function savePlayers(players) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.warn('Failed to save players to storage', error);
      throw error;
    }
  }

  function ensureDevCredentials(players) {
    if (!Object.prototype.hasOwnProperty.call(players, DEV_USERNAME)) {
      return Promise.resolve(players);
    }
    const salt = generateSalt();
    return hashPassword(DEV_DEFAULT_PASSWORD, salt)
      .then((passwordHash) => {
        const devProfile = players[DEV_USERNAME] && typeof players[DEV_USERNAME] === 'object' ? players[DEV_USERNAME] : {};
        devProfile.auth = {
          passwordHash,
          salt,
          createdAt: Date.now(),
          rememberOnDevice: false,
        };
        players[DEV_USERNAME] = devProfile;
        return players;
      })
      .catch((error) => {
        console.warn('Failed to refresh dev account password', error);
        return players;
      });
  }

  function usernameExists(players, username) {
    const lower = username.toLowerCase();
    if (lower === DEV_USERNAME) {
      return true;
    }
    return Object.keys(players).some((existing) => existing.toLowerCase() === lower);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!isValidUsername(username)) {
      setMessage('Invalid username. Use 3-32 characters made of letters, numbers, or underscores.', 'error');
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

    const players = loadPlayers();
    if (usernameExists(players, username)) {
      setMessage('That username is already taken. Choose another.', 'error');
      usernameInput.focus();
      return;
    }

    setMessage('Creating your account…', 'info');
    form.classList.add('is-submitting');

    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const profile = players[username] && typeof players[username] === 'object' ? players[username] : {};
      profile.auth = {
        passwordHash,
        salt,
        createdAt: Date.now(),
        rememberOnDevice: false,
      };
      players[username] = profile;
      const updatedPlayers = await ensureDevCredentials(players);
      savePlayers(updatedPlayers);
      window.localStorage.setItem(LAST_SIGNED_IN_USER_KEY, username);

      setMessage('Account created! Return to the login page to sign in.', 'success');
      form.reset();
      usernameInput.focus();
    } catch (error) {
      console.error('Failed to create account', error);
      setMessage('Something went wrong while creating your account. Please try again.', 'error');
    } finally {
      form.classList.remove('is-submitting');
    }
  }

  form.addEventListener('submit', handleSubmit);

  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
})();
