import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLeagueLeaders, getAllPlayers } from '../engine/statsManager';

export const LeagueLeaders: React.FC = () => {
  const { state } = useAppContext();
  const [useSeason, setUseSeason] = useState(true);

  // For career stats, include retired players; for season stats, only active players
  const allPlayers = useSeason
    ? getAllPlayers(state.teams).concat(state.freeAgents)
    : getAllPlayers(state.teams).concat(state.freeAgents, state.retiredPlayers);

  const goalsLeaders = getLeagueLeaders(allPlayers, 'goals', useSeason, 10);
  const assistsLeaders = getLeagueLeaders(allPlayers, 'assists', useSeason, 10);
  const pointsLeaders = getLeagueLeaders(allPlayers, 'points', useSeason, 10);
  const savesLeaders = getLeagueLeaders(allPlayers, 'saves', useSeason, 10);
  const hitsLeaders = getLeagueLeaders(allPlayers, 'hits', useSeason, 10);

  return (
    <div className="league-leaders">
      <h2>League Leaders</h2>
      <div className="toggle">
        <button
          className={useSeason ? 'active' : ''}
          onClick={() => setUseSeason(true)}
        >
          Season Stats
        </button>
        <button
          className={!useSeason ? 'active' : ''}
          onClick={() => setUseSeason(false)}
        >
          Career Stats
        </button>
      </div>

      <div className="leaders-grid">
        <div className="leader-category">
          <h3>Goals</h3>
          <ol>
            {goalsLeaders.map((leader) => (
              <li key={leader.player.id} style={{ color: leader.player.state === 'Retired' ? '#87CEEB' : 'inherit' }}>
                {leader.player.name} - {leader.value}
              </li>
            ))}
          </ol>
        </div>

        <div className="leader-category">
          <h3>Assists</h3>
          <ol>
            {assistsLeaders.map((leader) => (
              <li key={leader.player.id} style={{ color: leader.player.state === 'Retired' ? '#87CEEB' : 'inherit' }}>
                {leader.player.name} - {leader.value}
              </li>
            ))}
          </ol>
        </div>

        <div className="leader-category">
          <h3>Points</h3>
          <ol>
            {pointsLeaders.map((leader) => (
              <li key={leader.player.id} style={{ color: leader.player.state === 'Retired' ? '#87CEEB' : 'inherit' }}>
                {leader.player.name} - {leader.value}
              </li>
            ))}
          </ol>
        </div>

        <div className="leader-category">
          <h3>Saves</h3>
          <ol>
            {savesLeaders.map((leader) => (
              <li key={leader.player.id} style={{ color: leader.player.state === 'Retired' ? '#87CEEB' : 'inherit' }}>
                {leader.player.name} - {leader.value}
              </li>
            ))}
          </ol>
        </div>

        <div className="leader-category">
          <h3>Hits</h3>
          <ol>
            {hitsLeaders.map((leader) => (
              <li key={leader.player.id} style={{ color: leader.player.state === 'Retired' ? '#87CEEB' : 'inherit' }}>
                {leader.player.name} - {leader.value}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
