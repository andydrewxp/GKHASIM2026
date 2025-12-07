import type { Game, Team, Player, GameEvent } from '../types';

// Calculate team strength based on active player position-specific ratings
export const calculateTeamStrength = (team: Team): number => {
  return team.activePlayers.reduce((sum, player) => {
    // Use the rating that corresponds to the position they are currently playing
    let positionRating: number;
    switch (player.position) {
      case 'Forward':
        positionRating = player.forwardRating;
        break;
      case 'Defender':
        positionRating = player.defenderRating;
        break;
      case 'Goalie':
        positionRating = player.goalieRating;
        break;
      default:
        positionRating = player.overall;
    }
    return sum + positionRating;
  }, 0);
};

// Generate score with Poisson-like distribution based on lambda parameter
const generateScore = (lambda: number): number => {
  const rand = Math.random();

  // Calculate cumulative probabilities for Poisson distribution
  // P(X=k) = (e^-λ * λ^k) / k!
  const eLambda = Math.exp(-lambda);

  let cumulative = 0;
  for (let k = 0; k <= 10; k++) {
    // Calculate factorial
    let factorial = 1;
    for (let i = 2; i <= k; i++) {
      factorial *= i;
    }

    // Calculate probability P(X=k)
    const probability = (eLambda * Math.pow(lambda, k)) / factorial;
    cumulative += probability;

    if (rand < cumulative) {
      return k;
    }
  }
  return 10; // Fallback for scores > 10
};

// Calculate offensive strength - Forward rating counted twice, Defender rating once, averaged
const calculateOffensiveStrength = (team: Team): number => {
  const forward = team.activePlayers.find((p) => p.position === 'Forward');
  const defender = team.activePlayers.find((p) => p.position === 'Defender');

  if (!forward || !defender) {
    return 0;
  }

  // Forward rating counted twice, Defender rating once, then averaged
  return (forward.forwardRating + forward.forwardRating + defender.defenderRating) / 3;
};

// Calculate defensive strength - Goalie rating counted twice, Defender rating once, averaged
const calculateDefensiveStrength = (team: Team): number => {
  const goalie = team.activePlayers.find((p) => p.position === 'Goalie');
  const defender = team.activePlayers.find((p) => p.position === 'Defender');

  if (!goalie || !defender) {
    return 0;
  }

  // Goalie rating counted twice, Defender rating once, then averaged
  return (goalie.goalieRating + goalie.goalieRating + defender.defenderRating) / 3;
};

// Determine game winner based on team strengths
export const determineWinner = (
  homeTeam: Team,
  awayTeam: Team
): { homeScore: number; awayScore: number; overtime: boolean } => {
  // Calculate offensive and defensive strengths for both teams
  const homeOffense = calculateOffensiveStrength(homeTeam);
  const homeDefense = calculateDefensiveStrength(homeTeam);
  const awayOffense = calculateOffensiveStrength(awayTeam);
  const awayDefense = calculateDefensiveStrength(awayTeam);

  // Base lambda for average scoring (starts at 2.5 goals)
  const baseLambda = 2.5;

  // Calculate average ratings for normalization
  // Lower values increase scoring
  const avgOffense = 80;
  const avgDefense = 81;

  // Home team plays against away defense
  // Higher offense vs lower defense = more goals
  // Add home ice advantage (5% boost to offense)
  const homeAdvantage = 1.05;
  const homeLambda = baseLambda * (homeOffense * homeAdvantage / avgOffense) * (avgDefense / awayDefense);

  // Away team plays against home defense
  const awayLambda = baseLambda * (awayOffense / avgOffense) * (avgDefense / homeDefense);

  // Generate scores based on the calculated lambdas
  let homeScore = generateScore(homeLambda);
  let awayScore = generateScore(awayLambda);

  // Handle ties - games must have a winner (overtime or shootout)
  let overtime = false;
  if (homeScore === awayScore) {
    overtime = true;
    // In overtime, use team strengths to determine winner
    const homeOverallStrength = calculateTeamStrength(homeTeam);
    const awayOverallStrength = calculateTeamStrength(awayTeam);

    // Calculate overtime win probability (with slight home advantage)
    const homeOTWinProbability = (homeOverallStrength * homeAdvantage) /
                                  (homeOverallStrength * homeAdvantage + awayOverallStrength);

    // Determine overtime winner
    if (Math.random() < homeOTWinProbability) {
      homeScore++;
    } else {
      awayScore++;
    }
  }

  return { homeScore, awayScore, overtime };
};

