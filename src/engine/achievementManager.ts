import type { Game, Achievement, Player, Team, SeasonHistory } from '../types';

/**
 * Check if any game-based achievements should be unlocked based on the game result
 * @param game The completed game
 * @param achievements The current list of achievements
 * @param gameDate The current game date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkGameAchievements = (
  game: Game,
  achievements: Achievement[],
  gameDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  // Check for "double-digit-goals" achievement - Any team scores 10 goals in a game
  const doubleDigitAchievement = achievements.find((a) => a.id === 'double-digit-goals');
  if (
    doubleDigitAchievement &&
    !doubleDigitAchievement.isUnlocked &&
    (game.homeScore! >= 10 || game.awayScore! >= 10)
  ) {
    newlyUnlocked.push({
      ...doubleDigitAchievement,
      isUnlocked: true,
      unlockedDate: gameDate,
    });
  }

  // Check for "overtime-shutout" achievement - A game ends 1-0 in overtime
  const overtimeShutoutAchievement = achievements.find((a) => a.id === 'overtime-shutout');
  if (
    overtimeShutoutAchievement &&
    !overtimeShutoutAchievement.isUnlocked &&
    game.overtime &&
    ((game.homeScore === 1 && game.awayScore === 0) || (game.homeScore === 0 && game.awayScore === 1))
  ) {
    newlyUnlocked.push({
      ...overtimeShutoutAchievement,
      isUnlocked: true,
      unlockedDate: gameDate,
    });
  }

  // Check for "high-scoring-thriller" achievement - A game ends 9-6
  const highScoringAchievement = achievements.find((a) => a.id === 'high-scoring-thriller');
  if (
    highScoringAchievement &&
    !highScoringAchievement.isUnlocked &&
    ((game.homeScore === 9 && game.awayScore === 6) || (game.homeScore === 6 && game.awayScore === 9))
  ) {
    newlyUnlocked.push({
      ...highScoringAchievement,
      isUnlocked: true,
      unlockedDate: gameDate,
    });
  }

  return newlyUnlocked;
};

/**
 * Check if the "Pallet Town Remembers" achievement should be unlocked
 * Triggers when a player named Chauncey is generated/joins the league
 * @param newPlayers Array of newly generated players
 * @param achievements The current list of achievements
 * @param currentDate The current date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkNewPlayerAchievements = (
  newPlayers: Player[],
  achievements: Achievement[],
  currentDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  // Check for "pallet-town-remembers" achievement - A player named Chauncey joins the league
  const palletTownAchievement = achievements.find((a) => a.id === 'pallet-town-remembers');
  if (palletTownAchievement && !palletTownAchievement.isUnlocked) {
    // Check if any new player has first name "Chauncey"
    const hasChauncey = newPlayers.some((player) => {
      const firstName = player.name.split(' ')[0];
      return firstName === 'Chauncey';
    });

    if (hasChauncey) {
      newlyUnlocked.push({
        ...palletTownAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }
  }

  return newlyUnlocked;
};

/**
 * Check if any season-end achievements should be unlocked based on team stats
 * @param teams Array of all teams with their final regular season stats
 * @param achievements The current list of achievements
 * @param currentDate The current date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkSeasonEndAchievements = (
  teams: Team[],
  achievements: Achievement[],
  currentDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  teams.forEach((team) => {
    // Check for "offensive-powerhouse" achievement - Team finishes with 70+ goals scored
    const offensivePowerhouseAchievement = achievements.find((a) => a.id === 'offensive-powerhouse');
    if (
      offensivePowerhouseAchievement &&
      !offensivePowerhouseAchievement.isUnlocked &&
      team.goalsFor >= 70
    ) {
      newlyUnlocked.push({
        ...offensivePowerhouseAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "defensive-disaster" achievement - Team finishes with 70+ goals allowed
    const defensiveDisasterAchievement = achievements.find((a) => a.id === 'defensive-disaster');
    if (
      defensiveDisasterAchievement &&
      !defensiveDisasterAchievement.isUnlocked &&
      team.goalsAgainst >= 70
    ) {
      newlyUnlocked.push({
        ...defensiveDisasterAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "dominant-season" achievement - Team finishes with 35+ total points
    const dominantSeasonAchievement = achievements.find((a) => a.id === 'dominant-season');
    if (
      dominantSeasonAchievement &&
      !dominantSeasonAchievement.isUnlocked &&
      team.points >= 35
    ) {
      newlyUnlocked.push({
        ...dominantSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "basement-dweller" achievement - Team finishes with 10 or less total points
    const basementDwellerAchievement = achievements.find((a) => a.id === 'basement-dweller');
    if (
      basementDwellerAchievement &&
      !basementDwellerAchievement.isUnlocked &&
      team.points <= 10
    ) {
      newlyUnlocked.push({
        ...basementDwellerAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "overtime-specialist" achievement - Team finishes with 5+ overtime losses
    const overtimeSpecialistAchievement = achievements.find((a) => a.id === 'overtime-specialist');
    if (
      overtimeSpecialistAchievement &&
      !overtimeSpecialistAchievement.isUnlocked &&
      team.overtimeLosses >= 5
    ) {
      newlyUnlocked.push({
        ...overtimeSpecialistAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }
  });

  return newlyUnlocked;
};

/**
 * Check if any player stat achievements should be unlocked based on player stats
 * @param players Array of all players (from all teams)
 * @param achievements The current list of achievements
 * @param currentDate The current date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkPlayerStatAchievements = (
  players: Player[],
  achievements: Achievement[],
  currentDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  players.forEach((player) => {
    // Check for "fifty-goal-season" achievement - Player scores 50 goals in a season
    const fiftyGoalSeasonAchievement = achievements.find((a) => a.id === 'fifty-goal-season');
    if (
      fiftyGoalSeasonAchievement &&
      !fiftyGoalSeasonAchievement.isUnlocked &&
      player.seasonStats.goals >= 50
    ) {
      newlyUnlocked.push({
        ...fiftyGoalSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-600-goals" achievement - Player reaches 600 career goals
    const career600GoalsAchievement = achievements.find((a) => a.id === 'career-600-goals');
    if (
      career600GoalsAchievement &&
      !career600GoalsAchievement.isUnlocked &&
      player.careerStats.goals >= 600
    ) {
      newlyUnlocked.push({
        ...career600GoalsAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "twenty-five-assist-season" achievement - Player records 25 assists in a season
    const twentyFiveAssistSeasonAchievement = achievements.find((a) => a.id === 'twenty-five-assist-season');
    if (
      twentyFiveAssistSeasonAchievement &&
      !twentyFiveAssistSeasonAchievement.isUnlocked &&
      player.seasonStats.assists >= 25
    ) {
      newlyUnlocked.push({
        ...twentyFiveAssistSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-200-assists" achievement - Player reaches 200 career assists
    const career200AssistsAchievement = achievements.find((a) => a.id === 'career-200-assists');
    if (
      career200AssistsAchievement &&
      !career200AssistsAchievement.isUnlocked &&
      player.careerStats.assists >= 200
    ) {
      newlyUnlocked.push({
        ...career200AssistsAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "sixty-point-season" achievement - Player scores 60 points in a season
    const sixtyPointSeasonAchievement = achievements.find((a) => a.id === 'sixty-point-season');
    if (
      sixtyPointSeasonAchievement &&
      !sixtyPointSeasonAchievement.isUnlocked &&
      player.seasonStats.points >= 60
    ) {
      newlyUnlocked.push({
        ...sixtyPointSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-750-points" achievement - Player reaches 750 career points
    const career750PointsAchievement = achievements.find((a) => a.id === 'career-750-points');
    if (
      career750PointsAchievement &&
      !career750PointsAchievement.isUnlocked &&
      player.careerStats.points >= 750
    ) {
      newlyUnlocked.push({
        ...career750PointsAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "one-seventy-five-save-season" achievement - Goalie records 180 saves in a season
    const oneSeventyFiveSaveSeasonAchievement = achievements.find((a) => a.id === 'one-seventy-five-save-season');
    if (
      oneSeventyFiveSaveSeasonAchievement &&
      !oneSeventyFiveSaveSeasonAchievement.isUnlocked &&
      player.seasonStats.saves !== undefined &&
      player.seasonStats.saves >= 180
    ) {
      newlyUnlocked.push({
        ...oneSeventyFiveSaveSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-1500-saves" achievement - Goalie reaches 2500 career saves
    const career1500SavesAchievement = achievements.find((a) => a.id === 'career-1500-saves');
    if (
      career1500SavesAchievement &&
      !career1500SavesAchievement.isUnlocked &&
      player.careerStats.saves !== undefined &&
      player.careerStats.saves >= 2500
    ) {
      newlyUnlocked.push({
        ...career1500SavesAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "one-fifty-hit-season" achievement - Player records 150 hits in a season
    const oneFiftyHitSeasonAchievement = achievements.find((a) => a.id === 'one-fifty-hit-season');
    if (
      oneFiftyHitSeasonAchievement &&
      !oneFiftyHitSeasonAchievement.isUnlocked &&
      player.seasonStats.hits >= 150
    ) {
      newlyUnlocked.push({
        ...oneFiftyHitSeasonAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-1500-hits" achievement - Player reaches 2000 career hits
    const career1500HitsAchievement = achievements.find((a) => a.id === 'career-1500-hits');
    if (
      career1500HitsAchievement &&
      !career1500HitsAchievement.isUnlocked &&
      player.careerStats.hits >= 2000
    ) {
      newlyUnlocked.push({
        ...career1500HitsAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }

    // Check for "career-1000-legacy" achievement - Player reaches 1000 career legacy
    const career1000LegacyAchievement = achievements.find((a) => a.id === 'career-1000-legacy');
    if (
      career1000LegacyAchievement &&
      !career1000LegacyAchievement.isUnlocked &&
      player.careerStats.legacy !== undefined &&
      player.careerStats.legacy >= 1000
    ) {
      newlyUnlocked.push({
        ...career1000LegacyAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }
  });

  return newlyUnlocked;
};

/**
 * Check if the "Dynasty" achievement should be unlocked
 * Triggers when a team wins 3 consecutive championships
 * @param seasonHistory Array of all season history records
 * @param achievements The current list of achievements
 * @param currentDate The current date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkConsecutiveChampionshipAchievement = (
  seasonHistory: SeasonHistory[],
  achievements: Achievement[],
  currentDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  // Check for "three-peat" achievement - A team wins 3 consecutive championships
  const threePeatAchievement = achievements.find((a) => a.id === 'three-peat');
  if (threePeatAchievement && !threePeatAchievement.isUnlocked && seasonHistory.length >= 3) {
    // Get the last 3 seasons
    const lastThreeSeasons = seasonHistory.slice(-3);

    // Check if the same team won all 3 championships
    const champion1 = lastThreeSeasons[0].champion;
    const champion2 = lastThreeSeasons[1].champion;
    const champion3 = lastThreeSeasons[2].champion;

    if (champion1 === champion2 && champion2 === champion3) {
      newlyUnlocked.push({
        ...threePeatAchievement,
        isUnlocked: true,
        unlockedDate: currentDate,
      });
    }
  }

  return newlyUnlocked;
};

/**
 * Check if Hall of Fame achievements should be unlocked
 * Triggers when the Hall of Fame opens or when players are inducted
 * @param hallOfFameCount The total number of Hall of Fame inductees
 * @param achievements The current list of achievements
 * @param currentDate The current date for achievement unlocking
 * @returns Array of newly unlocked achievements, or empty array if none
 */
