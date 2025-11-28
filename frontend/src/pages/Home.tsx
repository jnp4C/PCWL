import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchConfig } from '../features/config/configSlice';
import { fetchSession, login } from '../features/session/sessionSlice';
import { playerThunks } from '../features/players/playerSlice';
import { districtThunks } from '../features/districts/districtSlice';
import { fetchActiveParty } from '../features/parties/partySlice';
import { fetchFriends } from '../features/friends/friendSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session);
  const players = useAppSelector((state) => state.players);
  const districts = useAppSelector((state) => state.districts);
  const party = useAppSelector((state) => state.parties.active);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    dispatch(fetchConfig());
    dispatch(fetchSession());
    dispatch(playerThunks.fetchAll());
    dispatch(districtThunks.fetchAll());
    dispatch(fetchActiveParty());
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!credentials.username || !credentials.password) return;
    dispatch(login(credentials));
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Session</h2>
        {session.authenticated && session.user ? (
          <div>
            <div>
              Signed in as <strong>{session.user.username}</strong>
            </div>
            <div>Home: {session.user.home_district_name || session.user.home_district_code || 'unset'}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              value={credentials.username}
              onChange={(e) => setCredentials((p) => ({ ...p, username: e.target.value }))}
              placeholder="Username"
            />
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
              placeholder="Password"
            />
            <button type="submit">Login</button>
            {session.status === 'failed' && <span style={{ color: 'tomato' }}>{session.error}</span>}
          </form>
        )}
      </section>

      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Players</h2>
        {players.loading && <p>Loading…</p>}
        {!players.loading && players.allIds.length === 0 && <p>No players loaded.</p>}
        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
          {players.allIds.map((id) => {
            const player = players.byId[id.toString()];
            if (!player) return null;
            return (
              <li key={id}>
                {player.username} — {player.score ?? 0} pts — home {player.home_district_name || player.home_district_code || 'unset'}
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Districts</h2>
        {districts.loading && <p>Loading…</p>}
        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
          {districts.allIds.map((id) => {
            const district = districts.byId[id.toString()];
            if (!district) return null;
            return (
              <li key={id}>
                {district.name} ({district.code}) {district.is_active === false ? '(inactive)' : ''}
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Active party</h2>
        {party ? (
          <div>
            <div>
              {party.name || 'Party'} • {party.members?.length ?? 0}/{party.size ?? party.members?.length ?? 0} players
            </div>
            <div>
              Active district: {party.active_district_name || party.active_district_code || 'n/a'} • expires{' '}
              {party.seconds_remaining ? `${Math.round(party.seconds_remaining)}s` : 'n/a'}
            </div>
          </div>
        ) : (
          <p>No active party.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
