import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Game, Player } from '../types';
import {
  determineWinner,
  generateGameEvents,
  checkForInjuries,
  checkForSuspensions,
  updatePlayerStats,
} from '../engine/gameSimulator';
import {
  getNextScheduledGame,
  getNextScheduledGames,
  isSeasonComplete,
} from '../engine/scheduleGenerator';
import { createGameResultPost, createInjuryPost, createIRPost, createSigningPost, createIRReturnToActivePost, createIRReturnToBenchPost, createReleasePost, createPositionSwitchPost, createAchievementPost, createSuspensionPost, createSuspensionListPost, createSuspensionReturnToActivePost, createSuspensionReturnToBenchPost } from '../engine/eventFeed';
import { applyInjury, applySuspension, processAllTeamIRReturns, processAllTeamSuspensionReturns, validateAndFixAllTeamRosters, findBestReplacement, switchPlayerPosition } from '../engine/rosterManager';
import { checkGameAchievements, checkSeasonEndAchievements, checkPlayerStatAchievements } from '../engine/achievementManager';

export const SimulationControls: React.FC<{ onLiveGameStart?: (gameId: string) => void }> = ({
  onLiveGameStart,
}) => {
  const { state, setState } = useAppContext();
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate a single game
  const simulateSingleGame = () => {
    const game = getNextScheduledGame(state.games);
    if (!game) {
      alert('No more games to simulate!');
      return;
    }

    // Start live view if callback provided
    if (onLiveGameStart) {
      onLiveGameStart(game.id);
      return;
    }

    // Otherwise simulate instantly
    simulateGameInstant(game.id);
  };

  // Simulate game instantly (no live view)
  const simulateGameInstant = (gameId: string) => {
    setState((prev) => {
      const newState = { ...prev };
      const game = newState.games.find((g) => g.id === gameId);
      if (!game) return prev;

      // Check if game has already been marked as Final - prevents double execution
      if (game.status === 'Final') return prev;

      const homeTeam = newState.teams.find((t) => t.id === game.homeTeamId);
      const awayTeam = newState.teams.find((t) => t.id === game.awayTeamId);
      if (!homeTeam || !awayTeam) return prev;

      // Determine winner
      const result = determineWinner(homeTeam, awayTeam);
      game.homeScore = result.homeScore;
      game.awayScore = result.awayScore;
      game.overtime = result.overtime;
      game.status = 'Final';

      // Generate events
      game.events = generateGameEvents(game, homeTeam, awayTeam, result.homeScore, result.awayScore);

      // Update stats
      const allPlayers = [...homeTeam.activePlayers, ...awayTeam.activePlayers];
      updatePlayerStats(allPlayers, game.events);

      // Check for player stat achievements after stats are updated
      const allPlayersInLeague = [
        ...newState.teams.flatMap((team) => [...team.activePlayers, team.benchPlayer, ...team.irPlayers, ...team.suspendedPlayers].filter((p): p is Player => p !== undefined)),
        ...newState.freeAgents,
      ];
      const playerStatAchievements = checkPlayerStatAchievements(allPlayersInLeague, newState.achievements, game.date);
      if (playerStatAchievements.length > 0) {
        playerStatAchievements.forEach((unlockedAchievement) => {
          const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
          if (achievementIndex !== -1) {
            newState.achievements[achievementIndex] = unlockedAchievement;
            newState.feedPosts.push(createAchievementPost(unlockedAchievement, game.date));
          }
        });
      }

      // Update team records
      const homeWon = result.homeScore > result.awayScore;
      // Increment games played for both teams
      homeTeam.gamesPlayed++;
      awayTeam.gamesPlayed++;

      // Update goals for/against
      homeTeam.goalsFor += result.homeScore;
      homeTeam.goalsAgainst += result.awayScore;
      awayTeam.goalsFor += result.awayScore;
      awayTeam.goalsAgainst += result.homeScore;

      if (homeWon) {
        homeTeam.wins++;
        homeTeam.points += 2;
        if (result.overtime) {
          awayTeam.overtimeLosses++;
          awayTeam.points += 1;
        } else {
          awayTeam.losses++;
        }
      } else {
        awayTeam.wins++;
        awayTeam.points += 2;
        if (result.overtime) {
          homeTeam.overtimeLosses++;
          homeTeam.points += 1;
        } else {
          homeTeam.losses++;
        }
      }

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

      // Check for injuries
      const injuries = checkForInjuries(allPlayers);
      injuries.forEach((injury) => {
        const player = allPlayers.find((p) => p.id === injury.playerId);
        if (player) {
          applyInjury(player, injury.days, injury.description);
          const team = player.teamId === homeTeam.id ? homeTeam : awayTeam;
          newState.injuries.push({
            playerId: injury.playerId,
            daysRemaining: injury.days,
            description: injury.description,
          });
          newState.feedPosts.push(createInjuryPost(player, team, injury.description, game.date));

          // Automatically move injured player to IR
          const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
          if (activePlayerIndex !== -1) {
            // Move to IR
            player.state = 'IR';
            team.irPlayers.push(player);
            team.activePlayers.splice(activePlayerIndex, 1);
            newState.feedPosts.push(createIRPost(player, team, game.date));

            // Find best replacement (bench or free agent) for the injured player's position
            const replacement = findBestReplacement(team, newState.freeAgents, player.position);

            if (replacement.replacementPlayer) {
              const replacementPlayer = replacement.replacementPlayer;
              const oldPosition = replacement.oldPosition;

              if (replacement.isBenchPlayer) {
                // Use bench player as replacement
                if (replacement.needsPositionSwitch && oldPosition) {
                  switchPlayerPosition(replacementPlayer, player.position);
                  newState.feedPosts.push(
                    createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, game.date)
                  );
                }
                replacementPlayer.state = 'Active';
                team.activePlayers.push(replacementPlayer);
                team.benchPlayer = undefined;

                // Sign a new bench player from free agents
                const newBenchReplacement = findBestReplacement(team, newState.freeAgents, replacementPlayer.position);
                if (newBenchReplacement.replacementPlayer) {
                  const newBenchPlayer = newBenchReplacement.replacementPlayer;
                  const newBenchOldPosition = newBenchReplacement.oldPosition;

                  if (newBenchReplacement.needsPositionSwitch && newBenchOldPosition) {
                    switchPlayerPosition(newBenchPlayer, replacementPlayer.position);
                  }
                  newBenchPlayer.state = 'Bench';
                  newBenchPlayer.teamId = team.id;
                  team.benchPlayer = newBenchPlayer;

                  // Remove from free agents
                  const newBenchIndex = newState.freeAgents.findIndex(
                    (fa) => fa.id === newBenchPlayer.id
                  );
                  newState.freeAgents.splice(newBenchIndex, 1);

                  newState.feedPosts.push(createSigningPost(newBenchPlayer, team, game.date));
                }
              } else {
                // Sign free agent as replacement
                if (replacement.needsPositionSwitch && oldPosition) {
                  switchPlayerPosition(replacementPlayer, player.position);
                }
                replacementPlayer.state = 'Active';
                replacementPlayer.teamId = team.id;
                team.activePlayers.push(replacementPlayer);

                // Remove from free agents
                const replacementIndex = newState.freeAgents.findIndex(
                  (fa) => fa.id === replacementPlayer.id
                );
                newState.freeAgents.splice(replacementIndex, 1);

                newState.feedPosts.push(createSigningPost(replacementPlayer, team, game.date));
              }
            }
          }
        }
      });

      // Check for suspensions
      const suspensions = checkForSuspensions(allPlayers);
      suspensions.forEach((suspension) => {
        const player = allPlayers.find((p) => p.id === suspension.playerId);
        if (player) {
          applySuspension(player, suspension.games, suspension.reason);
          const team = player.teamId === homeTeam.id ? homeTeam : awayTeam;
          newState.suspensions.push({
            playerId: suspension.playerId,
            gamesRemaining: suspension.games,
            reason: suspension.reason,
          });
          newState.feedPosts.push(createSuspensionPost(player, team, suspension.reason, suspension.games, game.date));

          // Automatically move suspended player to suspension list
          const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
          if (activePlayerIndex !== -1) {
            // Move to suspension list
            player.state = 'Suspended';
            team.suspendedPlayers.push(player);
            team.activePlayers.splice(activePlayerIndex, 1);
            newState.feedPosts.push(createSuspensionListPost(player, team, game.date));

            // Find best replacement (bench or free agent) for the suspended player's position
            const replacement = findBestReplacement(team, newState.freeAgents, player.position);

            if (replacement.replacementPlayer) {
              const replacementPlayer = replacement.replacementPlayer;
              const oldPosition = replacement.oldPosition;

              if (replacement.isBenchPlayer) {
                // Use bench player as replacement
                if (replacement.needsPositionSwitch && oldPosition) {
                  switchPlayerPosition(replacementPlayer, player.position);
                  newState.feedPosts.push(
                    createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, game.date)
                  );
                }
                replacementPlayer.state = 'Active';
                team.activePlayers.push(replacementPlayer);
                team.benchPlayer = undefined;

                // Sign a new bench player from free agents
                const newBenchReplacement = findBestReplacement(team, newState.freeAgents, replacementPlayer.position);
                if (newBenchReplacement.replacementPlayer) {
                  const newBenchPlayer = newBenchReplacement.replacementPlayer;
                  const newBenchOldPosition = newBenchReplacement.oldPosition;

                  if (newBenchReplacement.needsPositionSwitch && newBenchOldPosition) {
                    switchPlayerPosition(newBenchPlayer, replacementPlayer.position);
                  }
                  newBenchPlayer.state = 'Bench';
                  newBenchPlayer.teamId = team.id;
                  team.benchPlayer = newBenchPlayer;

                  // Remove from free agents
                  const newBenchIndex = newState.freeAgents.findIndex(
                    (fa) => fa.id === newBenchPlayer.id
                  );
                  newState.freeAgents.splice(newBenchIndex, 1);

                  newState.feedPosts.push(createSigningPost(newBenchPlayer, team, game.date));
                }
              } else {
                // Sign free agent as replacement
                if (replacement.needsPositionSwitch && oldPosition) {
                  switchPlayerPosition(replacementPlayer, player.position);
                }
                replacementPlayer.state = 'Active';
                replacementPlayer.teamId = team.id;
                team.activePlayers.push(replacementPlayer);

                // Remove from free agents
                const replacementIndex = newState.freeAgents.findIndex(
                  (fa) => fa.id === replacementPlayer.id
                );
                newState.freeAgents.splice(replacementIndex, 1);

                newState.feedPosts.push(createSigningPost(replacementPlayer, team, game.date));
              }
            }
          }
        }
      });

      // Check for game-based achievements
      const newlyUnlockedAchievements = checkGameAchievements(game, newState.achievements, game.date);
      if (newlyUnlockedAchievements.length > 0) {
        // Update achievements in state
        newlyUnlockedAchievements.forEach((unlockedAchievement) => {
          const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
          if (achievementIndex !== -1) {
            newState.achievements[achievementIndex] = unlockedAchievement;
            // Add achievement post to feed
            newState.feedPosts.push(createAchievementPost(unlockedAchievement, game.date));
          }
        });
      }

      // Add game result post
      newState.feedPosts.push(createGameResultPost(game, homeTeam, awayTeam, game.date));

      // Process injury recovery - decrement days for all injured players
      newState.teams.forEach((team) => {
        team.irPlayers.forEach((player) => {
          if (player.injuryDaysRemaining && player.injuryDaysRemaining > 0) {
            player.injuryDaysRemaining--;

            // Update the injury tracking array as well
            const injury = newState.injuries.find((inj) => inj.playerId === player.id);
            if (injury) {
              injury.daysRemaining = player.injuryDaysRemaining;
            }
          }
        });
      });

      // Remove healed injuries from the injuries array
      newState.injuries = newState.injuries.filter((injury) => injury.daysRemaining > 0);

      // Process suspension countdown - decrement games for all suspended players
      newState.teams.forEach((team) => {
        team.suspendedPlayers.forEach((player) => {
          if (player.suspensionGamesRemaining && player.suspensionGamesRemaining > 0) {
            player.suspensionGamesRemaining--;

            // Update the suspension tracking array as well
            const suspension = newState.suspensions.find((susp) => susp.playerId === player.id);
            if (suspension) {
              suspension.gamesRemaining = player.suspensionGamesRemaining;
            }
          }
        });
      });

      // Remove completed suspensions from the suspensions array
      newState.suspensions = newState.suspensions.filter((suspension) => suspension.gamesRemaining > 0);

      // Process automatic suspension returns for players with completed suspensions
      newState.teams.forEach((team) => {
        let hasCompletedSuspensions = true;
        while (hasCompletedSuspensions) {
          // Find player with completed suspension
          const returningPlayer = team.suspendedPlayers.find(
            (p) => !p.suspensionGamesRemaining || p.suspensionGamesRemaining <= 0
          );

          if (!returningPlayer) {
            hasCompletedSuspensions = false;
            break;
          }

          // Store info before processing
          const playerName = returningPlayer.name;
          const activePlayerIndex = team.activePlayers.findIndex(
            (p) => p.position === returningPlayer.position
          );

          if (activePlayerIndex === -1) {
            hasCompletedSuspensions = false;
            break;
          }

          // Process the return
          const result = processAllTeamSuspensionReturns([team], newState.freeAgents);

          if (result.returns > 0) {
            // Determine what happened and create appropriate feed post
            const newActivePlayer = team.activePlayers.find((p) => p.name === playerName);
            const newBenchPlayer = team.benchPlayer?.name === playerName ? team.benchPlayer : null;
            const nowFreeAgent = newState.freeAgents.find((p) => p.name === playerName);

            if (newActivePlayer) {
              // Player returned to active roster
              newState.feedPosts.push(createSuspensionReturnToActivePost(newActivePlayer, team, team.benchPlayer!, newState.gameDate));
              // Check if a player was dropped
              const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
              if (droppedPlayer) {
                newState.feedPosts.push(createReleasePost(droppedPlayer, team, newState.gameDate));
              }
            } else if (newBenchPlayer) {
              // Player returned to bench
              newState.feedPosts.push(createSuspensionReturnToBenchPost(newBenchPlayer, team, newState.gameDate));
              // Check if a player was dropped
              const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
              if (droppedPlayer) {
                newState.feedPosts.push(createReleasePost(droppedPlayer, team, newState.gameDate));
              }
            } else if (nowFreeAgent) {
              // Player was released to free agency
              newState.feedPosts.push(createReleasePost(nowFreeAgent, team, newState.gameDate));
            }
          } else {
            hasCompletedSuspensions = false;
          }
        }
      });

      // Process automatic IR returns for healed players
      newState.teams.forEach((team) => {
        let hasHealedPlayers = true;
        while (hasHealedPlayers) {
          // Find healed player
          const healedPlayer = team.irPlayers.find(
            (p) => !p.injuryDaysRemaining || p.injuryDaysRemaining <= 0
          );

          if (!healedPlayer) {
            hasHealedPlayers = false;
            break;
          }

          // Store info before processing
          const playerName = healedPlayer.name;
          const activePlayerIndex = team.activePlayers.findIndex(
            (p) => p.position === healedPlayer.position
          );

          if (activePlayerIndex === -1) {
            hasHealedPlayers = false;
            break;
          }

          // Process the return
          const result = processAllTeamIRReturns([team], newState.freeAgents);

          if (result.returns > 0) {
            // Determine what happened and create appropriate feed post
            const newActivePlayer = team.activePlayers.find((p) => p.name === playerName);
            const newBenchPlayer = team.benchPlayer?.name === playerName ? team.benchPlayer : null;
            const nowFreeAgent = newState.freeAgents.find((p) => p.name === playerName);

            if (newActivePlayer) {
              // Player returned to active roster
              newState.feedPosts.push(createIRReturnToActivePost(newActivePlayer, team, team.benchPlayer!, newState.gameDate));
              // Check if a player was dropped
              const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
              if (droppedPlayer) {
                newState.feedPosts.push(createReleasePost(droppedPlayer, team, newState.gameDate));
              }
            } else if (newBenchPlayer) {
              // Player returned to bench
              newState.feedPosts.push(createIRReturnToBenchPost(newBenchPlayer, team, newState.gameDate));
              // Check if a player was dropped
              const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
              if (droppedPlayer) {
                newState.feedPosts.push(createReleasePost(droppedPlayer, team, newState.gameDate));
              }
            } else if (nowFreeAgent) {
              // Player was released to free agency
              newState.feedPosts.push(createReleasePost(nowFreeAgent, team, newState.gameDate));
            }
          } else {
            hasHealedPlayers = false;
          }
        }
      });

      // Validate and fix team rosters to ensure minimum 3 active players
      const rosterValidation = validateAndFixAllTeamRosters(newState.teams, newState.freeAgents);
      if (rosterValidation.fixes > 0) {
        // Add feed posts for roster fixes
        rosterValidation.signedPlayers.forEach((player) => {
          const team = newState.teams.find((t) => t.id === player.teamId);
          if (team) {
            newState.feedPosts.push(createSigningPost(player, team, newState.gameDate));
          }
        });
        // Add feed posts for position switches
        rosterValidation.positionSwitches.forEach((switchInfo) => {
          newState.feedPosts.push(
            createPositionSwitchPost(
              switchInfo.player,
              switchInfo.team,
              switchInfo.oldPosition,
              switchInfo.newPosition,
              newState.gameDate
            )
          );
        });
      }
      // Check if season complete
      if (isSeasonComplete(newState.games)) {
        newState.isSeasonComplete = true;

        // Check for season-end achievements
        const seasonEndAchievements = checkSeasonEndAchievements(
          newState.teams,
          newState.achievements,
          newState.gameDate
        );
        if (seasonEndAchievements.length > 0) {
          seasonEndAchievements.forEach((unlockedAchievement) => {
            const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
            if (achievementIndex !== -1) {
              newState.achievements[achievementIndex] = unlockedAchievement;
              newState.feedPosts.push(createAchievementPost(unlockedAchievement, newState.gameDate));
            }
          });
        }
      }

      // Update gameDate to the date of the next scheduled game
      const nextGame = newState.games.find((g) => g.status === 'Scheduled');
      if (nextGame) {
        newState.gameDate = nextGame.date;
      }

      return newState;
    });
  };

  // Simulate 10 games
  const simulateMultipleGames = () => {
    setIsSimulating(true);
    const games = getNextScheduledGames(state.games, 10);

    games.forEach((game, index) => {
      setTimeout(() => {
        simulateGameInstant(game.id);
        if (index === games.length - 1) {
          // After all games are simulated, ensure season complete flag is set if needed
          setTimeout(() => {
            setState((prev) => {
              // Double-check that all regular season games are final
              const regularSeasonGames = prev.games.filter((g) => !g.seriesId);
              const allFinal = regularSeasonGames.length > 0 && regularSeasonGames.every((g) => g.status === 'Final');

              if (allFinal && !prev.isSeasonComplete) {
                return { ...prev, isSeasonComplete: true };
              }
              return prev;
            });
            setIsSimulating(false);
          }, 100);
        }
      }, index * 100);
    });
  };

  // Simulate full season
  const simulateFullSeason = () => {
    setIsSimulating(true);

    // Use a recursive approach to ensure games are simulated sequentially
    const simulateNextGame = (gameIndex: number, allGames: Game[]) => {
      if (gameIndex >= allGames.length) {
        // After all games are simulated, ensure season complete flag is set
        setTimeout(() => {
          setState((prev) => {
            // Double-check that all regular season games are final
            const regularSeasonGames = prev.games.filter((g) => !g.seriesId);
            const allFinal = regularSeasonGames.length > 0 && regularSeasonGames.every((g) => g.status === 'Final');

            if (allFinal && !prev.isSeasonComplete) {
              return { ...prev, isSeasonComplete: true };
            }
            return prev;
          });
          setIsSimulating(false);
        }, 100);
        return;
      }

      simulateGameInstant(allGames[gameIndex].id);

      // Wait for state update before simulating next game
      setTimeout(() => {
        simulateNextGame(gameIndex + 1, allGames);
      }, 50);
    };

    const allScheduledGames = state.games.filter((g) => g.status === 'Scheduled' && !g.seriesId);
    simulateNextGame(0, allScheduledGames);
  };

  const hasScheduledGames = state.games.some((g) => g.status === 'Scheduled' && !g.seriesId);

  return (
    <div className="simulation-controls">
      <h3>Simulation</h3>
      <div className="button-group">
        <button
          onClick={simulateSingleGame}
          disabled={!hasScheduledGames || isSimulating}
        >
          Simulate 1 Game
        </button>
        <button
          onClick={simulateMultipleGames}
          disabled={!hasScheduledGames || isSimulating}
        >
          Simulate 10 Games
        </button>
        <button
          onClick={simulateFullSeason}
          disabled={!hasScheduledGames || isSimulating}
        >
          Simulate Full Season
        </button>
      </div>
      {isSimulating && <p className="simulating">Simulating...</p>}
    </div>
  );
};
