import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { playerThunks } from '../features/players/playerSlice';
import { districtThunks } from '../features/districts/districtSlice';

const Account: React.FC = () => {
  const dispatch = useAppDispatch();
  const districts = useAppSelector((state) => state.districts);
  const [form, setForm] = useState({
    username: '',
    password: '',
    homeDistrict: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    dispatch(districtThunks.fetchAll());
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Creating account…');
    try {
      const payload: any = {
        username: form.username.trim(),
        password: form.password,
      };
      if (form.homeDistrict) {
        payload.home_district_code = form.homeDistrict;
        const match = districts.byId[form.homeDistrict];
        if (match?.name) {
          payload.home_district_name = match.name;
        }
      }
      await dispatch(playerThunks.createItem(payload)).unwrap();
      setStatus('Account created. You can now sign in on the home page.');
      setForm({ username: '', password: '', homeDistrict: '' });
    } catch (error: any) {
      setStatus(error?.message || 'Failed to create account.');
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Username
          <input
            required
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="Username"
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Password"
          />
        </label>
        <label>
          Home district (optional)
          <select
            value={form.homeDistrict}
            onChange={(e) => setForm((p) => ({ ...p, homeDistrict: e.target.value }))}
          >
            <option value="">Choose a district…</option>
            {districts.allIds.map((id) => {
              const entry = districts.byId[id.toString()];
              if (!entry) return null;
              return (
                <option key={id} value={entry.code}>
                  {entry.name} ({entry.code})
                </option>
              );
            })}
          </select>
        </label>
        <button type="submit">Create account</button>
        {status && <div aria-live="polite">{status}</div>}
      </form>
    </div>
  );
};

export default Account;
