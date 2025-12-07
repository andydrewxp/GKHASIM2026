import type { Player, Team } from '../types';

// Get league leaders for a specific stat category
export interface LeagueLeader {
  player: Player;
  value: number;
}

export const getLeagueLeaders = (
  allPlayers: Player[],
  category: 'goals' | 'assists' | 'points' | 'saves' | 'hits' | 'legacy',
  useSeason: boolean = true,
  limit: number = 10
): LeagueLeader[] => {
  const stats = useSeason ? 'seasonStats' : 'careerStats';

  const leaders = allPlayers
    .map((player) => ({
      player,
      value: player[stats][category] || 0,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return leaders;
};

// Get top stat leader for a category
export const getTopLeader = (
  allPlayers: Player[],
  category: 'goals' | 'assists' | 'points' | 'saves' | 'hits' | 'legacy',
  useSeason: boolean = true
): LeagueLeader | null => {
  const leaders = getLeagueLeaders(allPlayers, category, useSeason, 1);
  return leaders.length > 0 ? leaders[0] : null;
};

// Calculate team standings
export interface TeamStanding {
  team: Team;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
}

export const getStandings = (teams: Team[]): TeamStanding[] => {
  const standings = teams.map((team) => ({
    team,
    wins: team.wins,
    losses: team.losses,
    overtimeLosses: team.overtimeLosses,
    points: team.points,
    gamesPlayed: team.gamesPlayed,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
  }));

  // Sort by points (descending), then by wins (descending)
  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.wins - a.wins;
  });

  return standings;
};

// Get top 4 teams for playoffs
export const getPlayoffTeams = (teams: Team[]): Team[] => {
  const standings = getStandings(teams);
  return standings.slice(0, 4).map((standing) => standing.team);
};

// Reset season stats for all players
export const resetSeasonStats = (players: Player[]): void => {
  players.forEach((player) => {
    player.seasonStats = {
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      hits: 0,
      saves: 0,
      goalsAgainst: 0,
      legacy: player.careerStats.legacy || 0,
    };
  });
};

// Reset team records
export const resetTeamRecords = (teams: Team[]): void => {
  teams.forEach((team) => {
    team.wins = 0;
    team.losses = 0;
    team.overtimeLosses = 0;
    team.gamesPlayed = 0;
    team.points = 0;
    team.goalsFor = 0;
    team.goalsAgainst = 0;
  });
};

// Get all players from all teams
export const getAllPlayers = (teams: Team[]): Player[] => {
  const allPlayers: Player[] = [];

  teams.forEach((team) => {
    allPlayers.push(...team.activePlayers);
    if (team.benchPlayer) {
      allPlayers.push(team.benchPlayer);
    }
    if (team.irPlayers && team.irPlayers.length > 0) {
      allPlayers.push(...team.irPlayers);
    }
    if (team.suspendedPlayers && team.suspendedPlayers.length > 0) {
      allPlayers.push(...team.suspendedPlayers);
    }
  });

  return allPlayers;
};