// Generate live game events
export const generateGameEvents = (
  game: Game,
  homeTeam: Team,
  awayTeam: Team,
  homeScore: number,
  awayScore: number
): GameEvent[] => {
  const events: GameEvent[] = [];

  // Game duration in minutes (3 periods of 20 minutes each)
  const gameDuration = 60;

  // For overtime games, regulation should end tied
  // The final score includes the OT goal, so we need to subtract 1 from the winner's score for regulation
  let regulationHomeScore = homeScore;
  let regulationAwayScore = awayScore;
  let otWinner: 'home' | 'away' | null = null;

  if (game.overtime) {
    if (homeScore > awayScore) {
      regulationHomeScore = homeScore - 1;
      otWinner = 'home';
    } else {
      regulationAwayScore = awayScore - 1;
      otWinner = 'away';
    }
  }

  const totalRegulationGoals = regulationHomeScore + regulationAwayScore;

  // Generate goal events for regulation time only
  const goalTimes: number[] = [];
  for (let i = 0; i < totalRegulationGoals; i++) {
    goalTimes.push(Math.floor(Math.random() * gameDuration) + 1);
  }
  goalTimes.sort((a, b) => a - b);

  let homeGoalsScored = 0;
  let awayGoalsScored = 0;

  goalTimes.forEach((minute) => {
    // Determine which team scores based on regulation score
    let scoringTeam: Team;
    let scoringTeamId: string;
    let isHomeGoal: boolean;

    if (homeGoalsScored < regulationHomeScore && (awayGoalsScored >= regulationAwayScore || Math.random() < 0.5)) {
      scoringTeam = homeTeam;
      scoringTeamId = homeTeam.id;
      homeGoalsScored++;
      isHomeGoal = true;
    } else {
      scoringTeam = awayTeam;
      scoringTeamId = awayTeam.id;
      awayGoalsScored++;
      isHomeGoal = false;
    }

    // Pick random scorer from active players (forwards more likely)
    const forwards = scoringTeam.activePlayers.filter((p) => p.position === 'Forward');
    const others = scoringTeam.activePlayers.filter((p) => p.position !== 'Forward');

    let scorer: Player;
    if (Math.random() < 0.6 && forwards.length > 0) {
      // 60% chance to pick a forward if forwards exist
      scorer = forwards[Math.floor(Math.random() * forwards.length)];
    } else if (others.length > 0) {
      // Pick from others if available
      scorer = others[Math.floor(Math.random() * others.length)];
    } else if (forwards.length > 0) {
      // Fallback to forwards if others is empty
      scorer = forwards[Math.floor(Math.random() * forwards.length)];
    } else {
      // Last resort: pick any active player
      scorer = scoringTeam.activePlayers[Math.floor(Math.random() * scoringTeam.activePlayers.length)];
    }

    events.push({
      minute,
      type: 'Goal',
      description: `GOAL! ${scorer.name} scores for ${scoringTeam.name}! ${isHomeGoal ? `${homeTeam.name} ${homeGoalsScored}` : `${homeTeam.name} ${homeGoalsScored}`}, ${!isHomeGoal ? `${awayTeam.name} ${awayGoalsScored}` : `${awayTeam.name} ${awayGoalsScored}`}`,
      teamId: scoringTeamId,
      playerId: scorer.id,
    });
  });

  // Add some save events for regulation
  const numSaves = Math.floor(Math.random() * 10) + 10;
  for (let i = 0; i < numSaves; i++) {
    const minute = Math.floor(Math.random() * gameDuration) + 1;
    const team = Math.random() < 0.5 ? homeTeam : awayTeam;
    const goalie = team.activePlayers.find((p) => p.position === 'Goalie');

    if (goalie) {
      events.push({
        minute,
        type: 'Save',
        description: `Great save by ${goalie.name}!`,
        teamId: team.id,
        playerId: goalie.id,
      });
    }
  }

  // Add hit events for regulation (defenders most likely, goalies least likely)
  const numHits = Math.floor(Math.random() * 15) + 15; // 15-30 hits per game
  for (let i = 0; i < numHits; i++) {
    const minute = Math.floor(Math.random() * gameDuration) + 1;
    const team = Math.random() < 0.5 ? homeTeam : awayTeam;

    // Determine who delivers the hit based on position probabilities
    // Defenders: 60% chance, Forwards: 35% chance, Goalies: 5% chance
    const defenders = team.activePlayers.filter((p) => p.position === 'Defender');
    const forwards = team.activePlayers.filter((p) => p.position === 'Forward');
    const goalies = team.activePlayers.filter((p) => p.position === 'Goalie');

    let hitter: Player | undefined;
    const roll = Math.random();

    if (roll < 0.60 && defenders.length > 0) {
      // 60% chance for defender
      hitter = defenders[Math.floor(Math.random() * defenders.length)];
    } else if (roll < 0.95 && forwards.length > 0) {
      // 35% chance for forward (0.60 to 0.95)
      hitter = forwards[Math.floor(Math.random() * forwards.length)];
    } else if (goalies.length > 0) {
      // 5% chance for goalie (0.95 to 1.0)
      hitter = goalies[Math.floor(Math.random() * goalies.length)];
    }

    if (hitter) {
      events.push({
        minute,
        type: 'Hit',
        description: `${hitter.name} delivers a big hit!`,
        teamId: team.id,
        playerId: hitter.id,
      });
    }
  }

  // Add period end events
  events.push({ minute: 20, type: 'Period End', description: 'End of 1st period' });
  events.push({ minute: 40, type: 'Period End', description: 'End of 2nd period' });
  events.push({ minute: 60, type: 'Period End', description: 'End of 3rd period' });

  // Track the last goal minute for game end event
  let lastGoalMinute = gameDuration;

  // Add overtime goal if game went to OT
  if (game.overtime && otWinner) {
    const otScoringTeam = otWinner === 'home' ? homeTeam : awayTeam;
    const otScoringTeamId = otScoringTeam.id;

    // Pick random OT scorer from active players (forwards more likely)
    const forwards = otScoringTeam.activePlayers.filter((p) => p.position === 'Forward');
    const others = otScoringTeam.activePlayers.filter((p) => p.position !== 'Forward');

    let otScorer: Player;
    if (Math.random() < 0.7 && forwards.length > 0) {
      otScorer = forwards[Math.floor(Math.random() * forwards.length)];
    } else if (others.length > 0) {
      otScorer = others[Math.floor(Math.random() * others.length)];
    } else if (forwards.length > 0) {
      otScorer = forwards[Math.floor(Math.random() * forwards.length)];
    } else {
      otScorer = otScoringTeam.activePlayers[Math.floor(Math.random() * otScoringTeam.activePlayers.length)];
    }

    // OT goal happens between minutes 61-79
    const otGoalMinute = Math.floor(Math.random() * 19) + 61;
    lastGoalMinute = otGoalMinute;

    events.push({
      minute: otGoalMinute,
      type: 'Goal',
      description: `OVERTIME GOAL! ${otScorer.name} wins it for ${otScoringTeam.name}! Final: ${homeTeam.name} ${homeScore}, ${awayTeam.name} ${awayScore}`,
      teamId: otScoringTeamId,
      playerId: otScorer.id,
    });

    // Calculate overtime period length (from minute 61 to when the goal was scored)
    const overtimeDuration = otGoalMinute - 60;

    // Add extra saves proportional to overtime length
    // Base rate: 10-20 saves per 60 minutes of regulation
    // Scale proportionally for overtime period
    const otSavesRate = (numSaves / gameDuration) * overtimeDuration;
    const numOTSaves = Math.floor(otSavesRate);

    for (let i = 0; i < numOTSaves; i++) {
      const minute = Math.floor(Math.random() * overtimeDuration) + 61;
      const team = Math.random() < 0.5 ? homeTeam : awayTeam;
      const goalie = team.activePlayers.find((p) => p.position === 'Goalie');

      if (goalie) {
        events.push({
          minute,
          type: 'Save',
          description: `Great save by ${goalie.name}!`,
          teamId: team.id,
          playerId: goalie.id,
        });
      }
    }

    // Add extra hits proportional to overtime length
    // Base rate: 15-30 hits per 60 minutes of regulation
    // Scale proportionally for overtime period
    const otHitsRate = (numHits / gameDuration) * overtimeDuration;
    const numOTHits = Math.floor(otHitsRate);

    for (let i = 0; i < numOTHits; i++) {
      const minute = Math.floor(Math.random() * overtimeDuration) + 61;
      const team = Math.random() < 0.5 ? homeTeam : awayTeam;

      // Determine who delivers the hit based on position probabilities
      const defenders = team.activePlayers.filter((p) => p.position === 'Defender');
      const forwards = team.activePlayers.filter((p) => p.position === 'Forward');
      const goalies = team.activePlayers.filter((p) => p.position === 'Goalie');

      let hitter: Player | undefined;
      const roll = Math.random();

      if (roll < 0.60 && defenders.length > 0) {
        // 60% chance for defender
        hitter = defenders[Math.floor(Math.random() * defenders.length)];
      } else if (roll < 0.95 && forwards.length > 0) {
        // 35% chance for forward (0.60 to 0.95)
        hitter = forwards[Math.floor(Math.random() * forwards.length)];
      } else if (goalies.length > 0) {
        // 5% chance for goalie (0.95 to 1.0)
        hitter = goalies[Math.floor(Math.random() * goalies.length)];
      }

      if (hitter) {
        events.push({
          minute,
          type: 'Hit',
          description: `${hitter.name} delivers a big hit!`,
          teamId: team.id,
          playerId: hitter.id,
        });
      }
    }
  }

  // Add game end event at the same minute as the last goal scored
  events.push({
    minute: lastGoalMinute,
    type: 'Game End',
    description: `Final Score: ${homeTeam.name} ${homeScore}, ${awayTeam.name} ${awayScore}${game.overtime ? ' (OT)' : ''}`,
  });

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);

  return events;
};

