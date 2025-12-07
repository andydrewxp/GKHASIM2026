import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from '../types';
import { generateInitialTeams, generateInitialFreeAgents, ACHIEVEMENT_ANALYST } from '../data/seedData';
import { generateSchedule } from '../engine/scheduleGenerator';

// Storage key
const STORAGE_KEY = 'gkha_app_state';

// Maximum number of feed posts to retain
const MAX_FEED_POSTS = 300;

// Create context
interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  saveState: () => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initialize default achievements
const createDefaultAchievements = () => {
  return [
    {
      id: 'complete-one-season',
      title: 'First Championship',
      description: 'Complete one full season and crown a champion',
      isUnlocked: false,
    },
    {
      id: 'complete-10-seasons',
      title: 'Decade of Hockey',
      description: 'Complete 10 full seasons',
      isUnlocked: false,
    },
    {
      id: 'complete-50-seasons',
      title: 'Golden Anniversary',
      description: 'Complete 50 full seasons',
      isUnlocked: false,
    },
    {
      id: 'complete-100-seasons',
      title: 'Century of Champions',
      description: 'Complete 100 full seasons',
      isUnlocked: false,
    },
    {
      id: 'double-digit-goals',
      title: 'Offensive Explosion',
      description: 'A team scores 10 or more goals in a single game',
      isUnlocked: false,
    },
    {
      id: 'overtime-shutout',
      title: 'Overtime Nail-Biter',
      description: 'A game ends 1-0 in overtime',
      isUnlocked: false,
    },
    {
      id: 'high-scoring-thriller',
      title: 'Nice!',
      description: 'A game ends with a final score of 6-9',
      isUnlocked: false,
    },
    {
      id: 'peanut-butter-retirement',
      title: 'The Legend Retires',
      description: 'Jar of Peanut Butter retires',
      isUnlocked: false,
    },
    {
      id: 'pallet-town-remembers',
      title: 'Pallet Town Remembers',
      description: 'A player named Chauncey joins the league',
      isUnlocked: false,
    },
    {
      id: 'offensive-powerhouse',
      title: 'Offensive Powerhouse',
      description: 'A team finishes the regular season with 70+ goals scored',
      isUnlocked: false,
    },
    {
      id: 'defensive-disaster',
      title: 'Defensive Disaster',
      description: 'A team finishes the regular season with 70+ goals allowed',
      isUnlocked: false,
    },
    {
      id: 'dominant-season',
      title: 'Dominant Season',
      description: 'A team finishes the regular season with 35+ total points',
      isUnlocked: false,
    },
    {
      id: 'basement-dweller',
      title: 'Basement Dweller',
      description: 'A team finishes the regular season with 10 or less total points',
      isUnlocked: false,
    },
    {
      id: 'overtime-specialist',
      title: 'Overtime Specialist',
      description: 'A team finishes the regular season with 5+ overtime losses',
      isUnlocked: false,
    },
    {
      id: 'fifty-goal-season',
      title: 'Fifty Goals',
      description: 'A player scores 50 goals in a single season',
      isUnlocked: false,
    },
    {
      id: 'career-600-goals',
      title: 'The Great One',
      description: 'A player reaches 600 career goals',
      isUnlocked: false,
    },
    {
      id: 'twenty-five-assist-season',
      title: 'Playmaker',
      description: 'A player records 25 assists in a single season',
      isUnlocked: false,
    },
    {
      id: 'career-200-assists',
      title: 'Master Distributor',
      description: 'A player reaches 200 career assists',
      isUnlocked: false,
    },
    {
      id: 'sixty-point-season',
      title: 'Point Producer',
      description: 'A player scores 60 points in a single season',
      isUnlocked: false,
    },
    {
      id: 'career-750-points',
      title: 'Elite Scorer',
      description: 'A player reaches 750 career points',
      isUnlocked: false,
    },
    {
      id: 'one-seventy-five-save-season',
      title: 'Wall',
      description: 'A goalie records 180 saves in a single season',
      isUnlocked: false,
    },
    {
      id: 'career-1500-saves',
      title: 'Brick Wall',
      description: 'A goalie reaches 2500 career saves',
      isUnlocked: false,
    },
    {
      id: 'one-fifty-hit-season',
      title: 'Enforcer',
      description: 'A player records 150 hits in a single season',
      isUnlocked: false,
    },
    {
      id: 'career-1500-hits',
      title: 'Intimidator',
      description: 'A player reaches 2000 career hits',
      isUnlocked: false,
    },
    {
      id: 'three-peat',
      title: 'Three-Peat',
      description: 'A team wins 3 consecutive championships',
      isUnlocked: false,
    },
    {
      id: 'hall-of-fame-opens',
      title: 'Hall of Fame Opens',
      description: 'The Hall of Fame opens',
      isUnlocked: false,
    },
    {
      id: 'first-hall-of-fame-inductee',
      title: 'Legend Immortalized',
      description: 'A player is inducted into the Hall of Fame',
      isUnlocked: false,
    },
    {
      id: 'fifteen-hall-of-fame-inductees',
      title: 'Hall of Legends',
      description: '15 players are inducted into the Hall of Fame',
      isUnlocked: false,
    },
    {
      id: 'career-1000-legacy',
      title: 'Legendary Status',
      description: 'A player reaches 1000 career legacy score',
      isUnlocked: false,
    },
  ];
};

