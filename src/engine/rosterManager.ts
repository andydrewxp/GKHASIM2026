import type { Team, Player, Injury, Suspension, Position } from '../types';

// Swap bench player with active player
export const swapBenchWithActive = (
  team: Team,
  activePlayerIndex: number
): { success: boolean; message: string } => {
  if (!team.benchPlayer) {
    return { success: false, message: 'No bench player available' };
  }

  if (activePlayerIndex < 0 || activePlayerIndex >= team.activePlayers.length) {
    return { success: false, message: 'Invalid active player index' };
  }

  const benchPlayer = team.benchPlayer;
  const activePlayer = team.activePlayers[activePlayerIndex];

  // Check if bench player has higher overall
  if (benchPlayer.overall <= activePlayer.overall) {
    return {
      success: false,
      message: 'Bench player must have higher overall rating',
    };
  }

  // Check if positions match
  if (benchPlayer.position !== activePlayer.position) {
    return {
      success: false,
      message: 'Players must have the same position',
    };
  }

  // Perform swap
  team.activePlayers[activePlayerIndex] = benchPlayer;
  team.benchPlayer = activePlayer;

  benchPlayer.state = 'Active';
  activePlayer.state = 'Bench';

  // Optimize bench player position to their best position
  switchPlayerToBestPosition(activePlayer);

  return {
    success: true,
    message: `${benchPlayer.name} moved to active roster, ${activePlayer.name} moved to bench`,
  };
};

// Sign free agent to replace bench player
export const signFreeAgent = (
  team: Team,
  freeAgents: Player[],
  freeAgentId: string
): { success: boolean; message: string; droppedPlayer?: Player } => {
  const freeAgent = freeAgents.find((fa) => fa.id === freeAgentId);

  if (!freeAgent) {
    return { success: false, message: 'Free agent not found' };
  }

  if (!team.benchPlayer) {
    return { success: false, message: 'No bench player to replace' };
  }

  // Check if free agent has higher overall than bench player
  if (freeAgent.overall <= team.benchPlayer.overall) {
    return {
      success: false,
      message: 'Free agent must have higher overall rating than bench player',
    };
  }

  // Drop bench player
  const droppedPlayer = team.benchPlayer;
  droppedPlayer.state = 'Free Agent';
  droppedPlayer.teamId = undefined;

  // Sign free agent
  freeAgent.state = 'Bench';
  freeAgent.teamId = team.id;
  team.benchPlayer = freeAgent;

  // Update free agents list
  const freeAgentIndex = freeAgents.findIndex((fa) => fa.id === freeAgentId);
  freeAgents.splice(freeAgentIndex, 1);
  freeAgents.push(droppedPlayer);

  return {
    success: true,
    message: `Signed ${freeAgent.name}, dropped ${droppedPlayer.name}`,
    droppedPlayer,
  };
};

// Move injured player to IR and sign replacement
export const moveToIR = (
  team: Team,
  playerId: string,
  freeAgents: Player[],
  replacementId?: string
): { success: boolean; message: string } => {
  // Find injured player in active roster
  const activePlayerIndex = team.activePlayers.findIndex(
    (p) => p.id === playerId
  );

  if (activePlayerIndex === -1) {
    return { success: false, message: 'Player not found in active roster' };
  }

  const injuredPlayer = team.activePlayers[activePlayerIndex];

  // Move to IR
  injuredPlayer.state = 'IR';
  team.irPlayers.push(injuredPlayer);
  team.activePlayers.splice(activePlayerIndex, 1);

  // If replacement specified, sign them
  if (replacementId) {
    const replacement = freeAgents.find((fa) => fa.id === replacementId);
    if (!replacement) {
      return {
        success: false,
        message: 'Replacement player not found',
      };
    }

    if (replacement.position !== injuredPlayer.position) {
      return {
        success: false,
        message: 'Replacement must have same position as injured player',
      };
    }

    // Sign replacement
    replacement.state = 'Active';
    replacement.teamId = team.id;
    team.activePlayers.push(replacement);

    // Remove from free agents
    const replacementIndex = freeAgents.findIndex((fa) => fa.id === replacementId);
    freeAgents.splice(replacementIndex, 1);

    return {
      success: true,
      message: `${injuredPlayer.name} moved to IR, signed ${replacement.name}`,
    };
  }

  return {
    success: true,
    message: `${injuredPlayer.name} moved to IR`,
  };
};