// Check for injuries during game (5% chance per player per game)
export const checkForInjuries = (players: Player[]): { playerId: string; days: number; description: string }[] => {
  const injuries: { playerId: string; days: number; description: string }[] = [];

  players.forEach((player) => {
    if (Math.random() < 0.05) {
      // Player is injured
      const injuryTypes = [
        { description: 'Knee sprain', days: 7 },
        { description: 'Shoulder injury', days: 10 },
        { description: 'Ankle sprain', days: 5 },
        { description: 'Wrist injury', days: 14 },
        { description: 'Back strain', days: 7 },
        { description: 'Concussion', days: 21 },
      ];

      const injury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
      injuries.push({
        playerId: player.id,
        days: injury.days,
        description: injury.description,
      });
    }
  });

  return injuries;
};

// Check for suspensions during game (1% chance per player per game)
export const checkForSuspensions = (players: Player[]): { playerId: string; games: number; reason: string }[] => {
  const suspensions: { playerId: string; games: number; reason: string }[] = [];

  players.forEach((player) => {
    if (Math.random() < 0.01) {
      // Player is suspended
      const suspensionTypes = [
        { reason: 'Fighting', games: 2 },
        { reason: 'High-sticking', games: 1 },
        { reason: 'Unsportsmanlike conduct', games: 3 },
        { reason: 'Illegal check', games: 2 },
        { reason: 'Off-ice conduct violation', games: 5 },
        { reason: 'Repeated minor infractions', games: 1 },
      ];

      const suspension = suspensionTypes[Math.floor(Math.random() * suspensionTypes.length)];
      suspensions.push({
        playerId: player.id,
        games: suspension.games,
        reason: suspension.reason,
      });
    }
  });

  return suspensions;
};

