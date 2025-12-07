import type { Game, Team } from '../types';

// Generate game ID
let gameIdCounter = 1;
const generateGameId = () => `game_${gameIdCounter++}`;

// Helper function to generate random date for regular season (January 2 - May 31)
const getRandomDateInYear = (year: number, usedDates: Set<string>): string => {
  const startDate = new Date(year, 0, 2); // January 2
  const endDate = new Date(year, 4, 31); // May 31 (month is 0-indexed, so 4 = May)
  const dayCount = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  let randomDate: Date;
  let dateString: string;

  do {
    const randomDay = Math.floor(Math.random() * dayCount);
    randomDate = new Date(startDate.getTime() + randomDay * 24 * 60 * 60 * 1000);
    dateString = randomDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  } while (usedDates.has(dateString));

  usedDates.add(dateString);
  return dateString;
};

// Generate complete season schedule
export const generateSchedule = (teams: Team[], year: number): Game[] => {
  const games: Game[] = [];
  const teamIds = teams.map((t) => t.id);

  // Track games per team to ensure 20 games each (10 home, 10 away)
  const teamGames: { [teamId: string]: { home: Map<string, number>; away: Map<string, number> } } = {};
  teamIds.forEach((id) => {
    teamGames[id] = { home: new Map(), away: new Map() };
  });

  // Calculate games needed per opponent
  // With 6 teams, each team plays 5 opponents
  // To get 20 games total (10 home, 10 away), need to play each opponent 4 times (2 home, 2 away)
  const gamesPerOpponentPerVenue = 2;

  // Generate all possible matchups (each team plays each opponent multiple times)
  const matchups: Array<{ home: string; away: string }> = [];

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = 0; j < teamIds.length; j++) {
      if (i !== j) {
        // Add this matchup gamesPerOpponentPerVenue times
        for (let k = 0; k < gamesPerOpponentPerVenue; k++) {
          matchups.push({ home: teamIds[i], away: teamIds[j] });
        }
      }
    }
  }

  // Shuffle matchups to randomize schedule
  const shuffledMatchups = matchups.sort(() => Math.random() - 0.5);

  // Add games until each team has 10 home and 10 away games
  for (const matchup of shuffledMatchups) {
    const homeTeamGames = teamGames[matchup.home];
    const awayTeamGames = teamGames[matchup.away];

    // Count current home games for home team
    const homeTeamHomeCount = Array.from(homeTeamGames.home.values()).reduce((sum, count) => sum + count, 0);
    // Count current away games for away team
    const awayTeamAwayCount = Array.from(awayTeamGames.away.values()).reduce((sum, count) => sum + count, 0);

    // Count games between these two teams
    const homeVsAwayCount = homeTeamGames.home.get(matchup.away) || 0;

    // Check if both teams can play this game and haven't exceeded matchups against each other
    if (homeTeamHomeCount < 10 && awayTeamAwayCount < 10 && homeVsAwayCount < gamesPerOpponentPerVenue) {
      homeTeamGames.home.set(matchup.away, homeVsAwayCount + 1);
      const awayVsHomeCount = awayTeamGames.away.get(matchup.home) || 0;
      awayTeamGames.away.set(matchup.home, awayVsHomeCount + 1);

      games.push({
        id: generateGameId(),
        homeTeamId: matchup.home,
        awayTeamId: matchup.away,
        venue: 'Google Plus Arena', // Will assign outdoor rink later
        date: '', // Will assign random date later
        status: 'Scheduled',
      });
    }

    // Check if all teams have 20 games
    const allTeamsComplete = teamIds.every((id) => {
      const homeCount = Array.from(teamGames[id].home.values()).reduce((sum, count) => sum + count, 0);
      const awayCount = Array.from(teamGames[id].away.values()).reduce((sum, count) => sum + count, 0);
      return homeCount === 10 && awayCount === 10;
    });

    if (allTeamsComplete) {
      break;
    }
  }

  // Assign exactly 1 game to Outdoor Rink (random selection)
  if (games.length > 0) {
    const randomIndex = Math.floor(Math.random() * games.length);
    games[randomIndex].venue = 'Outdoor Rink';
  }

  // Assign random dates to games throughout the year
  const usedDates = new Set<string>();
  games.forEach((game) => {
    game.date = getRandomDateInYear(year, usedDates);
  });

  // Sort games by date
  games.sort((a, b) => a.date.localeCompare(b.date));

  return games;
};

// Get next scheduled game (regular season only)
export const getNextScheduledGame = (games: Game[]): Game | undefined => {
  return games.find((game) => game.status === 'Scheduled' && !game.seriesId);
};

// Get next N scheduled games (regular season only)
export const getNextScheduledGames = (games: Game[], count: number): Game[] => {
  return games.filter((game) => game.status === 'Scheduled' && !game.seriesId).slice(0, count);
};

// Check if season is complete (all regular season games played)
export const isSeasonComplete = (games: Game[]): boolean => {
  // Only check regular season games (exclude playoff games which have seriesId)
  const regularSeasonGames = games.filter((game) => !game.seriesId);
  return regularSeasonGames.length > 0 && regularSeasonGames.every((game) => game.status === 'Final');
};

// Get games for a specific team
export const getTeamGames = (games: Game[], teamId: string): Game[] => {
  return games.filter(
    (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
  );
};

// Get team record
export const getTeamRecord = (
  games: Game[],
  teamId: string
): { wins: number; losses: number; overtimeLosses: number } => {
  const teamGames = getTeamGames(games, teamId).filter(
    (game) => game.status === 'Final'
  );

  let wins = 0;
  let losses = 0;
  let overtimeLosses = 0;

  teamGames.forEach((game) => {
    const isHome = game.homeTeamId === teamId;
    const teamScore = isHome ? game.homeScore! : game.awayScore!;
    const opponentScore = isHome ? game.awayScore! : game.homeScore!;

    if (teamScore > opponentScore) {
      wins++;
    } else if (game.overtime) {
      overtimeLosses++;
    } else {
      losses++;
    }
  });

  return { wins, losses, overtimeLosses };
};
