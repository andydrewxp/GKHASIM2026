import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAllPlayers } from '../engine/statsManager';

type LegacyView = 'Player' | 'Team';

export const Legacy: React.FC = () => {
  const { state } = useAppContext();
  const [activeView, setActiveView] = useState<LegacyView>('Player');

  // Get all players (active and retired) sorted by legacy score
  const allPlayersWithLegacy = getAllPlayers(state.teams)
    .concat(state.freeAgents, state.retiredPlayers)
    .map((player) => ({
      player,
      legacyScore: player.careerStats.legacy || 0,
    }))
    .filter((entry) => entry.legacyScore > 0)
    .sort((a, b) => b.legacyScore - a.legacyScore);

  // Get all teams sorted by legacy score with championship counts
  const allTeamsWithLegacy = state.teams
    .map((team) => {
      // Count championships for this team
      const championships = state.seasonHistory.filter(
        (season) => season.champion === team.name
      ).length;

      return {
        team,
        legacyScore: team.legacy || 0,
        championships,
      };
    })
    .filter((entry) => entry.legacyScore > 0)
    .sort((a, b) => b.legacyScore - a.legacyScore);

  return (
    <div className="legacy">
      <h2>Legacy</h2>

      {/* Sub-navigation */}
      <div className="toggle">
        <button
          className={activeView === 'Player' ? 'active' : ''}
          onClick={() => setActiveView('Player')}
        >
          Player
        </button>
        <button
          className={activeView === 'Team' ? 'active' : ''}
          onClick={() => setActiveView('Team')}
        >
          Team
        </button>
      </div>

      {/* Player Legacy View */}
      {activeView === 'Player' && (
        <>
          {allPlayersWithLegacy.length === 0 ? (
            <p>No players have earned legacy points yet. Complete a season to see legacy rankings!</p>
          ) : (
            <div className="legacy-list">
              {allPlayersWithLegacy.map((entry, index) => (
                <div
                  key={entry.player.id}
                  className="legacy-card"
                  style={{
                    borderColor: entry.player.state === 'Retired' ? '#87CEEB' : 'white',
                  }}
                >
                  <div className="legacy-rank">#{index + 1}</div>
                  <div className="legacy-player-info">
                    <h3 style={{ color: entry.player.state === 'Retired' ? '#87CEEB' : 'white' }}>
                      {entry.player.name}
                    </h3>
                    <div className="legacy-details">
                      <span className="legacy-position">{entry.player.position}</span>
                      {entry.player.state === 'Retired' && (
                        <span className="legacy-status retired">Retired</span>
                      )}
                      {entry.player.state === 'Active' && entry.player.teamId && (
                        <span className="legacy-status active">Active</span>
                      )}
                      {entry.player.state === 'Free Agent' && (
                        <span className="legacy-status free-agent">Free Agent</span>
                      )}
                    </div>
                  </div>
                  <div className="legacy-score">
                    <div className="legacy-score-value">{entry.legacyScore}</div>
                    <div className="legacy-score-label">Legacy</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Team Legacy View */}
      {activeView === 'Team' && (
        <>
          {allTeamsWithLegacy.length === 0 ? (
            <p>No teams have earned legacy points yet. Complete a season to see team legacy rankings!</p>
          ) : (
            <div className="legacy-list">
              {allTeamsWithLegacy.map((entry, index) => (
                <div
                  key={entry.team.id}
                  className="legacy-card"
                >
                  <div className="legacy-rank">#{index + 1}</div>
                  <div className="legacy-player-info">
                    <h3 style={{ color: 'white' }}>{entry.team.name}</h3>
                    <div className="legacy-details">
                      <span className="legacy-position">
                        {entry.championships} {entry.championships === 1 ? 'Championship' : 'Championships'}
                      </span>
                    </div>
                  </div>
                  <div className="legacy-score">
                    <div className="legacy-score-value">{entry.legacyScore}</div>
                    <div className="legacy-score-label">Legacy</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
