import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Player, Team } from '../types';

export const Roster: React.FC = () => {
  const { state } = useAppContext();
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const getCurrentPositionRating = (player: Player): number => {
    switch (player.position) {
      case 'Forward':
        return player.forwardRating;
      case 'Defender':
        return player.defenderRating;
      case 'Goalie':
        return player.goalieRating;
      default:
        return 0;
    }
  };

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const getDetailedStats = (player: Player) => {
    const stats = [];

    if (player.nickname) {
      stats.push(`Nickname: "${player.nickname}"`);
    }

    stats.push(
      `Age: ${player.age}`,
      `Experience: ${player.yearsOfExperience}`,
      `Forward Rating: ${player.forwardRating}`,
      `Defender Rating: ${player.defenderRating}`,
      `Goalie Rating: ${player.goalieRating}`,
      `Games Played: ${player.seasonStats.gamesPlayed}`,
      `Goals: ${player.seasonStats.goals}`,
      `Assists: ${player.seasonStats.assists}`,
      `Points: ${player.seasonStats.points}`,
      `Legacy: ${player.careerStats.legacy || 0}`
    );

    if (player.position === 'Goalie') {
      stats.push(`Saves: ${player.seasonStats.saves || 0}`);
      stats.push(`Goals Against: ${player.seasonStats.goalsAgainst || 0}`);
    }

    return stats;
  };

  const renderPlayer = (player: Player, label?: string) => {
    const isExpanded = expandedPlayers.has(player.id);
    const ovr = getCurrentPositionRating(player);

    return (
      <div key={player.id} className="roster-player">
        <div
          className="player-header"
          onClick={() => togglePlayerExpanded(player.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="player-name">
            {player.name} {label && <span className="player-label">({label})</span>}
          </div>
          <div className="player-basic-info">
            <span className="player-attribute">Position: {player.position}</span>
            <span className="player-attribute">OVR: {ovr}</span>
            <span className="expand-indicator">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
        {isExpanded && (
          <div className="player-details">
            {getDetailedStats(player).map((stat, idx) => (
              <span key={idx} className="player-attribute">{stat}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTeamRoster = (team: Team) => (
    <div key={team.id} className="team-roster">
      <h3>{team.name}</h3>
      <div className="roster-section">
        <h4>Active Players</h4>
        {team.activePlayers.map(player => renderPlayer(player))}
      </div>
      {team.benchPlayer && (
        <div className="roster-section">
          <h4>Bench</h4>
          {renderPlayer(team.benchPlayer, 'Bench')}
        </div>
      )}
      {team.irPlayers && team.irPlayers.length > 0 && (
        <div className="roster-section">
          <h4>Injury Reserve</h4>
          {team.irPlayers.map(player => {
            const daysRemaining = player.injuryDaysRemaining ?? 0;
            const label = daysRemaining === 0
              ? 'IR - Healthy (Ready to Return)'
              : `IR - ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
            return renderPlayer(player, label);
          })}
        </div>
      )}
      {team.suspendedPlayers && team.suspendedPlayers.length > 0 && (
        <div className="roster-section">
          <h4>Suspended</h4>
          {team.suspendedPlayers.map(player => {
            const gamesRemaining = player.suspensionGamesRemaining ?? 0;
            const label = gamesRemaining === 0
              ? 'Suspended - Eligible to Return'
              : `Suspended - ${gamesRemaining} ${gamesRemaining === 1 ? 'game' : 'games'} remaining`;
            return renderPlayer(player, label);
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="roster-view">
      <h2>{state.currentYear} GKHA Rosters</h2>

      <div className="rosters-container">
        {state.teams.map(team => renderTeamRoster(team))}
      </div>

      <div className="free-agents-section">
        <h2>Free Agents</h2>
        <div className="free-agents-grid">
          {state.freeAgents.map(player => renderPlayer(player, 'Free Agent'))}
        </div>
      </div>
    </div>
  );
};
