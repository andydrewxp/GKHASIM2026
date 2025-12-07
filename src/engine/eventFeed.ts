import type { FeedPost, Game, Team, Player, Achievement, HallOfFameInductee } from '../types';
import { ANALYSTS, ACHIEVEMENT_ANALYST } from '../data/seedData';

// Generate unique post ID
let postIdCounter = 1;
const generatePostId = () => `post_${postIdCounter++}`;

// Get random analyst
const getRandomAnalyst = (): string => {
  return ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];
};

// Format player name with nickname if available
const formatPlayerName = (player: Player): string => {
  if (player.nickname) {
    const nameParts = player.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return `${firstName} "${player.nickname}" ${lastName}`;
  }
  return player.name;
};

// Generate timestamp from game date with random afternoon time
const generateTimestamp = (gameDate: string): number => {
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = gameDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Random hour between 12 PM and 5 PM (12-17)
  const hour = Math.floor(Math.random() * 6) + 12;
  // Random minute between 0 and 59
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

// Create game result post
export const createGameResultPost = (
  game: Game,
  homeTeam: Team,
  awayTeam: Team,
  gameDate: string
): FeedPost => {
  const analyst = getRandomAnalyst();
  const winner = game.homeScore! > game.awayScore! ? homeTeam : awayTeam;
  const loser = game.homeScore! > game.awayScore! ? awayTeam : homeTeam;

  const messages = [
    `${winner.name} defeats ${loser.name} ${game.homeScore}-${game.awayScore}${game.overtime ? ' in overtime' : ''}! What a game!`,
    `Final score: ${homeTeam.name} ${game.homeScore}, ${awayTeam.name} ${game.awayScore}${game.overtime ? ' (OT)' : ''}. ${winner.name} takes the W!`,
    `${winner.name} comes out on top against ${loser.name}, ${game.homeScore}-${game.awayScore}${game.overtime ? ' in OT' : ''}!`,
    `Game over at ${game.venue}! ${homeTeam.name} ${game.homeScore}, ${awayTeam.name} ${game.awayScore}. ${winner.name} wins!`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Game Result',
  };
};

// Create injury post
export const createInjuryPost = (player: Player, team: Team, description: string, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `Breaking: ${player.name} of the ${team.name} suffers ${description}. Day-to-day.`,
    `Injury update: ${team.name} ${player.position} ${player.name} out with ${description}.`,
    `Tough break for ${team.name}. ${player.name} injured (${description}).`,
    `${player.name} leaves the ice with ${description}. ${team.name} hoping for a quick recovery.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Injury',
  };
};

// Create roster move post (signing)
export const createSigningPost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `${team.name} signs ${player.position} ${playerName} (${player.overall} OVR). Solid pickup!`,
    `Roster move: ${team.name} adds ${playerName} to the squad. ${player.position}, ${player.overall} overall.`,
    `${playerName} joins ${team.name}! The ${player.position} brings a ${player.overall} overall rating.`,
    `Breaking: ${team.name} signs free agent ${playerName} (${player.position}, ${player.overall} OVR).`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create roster move post (release)
export const createReleasePost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `${team.name} releases ${player.name}. The ${player.position} hits free agency.`,
    `Roster move: ${team.name} parts ways with ${player.name}.`,
    `${player.name} no longer with ${team.name}. Free agent market gets another option.`,
    `${team.name} drops ${player.name} from the roster. Making room for upgrades?`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create IR move post
export const createIRPost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `${team.name} places ${player.name} on IR. Tough loss for the ${team.name}.`,
    `Injury reserve: ${player.name} moved to IR by ${team.name}.`,
    `${player.name} to IR. ${team.name} will need to find a replacement.`,
    `${team.name} moves injured ${player.position} ${player.name} to injury reserve.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create season start post
export const createSeasonStartPost = (year: number, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `The ${year} GKHA season is underway! Let's see who takes home the championship!`,
    `Welcome to the ${year} season! 6 teams, 1 champion. Who's it gonna be?`,
    `${year} GKHA season tips off! Time to knee some pucks!`,
    `New season, new dreams! ${year} GKHA action starts now!`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Other',
  };
};

// Create playoffs start post
export const createPlayoffsStartPost = (teams: Team[], gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const teamNames = teams.map((t) => t.name).join(', ');

  const messages = [
    `Playoffs begin! Top 4 teams: ${teamNames}. Who will be crowned champion?`,
    `The playoffs are here! ${teamNames} battle for the title!`,
    `Postseason time! ${teamNames} are your playoff teams!`,
    `Championship hunt begins! ${teamNames} advance to the playoffs!`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Other',
  };
};

// Create championship post
export const createChampionshipPost = (champion: Team, year: number, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `🏆 ${champion.name} are your ${year} GKHA Champions! What a season!`,
    `Champions! ${champion.name} win the ${year} GKHA title!`,
    `${champion.name} capture the ${year} championship! Incredible!`,
    `Your ${year} GKHA Champions: ${champion.name}! 🏆`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Other',
  };
};

