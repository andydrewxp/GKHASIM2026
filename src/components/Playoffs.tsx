import React from 'react';
import { useAppContext } from '../context/AppContext';
import {
  generatePlayoffSeries,
  generateSeriesGames,
  generateNextSeriesGame,
  simulatePlayoffGame,
  getNextSeriesGame,
  isSeriesComplete,
  createChampionshipSeries,
  getChampion,
  getNextAvailableSeries,
} from '../engine/playoffsManager';
import { createPlayoffsStartPost, createChampionshipPost, createGameResultPost, createRetirementPost, createNewFreeAgentPost, createAchievementPost, createHallOfFameInductionPost, createHallOfFameNoInductionPost, createIRReturnToActivePost, createIRReturnToBenchPost, createReleasePost, createSuspensionReturnToActivePost, createSuspensionReturnToBenchPost, createInjuryPost, createIRPost, createSigningPost, createPositionSwitchPost, createSuspensionPost, createSuspensionListPost } from '../engine/eventFeed';
import { advanceSeason } from '../engine/seasonManager';
import { generateSchedule } from '../engine/scheduleGenerator';
import { checkGameAchievements, checkNewPlayerAchievements, checkConsecutiveChampionshipAchievement, checkHallOfFameAchievements } from '../engine/achievementManager';
import { processAllTeamIRReturns, processAllTeamSuspensionReturns, applyInjury, applySuspension, findBestReplacement, switchPlayerPosition } from '../engine/rosterManager';
import { checkForInjuries, checkForSuspensions } from '../engine/gameSimulator';

