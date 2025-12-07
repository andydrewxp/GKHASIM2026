// Position types for players
export type Position = 'Forward' | 'Goalie' | 'Defender';

// Player states
export type PlayerState = 'Active' | 'Bench' | 'IR' | 'Suspended' | 'Free Agent' | 'Retired';

// Player potential
export type PlayerPotential = 'Bust' | 'Standard' | 'Star' | 'Goat';

// Venue types
export type Venue = 'Google Plus Arena' | 'Outdoor Rink';

// Player stats
export interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  hits: number;
  saves?: number; // For goalies
  goalsAgainst?: number; // For goalies
  legacy?: number; // Legacy score - career achievement points
}

// Hall of Fame inductee
export interface HallOfFameInductee {
  playerId: string;
  playerName: string;
  inductionYear: number;
  retirementYear: number;
  legacyScore: number;
  position: Position;
  yearsOfExperience: number;
  careerStats: PlayerStats;
}

// Player interface
export interface Player {
  id: string;
  name: string;
  nickname?: string; // Optional nickname for the player
  position: Position;
  overall: number; // Overall rating (skill level)
  forwardRating: number; // Skill rating as a forward
  defenderRating: number; // Skill rating as a defender
  goalieRating: number; // Skill rating as a goalie
  state: PlayerState;
  potential: PlayerPotential; // Player's development potential
  teamId?: string; // ID of team player belongs to, undefined if free agent or retired
  seasonStats: PlayerStats;
  careerStats: PlayerStats;
  injuryDaysRemaining?: number;
  suspensionGamesRemaining?: number;
  yearsOfExperience: number; // Number of seasons played (at least 1 game)
  age: number; // Player's age
  consecutiveSeasonsWithoutGames: number; // Number of consecutive seasons without playing a game
  seasonGenerated?: number; // Year the player was generated (for tracking new season free agents)
  retirementYear?: number; // Year the player retired (for Hall of Fame tracking)
}

// Team interface
export interface Team {
  id: string;
  name: string;
  activePlayers: Player[]; // 3 players: 1 Forward, 1 Goalie, 1 Defender
  benchPlayer?: Player; // 1 bench player
  irPlayers: Player[]; // IR slots (can have multiple injured players)
  suspendedPlayers: Player[]; // Suspended players (can have multiple suspended players)
  wins: number;
  losses: number;
  overtimeLosses: number;
  gamesPlayed: number; // Total games played
  points: number; // For standings (2 pts for win, 1 pt for OT loss)
  goalsFor: number; // Total goals scored
  goalsAgainst: number; // Total goals allowed
  legacy: number; // Legacy score - career achievement points for team
}

// Game status
export type GameStatus = 'Scheduled' | 'In Progress' | 'Final';

// Game result types
export type GameResult = 'Win' | 'Loss' | 'OT Loss';

// Game interface
export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  venue: Venue;
  date: string; // ISO date string (YYYY-MM-DD)
  status: GameStatus;
  overtime?: boolean;
  events?: GameEvent[];
  seriesId?: string; // For playoff series tracking (best of 3)
  gameNumber?: number; // Game number within series (1, 2, or 3)
}

// Game event for live simulation
export interface GameEvent {
  minute: number;
  type: 'Goal' | 'Save' | 'Shot' | 'Hit' | 'Injury' | 'Period End' | 'Game End';
  description: string;
  teamId?: string;
  playerId?: string;
}

// Injury interface
export interface Injury {
  playerId: string;
  daysRemaining: number;
  description: string;
}

// Suspension interface
export interface Suspension {
  playerId: string;
  gamesRemaining: number;
  reason: string;
}

// Event feed post
export interface FeedPost {
  id: string;
  analyst: string; // @username
  content: string;
  timestamp: number;
  type: 'Game Result' | 'Injury' | 'Roster Move' | 'Achievement' | 'Retirement' | 'Suspension' | 'Other' | 'Hall Of Fame';
  isAchievement?: boolean; // For gold border styling
}

// Historical season data
export interface SeasonHistory {
  year: number;
  champion: string; // Team name
  statLeaders: {
    goals: { playerName: string; value: number };
    assists: { playerName: string; value: number };
    points: { playerName: string; value: number };
    saves: { playerName: string; value: number };
    hits: { playerName: string; value: number };
  };
}

// Playoff series state
export interface PlayoffSeries {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Wins: number;
  team2Wins: number;
  round: 'semifinal' | 'championship';
  winnerId?: string;
}

// Main application state
export interface AppState {
  currentYear: number;
  gameDate: string; // Current game date (ISO format YYYY-MM-DD)
  teams: Team[];
  freeAgents: Player[];
  retiredPlayers: Player[];
  games: Game[];
  injuries: Injury[];
  suspensions: Suspension[];
  feedPosts: FeedPost[];
  seasonHistory: SeasonHistory[];
  isSeasonComplete: boolean;
  playoffsStarted: boolean;
  playoffSeries: PlayoffSeries[];
  achievements: Achievement[];
  hallOfFame: HallOfFameInductee[];
}

// Simulation speed
export type SimulationSpeed = 'slow' | 'fast';

// Simulation mode
export type SimulationMode = 'single' | 'multi' | 'season';

// Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedDate?: string; // ISO date string when achievement was unlocked
}