// Create retirement post
export const createRetirementPost = (player: Player, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `${playerName} announces retirement. ${player.careerStats.gamesPlayed} games, ${player.careerStats.points} points. What a career!`,
    `End of an era: ${playerName} retires from the GKHA. ${player.careerStats.points} career points.`,
    `${playerName} hangs up the stick. Career: ${player.careerStats.gamesPlayed} GP, ${player.careerStats.goals} G, ${player.careerStats.assists} A.`,
    `Retirement: ${playerName} calls it a career after ${player.careerStats.gamesPlayed} games. Respect!`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Retirement',
  };
};

// Create IR return to active post
export const createIRReturnToActivePost = (
  player: Player,
  team: Team,
  benchedPlayer: Player,
  gameDate: string
): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);
  const benchedPlayerName = formatPlayerName(benchedPlayer);

  const messages = [
    `${playerName} returns from IR and takes back their spot in ${team.name}'s active lineup! ${benchedPlayerName} moves to bench.`,
    `Healthy and ready! ${playerName} (${player.overall} OVR) back in action for ${team.name}. ${benchedPlayerName} to the bench.`,
    `${team.name} activates ${playerName} from IR. ${benchedPlayerName} heads to the bench.`,
    `Welcome back! ${playerName} returns from injury and rejoins ${team.name}'s active roster.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create IR return to bench post
export const createIRReturnToBenchPost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `${playerName} returns from IR to ${team.name}'s bench. Good to have them back!`,
    `${team.name} activates ${playerName} from IR to the bench. Depth restored!`,
    `Healthy again! ${playerName} rejoins ${team.name} on the bench.`,
    `${playerName} (${player.overall} OVR) back from injury, heads to ${team.name}'s bench.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create suspension post
export const createSuspensionPost = (player: Player, team: Team, reason: string, games: number, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `Breaking: ${team.name} ${player.position} ${player.name} suspended ${games} game${games > 1 ? 's' : ''} for ${reason}.`,
    `Discipline: ${player.name} receives ${games}-game suspension for ${reason}. Big loss for ${team.name}.`,
    `${player.name} suspended! The ${team.name} ${player.position} sits ${games} game${games > 1 ? 's' : ''} (${reason}).`,
    `League announces: ${player.name} of ${team.name} suspended ${games} game${games > 1 ? 's' : ''} for ${reason}.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Suspension',
  };
};

// Create suspension list move post
export const createSuspensionListPost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();

  const messages = [
    `${team.name} moves ${player.name} to suspension list. Time to find a replacement.`,
    `${player.name} to suspension list. ${team.name} will need to adjust their lineup.`,
    `${team.name} places ${player.position} ${player.name} on suspension list.`,
    `Roster move: ${player.name} moved to ${team.name}'s suspension list.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create suspension return to active post
export const createSuspensionReturnToActivePost = (
  player: Player,
  team: Team,
  benchedPlayer: Player,
  gameDate: string
): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);
  const benchedPlayerName = formatPlayerName(benchedPlayer);

  const messages = [
    `${playerName} returns from suspension and takes back their spot in ${team.name}'s active lineup! ${benchedPlayerName} moves to bench.`,
    `Suspension served! ${playerName} (${player.overall} OVR) back in action for ${team.name}. ${benchedPlayerName} to the bench.`,
    `${team.name} activates ${playerName} from suspension. ${benchedPlayerName} heads to the bench.`,
    `Welcome back! ${playerName} returns from suspension and rejoins ${team.name}'s active roster.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create suspension return to bench post
export const createSuspensionReturnToBenchPost = (player: Player, team: Team, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `${playerName} returns from suspension to ${team.name}'s bench. Served their time!`,
    `${team.name} activates ${playerName} from suspension to the bench. Depth restored!`,
    `Suspension complete! ${playerName} rejoins ${team.name} on the bench.`,
    `${playerName} (${player.overall} OVR) back from suspension, heads to ${team.name}'s bench.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create position switch post
export const createPositionSwitchPost = (
  player: Player,
  team: Team,
  oldPosition: string,
  newPosition: string,
  gameDate: string
): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `${team.name} moves ${playerName} from ${oldPosition} to ${newPosition}. New overall: ${player.overall}. Versatility!`,
    `Position change: ${playerName} switches from ${oldPosition} to ${newPosition} for ${team.name}. (${player.overall} OVR)`,
    `${playerName} makes the position switch! Now playing ${newPosition} for ${team.name} (${player.overall} OVR).`,
    `${team.name} utilizes ${playerName}'s versatility, switching from ${oldPosition} to ${newPosition}. ${player.overall} overall.`,
    `Roster flexibility! ${playerName} transitions from ${oldPosition} to ${newPosition} for ${team.name}.`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Roster Move',
  };
};

