import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchLeaderboard } from '../features/leaderboard/leaderboardSlice';

const Leaderboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const leaderboard = useAppSelector((state) => state.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2>Player leaderboard</h2>
        {leaderboard.status === 'loading' && <p>Loading…</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">#</th>
              <th align="left">Player</th>
              <th align="right">Points</th>
              <th align="right">Attack</th>
              <th align="right">Defend</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.players.map((entry, index) => (
              <tr key={entry.username || index}>
                <td>{entry.rank ?? index + 1}</td>
                <td>{entry.display_name || entry.username}</td>
                <td align="right">{entry.score ?? 0}</td>
                <td align="right">{entry.attack_points ?? 0}</td>
                <td align="right">{entry.defend_points ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2>District leaderboard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">#</th>
              <th align="left">District</th>
              <th align="right">Strength</th>
              <th align="right">Defended</th>
              <th align="right">Attacked</th>
              <th align="right">Check-ins</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.districts.map((entry, index) => (
              <tr key={entry.id || index}>
                <td>{entry.rank ?? index + 1}</td>
                <td>{entry.name || entry.id}</td>
                <td align="right">{entry.strength ?? 0}</td>
                <td align="right">{entry.defended ?? 0}</td>
                <td align="right">{entry.attacked ?? 0}</td>
                <td align="right">{entry.checkins ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Leaderboard;
