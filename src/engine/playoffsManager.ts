import type { Team, Game, PlayoffSeries } from '../types';
import { getPlayoffTeams } from './statsManager';
import { determineWinner } from './gameSimulator';

// Generate playoff series (best of 3, 4 teams)
export const generatePlayoffSeries = (teams: Team[]): PlayoffSeries[] => {
  const playoffTeams = getPlayoffTeams(teams);

  if (playoffTeams.length < 4) {
    return [];
  }

  // Create two semifinal series: Seed 1 vs Seed 4, Seed 2 vs Seed 3
  const series: PlayoffSeries[] = [
    {
      id: 'semifinal_1',
      team1Id: playoffTeams[0].id, // Seed 1
      team2Id: playoffTeams[3].id, // Seed 4
      team1Wins: 0,
      team2Wins: 0,
      round: 'semifinal',
    },
    {
      id: 'semifinal_2',
      team1Id: playoffTeams[1].id, // Seed 2
      team2Id: playoffTeams[2].id, // Seed 3
      team1Wins: 0,
      team2Wins: 0,
      round: 'semifinal',
    },
  ];

  return series;
};

// Generate initial game for a series (only Game 1)
export const generateSeriesGames = (series: PlayoffSeries, startDate: string): Game[] => {
  const games: Game[] = [];

  // Generate only the first game initially
  games.push({
    id: `${series.id}_game1`,
    homeTeamId: series.team1Id, // Team 1 is home for Game 1
    awayTeamId: series.team2Id,
    venue: 'Google Plus Arena',
    date: startDate,
    status: 'Scheduled',
    seriesId: series.id,
    gameNumber: 1,
  });

  return games;
};

// Generate the next game in a series (Game 2 or Game 3)
export const generateNextSeriesGame = (series: PlayoffSeries, startDate: string, existingGames: Game[]): Game | null => {
  // Don't generate if series is already complete
  if (isSeriesComplete(series)) {
    return null;
  }

  // Determine how many games already exist for this series by finding the highest game number
  const seriesGames = existingGames.filter((g) => g.seriesId === series.id);
  const maxGameNumber = seriesGames.reduce((max, game) => {
    return Math.max(max, game.gameNumber || 0);
  }, 0);

  const nextGameNumber = maxGameNumber + 1;

  // Don't generate more than 3 games
  if (nextGameNumber > 3) {
    return null;
  }

  // Check if a game with this ID already exists (prevent duplicates)
  const gameId = `${series.id}_game${nextGameNumber}`;
  if (existingGames.some((g) => g.id === gameId)) {
    return null;
  }

  // Calculate next game date (add days from start date)
  const baseDate = new Date(startDate);
  baseDate.setDate(baseDate.getDate() + nextGameNumber - 1);
  const nextGameDate = baseDate.toISOString().split('T')[0];

  // Create the next game
  const game: Game = {
    id: gameId,
    homeTeamId: nextGameNumber % 2 === 1 ? series.team1Id : series.team2Id, // Alternate home team
    awayTeamId: nextGameNumber % 2 === 1 ? series.team2Id : series.team1Id,
    venue: 'Google Plus Arena',
    date: nextGameDate,
    status: 'Scheduled',
    seriesId: series.id,
    gameNumber: nextGameNumber,
  };

  return game;
};

// Simulate playoff game and update series
export const simulatePlayoffGame = (
  game: Game,
  homeTeam: Team,
  awayTeam: Team,
  series: PlayoffSeries
): void => {
  const result = determineWinner(homeTeam, awayTeam);

  game.homeScore = result.homeScore;
  game.awayScore = result.awayScore;
  game.overtime = result.overtime;
  game.status = 'Final';

  // Update goals for/against
  homeTeam.goalsFor += result.homeScore;
  homeTeam.goalsAgainst += result.awayScore;
  awayTeam.goalsFor += result.awayScore;
  awayTeam.goalsAgainst += result.homeScore;

  // Award legacy points for game achievements
  // +1 legacy for scoring 7+ goals
  if (result.homeScore >= 7) {
    homeTeam.legacy = (homeTeam.legacy || 0) + 1;
  }
  if (result.awayScore >= 7) {
    awayTeam.legacy = (awayTeam.legacy || 0) + 1;
  }

  // +1 legacy for shutout (allowing 0 goals)
  if (result.awayScore === 0) {
    homeTeam.legacy = (homeTeam.legacy || 0) + 1;
  }
  if (result.homeScore === 0) {
    awayTeam.legacy = (awayTeam.legacy || 0) + 1;
  }

  // Update series wins
  const winnerId = result.homeScore > result.awayScore ? homeTeam.id : awayTeam.id;
  if (winnerId === series.team1Id) {
    series.team1Wins++;
  } else {
    series.team2Wins++;
  }

  // Check if series is over (first to 2 wins)
  if (series.team1Wins === 2) {
    series.winnerId = series.team1Id;
  } else if (series.team2Wins === 2) {
    series.winnerId = series.team2Id;
  }
};

// Check if a series is complete
export const isSeriesComplete = (series: PlayoffSeries): boolean => {
  return series.team1Wins === 2 || series.team2Wins === 2;
};

// Get the next unplayed game in a series
export const getNextSeriesGame = (seriesId: string, games: Game[]): Game | null => {
  const seriesGames = games
    .filter((g) => g.seriesId === seriesId)
    .sort((a, b) => (a.gameNumber || 0) - (b.gameNumber || 0));

  return seriesGames.find((g) => g.status === 'Scheduled') || null;
};

// Get series winner
export const getSeriesWinner = (series: PlayoffSeries, teams: Team[]): Team | null => {
  if (!series.winnerId) {
    return null;
  }
  return teams.find((t) => t.id === series.winnerId) || null;
};

// Create championship series after semifinals are complete
export const createChampionshipSeries = (
  semifinalSeries: PlayoffSeries[],
  teams: Team[]
): PlayoffSeries | null => {
  if (semifinalSeries.length !== 2) {
    return null;
  }

  const winner1 = getSeriesWinner(semifinalSeries[0], teams);
  const winner2 = getSeriesWinner(semifinalSeries[1], teams);

  if (!winner1 || !winner2) {
    return null;
  }

  return {
    id: 'championship',
    team1Id: winner1.id,
    team2Id: winner2.id,
    team1Wins: 0,
    team2Wins: 0,
    round: 'championship',
  };
};

// Get champion from completed championship series
export const getChampion = (
  championshipSeries: PlayoffSeries,
  teams: Team[]
): Team | null => {
  return getSeriesWinner(championshipSeries, teams);
};

// Get the next available series to simulate based on date order
export const getNextAvailableSeries = (
  playoffSeries: PlayoffSeries[],
  games: Game[]
): PlayoffSeries | null => {
  // Filter to incomplete series only
  const incompleteSeries = playoffSeries.filter((series) => !isSeriesComplete(series));

  if (incompleteSeries.length === 0) {
    return null;
  }

  // Find the series with the earliest game date
  let earliestSeries: PlayoffSeries | null = null;
  let earliestDate: string | null = null;

  incompleteSeries.forEach((series) => {
    const seriesGames = games.filter((g) => g.seriesId === series.id);
    if (seriesGames.length > 0) {
      const firstGameDate = seriesGames[0].date;
      if (!earliestDate || firstGameDate < earliestDate) {
        earliestDate = firstGameDate;
        earliestSeries = series;
      }
    }
  });

  return earliestSeries;
};