// Update player stats after game
export const updatePlayerStats = (
  players: Player[],
  events: GameEvent[]
): void => {
  // Count goals, saves, and hits for each player
  const playerGoals: { [playerId: string]: number } = {};
  const playerSaves: { [playerId: string]: number } = {};
  const playerHits: { [playerId: string]: number } = {};

  events.forEach((event) => {
    if (event.type === 'Goal' && event.playerId) {
      playerGoals[event.playerId] = (playerGoals[event.playerId] || 0) + 1;
    } else if (event.type === 'Save' && event.playerId) {
      playerSaves[event.playerId] = (playerSaves[event.playerId] || 0) + 1;
    } else if (event.type === 'Hit' && event.playerId) {
      playerHits[event.playerId] = (playerHits[event.playerId] || 0) + 1;
    }
  });

  // Update stats for all players who participated
  players.forEach((player) => {
    player.seasonStats.gamesPlayed++;
    player.careerStats.gamesPlayed++;

    if (playerGoals[player.id]) {
      const goals = playerGoals[player.id];
      player.seasonStats.goals += goals;
      player.careerStats.goals += goals;
      player.seasonStats.points += goals;
      player.careerStats.points += goals;

      // Award +1 legacy for hat trick (3+ goals in a game)
      if (goals >= 3) {
        player.careerStats.legacy = (player.careerStats.legacy || 0) + 1;
      }

      // Award assists to random teammates (70% chance per goal)
      for (let i = 0; i < goals; i++) {
        if (Math.random() < 0.7) {
          // Get teammates (other players on the same team, excluding the goal scorer)
          const teammates = players.filter((p) => p.id !== player.id);

          if (teammates.length > 0) {
            // Pick a random teammate to get the assist
            const assistPlayer = teammates[Math.floor(Math.random() * teammates.length)];
            assistPlayer.seasonStats.assists++;
            assistPlayer.careerStats.assists++;
            assistPlayer.seasonStats.points++;
            assistPlayer.careerStats.points++;
          }
        }
      }
    }

    if (playerSaves[player.id]) {
      const saves = playerSaves[player.id];
      if (player.seasonStats.saves !== undefined) {
        player.seasonStats.saves += saves;
      }
      if (player.careerStats.saves !== undefined) {
        player.careerStats.saves += saves;
      }

      // Award +1 legacy for 10+ saves in a game
      if (saves >= 10) {
        player.careerStats.legacy = (player.careerStats.legacy || 0) + 1;
      }
    }

    if (playerHits[player.id]) {
      const hits = playerHits[player.id];
      player.seasonStats.hits += hits;
      player.careerStats.hits += hits;

      // Award +1 legacy for 10+ hits in a game
      if (hits >= 10) {
        player.careerStats.legacy = (player.careerStats.legacy || 0) + 1;
      }
    }
  });
};