// Return player from IR
export const returnFromIR = (
  team: Team,
  freeAgents: Player[],
  playerToDropId?: string
): { success: boolean; message: string } => {
  if (!team.irPlayers || team.irPlayers.length === 0) {
    return { success: false, message: 'No players in IR' };
  }

  // Find a healed player in IR (first one that's healed)
  const returningPlayer = team.irPlayers.find(
    (p) => !p.injuryDaysRemaining || p.injuryDaysRemaining <= 0
  );

  if (!returningPlayer) {
    return { success: false, message: 'No healed players in IR' };
  }

  // Check if player is healed
  if (returningPlayer.injuryDaysRemaining && returningPlayer.injuryDaysRemaining > 0) {
    return {
      success: false,
      message: 'Player is still injured',
    };
  }

  // Need to drop a player to make room
  if (team.activePlayers.length >= 3) {
    if (!playerToDropId) {
      return {
        success: false,
        message: 'Must specify player to drop',
      };
    }

    const activePlayerIndex = team.activePlayers.findIndex(
      (p) => p.id === playerToDropId
    );

    if (activePlayerIndex === -1) {
      return {
        success: false,
        message: 'Player to drop not found',
      };
    }

    const droppedPlayer = team.activePlayers[activePlayerIndex];

    // Check if positions match
    if (droppedPlayer.position !== returningPlayer.position) {
      return {
        success: false,
        message: 'Dropped player must have same position as returning player',
      };
    }

    // Drop player to free agency
    droppedPlayer.state = 'Free Agent';
    droppedPlayer.teamId = undefined;
    freeAgents.push(droppedPlayer);

    // Remove from active roster
    team.activePlayers.splice(activePlayerIndex, 1);
  }

  // Return player from IR
  returningPlayer.state = 'Active';
  returningPlayer.injuryDaysRemaining = undefined;
  team.activePlayers.push(returningPlayer);

  // Remove from IR array
  const irIndex = team.irPlayers.findIndex((p) => p.id === returningPlayer.id);
  if (irIndex !== -1) {
    team.irPlayers.splice(irIndex, 1);
  }

  return {
    success: true,
    message: `${returningPlayer.name} returned from IR`,
  };
};

// Process injuries after simulation day
export const processInjuries = (
  teams: Team[],
  injuries: Injury[]
): { healedPlayerIds: string[] } => {
  const healedPlayerIds: string[] = [];

  injuries.forEach((injury) => {
    injury.daysRemaining--;

    if (injury.daysRemaining <= 0) {
      // Player is healed
      healedPlayerIds.push(injury.playerId);

      // Update player injury status
      teams.forEach((team) => {
        const irPlayer = team.irPlayers.find((p) => p.id === injury.playerId);
        if (irPlayer) {
          irPlayer.injuryDaysRemaining = 0;
        }
      });
    }
  });

  // Remove healed injuries
  injuries = injuries.filter((injury) => injury.daysRemaining > 0);

  return { healedPlayerIds };
};

// Apply injury to player
export const applyInjury = (
  player: Player,
  days: number,
  _description: string
): void => {
  player.injuryDaysRemaining = days;
};