export const checkHallOfFameAchievements = (
  hallOfFameCount: number,
  achievements: Achievement[],
  currentDate: string
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  // Check for "hall-of-fame-opens" achievement - Hall of Fame becomes active (year > 2040)
  // This achievement unlocks when the Hall of Fame opens, regardless of inductees
  const hallOfFameOpensAchievement = achievements.find((a) => a.id === 'hall-of-fame-opens');
  if (hallOfFameOpensAchievement && !hallOfFameOpensAchievement.isUnlocked) {
    newlyUnlocked.push({
      ...hallOfFameOpensAchievement,
      isUnlocked: true,
      unlockedDate: currentDate,
    });
  }

  // Check for "first-hall-of-fame-inductee" achievement - A player is inducted
  const firstInducteeAchievement = achievements.find((a) => a.id === 'first-hall-of-fame-inductee');
  if (firstInducteeAchievement && !firstInducteeAchievement.isUnlocked && hallOfFameCount >= 1) {
    newlyUnlocked.push({
      ...firstInducteeAchievement,
      isUnlocked: true,
      unlockedDate: currentDate,
    });
  }

  // Check for "fifteen-hall-of-fame-inductees" achievement - 15 players inducted
  const fifteenInducteesAchievement = achievements.find((a) => a.id === 'fifteen-hall-of-fame-inductees');
  if (fifteenInducteesAchievement && !fifteenInducteesAchievement.isUnlocked && hallOfFameCount >= 15) {
    newlyUnlocked.push({
      ...fifteenInducteesAchievement,
      isUnlocked: true,
      unlockedDate: currentDate,
    });
  }

  return newlyUnlocked;
};
