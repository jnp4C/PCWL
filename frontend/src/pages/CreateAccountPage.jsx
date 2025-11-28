import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

export default function CreateAccountPage() {
  const config = useSelector((state) => state.config.data);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Choose a username and password to get started.');

  const homeUrl = useMemo(() => (config?.links?.home ? config.links.home : '/'), [config]);
  const staticBase = (config?.assets?.static_url || '/').replace(/\/?$/, '/');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('loading');
    setMessage('Creating account…');
    try {
      await apiClient.post(apiEndpoints.players, { username, password });
      setMessage('Account created. You can now sign in.');
      setStatus('succeeded');
    } catch (error) {
      const normalised = normaliseError(error);
      setMessage(normalised.message || 'Could not create account.');
      setStatus('failed');
    }
  };

  return (
    <main className="app">
      <section className="panel account-panel">
        <button
          type="button"
          className="secondary back-link"
          id="back-to-login"
          data-home-url={homeUrl}
          onClick={() => (window.location.href = homeUrl)}
        >
          ← Back to login
        </button>
        <img
          src={`${staticBase}data/Prague_Civil_War_Live.png`}
          alt="PCWL logo"
          className="welcome-logo"
        />
        <h1>Create a PCWL account</h1>
        <p className="account-hint">Usernames must be 3–32 characters and can include letters, numbers, or underscores.</p>

        <form id="create-account-form" className="account-form" autoComplete="off" noValidate onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="new-username">Username</label>
            <input
              type="text"
              id="new-username"
              name="username"
              maxLength="32"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="new-password">Password</label>
            <input
              type="password"
              id="new-password"
              name="password"
              minLength="4"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              minLength="4"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <div className="account-actions">
            <button type="submit" className="primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating…' : 'Create account'}
            </button>
            <p className="account-hint">
              Already have an account?{' '}
              <a className="account-link" href={homeUrl}>
                Return to login
              </a>
            </p>
          </div>
          <div id="account-message" className="form-message info" role="status" aria-live="polite">
            {message}
          </div>
        </form>
      </section>
    </main>
  );
}