// Move suspended player to suspension list and sign replacement
export const moveToSuspension = (
  team: Team,
  playerId: string,
  freeAgents: Player[],
  replacementId?: string
): { success: boolean; message: string } => {
  // Find suspended player in active roster
  const activePlayerIndex = team.activePlayers.findIndex(
    (p) => p.id === playerId
  );

  if (activePlayerIndex === -1) {
    return { success: false, message: 'Player not found in active roster' };
  }

  const suspendedPlayer = team.activePlayers[activePlayerIndex];

  // Move to suspension list
  suspendedPlayer.state = 'Suspended';
  team.suspendedPlayers.push(suspendedPlayer);
  team.activePlayers.splice(activePlayerIndex, 1);

  // If replacement specified, sign them
  if (replacementId) {
    const replacement = freeAgents.find((fa) => fa.id === replacementId);
    if (!replacement) {
      return {
        success: false,
        message: 'Replacement player not found',
      };
    }

    if (replacement.position !== suspendedPlayer.position) {
      return {
        success: false,
        message: 'Replacement must have same position as suspended player',
      };
    }

    // Sign replacement
    replacement.state = 'Active';
    replacement.teamId = team.id;
    team.activePlayers.push(replacement);

    // Remove from free agents
    const replacementIndex = freeAgents.findIndex((fa) => fa.id === replacementId);
    freeAgents.splice(replacementIndex, 1);

    return {
      success: true,
      message: `${suspendedPlayer.name} moved to suspension list, signed ${replacement.name}`,
    };
  }

  return {
    success: true,
    message: `${suspendedPlayer.name} moved to suspension list`,
  };
};

// Return player from suspension
export const returnFromSuspension = (
  team: Team,
  freeAgents: Player[],
  playerToDropId?: string
): { success: boolean; message: string } => {
  if (!team.suspendedPlayers || team.suspendedPlayers.length === 0) {
    return { success: false, message: 'No players in suspension list' };
  }

  // Find a player with completed suspension (first one that's eligible)
  const returningPlayer = team.suspendedPlayers.find(
    (p) => !p.suspensionGamesRemaining || p.suspensionGamesRemaining <= 0
  );

  if (!returningPlayer) {
    return { success: false, message: 'No players with completed suspensions' };
  }

  // Check if suspension is completed
  if (returningPlayer.suspensionGamesRemaining && returningPlayer.suspensionGamesRemaining > 0) {
    return {
      success: false,
      message: 'Player is still suspended',
    };
  }

  // Need to drop a player to make room
  if (team.activePlayers.length >= 3) {
    if (!playerToDropId) {
      return {
        success: false,
        message: 'Must specify player to drop',
      };
    }

    const activePlayerIndex = team.activePlayers.findIndex(
      (p) => p.id === playerToDropId
    );

    if (activePlayerIndex === -1) {
      return {
        success: false,
        message: 'Player to drop not found',
      };
    }

    const droppedPlayer = team.activePlayers[activePlayerIndex];

    // Check if positions match
    if (droppedPlayer.position !== returningPlayer.position) {
      return {
        success: false,
        message: 'Dropped player must have same position as returning player',
      };
    }

    // Drop player to free agency
    droppedPlayer.state = 'Free Agent';
    droppedPlayer.teamId = undefined;
    freeAgents.push(droppedPlayer);

    // Remove from active roster
    team.activePlayers.splice(activePlayerIndex, 1);
  }

  // Return player from suspension
  returningPlayer.state = 'Active';
  returningPlayer.suspensionGamesRemaining = undefined;
  team.activePlayers.push(returningPlayer);

  // Remove from suspension array
  const suspensionIndex = team.suspendedPlayers.findIndex((p) => p.id === returningPlayer.id);
  if (suspensionIndex !== -1) {
    team.suspendedPlayers.splice(suspensionIndex, 1);
  }

  return {
    success: true,
    message: `${returningPlayer.name} returned from suspension`,
  };
};

// Process suspensions after game
export const processSuspensions = (
  teams: Team[],
  suspensions: Suspension[]
): { completedPlayerIds: string[] } => {
  const completedPlayerIds: string[] = [];

  suspensions.forEach((suspension) => {
    suspension.gamesRemaining--;

    if (suspension.gamesRemaining <= 0) {
      // Suspension is completed
      completedPlayerIds.push(suspension.playerId);

      // Update player suspension status
      teams.forEach((team) => {
        const suspendedPlayer = team.suspendedPlayers.find((p) => p.id === suspension.playerId);
        if (suspendedPlayer) {
          suspendedPlayer.suspensionGamesRemaining = 0;
        }
      });
    }
  });

  // Remove completed suspensions
  suspensions = suspensions.filter((suspension) => suspension.gamesRemaining > 0);

  return { completedPlayerIds };
};

