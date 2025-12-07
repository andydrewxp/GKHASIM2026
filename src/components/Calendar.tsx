import React from 'react';
import { useAppContext } from '../context/AppContext';

export const Calendar: React.FC = () => {
  const { state } = useAppContext();

  // Group games by date
  const gamesByDate: { [date: string]: typeof state.games } = {};
  state.games.forEach((game) => {
    if (!gamesByDate[game.date]) {
      gamesByDate[game.date] = [];
    }
    gamesByDate[game.date].push(game);
  });

  // Get sorted dates
  const dates = Object.keys(gamesByDate).sort((a, b) => a.localeCompare(b));

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="calendar">
      <h2>{state.currentYear} Season Calendar</h2>
      <div className="calendar-grid">
        {dates.map((date) => {
          const games = gamesByDate[date];
          return (
            <div key={date} className="calendar-day">
              <div className="day-number">{formatDate(date)}</div>
              {games.map((game) => {
                const homeTeam = state.teams.find((t) => t.id === game.homeTeamId);
                const awayTeam = state.teams.find((t) => t.id === game.awayTeamId);

                return (
                  <div
                    key={game.id}
                    className={`game-item ${game.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="matchup">
                      {awayTeam?.name} @ {homeTeam?.name}
                    </div>
                    <div className="venue">{game.venue}</div>
                    {game.status === 'Final' && (
                      <div className="score">
                        {game.awayScore} - {game.homeScore}
                        {game.overtime && ' (OT)'}
                      </div>
                    )}
                    <div className="status">{game.status}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