export const Playoffs: React.FC = () => {
  const { state, setState } = useAppContext();

  const startPlayoffs = () => {
    setState((prev) => {
      const newState = { ...prev, games: [...prev.games] };
      const playoffSeries = generatePlayoffSeries(newState.teams);

      // Generate games for both semifinal series
      // Start playoffs in June
      const year = newState.currentYear;
      const startDate = new Date(year, 5, 1); // June 1st (month is 0-indexed, so 5 = June)

      playoffSeries.forEach((series, index) => {
        const seriesStartDate = new Date(startDate);
        seriesStartDate.setDate(seriesStartDate.getDate() + index * 4); // Gap between series
        const seriesGames = generateSeriesGames(series, seriesStartDate.toISOString().split('T')[0]);

        // Only add games that don't already exist
        seriesGames.forEach((game) => {
          if (!newState.games.some((g) => g.id === game.id)) {
            newState.games.push(game);
          }
        });
      });

      newState.playoffSeries = playoffSeries;
      newState.playoffsStarted = true;

      // Get playoff teams for announcement
      const playoffTeamIds = new Set(
        playoffSeries.flatMap((s) => [s.team1Id, s.team2Id])
      );
      const playoffTeams = newState.teams.filter((t) => playoffTeamIds.has(t.id));

      // Add playoffs start post
      newState.feedPosts.push(createPlayoffsStartPost(playoffTeams, newState.gameDate));

      return newState;
    });
  };

  const simulateNextGame = (seriesId: string) => {
    setState((prev) => {
      // Create deep copies of the arrays
      const newGames = prev.games.map(g => ({ ...g }));
      const newPlayoffSeries = prev.playoffSeries.map(s => ({ ...s }));
      const newState = { ...prev, games: newGames, playoffSeries: newPlayoffSeries };

      const series = newState.playoffSeries.find((s) => s.id === seriesId);

      if (!series) return prev;

      // Get the next scheduled game
      const nextGame = getNextSeriesGame(seriesId, newState.games);

      if (!nextGame) return prev;

      // Check if this game is already simulated to prevent double-simulation in StrictMode
      if (nextGame.status === 'Final') return prev;

      const homeTeam = newState.teams.find((t) => t.id === nextGame.homeTeamId);
      const awayTeam = newState.teams.find((t) => t.id === nextGame.awayTeamId);

      if (homeTeam && awayTeam) {
        // Update the current game date to the playoff game's date
        newState.gameDate = nextGame.date;

        // Simulate the current game
        simulatePlayoffGame(nextGame, homeTeam, awayTeam, series);

        // Check for game-based achievements
        const newlyUnlockedAchievements = checkGameAchievements(nextGame, newState.achievements, nextGame.date);
        if (newlyUnlockedAchievements.length > 0) {
          newlyUnlockedAchievements.forEach((unlockedAchievement) => {
            const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
            if (achievementIndex !== -1) {
              newState.achievements[achievementIndex] = unlockedAchievement;
              newState.feedPosts.push(createAchievementPost(unlockedAchievement, nextGame.date));
            }
          });
        }

        newState.feedPosts.push(createGameResultPost(nextGame, homeTeam, awayTeam, nextGame.date));

        // Check for injuries in playoff game
        const allPlayers = [...homeTeam.activePlayers, ...awayTeam.activePlayers];
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
            newState.feedPosts.push(createInjuryPost(player, team, injury.description, nextGame.date));

            // Automatically move injured player to IR
            const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
            if (activePlayerIndex !== -1) {
              // Move to IR
              player.state = 'IR';
              team.irPlayers.push(player);
              team.activePlayers.splice(activePlayerIndex, 1);
              newState.feedPosts.push(createIRPost(player, team, nextGame.date));

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
                      createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, nextGame.date)
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

                    newState.feedPosts.push(createSigningPost(newBenchPlayer, team, nextGame.date));
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

                  newState.feedPosts.push(createSigningPost(replacementPlayer, team, nextGame.date));
                }
              }
            }
          }
        });

        // Check for suspensions in playoff game
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
            newState.feedPosts.push(createSuspensionPost(player, team, suspension.reason, suspension.games, nextGame.date));

            // Automatically move suspended player to suspension list
            const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
            if (activePlayerIndex !== -1) {
              // Move to suspension list
              player.state = 'Suspended';
              team.suspendedPlayers.push(player);
              team.activePlayers.splice(activePlayerIndex, 1);
              newState.feedPosts.push(createSuspensionListPost(player, team, nextGame.date));

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
                      createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, nextGame.date)
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

                    newState.feedPosts.push(createSigningPost(newBenchPlayer, team, nextGame.date));
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

                  newState.feedPosts.push(createSigningPost(replacementPlayer, team, nextGame.date));
                }
              }
            }
          }
        });

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
                newState.feedPosts.push(createSuspensionReturnToActivePost(newActivePlayer, team, team.benchPlayer!, nextGame.date));
                // Check if a player was dropped
                const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                if (droppedPlayer) {
                  newState.feedPosts.push(createReleasePost(droppedPlayer, team, nextGame.date));
                }
              } else if (newBenchPlayer) {
                // Player returned to bench
                newState.feedPosts.push(createSuspensionReturnToBenchPost(newBenchPlayer, team, nextGame.date));
                // Check if a player was dropped
                const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                if (droppedPlayer) {
                  newState.feedPosts.push(createReleasePost(droppedPlayer, team, nextGame.date));
                }
              } else if (nowFreeAgent) {
                // Player was released to free agency
                newState.feedPosts.push(createReleasePost(nowFreeAgent, team, nextGame.date));
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
                newState.feedPosts.push(createIRReturnToActivePost(newActivePlayer, team, team.benchPlayer!, nextGame.date));
                // Check if a player was dropped
                const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                if (droppedPlayer) {
                  newState.feedPosts.push(createReleasePost(droppedPlayer, team, nextGame.date));
                }
              } else if (newBenchPlayer) {
                // Player returned to bench
                newState.feedPosts.push(createIRReturnToBenchPost(newBenchPlayer, team, nextGame.date));
                // Check if a player was dropped
                const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                if (droppedPlayer) {
                  newState.feedPosts.push(createReleasePost(droppedPlayer, team, nextGame.date));
                }
              } else if (nowFreeAgent) {
                // Player was released to free agency
                newState.feedPosts.push(createReleasePost(nowFreeAgent, team, nextGame.date));
              }
            } else {
              hasHealedPlayers = false;
            }
          }
        });

        // Generate the next game if series is not complete
        if (!isSeriesComplete(series)) {
          const seriesGames = newState.games.filter((g) => g.seriesId === seriesId);
          const startDate = seriesGames.length > 0 ? seriesGames[0].date : `${newState.currentYear}-06-01`;
          const newGame = generateNextSeriesGame(series, startDate, newState.games);
          if (newGame && !newState.games.some((g) => g.id === newGame.id)) {
            newState.games.push(newGame);
          }
        } else {
          // Series just completed - if it's the championship, add championship post
          if (series.id === 'championship') {
            const champion = getChampion(series, newState.teams);
            if (champion) {
              newState.feedPosts.push(createChampionshipPost(champion, newState.currentYear, newState.gameDate));
            }
          }
        }
      }

      return newState;
    });
  };


  const startChampionship = () => {
    setState((prev) => {
      const newState = { ...prev, games: [...prev.games] };
      const semifinalSeries = newState.playoffSeries.filter((s) => s.round === 'semifinal');
      const championshipSeries = createChampionshipSeries(semifinalSeries, newState.teams);

      if (!championshipSeries) return prev;

      // Generate championship games (mid-June)
      const championshipStartDate = new Date(newState.currentYear, 5, 15); // June 15th (month is 0-indexed, so 5 = June)
      const championshipGames = generateSeriesGames(championshipSeries, championshipStartDate.toISOString().split('T')[0]);

      // Only add games that don't already exist
      championshipGames.forEach((game) => {
        if (!newState.games.some((g) => g.id === game.id)) {
          newState.games.push(game);
        }
      });

      newState.playoffSeries.push(championshipSeries);

      return newState;
    });
  };


  const simulateEntirePlayoffs = () => {
    setState((prev) => {
      let newState = { ...prev };
      let continueSimulating = true;

      while (continueSimulating) {
        // Check if we need to start the championship series
        const semifinalSeries = newState.playoffSeries.filter((s) => s.round === 'semifinal');
        const championshipSeries = newState.playoffSeries.find((s) => s.id === 'championship');
        const allSemifinalsComplete = semifinalSeries.length === 2 && semifinalSeries.every(isSeriesComplete);

        if (allSemifinalsComplete && !championshipSeries) {
          // Start championship series inline
          const championshipSeriesData = createChampionshipSeries(semifinalSeries, newState.teams);

          if (championshipSeriesData) {
            // Generate championship games (mid-June)
            const championshipStartDate = new Date(newState.currentYear, 5, 15);
            const championshipGames = generateSeriesGames(championshipSeriesData, championshipStartDate.toISOString().split('T')[0]);

            // Create new games array with championship games
            const updatedGames = [...newState.games];
            championshipGames.forEach((game) => {
              if (!updatedGames.some((g) => g.id === game.id)) {
                updatedGames.push(game);
              }
            });

            newState = {
              ...newState,
              games: updatedGames,
              playoffSeries: [...newState.playoffSeries, championshipSeriesData]
            };
          }
          continue;
        }

        // Get the next available series to simulate
        const nextSeries = getNextAvailableSeries(newState.playoffSeries, newState.games);

        if (!nextSeries) {
          // No incomplete series found - all playoffs complete
          continueSimulating = false;
          break;
        }

        // Get the next game in this series
        const nextGame = getNextSeriesGame(nextSeries.id, newState.games);

        if (!nextGame || nextGame.status === 'Final') {
          // No more games in this series, loop will check for next series
          continue;
        }

        // Simulate the game inline (copy logic from simulateNextGame)
        // Create deep copies of the arrays
        const newGames = newState.games.map(g => ({ ...g }));
        const newPlayoffSeries = newState.playoffSeries.map(s => ({ ...s }));
        const tempState = { ...newState, games: newGames, playoffSeries: newPlayoffSeries };

        const series = tempState.playoffSeries.find((s) => s.id === nextSeries.id);

        if (!series) {
          continueSimulating = false;
          break;
        }

        const gameToSimulate = tempState.games.find((g) => g.id === nextGame.id);

        if (!gameToSimulate || gameToSimulate.status === 'Final') {
          continue;
        }

        const homeTeam = tempState.teams.find((t) => t.id === gameToSimulate.homeTeamId);
        const awayTeam = tempState.teams.find((t) => t.id === gameToSimulate.awayTeamId);

        if (homeTeam && awayTeam) {
          // Update the current game date to the playoff game's date
          tempState.gameDate = gameToSimulate.date;

          // Simulate the current game
          simulatePlayoffGame(gameToSimulate, homeTeam, awayTeam, series);

          // Check for game-based achievements
          const newlyUnlockedAchievements = checkGameAchievements(gameToSimulate, tempState.achievements, gameToSimulate.date);
          if (newlyUnlockedAchievements.length > 0) {
            newlyUnlockedAchievements.forEach((unlockedAchievement) => {
              const achievementIndex = tempState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
              if (achievementIndex !== -1) {
                tempState.achievements[achievementIndex] = unlockedAchievement;
                tempState.feedPosts.push(createAchievementPost(unlockedAchievement, gameToSimulate.date));
              }
            });
          }

          tempState.feedPosts.push(createGameResultPost(gameToSimulate, homeTeam, awayTeam, gameToSimulate.date));

          // Check for injuries in playoff game
          const allPlayers = [...homeTeam.activePlayers, ...awayTeam.activePlayers];
          const injuries = checkForInjuries(allPlayers);
          injuries.forEach((injury) => {
            const player = allPlayers.find((p) => p.id === injury.playerId);
            if (player) {
              applyInjury(player, injury.days, injury.description);
              const team = player.teamId === homeTeam.id ? homeTeam : awayTeam;
              tempState.injuries.push({
                playerId: injury.playerId,
                daysRemaining: injury.days,
                description: injury.description,
              });
              tempState.feedPosts.push(createInjuryPost(player, team, injury.description, gameToSimulate.date));

              // Automatically move injured player to IR
              const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
              if (activePlayerIndex !== -1) {
                // Move to IR
                player.state = 'IR';
                team.irPlayers.push(player);
                team.activePlayers.splice(activePlayerIndex, 1);
                tempState.feedPosts.push(createIRPost(player, team, gameToSimulate.date));

                // Find best replacement (bench or free agent) for the injured player's position
                const replacement = findBestReplacement(team, tempState.freeAgents, player.position);

                if (replacement.replacementPlayer) {
                  const replacementPlayer = replacement.replacementPlayer;
                  const oldPosition = replacement.oldPosition;

                  if (replacement.isBenchPlayer) {
                    // Use bench player as replacement
                    if (replacement.needsPositionSwitch && oldPosition) {
                      switchPlayerPosition(replacementPlayer, player.position);
                      tempState.feedPosts.push(
                        createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, gameToSimulate.date)
                      );
                    }
                    replacementPlayer.state = 'Active';
                    team.activePlayers.push(replacementPlayer);
                    team.benchPlayer = undefined;

                    // Sign a new bench player from free agents
                    const newBenchReplacement = findBestReplacement(team, tempState.freeAgents, replacementPlayer.position);
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
                      const newBenchIndex = tempState.freeAgents.findIndex(
                        (fa) => fa.id === newBenchPlayer.id
                      );
                      tempState.freeAgents.splice(newBenchIndex, 1);

                      tempState.feedPosts.push(createSigningPost(newBenchPlayer, team, gameToSimulate.date));
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
                    const replacementIndex = tempState.freeAgents.findIndex(
                      (fa) => fa.id === replacementPlayer.id
                    );
                    tempState.freeAgents.splice(replacementIndex, 1);

                    tempState.feedPosts.push(createSigningPost(replacementPlayer, team, gameToSimulate.date));
                  }
                }
              }
            }
          });

          // Check for suspensions in playoff game
          const suspensions = checkForSuspensions(allPlayers);
          suspensions.forEach((suspension) => {
            const player = allPlayers.find((p) => p.id === suspension.playerId);
            if (player) {
              applySuspension(player, suspension.games, suspension.reason);
              const team = player.teamId === homeTeam.id ? homeTeam : awayTeam;
              tempState.suspensions.push({
                playerId: suspension.playerId,
                gamesRemaining: suspension.games,
                reason: suspension.reason,
              });
              tempState.feedPosts.push(createSuspensionPost(player, team, suspension.reason, suspension.games, gameToSimulate.date));

              // Automatically move suspended player to suspension list
              const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
              if (activePlayerIndex !== -1) {
                // Move to suspension list
                player.state = 'Suspended';
                team.suspendedPlayers.push(player);
                team.activePlayers.splice(activePlayerIndex, 1);
                tempState.feedPosts.push(createSuspensionListPost(player, team, gameToSimulate.date));

                // Find best replacement (bench or free agent) for the suspended player's position
                const replacement = findBestReplacement(team, tempState.freeAgents, player.position);

                if (replacement.replacementPlayer) {
                  const replacementPlayer = replacement.replacementPlayer;
                  const oldPosition = replacement.oldPosition;

                  if (replacement.isBenchPlayer) {
                    // Use bench player as replacement
                    if (replacement.needsPositionSwitch && oldPosition) {
                      switchPlayerPosition(replacementPlayer, player.position);
                      tempState.feedPosts.push(
                        createPositionSwitchPost(replacementPlayer, team, oldPosition, player.position, gameToSimulate.date)
                      );
                    }
                    replacementPlayer.state = 'Active';
                    team.activePlayers.push(replacementPlayer);
                    team.benchPlayer = undefined;

                    // Sign a new bench player from free agents
                    const newBenchReplacement = findBestReplacement(team, tempState.freeAgents, replacementPlayer.position);
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
                      const newBenchIndex = tempState.freeAgents.findIndex(
                        (fa) => fa.id === newBenchPlayer.id
                      );
                      tempState.freeAgents.splice(newBenchIndex, 1);

                      tempState.feedPosts.push(createSigningPost(newBenchPlayer, team, gameToSimulate.date));
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
                    const replacementIndex = tempState.freeAgents.findIndex(
                      (fa) => fa.id === replacementPlayer.id
                    );
                    tempState.freeAgents.splice(replacementIndex, 1);

                    tempState.feedPosts.push(createSigningPost(replacementPlayer, team, gameToSimulate.date));
                  }
                }
              }
            }
          });

          // Process injury recovery - decrement days for all injured players
          tempState.teams.forEach((team) => {
            team.irPlayers.forEach((player) => {
              if (player.injuryDaysRemaining && player.injuryDaysRemaining > 0) {
                player.injuryDaysRemaining--;

                // Update the injury tracking array as well
                const injury = tempState.injuries.find((inj) => inj.playerId === player.id);
                if (injury) {
                  injury.daysRemaining = player.injuryDaysRemaining;
                }
              }
            });
          });

          // Remove healed injuries from the injuries array
          tempState.injuries = tempState.injuries.filter((injury) => injury.daysRemaining > 0);

          // Process suspension countdown - decrement games for all suspended players
          tempState.teams.forEach((team) => {
            team.suspendedPlayers.forEach((player) => {
              if (player.suspensionGamesRemaining && player.suspensionGamesRemaining > 0) {
                player.suspensionGamesRemaining--;

                // Update the suspension tracking array as well
                const suspension = tempState.suspensions.find((susp) => susp.playerId === player.id);
                if (suspension) {
                  suspension.gamesRemaining = player.suspensionGamesRemaining;
                }
              }
            });
          });

          // Remove completed suspensions from the suspensions array
          tempState.suspensions = tempState.suspensions.filter((suspension) => suspension.gamesRemaining > 0);

          // Process automatic suspension returns for players with completed suspensions
          tempState.teams.forEach((team) => {
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
              const result = processAllTeamSuspensionReturns([team], tempState.freeAgents);

              if (result.returns > 0) {
                // Determine what happened and create appropriate feed post
                const newActivePlayer = team.activePlayers.find((p) => p.name === playerName);
                const newBenchPlayer = team.benchPlayer?.name === playerName ? team.benchPlayer : null;
                const nowFreeAgent = tempState.freeAgents.find((p) => p.name === playerName);

                if (newActivePlayer) {
                  // Player returned to active roster
                  tempState.feedPosts.push(createSuspensionReturnToActivePost(newActivePlayer, team, team.benchPlayer!, gameToSimulate.date));
                  // Check if a player was dropped
                  const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                  if (droppedPlayer) {
                    tempState.feedPosts.push(createReleasePost(droppedPlayer, team, gameToSimulate.date));
                  }
                } else if (newBenchPlayer) {
                  // Player returned to bench
                  tempState.feedPosts.push(createSuspensionReturnToBenchPost(newBenchPlayer, team, gameToSimulate.date));
                  // Check if a player was dropped
                  const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                  if (droppedPlayer) {
                    tempState.feedPosts.push(createReleasePost(droppedPlayer, team, gameToSimulate.date));
                  }
                } else if (nowFreeAgent) {
                  // Player was released to free agency
                  tempState.feedPosts.push(createReleasePost(nowFreeAgent, team, gameToSimulate.date));
                }
              } else {
                hasCompletedSuspensions = false;
              }
            }
          });

          // Process automatic IR returns for healed players
          tempState.teams.forEach((team) => {
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
              const result = processAllTeamIRReturns([team], tempState.freeAgents);

              if (result.returns > 0) {
                // Determine what happened and create appropriate feed post
                const newActivePlayer = team.activePlayers.find((p) => p.name === playerName);
                const newBenchPlayer = team.benchPlayer?.name === playerName ? team.benchPlayer : null;
                const nowFreeAgent = tempState.freeAgents.find((p) => p.name === playerName);

                if (newActivePlayer) {
                  // Player returned to active roster
                  tempState.feedPosts.push(createIRReturnToActivePost(newActivePlayer, team, team.benchPlayer!, gameToSimulate.date));
                  // Check if a player was dropped
                  const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                  if (droppedPlayer) {
                    tempState.feedPosts.push(createReleasePost(droppedPlayer, team, gameToSimulate.date));
                  }
                } else if (newBenchPlayer) {
                  // Player returned to bench
                  tempState.feedPosts.push(createIRReturnToBenchPost(newBenchPlayer, team, gameToSimulate.date));
                  // Check if a player was dropped
                  const droppedPlayer = result.droppedPlayers.find((p) => p.name !== playerName);
                  if (droppedPlayer) {
                    tempState.feedPosts.push(createReleasePost(droppedPlayer, team, gameToSimulate.date));
                  }
                } else if (nowFreeAgent) {
                  // Player was released to free agency
                  tempState.feedPosts.push(createReleasePost(nowFreeAgent, team, gameToSimulate.date));
                }
              } else {
                hasHealedPlayers = false;
              }
            }
          });

          // Generate the next game if series is not complete
          if (!isSeriesComplete(series)) {
            const seriesGames = tempState.games.filter((g) => g.seriesId === nextSeries.id);
            const startDate = seriesGames.length > 0 ? seriesGames[0].date : `${tempState.currentYear}-06-01`;
            const newGame = generateNextSeriesGame(series, startDate, tempState.games);
            if (newGame && !tempState.games.some((g) => g.id === newGame.id)) {
              tempState.games.push(newGame);
            }
          } else {
            // Series just completed - if it's the championship, add championship post
            if (series.id === 'championship') {
              const champion = getChampion(series, tempState.teams);
              if (champion) {
                tempState.feedPosts.push(createChampionshipPost(champion, tempState.currentYear, tempState.gameDate));
              }
            }
          }

          // Update newState with all the changes from tempState
          newState = tempState;
        } else {
          continueSimulating = false;
        }
      }

      return newState;
    });
  };

  const advanceToNextSeason = () => {
    setState((prev) => {
      const newState = { ...prev };
      const championshipSeries = newState.playoffSeries.find((s) => s.id === 'championship');
      const champion = championshipSeries ? getChampion(championshipSeries, newState.teams) : null;

      if (!champion) {
        alert('Championship must be completed first!');
        return prev;
      }

      // Find the actual championship game date (the final game that determined the champion)
      const championshipGames = newState.games.filter((g) => g.seriesId === 'championship' && g.status === 'Final');
      const finalChampionshipGame = championshipGames[championshipGames.length - 1]; // Get the last completed championship game
      const championshipDate = finalChampionshipGame?.date || newState.gameDate;

      // Get playoff team names (all teams in playoff series)
      const playoffTeamIds = new Set<string>();
      newState.playoffSeries.forEach((series) => {
        playoffTeamIds.add(series.team1Id);
        playoffTeamIds.add(series.team2Id);
      });
      const playoffTeamNames = newState.teams
        .filter((t) => playoffTeamIds.has(t.id))
        .map((t) => t.name);

      // Get finalist team names (teams in championship series)
      const finalistsTeamNames = championshipSeries
        ? newState.teams
            .filter((t) => t.id === championshipSeries.team1Id || t.id === championshipSeries.team2Id)
            .map((t) => t.name)
        : [];

      // Advance season
      const result = advanceSeason(
        newState.teams,
        newState.freeAgents,
        newState.retiredPlayers,
        newState.currentYear,
        champion.name,
        newState.seasonHistory,
        playoffTeamNames,
        finalistsTeamNames,
        newState.hallOfFame
      );

      newState.currentYear = result.newYear;
      newState.gameDate = result.newGameDate;

      // Process injury recovery for the time between playoffs (June) and new season (January 1)
      // Calculate days between championship date and new season start
      const championshipDateObj = new Date(championshipDate);
      const newSeasonDateObj = new Date(result.newGameDate);
      const daysBetween = Math.floor((newSeasonDateObj.getTime() - championshipDateObj.getTime()) / (1000 * 60 * 60 * 24));

      // Heal all injuries by the number of days that passed
      newState.teams.forEach((team) => {
        team.irPlayers.forEach((player) => {
          if (player.injuryDaysRemaining && player.injuryDaysRemaining > 0) {
            player.injuryDaysRemaining = Math.max(0, player.injuryDaysRemaining - daysBetween);

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

      // Create retirement posts for all retiring players
      result.retiringPlayers.forEach((player) => {
        // Only create retirement post if player has more than 30 career games played
        if (player.careerStats.gamesPlayed > 30) {
          newState.feedPosts.push(createRetirementPost(player, newState.gameDate));
        }

        // Check if Jar of Peanut Butter retired
        if (player.name === 'Jar of Peanut Butter') {
          const peanutButterAchievement = newState.achievements.find(
            (achievement) => achievement.id === 'peanut-butter-retirement'
          );
          if (peanutButterAchievement && !peanutButterAchievement.isUnlocked) {
            peanutButterAchievement.isUnlocked = true;
            peanutButterAchievement.unlockedDate = newState.gameDate;
            newState.feedPosts.push(createAchievementPost(peanutButterAchievement, newState.gameDate));
          }
        }
      });

      // Create new free agent posts for all new players entering the league
      // Check if post already exists to prevent duplicates in React Strict Mode
      result.newFreeAgents.forEach((player) => {
        const postAlreadyExists = newState.feedPosts.some(
          (post) => post.type === 'Other' && post.content.includes(player.name) && post.content.includes('free agent')
        );
        if (!postAlreadyExists) {
          newState.feedPosts.push(createNewFreeAgentPost(player, newState.gameDate));
        }
      });

      // Create Hall of Fame post (induction or no induction)
      // Only create posts after 2040 when Hall of Fame is active
      if (newState.currentYear > 2040) {
        if (result.newInductee) {
          const inductionPostAlreadyExists = newState.feedPosts.some(
            (post) => post.type === 'Hall Of Fame' && post.content.includes(result.newInductee!.playerName)
          );
          if (!inductionPostAlreadyExists) {
            newState.feedPosts.push(createHallOfFameInductionPost(result.newInductee, newState.gameDate));
          }
        } else {
          // No inductee - check if we already posted about no induction for this year
          const noInductionPostAlreadyExists = newState.feedPosts.some(
            (post) => post.type === 'Hall Of Fame' && (
              post.content.includes(`Class of ${newState.currentYear}`) ||
              post.content.includes(`in ${newState.currentYear}`)
            ) && (
              post.content.includes('No inductees') ||
              post.content.includes('No new Hall of Famers') ||
              post.content.includes('will not be adding any new members') ||
              post.content.includes('will remain empty')
            )
          );
          if (!noInductionPostAlreadyExists) {
            newState.feedPosts.push(createHallOfFameNoInductionPost(newState.currentYear, newState.gameDate));
          }
        }
      }

      // Check for Hall of Fame achievements
      // Check if Hall of Fame just opened (year > 2039)
      if (newState.currentYear > 2039) {
        const hallOfFameAchievements = checkHallOfFameAchievements(
          newState.hallOfFame.length,
          newState.achievements,
          newState.gameDate
        );
        hallOfFameAchievements.forEach((achievement) => {
          const existingAchievement = newState.achievements.find((a) => a.id === achievement.id);
          if (existingAchievement) {
            existingAchievement.isUnlocked = true;
            existingAchievement.unlockedDate = achievement.unlockedDate;
            newState.feedPosts.push(createAchievementPost(achievement, newState.gameDate));
          }
        });
      }

      // Check for new player achievements (e.g., Chauncey joining the league)
      const newPlayerAchievements = checkNewPlayerAchievements(
        result.newFreeAgents,
        newState.achievements,
        newState.gameDate
      );
      newPlayerAchievements.forEach((achievement) => {
        const existingAchievement = newState.achievements.find((a) => a.id === achievement.id);
        if (existingAchievement) {
          existingAchievement.isUnlocked = true;
          existingAchievement.unlockedDate = achievement.unlockedDate;
          newState.feedPosts.push(createAchievementPost(achievement, newState.gameDate));
        }
      });

      // Unlock "Complete One Season" achievement if not already unlocked
      const completeSeasonAchievement = newState.achievements.find(
        (achievement) => achievement.id === 'complete-one-season'
      );
      if (completeSeasonAchievement && !completeSeasonAchievement.isUnlocked) {
        completeSeasonAchievement.isUnlocked = true;
        completeSeasonAchievement.unlockedDate = championshipDate;

        // Post achievement to GoogusNow with gold border
        newState.feedPosts.push(createAchievementPost(completeSeasonAchievement, championshipDate));
      }

      // Check for season milestone achievements (10, 50, 100 seasons)
      const completedSeasons = newState.seasonHistory.length;
      const milestoneAchievements = [
        { count: 10, id: 'complete-10-seasons' },
        { count: 50, id: 'complete-50-seasons' },
        { count: 100, id: 'complete-100-seasons' },
      ];

      milestoneAchievements.forEach((milestone) => {
        if (completedSeasons === milestone.count) {
          const achievement = newState.achievements.find((a) => a.id === milestone.id);
          if (achievement && !achievement.isUnlocked) {
            achievement.isUnlocked = true;
            achievement.unlockedDate = championshipDate;
            newState.feedPosts.push(createAchievementPost(achievement, championshipDate));
          }
        }
      });

      // Check for consecutive championship achievement
      const consecutiveChampionshipAchievements = checkConsecutiveChampionshipAchievement(
        newState.seasonHistory,
        newState.achievements,
        championshipDate
      );
      if (consecutiveChampionshipAchievements.length > 0) {
        consecutiveChampionshipAchievements.forEach((unlockedAchievement) => {
          const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
          if (achievementIndex !== -1) {
            newState.achievements[achievementIndex] = unlockedAchievement;
            newState.feedPosts.push(createAchievementPost(unlockedAchievement, championshipDate));
          }
        });
      }

      // Generate new schedule
      newState.games = generateSchedule(newState.teams, newState.currentYear);
      newState.isSeasonComplete = false;
      newState.playoffsStarted = false;
      newState.playoffSeries = [];

      return newState;
    });
  };

  const semifinalSeries = state.playoffSeries.filter((s) => s.round === 'semifinal');
  const championshipSeries = state.playoffSeries.find((s) => s.id === 'championship');

  const allSemifinalsComplete = semifinalSeries.length === 2 && semifinalSeries.every(isSeriesComplete);

  // Determine which series can be simulated based on date order
  const nextAvailableSeries = getNextAvailableSeries(state.playoffSeries, state.games);

  return (
    <div className="playoffs">
      <h2>Playoffs (Best of 3)</h2>

      {!state.isSeasonComplete && (
        <p>Complete the regular season before starting playoffs.</p>
      )}

      {state.isSeasonComplete && !state.playoffsStarted && (
        <button onClick={startPlayoffs}>Start Playoffs</button>
      )}

      {state.playoffsStarted && !championshipSeries?.winnerId && (
        <button onClick={simulateEntirePlayoffs}>Simulate Entire Playoffs</button>
      )}

      {state.playoffsStarted && (
        <div className="playoff-bracket">
          <div className="round">
            <h3>Semifinals</h3>
            {semifinalSeries.map((series) => {
              const team1 = state.teams.find((t) => t.id === series.team1Id);
              const team2 = state.teams.find((t) => t.id === series.team2Id);
              const seriesGames = state.games.filter((g) => g.seriesId === series.id);
              const nextGame = getNextSeriesGame(series.id, state.games);
              const isAvailable = nextAvailableSeries?.id === series.id;

              return (
                <div key={series.id} className="playoff-series">
                  <div className="series-header">
                    <strong>{team1?.name} vs {team2?.name}</strong>
                    <div className="series-score">
                      Series: {series.team1Wins} - {series.team2Wins}
                    </div>
                  </div>

                  <div className="series-games">
                    {seriesGames.map((game) => {
                      const homeTeam = state.teams.find((t) => t.id === game.homeTeamId);
                      const awayTeam = state.teams.find((t) => t.id === game.awayTeamId);

                      return (
                        <div key={game.id} className="playoff-game">
                          <div className="game-label">Game {game.gameNumber}</div>
                          <div className="matchup">
                            {awayTeam?.name} @ {homeTeam?.name}
                          </div>
                          {game.status === 'Final' && (
                            <div className="result">
                              {awayTeam?.name} {game.awayScore} - {game.homeScore} {homeTeam?.name}
                              {game.overtime && ' (OT)'}
                            </div>
                          )}
                          <div className="status">{game.status}</div>
                        </div>
                      );
                    })}
                  </div>

                  {!isSeriesComplete(series) && nextGame && isAvailable && (
                    <button onClick={() => simulateNextGame(series.id)}>
                      Simulate Game {nextGame.gameNumber}
                    </button>
                  )}

                  {!isSeriesComplete(series) && !isAvailable && (
                    <p className="series-locked">Series locked until previous series completes</p>
                  )}

                  {isSeriesComplete(series) && (
                    <div className="series-winner">
                      Winner: {state.teams.find((t) => t.id === series.winnerId)?.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {allSemifinalsComplete && !championshipSeries && (
            <div className="championship-start">
              <button onClick={startChampionship}>Start Championship Series</button>
            </div>
          )}

          {championshipSeries && (
            <div className="round">
              <h3>Championship</h3>
              <div className="playoff-series">
                {(() => {
                  const team1 = state.teams.find((t) => t.id === championshipSeries.team1Id);
                  const team2 = state.teams.find((t) => t.id === championshipSeries.team2Id);
                  const seriesGames = state.games.filter((g) => g.seriesId === championshipSeries.id);
                  const nextGame = getNextSeriesGame(championshipSeries.id, state.games);

                  return (
                    <>
                      <div className="series-header">
                        <strong>{team1?.name} vs {team2?.name}</strong>
                        <div className="series-score">
                          Series: {championshipSeries.team1Wins} - {championshipSeries.team2Wins}
                        </div>
                      </div>

                      <div className="series-games">
                        {seriesGames.map((game) => {
                          const homeTeam = state.teams.find((t) => t.id === game.homeTeamId);
                          const awayTeam = state.teams.find((t) => t.id === game.awayTeamId);

                          return (
                            <div key={game.id} className="playoff-game">
                              <div className="game-label">Game {game.gameNumber}</div>
                              <div className="matchup">
                                {awayTeam?.name} @ {homeTeam?.name}
                              </div>
                              {game.status === 'Final' && (
                                <div className="result">
                                  {awayTeam?.name} {game.awayScore} - {game.homeScore} {homeTeam?.name}
                                  {game.overtime && ' (OT)'}
                                </div>
                              )}
                              <div className="status">{game.status}</div>
                            </div>
                          );
                        })}
                      </div>

                      {!isSeriesComplete(championshipSeries) && nextGame && (
                        <button onClick={() => simulateNextGame(championshipSeries.id)}>
                          Simulate Game {nextGame.gameNumber}
                        </button>
                      )}

                      {isSeriesComplete(championshipSeries) && (
                        <div className="series-winner championship-winner">
                          Champion: {state.teams.find((t) => t.id === championshipSeries.winnerId)?.name}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {championshipSeries && isSeriesComplete(championshipSeries) && (
            <div className="advance-season">
              <button onClick={advanceToNextSeason}>Advance to Next Season</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