// Apply suspension to player
export const applySuspension = (
  player: Player,
  games: number,
  _reason: string
): void => {
  player.suspensionGamesRemaining = games;
};

// Automatically return players from suspension
export const autoReturnFromSuspension = (
  team: Team,
  freeAgents: Player[]
): {
  returned: boolean;
  message?: string;
  droppedPlayer?: Player;
  action?: 'to-active' | 'to-bench' | 'dropped';
} => {
  // Find first player with completed suspension
  const returningPlayer = team.suspendedPlayers.find(
    (p) => !p.suspensionGamesRemaining || p.suspensionGamesRemaining <= 0
  );

  if (!returningPlayer) {
    return { returned: false };
  }

  // Clear suspension status
  returningPlayer.suspensionGamesRemaining = undefined;

  // Find active player with same position
  const activePlayerIndex = team.activePlayers.findIndex(
    (p) => p.position === returningPlayer.position
  );

  if (activePlayerIndex === -1) {
    // No active player with same position - shouldn't happen but handle gracefully
    return { returned: false };
  }

  const activePlayer = team.activePlayers[activePlayerIndex];

  // Scenario 1: Returning player better than active player
  if (returningPlayer.overall > activePlayer.overall) {
    // Drop bench player if exists
    let droppedPlayer: Player | undefined;
    if (team.benchPlayer) {
      droppedPlayer = team.benchPlayer;
      droppedPlayer.state = 'Free Agent';
      droppedPlayer.teamId = undefined;
      freeAgents.push(droppedPlayer);
    }

    // Active becomes bench
    team.benchPlayer = activePlayer;
    activePlayer.state = 'Bench';

    // Optimize bench player position to their best position
    switchPlayerToBestPosition(activePlayer);

    // Returning player becomes active
    team.activePlayers[activePlayerIndex] = returningPlayer;
    returningPlayer.state = 'Active';

    // Remove from suspension list
    const suspensionIndex = team.suspendedPlayers.findIndex((p) => p.id === returningPlayer.id);
    if (suspensionIndex !== -1) {
      team.suspendedPlayers.splice(suspensionIndex, 1);
    }

    return {
      returned: true,
      message: `${returningPlayer.name} (${returningPlayer.overall} OVR) returns from suspension to active roster, ${activePlayer.name} (${activePlayer.overall} OVR) moves to bench${droppedPlayer ? `, ${droppedPlayer.name} released` : ''}`,
      droppedPlayer,
      action: 'to-active',
    };
  }

  // Scenario 2: Returning player better than bench player (but not active)
  if (team.benchPlayer && returningPlayer.overall > team.benchPlayer.overall) {
    const droppedPlayer = team.benchPlayer;
    droppedPlayer.state = 'Free Agent';
    droppedPlayer.teamId = undefined;
    freeAgents.push(droppedPlayer);

    // Returning player becomes bench
    team.benchPlayer = returningPlayer;
    returningPlayer.state = 'Bench';

    // Optimize bench player position to their best position
    switchPlayerToBestPosition(returningPlayer);

    // Remove from suspension list
    const suspensionIndex = team.suspendedPlayers.findIndex((p) => p.id === returningPlayer.id);
    if (suspensionIndex !== -1) {
      team.suspendedPlayers.splice(suspensionIndex, 1);
    }

    return {
      returned: true,
      message: `${returningPlayer.name} (${returningPlayer.overall} OVR) returns from suspension to bench, ${droppedPlayer.name} (${droppedPlayer.overall} OVR) released`,
      droppedPlayer,
      action: 'to-bench',
    };
  }

  // Scenario 3: Returning player worse than both - drop to free agency
  const droppedPlayer = returningPlayer;
  droppedPlayer.state = 'Free Agent';
  droppedPlayer.teamId = undefined;
  freeAgents.push(droppedPlayer);

  // Remove from suspension list
  const suspensionIndex = team.suspendedPlayers.findIndex((p) => p.id === returningPlayer.id);
  if (suspensionIndex !== -1) {
    team.suspendedPlayers.splice(suspensionIndex, 1);
  }

  return {
    returned: true,
    message: `${returningPlayer.name} (${returningPlayer.overall} OVR) suspension completed but released to free agency`,
    droppedPlayer,
    action: 'dropped',
  };
};