// Create new free agent entering league post
export const createNewFreeAgentPost = (player: Player, gameDate: string): FeedPost => {
  const analyst = getRandomAnalyst();
  const playerName = formatPlayerName(player);

  const messages = [
    `New talent alert! ${player.position} ${playerName} (${player.overall} OVR) enters the free agent pool. Who will sign them?`,
    `Fresh blood in the GKHA! ${playerName} is now available as a free agent. ${player.position}, ${player.overall} overall.`,
    `${playerName} joins the free agent market! The ${player.position} brings a ${player.overall} overall rating.`,
    `Breaking: New ${player.position} ${playerName} (${player.overall} OVR) available for signing. Teams, make your move!`,
    `League expansion! ${playerName} (${player.position}, ${player.overall} OVR) is now a free agent. Who's gonna snag this talent?`,
  ];

  return {
    id: generatePostId(),
    analyst,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Other',
  };
};

// Create achievement unlocked post
export const createAchievementPost = (achievement: Achievement, gameDate: string): FeedPost => {
  const messages = [
    `Achievement Unlocked: ${achievement.title}! ${achievement.description}`,
    `Milestone reached! ${achievement.title} - ${achievement.description}`,
    `Congratulations! You've unlocked: ${achievement.title}. ${achievement.description}`,
    `New Achievement! ${achievement.title}: ${achievement.description}`,
  ];

  return {
    id: generatePostId(),
    analyst: ACHIEVEMENT_ANALYST,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Achievement',
    isAchievement: true,
  };
};

// Create Hall of Fame induction post
export const createHallOfFameInductionPost = (inductee: HallOfFameInductee, gameDate: string): FeedPost => {
  const messages = [
    `BREAKING: ${inductee.playerName} has been inducted into the Hall of Fame! With a legacy score of ${inductee.legacyScore}, the legendary ${inductee.position} will be remembered forever.`,
    `HISTORIC MOMENT: ${inductee.playerName} joins the Hall of Fame! The ${inductee.position} amassed ${inductee.legacyScore} legacy points over ${inductee.yearsOfExperience} seasons. A true legend of the game.`,
    `Hall of Fame Class of ${inductee.inductionYear}: ${inductee.playerName}! The ${inductee.position} enters immortality with ${inductee.legacyScore} legacy points. Congratulations to a hockey legend!`,
    `It's official! ${inductee.playerName} has been enshrined in the Hall of Fame with ${inductee.legacyScore} legacy points. The ${inductee.position}'s ${inductee.yearsOfExperience}-year career will never be forgotten.`,
  ];

  return {
    id: generatePostId(),
    analyst: ACHIEVEMENT_ANALYST,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Hall Of Fame',
  };
};

// Create Hall of Fame no induction post
export const createHallOfFameNoInductionPost = (year: number, gameDate: string): FeedPost => {
  const messages = [
    `Hall of Fame Class of ${year}: No inductees this year. While we saw some great careers come to an end, none were quite legendary enough for enshrinement.`,
    `The Hall of Fame will not be adding any new members this year. The voting committee has determined that no recently retired players have earned induction at this time.`,
    `Hall of Fame announcement: The ${year} class will remain empty. No retired players met the criteria for induction this year.`,
    `No new Hall of Famers in ${year}. The committee evaluated all recently retired players but none were selected for enshrinement at this time.`,
  ];

  return {
    id: generatePostId(),
    analyst: ACHIEVEMENT_ANALYST,
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: generateTimestamp(gameDate),
    type: 'Hall Of Fame',
  };
};
