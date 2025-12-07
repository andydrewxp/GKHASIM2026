import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

type HistoryView = 'Past Season Results' | 'Retired Players' | 'Hall of Fame';

export const LeagueHistory: React.FC = () => {
  const { state } = useAppContext();
  const [activeView, setActiveView] = useState<HistoryView>('Past Season Results');

  // Filter retired players with minimum 30 games played
  const retiredPlayersWithMinGames = state.retiredPlayers.filter(
    (player) => player.careerStats.gamesPlayed >= 30
  );

  return (
    <div className="league-history">
      <h2>League History</h2>

      {/* Sub-navigation */}
      <div className="history-nav">
        <button
          className={activeView === 'Past Season Results' ? 'active' : ''}
          onClick={() => setActiveView('Past Season Results')}
        >
          Past Season Results
        </button>
        <button
          className={activeView === 'Retired Players' ? 'active' : ''}
          onClick={() => setActiveView('Retired Players')}
        >
          Retired Players
        </button>
        {state.currentYear > 2039 && (
          <button
            className={activeView === 'Hall of Fame' ? 'active' : ''}
            onClick={() => setActiveView('Hall of Fame')}
          >
            Hall of Fame
          </button>
        )}
      </div>

      {/* Past Season Results View */}
      {activeView === 'Past Season Results' && (
        <>
          {state.seasonHistory.length === 0 ? (
            <p>No historical data yet. Complete a season to see history!</p>
          ) : (
            <div className="history-list">
              {[...state.seasonHistory].reverse().map((season, index) => (
                <div key={`${season.year}-${index}`} className="season-history">
                  <h3>{season.year} Season</h3>
                  <p className="champion">🏆 Champion: <strong>{season.champion}</strong></p>
                  <div className="stat-leaders">
                    <h4>Stat Leaders</h4>
                    <ul>
                      <li>Goals: {season.statLeaders.goals.playerName} ({season.statLeaders.goals.value})</li>
                      <li>Assists: {season.statLeaders.assists.playerName} ({season.statLeaders.assists.value})</li>
                      <li>Points: {season.statLeaders.points.playerName} ({season.statLeaders.points.value})</li>
                      <li>Saves: {season.statLeaders.saves.playerName} ({season.statLeaders.saves.value})</li>
                      <li>Hits: {season.statLeaders.hits.playerName} ({season.statLeaders.hits.value})</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Retired Players View */}
      {activeView === 'Retired Players' && (
        <>
          {retiredPlayersWithMinGames.length === 0 ? (
            <p>No retired players with 30+ games played yet.</p>
          ) : (
            <div className="retired-players-list">
              {retiredPlayersWithMinGames.map((player) => (
                <div key={player.id} className="retired-player-card">
                  <div className="retired-player-header">
                    <h3>{player.name}</h3>
                    <span className="player-position">{player.position}</span>
                  </div>
                  <div className="retired-player-info">
                    <p><strong>Years of Experience:</strong> {player.yearsOfExperience}</p>
                    <p><strong>Final Age:</strong> {player.age}</p>
                  </div>
                  <div className="retired-player-stats">
                    <h4>Career Stats</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Games Played</span>
                        <span className="stat-value">{player.careerStats.gamesPlayed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Goals</span>
                        <span className="stat-value">{player.careerStats.goals}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Assists</span>
                        <span className="stat-value">{player.careerStats.assists}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Points</span>
                        <span className="stat-value">{player.careerStats.points}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Hits</span>
                        <span className="stat-value">{player.careerStats.hits}</span>
                      </div>
                      {player.position === 'Goalie' && player.careerStats.saves !== undefined && (
                        <div className="stat-item">
                          <span className="stat-label">Saves</span>
                          <span className="stat-value">{player.careerStats.saves}</span>
                        </div>
                      )}
                      <div className="stat-item">
                        <span className="stat-label">Legacy</span>
                        <span className="stat-value">{player.careerStats.legacy || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Hall of Fame View */}
      {activeView === 'Hall of Fame' && (
        <>
          {state.hallOfFame.length === 0 ? (
            <p>No Hall of Fame inductees yet.</p>
          ) : (
            <div className="hall-of-fame-list">
              {[...state.hallOfFame].reverse().map((inductee) => (
                <div key={inductee.playerId} className="hall-of-fame-card">
                  <div className="hall-of-fame-header">
                    <div className="hof-rank">
                      <span className="hof-trophy">🏆</span>
                    </div>
                    <div className="hof-player-info">
                      <h3>{inductee.playerName}</h3>
                      <span className="player-position">{inductee.position}</span>
                      <p className="induction-year">Inducted: {inductee.inductionYear}</p>
                      <p className="retirement-year">Retired: {inductee.retirementYear}</p>
                    </div>
                    <div className="hof-legacy-badge">
                      <div className="hof-legacy-value">{inductee.legacyScore}</div>
                      <div className="hof-legacy-label">Legacy</div>
                    </div>
                  </div>
                  <div className="hof-player-details">
                    <p><strong>Years of Experience:</strong> {inductee.yearsOfExperience}</p>
                  </div>
                  <div className="hof-player-stats">
                    <h4>Career Stats</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Games Played</span>
                        <span className="stat-value">{inductee.careerStats.gamesPlayed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Goals</span>
                        <span className="stat-value">{inductee.careerStats.goals}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Assists</span>
                        <span className="stat-value">{inductee.careerStats.assists}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Points</span>
                        <span className="stat-value">{inductee.careerStats.points}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Hits</span>
                        <span className="stat-value">{inductee.careerStats.hits}</span>
                      </div>
                      {inductee.position === 'Goalie' && inductee.careerStats.saves !== undefined && (
                        <div className="stat-item">
                          <span className="stat-label">Saves</span>
                          <span className="stat-value">{inductee.careerStats.saves}</span>
                        </div>
                      )}
                    </div>
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