// Process all teams for automatic suspension returns
export const processAllTeamSuspensionReturns = (
  teams: Team[],
  freeAgents: Player[]
): {
  returns: number;
  messages: string[];
  droppedPlayers: Player[];
} => {
  const messages: string[] = [];
  const droppedPlayers: Player[] = [];
  let returns = 0;

  teams.forEach((team) => {
    // Process all players with completed suspensions on this team
    let hasCompletedSuspensions = true;
    while (hasCompletedSuspensions) {
      const result = autoReturnFromSuspension(team, freeAgents);
      if (result.returned && result.message) {
        messages.push(`[${team.name}] ${result.message}`);
        returns++;
        if (result.droppedPlayer) {
          droppedPlayers.push(result.droppedPlayer);
        }
      } else {
        hasCompletedSuspensions = false;
      }
    }
  });

  return { returns, messages, droppedPlayers };
};

// Automatically swap bench player with active player if bench player has higher overall
export const autoSwapBenchWithActive = (team: Team): {
  swapped: boolean;
  message?: string;
} => {
  if (!team.benchPlayer) {
    return { swapped: false };
  }

  const benchPlayer = team.benchPlayer;

  // Find active player with same position
  const activePlayerIndex = team.activePlayers.findIndex(
    (p) => p.position === benchPlayer.position
  );

  if (activePlayerIndex === -1) {
    return { swapped: false };
  }

  const activePlayer = team.activePlayers[activePlayerIndex];

  // Check if bench player has higher overall
  if (benchPlayer.overall > activePlayer.overall) {
    // Perform swap
    team.activePlayers[activePlayerIndex] = benchPlayer;
    team.benchPlayer = activePlayer;

    benchPlayer.state = 'Active';
    activePlayer.state = 'Bench';

    // Optimize bench player position to their best position
    switchPlayerToBestPosition(activePlayer);

    return {
      swapped: true,
      message: `${benchPlayer.name} (${benchPlayer.overall} OVR) moved to active roster, ${activePlayer.name} (${activePlayer.overall} OVR) moved to bench`,
    };
  }

  return { swapped: false };
};

// Process all teams to auto-swap bench players with higher overall ratings
export const processAllTeamAutoSwaps = (
  teams: Team[]
): { swapsMade: number; messages: string[] } => {
  const messages: string[] = [];
  let swapsMade = 0;

  teams.forEach((team) => {
    const result = autoSwapBenchWithActive(team);
    if (result.swapped && result.message) {
      messages.push(`[${team.name}] ${result.message}`);
      swapsMade++;
    }
  });

  return { swapsMade, messages };
};