// Initialize default state
const createDefaultState = (): AppState => {
  const teams = generateInitialTeams();
  const freeAgents = generateInitialFreeAgents();
  const currentYear = 2026;
  const games = generateSchedule(teams, currentYear);

  // Create welcome posts
  const baseTimestamp = Date.now();
  const welcomePost = {
    id: 'welcome-post',
    analyst: ACHIEVEMENT_ANALYST,
    content: 'Hello and Welcome to GKHA 2026!',
    timestamp: baseTimestamp,
    type: 'Other' as const,
  };

  const excitementPost = {
    id: 'excitement-post',
    analyst: '@GKHAinside',
    content: "Who's excited for some knockey!?",
    timestamp: baseTimestamp + 1,
    type: 'Other' as const,
  };

  return {
    currentYear,
    gameDate: `${currentYear}-01-01`,
    teams,
    freeAgents,
    retiredPlayers: [],
    games,
    injuries: [],
    suspensions: [],
    feedPosts: [welcomePost, excitementPost],
    seasonHistory: [],
    isSeasonComplete: false,
    playoffsStarted: false,
    playoffSeries: [],
    achievements: createDefaultAchievements(),
    hallOfFame: [],
  };
};

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old state format to include playoffSeries if missing
        if (!parsed.playoffSeries) {
          parsed.playoffSeries = [];
        }
        // Migrate old team format from irPlayer to irPlayers
        if (parsed.teams) {
          parsed.teams.forEach((team: any) => {
            if (team.irPlayer !== undefined) {
              // Convert old single irPlayer to array
              team.irPlayers = team.irPlayer ? [team.irPlayer] : [];
              delete team.irPlayer;
            } else if (!team.irPlayers) {
              // Initialize irPlayers if missing
              team.irPlayers = [];
            }
            // Migrate to add gamesPlayed field if missing
            if (team.gamesPlayed === undefined) {
              team.gamesPlayed = (team.wins || 0) + (team.losses || 0) + (team.overtimeLosses || 0);
            }
          });
        }
        // Migrate players to include position-specific ratings
        const migratePlayerRatings = (player: any) => {
          if (player.forwardRating === undefined || player.defenderRating === undefined || player.goalieRating === undefined) {
            const overall = player.overall || 75;
            const secondaryMin = 0.6;
            const secondaryMax = 0.85;

            if (player.position === 'Forward') {
              player.forwardRating = overall;
              player.defenderRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
              player.goalieRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
            } else if (player.position === 'Defender') {
              player.defenderRating = overall;
              player.forwardRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
              player.goalieRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
            } else {
              player.goalieRating = overall;
              player.forwardRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
              player.defenderRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
            }
          }
          // Migrate players to include yearsOfExperience if missing
          if (player.yearsOfExperience === undefined) {
            player.yearsOfExperience = 0;
          }
          // Migrate players to include consecutiveSeasonsWithoutGames if missing
          if (player.consecutiveSeasonsWithoutGames === undefined) {
            player.consecutiveSeasonsWithoutGames = 0;
          }
          // Migrate players to include hits in stats if missing
          if (player.seasonStats && player.seasonStats.hits === undefined) {
            player.seasonStats.hits = 0;
          }
          if (player.careerStats && player.careerStats.hits === undefined) {
            player.careerStats.hits = 0;
          }
          // Migrate players to include legacy in stats if missing
          if (player.seasonStats && player.seasonStats.legacy === undefined) {
            player.seasonStats.legacy = 0;
          }
          if (player.careerStats && player.careerStats.legacy === undefined) {
            player.careerStats.legacy = 0;
          }
        };
        if (parsed.teams) {
          parsed.teams.forEach((team: any) => {
            team.activePlayers?.forEach(migratePlayerRatings);
            if (team.benchPlayer) migratePlayerRatings(team.benchPlayer);
            team.irPlayers?.forEach(migratePlayerRatings);
            team.suspendedPlayers?.forEach(migratePlayerRatings);
          });
        }
        if (parsed.freeAgents) {
          parsed.freeAgents.forEach(migratePlayerRatings);
        }
        if (parsed.retiredPlayers) {
          parsed.retiredPlayers.forEach(migratePlayerRatings);
        }
        // Migrate from old day-based system to date-based system
        if (parsed.games && parsed.games.length > 0) {
          const year = parsed.currentYear || 2026;
          parsed.games.forEach((game: any) => {
            if (game.day !== undefined && !game.date) {
              // Convert day number to actual date
              const date = new Date(year, 0, 1); // Start at January 1
              date.setDate(date.getDate() + game.day - 1);
              game.date = date.toISOString().split('T')[0];
              delete game.day;
            }
          });
        }
        // Add gameDate if missing
        if (!parsed.gameDate) {
          const year = parsed.currentYear || 2026;
          parsed.gameDate = `${year}-01-01`;
        }
        // Add achievements if missing
        if (!parsed.achievements) {
          parsed.achievements = createDefaultAchievements();
        } else {
          // Migrate to add new achievements if they don't exist
          const defaultAchievements = createDefaultAchievements();
          defaultAchievements.forEach((defaultAchievement) => {
            const exists = parsed.achievements.some((a: any) => a.id === defaultAchievement.id);
            if (!exists) {
              parsed.achievements.push(defaultAchievement);
            }
          });
        }
        // Migrate season history to include hits stat leader
        if (parsed.seasonHistory) {
          parsed.seasonHistory.forEach((season: any) => {
            if (season.statLeaders && !season.statLeaders.hits) {
              season.statLeaders.hits = { playerName: 'N/A', value: 0 };
            }
          });
        }
        // Add hallOfFame if missing
        if (!parsed.hallOfFame) {
          parsed.hallOfFame = [];
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        return createDefaultState();
      }
    }
    return createDefaultState();
  });

  // Save to localStorage
  const saveState = () => {
    // Trim feedPosts to maximum limit before saving
    const stateToSave = {
      ...state,
      feedPosts: state.feedPosts.slice(-MAX_FEED_POSTS),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  // Auto-save on state changes
  useEffect(() => {
    // Trim feedPosts in state if exceeds limit to prevent memory buildup
    if (state.feedPosts.length > MAX_FEED_POSTS) {
      setState(prevState => ({
        ...prevState,
        feedPosts: prevState.feedPosts.slice(-MAX_FEED_POSTS),
      }));
    } else {
      saveState();
    }
  }, [state]);

  // Reset state
  const resetState = () => {
    setState(createDefaultState());
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider value={{ state, setState, saveState, resetState }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
