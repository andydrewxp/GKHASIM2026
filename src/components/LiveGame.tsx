import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Game, SimulationSpeed, Player } from '../types';
import {
  determineWinner,
  generateGameEvents,
  checkForInjuries,
  updatePlayerStats,
} from '../engine/gameSimulator';
import { createGameResultPost, createInjuryPost, createIRPost, createSigningPost, createIRReturnToActivePost, createIRReturnToBenchPost, createReleasePost, createPositionSwitchPost, createAchievementPost } from '../engine/eventFeed';
import { applyInjury, processAllTeamIRReturns, validateAndFixAllTeamRosters } from '../engine/rosterManager';
import { isSeasonComplete } from '../engine/scheduleGenerator';
import { checkGameAchievements, checkSeasonEndAchievements, checkPlayerStatAchievements } from '../engine/achievementManager';

interface LiveGameProps {
  gameId: string;
  onComplete: () => void;
}

export const LiveGame: React.FC<LiveGameProps> = ({ gameId, onComplete }) => {
  const { state, setState } = useAppContext();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>('slow');
  const [game, setGame] = useState<Game | null>(null);
  const hasCompletedGame = useRef(false);

  // Initialize game
  useEffect(() => {
    const foundGame = state.games.find((g) => g.id === gameId);
    if (!foundGame) return;

    const homeTeam = state.teams.find((t) => t.id === foundGame.homeTeamId);
    const awayTeam = state.teams.find((t) => t.id === foundGame.awayTeamId);

    if (!homeTeam || !awayTeam) return;

    // Generate game result
    const result = determineWinner(homeTeam, awayTeam);

    // Create game object with overtime flag set before generating events
    const gameWithOT = {
      ...foundGame,
      overtime: result.overtime,
    };

    const events = generateGameEvents(
      gameWithOT,
      homeTeam,
      awayTeam,
      result.homeScore,
      result.awayScore
    );

    const initializedGame = {
      ...gameWithOT,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      events,
      status: 'In Progress' as const,
    };

    setGame(initializedGame);
  }, [gameId]);

  // Animate events
  useEffect(() => {
    if (!game || !game.events || isPaused || currentEventIndex >= game.events.length) {
      return;
    }

    const delay = speed === 'slow' ? 1750 : 50;
    const timer = setTimeout(() => {
      setCurrentEventIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentEventIndex, isPaused, speed, game]);

  // Complete game when all events shown
  useEffect(() => {
    if (!game || !game.events) return;

    // Prevent running game completion logic more than once
    if (hasCompletedGame.current) return;

    if (currentEventIndex >= game.events.length) {
      hasCompletedGame.current = true;
      // Game complete - update state
      setState((prev) => {
        const newState = { ...prev };
        const stateGame = newState.games.find((g) => g.id === gameId);
        if (!stateGame) return prev;
        // Check if game has already been marked as Final - prevents double execution
        if (stateGame.status === 'Final') return prev;

        stateGame.status = 'Final';
        stateGame.homeScore = game.homeScore;
        stateGame.awayScore = game.awayScore;
        stateGame.overtime = game.overtime;
        stateGame.events = game.events;

        const homeTeam = newState.teams.find((t) => t.id === stateGame.homeTeamId);
        const awayTeam = newState.teams.find((t) => t.id === stateGame.awayTeamId);

        if (homeTeam && awayTeam) {
          // Update stats
          const allPlayers = [...homeTeam.activePlayers, ...awayTeam.activePlayers];
          updatePlayerStats(allPlayers, game.events!);

          // Check for player stat achievements after stats are updated
          const allPlayersInLeague = [
            ...newState.teams.flatMap((team) => [...team.activePlayers, team.benchPlayer, ...team.irPlayers, ...team.suspendedPlayers].filter((p): p is Player => p !== undefined)),
            ...newState.freeAgents,
          ];
          const playerStatAchievements = checkPlayerStatAchievements(allPlayersInLeague, newState.achievements, stateGame.date);
          if (playerStatAchievements.length > 0) {
            playerStatAchievements.forEach((unlockedAchievement) => {
              const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
              if (achievementIndex !== -1) {
                newState.achievements[achievementIndex] = unlockedAchievement;
                newState.feedPosts.push(createAchievementPost(unlockedAchievement, stateGame.date));
              }
            });
          }

          // Update team records
          const homeWon = game.homeScore! > game.awayScore!;
          // Increment games played for both teams
          homeTeam.gamesPlayed++;
          awayTeam.gamesPlayed++;

          // Update goals for/against
          homeTeam.goalsFor += game.homeScore!;
          homeTeam.goalsAgainst += game.awayScore!;
          awayTeam.goalsFor += game.awayScore!;
          awayTeam.goalsAgainst += game.homeScore!;

          if (homeWon) {
            homeTeam.wins++;
            homeTeam.points += 2;
            if (game.overtime) {
              awayTeam.overtimeLosses++;
              awayTeam.points += 1;
            } else {
              awayTeam.losses++;
            }
          } else {
            awayTeam.wins++;
            awayTeam.points += 2;
            if (game.overtime) {
              homeTeam.overtimeLosses++;
              homeTeam.points += 1;
            } else {
              homeTeam.losses++;
            }
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
              newState.feedPosts.push(createInjuryPost(player, team, injury.description, stateGame.date));

              // Automatically move injured player to IR
              const activePlayerIndex = team.activePlayers.findIndex((p) => p.id === player.id);
              if (activePlayerIndex !== -1) {
                // Move to IR
                player.state = 'IR';
                team.irPlayers.push(player);
                team.activePlayers.splice(activePlayerIndex, 1);
                newState.feedPosts.push(createIRPost(player, team, stateGame.date));

                // Find a replacement free agent with the same position
                const replacementFreeAgent = newState.freeAgents.find(
                  (fa) => fa.position === player.position
                );

                if (replacementFreeAgent) {
                  // Sign the replacement
                  replacementFreeAgent.state = 'Active';
                  replacementFreeAgent.teamId = team.id;
                  team.activePlayers.push(replacementFreeAgent);

                  // Remove from free agents
                  const replacementIndex = newState.freeAgents.findIndex(
                    (fa) => fa.id === replacementFreeAgent.id
                  );
                  newState.freeAgents.splice(replacementIndex, 1);

                  newState.feedPosts.push(createSigningPost(replacementFreeAgent, team, stateGame.date));
                }
              }
            }
          });

          // Check for game-based achievements
          const newlyUnlockedAchievements = checkGameAchievements(stateGame, newState.achievements, stateGame.date);
          if (newlyUnlockedAchievements.length > 0) {
            newlyUnlockedAchievements.forEach((unlockedAchievement) => {
              const achievementIndex = newState.achievements.findIndex((a) => a.id === unlockedAchievement.id);
              if (achievementIndex !== -1) {
                newState.achievements[achievementIndex] = unlockedAchievement;
                newState.feedPosts.push(createAchievementPost(unlockedAchievement, stateGame.date));
              }
            });
          }

          // Add game result post
          newState.feedPosts.push(createGameResultPost(stateGame, homeTeam, awayTeam, stateGame.date));

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
        }

        return newState;
      });
    }
  }, [currentEventIndex, game]);

  if (!game || !game.events) {
    return <div>Loading game...</div>;
  }

  const homeTeam = state.teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = state.teams.find((t) => t.id === game.awayTeamId);

  if (!homeTeam || !awayTeam) {
    return <div>Error loading teams</div>;
  }

  const visibleEvents = game.events.slice(0, currentEventIndex);
  const isComplete = currentEventIndex >= game.events.length;

  // Calculate running score based on visible goal events
  let currentHomeScore = 0;
  let currentAwayScore = 0;
  let currentMinute = 0;
  visibleEvents.forEach((event) => {
    if (event.type === 'Goal') {
      if (event.teamId === game.homeTeamId) {
        currentHomeScore++;
      } else if (event.teamId === game.awayTeamId) {
        currentAwayScore++;
      }
    }
    // Track the latest minute from visible events
    if (event.minute > currentMinute) {
      currentMinute = event.minute;
    }
  });

  // Only show OT if the game is in overtime AND we've reached the OT period (minute > 60)
  const showOT = game.overtime && currentMinute > 60;

  // Calculate final stats from all game events
  const playerStats: { [playerId: string]: { name: string; teamId: string; goals: number; assists: number; saves: number; hits: number; position: string } } = {};

  if (isComplete && game.events) {
    // Initialize stats for all players who participated (including those now on IR due to injury during this game)
    [...homeTeam.activePlayers, ...homeTeam.irPlayers, ...awayTeam.activePlayers, ...awayTeam.irPlayers].forEach((player) => {
      playerStats[player.id] = {
        name: player.name,
        teamId: player.teamId!,
        goals: 0,
        assists: 0,
        saves: 0,
        hits: 0,
        position: player.position,
      };
    });

    // Count stats from events
    game.events.forEach((event) => {
      if (event.playerId && playerStats[event.playerId]) {
        if (event.type === 'Goal') {
          playerStats[event.playerId].goals++;

          // Award assists to random teammates (70% chance per goal)
          const allHomePlayers = [...homeTeam.activePlayers, ...homeTeam.irPlayers];
          const allAwayPlayers = [...awayTeam.activePlayers, ...awayTeam.irPlayers];
          const scoringTeam = allHomePlayers.find(p => p.id === event.playerId) ? homeTeam : awayTeam;
          const allTeamPlayers = scoringTeam.id === homeTeam.id ? allHomePlayers : allAwayPlayers;
          const teammates = allTeamPlayers.filter(p => p.id !== event.playerId);

          if (Math.random() < 0.7 && teammates.length > 0) {
            const assistPlayer = teammates[Math.floor(Math.random() * teammates.length)];
            if (playerStats[assistPlayer.id]) {
              playerStats[assistPlayer.id].assists++;
            }
          }
        } else if (event.type === 'Save') {
          playerStats[event.playerId].saves++;
        } else if (event.type === 'Hit') {
          playerStats[event.playerId].hits++;
        }
      }
    });
  }

  return (
    <div className="live-game">
      {!isComplete && (
        <>
          <h2>Live Game</h2>
          <div className="game-header">
            <div className="team">
              <h3>{awayTeam.name}</h3>
              <div className="score">{currentAwayScore}</div>
            </div>
            <div className="vs">@</div>
            <div className="team">
              <h3>{homeTeam.name}</h3>
              <div className="score">{currentHomeScore}</div>
            </div>
          </div>
          <div className="game-info">
            <span>{game.venue}</span>
            {showOT && <span className="overtime">OT</span>}
          </div>

          <div className="game-controls">
            <button onClick={() => setIsPaused(!isPaused)} disabled={isComplete}>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <div className="speed-controls">
              <button
                className={speed === 'slow' ? 'active' : ''}
                onClick={() => setSpeed('slow')}
              >
                Slow
              </button>
              <button
                className={speed === 'fast' ? 'active' : ''}
                onClick={() => setSpeed('fast')}
              >
                Fast
              </button>
            </div>
          </div>
        </>
      )}

      {isComplete && (
        <div className="game-complete">
          <button onClick={onComplete} className="return-button">
            Return to Main Menu
          </button>

          <h3>FINAL</h3>
          <div className="final-score-display">
            <div className="final-team-score">
              <div className="final-team-name">{awayTeam.name}</div>
              <div className="final-score-number">{game.awayScore}</div>
            </div>
            <div className="final-divider">-</div>
            <div className="final-team-score">
              <div className="final-team-name">{homeTeam.name}</div>
              <div className="final-score-number">{game.homeScore}</div>
            </div>
          </div>
          {game.overtime && <div className="overtime-badge">OVERTIME</div>}

          <div className="final-stats">
            <h4>Game Statistics</h4>

            <div className="team-stats">
              <h5>{homeTeam.name}</h5>
              <div className="stats-table">
                <div className="stats-header">
                  <span className="header-name">Player</span>
                  <span className="header-pos">Pos</span>
                  <span className="header-stat">Goals</span>
                  <span className="header-stat">Assists</span>
                  <span className="header-stat">Saves</span>
                  <span className="header-stat">Hits</span>
                </div>
                {Object.values(playerStats)
                  .filter((stats) => stats.teamId === homeTeam.id)
                  .map((stats) => (
                    <div key={stats.name} className="player-stat-row">
                      <span className="player-name">{stats.name}</span>
                      <span className="player-position">{stats.position}</span>
                      <span className="stat-value">{stats.goals > 0 ? stats.goals : '-'}</span>
                      <span className="stat-value">{stats.assists > 0 ? stats.assists : '-'}</span>
                      <span className="stat-value">{stats.saves > 0 ? stats.saves : '-'}</span>
                      <span className="stat-value">{stats.hits > 0 ? stats.hits : '-'}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="team-stats">
              <h5>{awayTeam.name}</h5>
              <div className="stats-table">
                <div className="stats-header">
                  <span className="header-name">Player</span>
                  <span className="header-pos">Pos</span>
                  <span className="header-stat">Goals</span>
                  <span className="header-stat">Assists</span>
                  <span className="header-stat">Saves</span>
                  <span className="header-stat">Hits</span>
                </div>
                {Object.values(playerStats)
                  .filter((stats) => stats.teamId === awayTeam.id)
                  .map((stats) => (
                    <div key={stats.name} className="player-stat-row">
                      <span className="player-name">{stats.name}</span>
                      <span className="player-position">{stats.position}</span>
                      <span className="stat-value">{stats.goals > 0 ? stats.goals : '-'}</span>
                      <span className="stat-value">{stats.assists > 0 ? stats.assists : '-'}</span>
                      <span className="stat-value">{stats.saves > 0 ? stats.saves : '-'}</span>
                      <span className="stat-value">{stats.hits > 0 ? stats.hits : '-'}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="event-list">
        {visibleEvents.slice().reverse().map((event, index) => (
          <div key={index} className={`event event-${event.type.toLowerCase().replace(' ', '-')}`}>
            <span className="event-time">Minute {event.minute}</span>
            <span className="event-description">{event.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