// Automatically return healed players from IR
export const autoReturnFromIR = (
  team: Team,
  freeAgents: Player[]
): {
  returned: boolean;
  message?: string;
  droppedPlayer?: Player;
  action?: 'to-active' | 'to-bench' | 'dropped';
} => {
  // Find first healed player in IR
  const healedPlayer = team.irPlayers.find(
    (p) => !p.injuryDaysRemaining || p.injuryDaysRemaining <= 0
  );

  if (!healedPlayer) {
    return { returned: false };
  }

  // Clear injury status
  healedPlayer.injuryDaysRemaining = undefined;

  // Find active player with same position
  const activePlayerIndex = team.activePlayers.findIndex(
    (p) => p.position === healedPlayer.position
  );

  if (activePlayerIndex === -1) {
    // No active player with same position - shouldn't happen but handle gracefully
    return { returned: false };
  }

  const activePlayer = team.activePlayers[activePlayerIndex];

  // Scenario 1: Healed player better than active player
  if (healedPlayer.overall > activePlayer.overall) {
    // Drop bench player if exists
    let droppedPlayer: Player | undefined;
    if (team.benchPlayer) {
      droppedPlayer = team.benchPlayer;
      droppedPlayer.state = 'Free Agent';
      droppedPlayer.teamId = undefined;
      freeAgents.push(droppedPlayer);
    }

    // Active becomes bench
    team.benchPlayer = activePlayer;
    activePlayer.state = 'Bench';

    // Optimize bench player position to their best position
    switchPlayerToBestPosition(activePlayer);

    // Healed becomes active
    team.activePlayers[activePlayerIndex] = healedPlayer;
    healedPlayer.state = 'Active';

    // Remove from IR
    const irIndex = team.irPlayers.findIndex((p) => p.id === healedPlayer.id);
    if (irIndex !== -1) {
      team.irPlayers.splice(irIndex, 1);
    }

    return {
      returned: true,
      message: `${healedPlayer.name} (${healedPlayer.overall} OVR) returns from IR to active roster, ${activePlayer.name} (${activePlayer.overall} OVR) moves to bench${droppedPlayer ? `, ${droppedPlayer.name} released` : ''}`,
      droppedPlayer,
      action: 'to-active',
    };
  }

  // Scenario 2: Healed player better than bench player (but not active)
  if (team.benchPlayer && healedPlayer.overall > team.benchPlayer.overall) {
    const droppedPlayer = team.benchPlayer;
    droppedPlayer.state = 'Free Agent';
    droppedPlayer.teamId = undefined;
    freeAgents.push(droppedPlayer);

    // Healed becomes bench
    team.benchPlayer = healedPlayer;
    healedPlayer.state = 'Bench';

    // Optimize bench player position to their best position
    switchPlayerToBestPosition(healedPlayer);

    // Remove from IR
    const irIndex = team.irPlayers.findIndex((p) => p.id === healedPlayer.id);
    if (irIndex !== -1) {
      team.irPlayers.splice(irIndex, 1);
    }

    return {
      returned: true,
      message: `${healedPlayer.name} (${healedPlayer.overall} OVR) returns from IR to bench, ${droppedPlayer.name} (${droppedPlayer.overall} OVR) released`,
      droppedPlayer,
      action: 'to-bench',
    };
  }

  // Scenario 3: Healed player worse than both - drop to free agency
  const droppedPlayer = healedPlayer;
  droppedPlayer.state = 'Free Agent';
  droppedPlayer.teamId = undefined;
  freeAgents.push(droppedPlayer);

  // Remove from IR
  const irIndex = team.irPlayers.findIndex((p) => p.id === healedPlayer.id);
  if (irIndex !== -1) {
    team.irPlayers.splice(irIndex, 1);
  }

  return {
    returned: true,
    message: `${healedPlayer.name} (${healedPlayer.overall} OVR) healed but released to free agency`,
    droppedPlayer,
    action: 'dropped',
  };
};

// Process all teams for automatic IR returns
export const processAllTeamIRReturns = (
  teams: Team[],
  freeAgents: Player[]
): {
  returns: number;
  messages: string[];
  droppedPlayers: Player[];
} => {
  const messages: string[] = [];
  const droppedPlayers: Player[] = [];
  let returns = 0;

  teams.forEach((team) => {
    // Process all healed players on this team
    let hasHealedPlayers = true;
    while (hasHealedPlayers) {
      const result = autoReturnFromIR(team, freeAgents);
      if (result.returned && result.message) {
        messages.push(`[${team.name}] ${result.message}`);
        returns++;
        if (result.droppedPlayer) {
          droppedPlayers.push(result.droppedPlayer);
        }
      } else {
        hasHealedPlayers = false;
      }
    }
  });

  return { returns, messages, droppedPlayers };
};

// Get player's rating for a specific position
export const getPlayerRatingForPosition = (player: Player, position: Position): number => {
  switch (position) {
    case 'Forward':
      return player.forwardRating;
    case 'Defender':
      return player.defenderRating;
    case 'Goalie':
      return player.goalieRating;
  }
};

