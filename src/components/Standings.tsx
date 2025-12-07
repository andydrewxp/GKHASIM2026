import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getStandings } from '../engine/statsManager';

export const Standings: React.FC = () => {
  const { state } = useAppContext();
  const standings = getStandings(state.teams);

  return (
    <div className="standings">
      <h2>{state.currentYear} GKHA Standings</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>GP</th>
            <th>W</th>
            <th>L</th>
            <th>OTL</th>
            <th>PTS</th>
            <th>GF</th>
            <th>GA</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => (
            <tr key={standing.team.id}>
              <td>{index + 1}</td>
              <td>{standing.team.name}</td>
              <td>{standing.gamesPlayed}</td>
              <td>{standing.wins}</td>
              <td>{standing.losses}</td>
              <td>{standing.overtimeLosses}</td>
              <td><strong>{standing.points}</strong></td>
              <td>{standing.goalsFor}</td>
              <td>{standing.goalsAgainst}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
