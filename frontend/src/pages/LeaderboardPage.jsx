import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard, hydrateLeaderboard } from '../store/leaderboardSlice';
import { fetchConfig } from '../store/configSlice';

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value || 0);
}

function formatRatio(attack, defend) {
  const attackValue = Number(attack) || 0;
  const defendValue = Number(defend) || 0;
  if (attackValue === 0 && defendValue === 0) return '—';
  if (defendValue === 0) return '∞';
  const ratio = attackValue / defendValue;
  const precision = ratio >= 10 ? 1 : 2;
  return (ratio || 0).toFixed(precision);
}

export default function LeaderboardPage() {
  const dispatch = useDispatch();
  const leaderboard = useSelector((state) => state.leaderboard);
  const config = useSelector((state) => state.config.data);
  const playerRows = leaderboard.players || [];
  const districtRows = leaderboard.districts || [];
  const homeUrl = config?.links?.home || '/';

  useEffect(() => {
    dispatch(fetchConfig('leaderboard')).then((action) => {
      const payload = action.payload?.data || {};
      if (payload.leaderboard) {
        dispatch(hydrateLeaderboard(payload.leaderboard));
      }
    });
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <main className="app">
      <section className="panel">
        <header className="top-bar leaderboard-bar">
          <div className="nav-group">
            <a href={homeUrl} className="secondary button-link">
              Back to Game
            </a>
          </div>
          <div className="score">
            <h1>Global Leaderboards</h1>
          </div>
          <div></div>
        </header>
        <p className="leaderboard-intro">
          Points earned in Prague Explorer now fuel two leaderboards: one for individual players and one for districts.
          Every district starts with <strong>2,000</strong> control points. Defend your home to add to its total, or launch
          attacks to drain rival districts.
        </p>
        <div className="leaderboard-sections">
          <section className="leaderboard-section" aria-labelledby="player-leaderboard-heading">
            <h2 id="player-leaderboard-heading">Player Leaderboard</h2>
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table leaderboard-table--players" aria-describedby="player-leaderboard-heading">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Player</th>
                    <th scope="col" className="numeric">
                      Points
                    </th>
                    <th scope="col" className="numeric">
                      Attack
                    </th>
                    <th scope="col" className="numeric">
                      Defend
                    </th>
                    <th scope="col" className="numeric">
                      A : D Ratio
                    </th>
                  </tr>
                </thead>
                <tbody id="player-leaderboard-body">
                  {playerRows.length === 0 && (
                    <tr>
                      <td colSpan="6" className="numeric">
                        No player activity yet.
                      </td>
                    </tr>
                  )}
                  {playerRows.map((player, index) => (
                    <tr key={player.id || player.username || index}>
                      <td>{index + 1}</td>
                      <td>{player.username}</td>
                      <td className="numeric">{formatNumber(player.score)}</td>
                      <td className="numeric">{formatNumber(player.attack_points)}</td>
                      <td className="numeric">{formatNumber(player.defend_points)}</td>
                      <td className="numeric">{formatRatio(player.attack_points, player.defend_points)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`leaderboard-empty ${playerRows.length ? 'hidden' : ''}`} id="player-leaderboard-empty">
              No player activity yet. Check in or attack a district to appear here.
            </p>
          </section>
          <section className="leaderboard-section" aria-labelledby="district-leaderboard-heading">
            <h2 id="district-leaderboard-heading">District Leaderboard</h2>
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table leaderboard-table--districts" aria-describedby="district-leaderboard-heading">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">District</th>
                    <th scope="col" className="numeric">
                      Score
                    </th>
                    <th scope="col" className="numeric">
                      Change
                    </th>
                    <th scope="col" className="numeric">
                      Defended
                    </th>
                    <th scope="col" className="numeric">
                      Attacked
                    </th>
                  </tr>
                </thead>
                <tbody id="district-leaderboard-body">
                  {districtRows.length === 0 && (
                    <tr>
                      <td colSpan="6" className="numeric">
                        No district data yet.
                      </td>
                    </tr>
                  )}
                  {districtRows.map((district, index) => (
                    <tr key={district.id || district.code || index}>
                      <td>{index + 1}</td>
                      <td>{district.name}</td>
                      <td className="numeric">{formatNumber(district.score)}</td>
                      <td className="numeric">{formatNumber(district.change)}</td>
                      <td className="numeric">{formatNumber(district.defended)}</td>
                      <td className="numeric">{formatNumber(district.attacked)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`leaderboard-empty ${districtRows.length ? 'hidden' : ''}`} id="district-leaderboard-empty">
              No districts have been contested yet. Capture or defend a district to change the standings.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