// Switch player to a new position and update their overall rating
export const switchPlayerPosition = (player: Player, newPosition: Position): void => {
  player.position = newPosition;
  player.overall = getPlayerRatingForPosition(player, newPosition);
};

// Get player's best position based on their ratings
export const getPlayerBestPosition = (player: Player): Position => {
  const ratings = [
    { position: 'Forward' as Position, rating: player.forwardRating },
    { position: 'Defender' as Position, rating: player.defenderRating },
    { position: 'Goalie' as Position, rating: player.goalieRating },
  ];

  return ratings.sort((a, b) => b.rating - a.rating)[0].position;
};

// Switch player to their best position (used for bench optimization)
export const switchPlayerToBestPosition = (player: Player): void => {
  const bestPosition = getPlayerBestPosition(player);
  if (player.position !== bestPosition) {
    switchPlayerPosition(player, bestPosition);
  }
};

// Validate team roster has minimum required active players
export const validateTeamRoster = (team: Team): {
  valid: boolean;
  missingPosition?: Position;
} => {
  // Check if team has at least 3 active players
  if (team.activePlayers.length < 3) {
    // Find which position is missing
    const hasForward = team.activePlayers.some((p) => p.position === 'Forward');
    const hasGoalie = team.activePlayers.some((p) => p.position === 'Goalie');
    const hasDefender = team.activePlayers.some((p) => p.position === 'Defender');

    if (!hasForward) {
      return { valid: false, missingPosition: 'Forward' };
    }
    if (!hasGoalie) {
      return { valid: false, missingPosition: 'Goalie' };
    }
    if (!hasDefender) {
      return { valid: false, missingPosition: 'Defender' };
    }
  }

  return { valid: true };
};

// Automatically fill missing roster position with free agent or bench player
export const autoFillMissingPosition = (
  team: Team,
  freeAgents: Player[],
  missingPosition: Position
): {
  filled: boolean;
  message?: string;
  signedPlayer?: Player;
  positionSwitched?: boolean;
  oldPosition?: Position;
} => {
  // Find the best bench player rating for the missing position (considering position switch)
  let bestBenchRating = 0;
  if (team.benchPlayer) {
    bestBenchRating = getPlayerRatingForPosition(team.benchPlayer, missingPosition);
  }

  // Find the best free agent rating for the missing position (considering position switch)
  const bestFreeAgent = freeAgents
    .map((fa) => ({
      player: fa,
      rating: getPlayerRatingForPosition(fa, missingPosition),
    }))
    .sort((a, b) => b.rating - a.rating)[0];

  const bestFreeAgentRating = bestFreeAgent ? bestFreeAgent.rating : 0;

  // Compare bench player vs best free agent
  if (team.benchPlayer && bestBenchRating >= bestFreeAgentRating) {
    // Use bench player
    const benchPlayer = team.benchPlayer;
    const oldPosition = benchPlayer.position;
    const needsPositionSwitch = benchPlayer.position !== missingPosition;

    // Switch position if needed
    if (needsPositionSwitch) {
      switchPlayerPosition(benchPlayer, missingPosition);
    }

    benchPlayer.state = 'Active';
    team.activePlayers.push(benchPlayer);
    team.benchPlayer = undefined;

    const message = needsPositionSwitch
      ? `Moved ${benchPlayer.name} from bench, switched position from ${oldPosition} to ${missingPosition} (${benchPlayer.overall} OVR)`
      : `Moved ${benchPlayer.name} (${benchPlayer.overall} OVR) from bench to fill vacant ${missingPosition} spot`;

    return {
      filled: true,
      message,
      positionSwitched: needsPositionSwitch,
      oldPosition: needsPositionSwitch ? oldPosition : undefined,
    };
  } else if (bestFreeAgent) {
    // Sign the best free agent
    const freeAgent = bestFreeAgent.player;
    const oldPosition = freeAgent.position;
    const needsPositionSwitch = freeAgent.position !== missingPosition;

    // Switch position if needed
    if (needsPositionSwitch) {
      switchPlayerPosition(freeAgent, missingPosition);
    }

    freeAgent.state = 'Active';
    freeAgent.teamId = team.id;
    team.activePlayers.push(freeAgent);

    const freeAgentIndex = freeAgents.findIndex((fa) => fa.id === freeAgent.id);
    freeAgents.splice(freeAgentIndex, 1);

    const message = needsPositionSwitch
      ? `Signed ${freeAgent.name}, switched position from ${oldPosition} to ${missingPosition} (${freeAgent.overall} OVR)`
      : `Signed ${freeAgent.name} (${freeAgent.overall} OVR) to fill vacant ${missingPosition} spot`;

    return {
      filled: true,
      message,
      signedPlayer: freeAgent,
      positionSwitched: needsPositionSwitch,
      oldPosition: needsPositionSwitch ? oldPosition : undefined,
    };
  }

  // No players available
  return {
    filled: false,
    message: `No players available to fill ${missingPosition} position`,
  };
};

// Find best replacement player (bench or free agent) for a given position
export const findBestReplacement = (
  team: Team,
  freeAgents: Player[],
  position: Position
): {
  replacementPlayer: Player | undefined;
  isBenchPlayer: boolean;
  needsPositionSwitch: boolean;
  oldPosition?: Position;
} => {
  // Find the best bench player rating for the position
  let bestBenchRating = 0;
  if (team.benchPlayer) {
    bestBenchRating = getPlayerRatingForPosition(team.benchPlayer, position);
  }

  // Find the best free agent rating for the position
  const bestFreeAgent = freeAgents
    .map((fa) => ({
      player: fa,
      rating: getPlayerRatingForPosition(fa, position),
    }))
    .sort((a, b) => b.rating - a.rating)[0];

  const bestFreeAgentRating = bestFreeAgent ? bestFreeAgent.rating : 0;

  // Compare bench player vs best free agent
  if (team.benchPlayer && bestBenchRating >= bestFreeAgentRating) {
    // Use bench player
    const needsPositionSwitch = team.benchPlayer.position !== position;
    return {
      replacementPlayer: team.benchPlayer,
      isBenchPlayer: true,
      needsPositionSwitch,
      oldPosition: needsPositionSwitch ? team.benchPlayer.position : undefined,
    };
  } else if (bestFreeAgent) {
    // Use best free agent
    const needsPositionSwitch = bestFreeAgent.player.position !== position;
    return {
      replacementPlayer: bestFreeAgent.player,
      isBenchPlayer: false,
      needsPositionSwitch,
      oldPosition: needsPositionSwitch ? bestFreeAgent.player.position : undefined,
    };
  }

  // No replacement available
  return {
    replacementPlayer: undefined,
    isBenchPlayer: false,
    needsPositionSwitch: false,
  };
};

// Validate and fix all team rosters
export const validateAndFixAllTeamRosters = (
  teams: Team[],
  freeAgents: Player[]
): {
  fixes: number;
  messages: string[];
  signedPlayers: Player[];
  positionSwitches: Array<{
    player: Player;
    team: Team;
    oldPosition: Position;
    newPosition: Position;
  }>;
} => {
  const messages: string[] = [];
  const signedPlayers: Player[] = [];
  const positionSwitches: Array<{
    player: Player;
    team: Team;
    oldPosition: Position;
    newPosition: Position;
  }> = [];
  let fixes = 0;

  teams.forEach((team) => {
    const validation = validateTeamRoster(team);
    if (!validation.valid && validation.missingPosition) {
      const result = autoFillMissingPosition(team, freeAgents, validation.missingPosition);
      if (result.filled && result.message) {
        messages.push(`[${team.name}] ${result.message}`);
        fixes++;
        if (result.signedPlayer) {
          signedPlayers.push(result.signedPlayer);
        }
        if (result.positionSwitched && result.oldPosition) {
          const player = result.signedPlayer || team.activePlayers[team.activePlayers.length - 1];
          positionSwitches.push({
            player,
            team,
            oldPosition: result.oldPosition,
            newPosition: validation.missingPosition,
          });
        }
      }
    }
  });

  return { fixes, messages, signedPlayers, positionSwitches };
};
