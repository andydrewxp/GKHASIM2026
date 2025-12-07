import type { Player, Team, Position, PlayerPotential } from '../types';
import { autoSwapBenchWithActive } from '../engine/rosterManager';

// Helper function to generate player stats
const createEmptyStats = () => ({
  gamesPlayed: 0,
  goals: 0,
  assists: 0,
  points: 0,
  hits: 0,
  saves: 0,
  goalsAgainst: 0,
  legacy: 0,
});

// Generate unique player ID
let playerIdCounter = 1;
const generatePlayerId = () => `player_${playerIdCounter++}`;

// Team names
export const TEAM_NAMES = [
  'American Revolution',
  'Alaskan Thunder',
  'Boondock Beluga Whales',
  'Florida Tropics',
  'Southside Spartans',
  'Smashville Chippewas',
];

// Player name pools
const FIRST_NAMES = [
  'Alex', 'Blake', 'Callum', 'Drew', 'Elliot', 'Finn', 'Gray',
  'Harry', 'Ian', 'Jordan', 'Kyle', 'Logan', 'Matthew', 'Noah',
  'Owen', 'Parker', 'Quinn', 'Riley', 'Sam', 'Tyler', 'Uri',
  'Vince', 'West', 'Xavier', 'John', 'Zeke', 'Ash', 'Bryan',
  'Charlie', 'Dante', 'Eli', 'Felix', 'Glen', 'Hunter',
  'Chauncey', 'Chauncey', 'Chauncey', 'Chauncey', 'Chauncey',
  'Jared', 'Josh', 'Jameson', 'Matt', 'David', 'Mike', 'Joe',
  'Pat', 'Chase', 'Ed', 'Bryce', 'Rico', 'Jalen',
  'Mitchell', 'Jimmy', 'Jim', 'Johnathon', 'Chris', 'Collin',
  'Andrew', 'Andy', 'Michael', 'Shawn', 'Jon', 'Jo',
  'AJ', 'DJ', 'CJ', 'BJ', 'EJ', 'JJ', 'OJ', 'PJ', "RJ", 'TJ',
  'Bam', 'Derek', 'Bobby', 'Bob', 'Corey', 'Cory', 'Nick',
  'Nicholas', 'Thomas', 'Tom', 'Trevor', 'Dylan', 'Ben',
  'Benny', 'Victor', 'Luke', 'Lucas', 'Elijah',
  'Ryan', 'Christian', 'Joseph', 'Evan', 'Ivan', 'Travis',
  'Donald', 'Brock', 'Brian', 'Dakota', 'George', 'Christos',
  'Rick', 'Richie', 'Ricky', 'Colton', 'Baker', 'Juan',
  'Teddy', 'Cade', 'Sean', 'Cam', 'Greg', 'Chadd',
  'Colby', 'Kyren', 'Coby', 'Troy', 'Jaylen', 'Jayden', 'Omar',
  'Joshua', 'Stu', 'Albi', 'Kirk', 'Eric', 'Erik', 'Jessie',
  'Brandon', 'Brendan', 'Jacob', 'Connor', 'Zack', 'Zachary',
  'Ronnie', 'Arnold', 'Artie', 'Mason', 'Nathan', 'Nate',
  'Marco', 'JT', 'Simon', 'Justin', 'Albert', 'Moritz',
  'Amadeo', 'Adam', 'Kent', 'Abe', 'Isaac', 'Tim', 'Cole',
  'Timothy', 'Dmitri', 'Jake', 'Damon', 'Jet', 'Oscar',
  'Matthieu', 'Phil', 'Mac', 'Joel', 'Marc',
  'Gabe', 'Bo', 'Emil', 'Tony', 'Scott', 'Marcus', 'Ilya',
  'Max', 'Austin', 'Auston', 'Nico', 'Mattias', 'Easton',
  'Oliver', 'Shooter', 'Gunner', 'Guy', 'Scottie', 'Kirby',
  'Kaiden', 'Leon', 'King', 'Ty', 'Cal', 'Aaron',
  'Sergei', 'Wayne', 'Ozzy', 'Luca', 'Elio', 'Matteo',
  'Vlad', 'Andrei', 'Oleg', 'Alexei', 'Henri', 'Arthur'
];

const LAST_NAMES = [
  'Anderson', 'Bennett', 'Carter', 'Davis', 'Evans', 'Foster',
  'Garcia', 'Harris', 'Irving', 'Jackson', 'King', 'Lewis',
  'Martinez', 'Nelson', 'O\'Brien', 'Parker', 'Quinn', 'Roberts',
  'Smith', 'Taylor', 'Underwood', 'Vasquez', 'Wilson', 'Xavier',
  'Young', 'Zhang', 'Adams', 'Brooks', 'Collins', 'Dixon',
  'Sneed', 'Johnson', 'Gibbs', 'Parsons', 'Braun', 'Black',
  'White', 'Green', 'Brady', 'Cooper', 'Allen', 'Decker',
  'Campbell', 'Wall', 'Stafford', 'Haula', 'Wood', 'Golden',
  'Appleton', 'Kane', 'Danielson', 'Larkin', 'Coleman', 'Frost',
  'Wolf', 'Petzold', 'Cooley', 'Douglas', 'James', 'Paul', 'Brink',
  'Hathaway', 'Tippett', 'York', 'Jones', 'Holloway',
  'Thomas', 'Walker', 'Faulk', 'Tucker', 'Glass', 'Hughes',
  'Hamilton', 'Swayman', 'Lee', 'Palmieri', 'Schaefer', 'Dunn',
  'Benson', 'McLeod', 'Powers', 'Crosby', 'Ovechkin', 'Malkin',
  'Novak', 'Rust', 'Graves', 'Shea', 'Barron', 'Connor', 'Lowry',
  'Pierce', 'Pearson', 'Toews', 'Stanley', 'Judge', 'Miller',
  'Frank', 'Leonard', 'Milano', 'Roy', 'Berard', 'Panarin',
  'Robertson', 'Schneider', 'Fox', 'Blake', 'Hall', 'Robinson',
  'McMann', 'Knight', 'Coyle', 'Middleton', 'Bedard',
  'Moore', 'Murphy', 'Celebrini', 'Orlovsky', 'Colt', 'Holt',
  'Burns', 'Makar', 'Caufield', 'Suzuki', 'Cruise', 'Chen',
  'Gomes', 'DuBois', 'Keller', 'Cole', 'Marino', 'Cousins',
  'Perron', 'Pinto', 'Spence', 'Bowman', 'Eichel', 'Stone',
  'McNabb', 'Whitecloud', 'Barns', 'Myers', 'Gretzky', 'Terry',
  'Beck', 'Manning', 'Benn', 'Johnston', 'Brightwell', 'Wyatt',
  'Steel', 'Lindell', 'Mayer', 'Rock', 'Love', 'Cook',
  'Hawes', 'Palmer', 'Knox', 'Gilliam', 'Poyer',
  'Benford', 'Williams', 'Franklin', 'Bosa', 'Graham',
  'Watson', 'Sanders', 'Hairston', 'Mills', 'Marks', 'Chubb',
  'Noel', 'Hutchinson', 'Higgins', 'Schultz', 'Fortin',
  'Stover', 'Hunter', 'Settle', 'Hansen', 'Barnett',
  'Bryant', 'Horton', 'Darnold', 'Lassiter', 'Warren', 'Cox',
  'Pittman', 'Ward', 'Pierre', 'Holcomb', 'Slay', 'Boswell',
  'Pratt', 'Stewart', 'Burden', 'Swift', 'Loveland', 'Sweat',
  'Cross', 'Gardner', 'Gallimore', 'Treadwell', 'Goodson',
  'Edwards', 'Rice', 'Gray', 'Thornton', 'Bolton', 'Hicks',
  'McDonald', 'Penner', 'Knowles', 'Rudolph', 'Novikoff',
  'Heyward', 'Austin', 'Ramsey', 'Watt', 'Turbo', 'Booth',
  'Sawyer', 'Porter', 'Wright', 'Brisker', 'Dexter', 'Booker',
  'Owens', 'Scheffler', 'Hovland', 'Maye', 'Woods',
  'Jennings', 'Hooper', 'Hollins', 'Spillane', 'Pepper',
  'Gibbens', 'Landry', 'Ponder', 'Powder', 'Swinson', 'Fears',
  'Browning', 'Burrow', 'Tinsley', 'Ferguson', 'Fant',
  'Battle', 'Hill', 'Jenkins', 'Giles', 'Burks', "Ivey",
  'Newton', 'Turner', 'Sherwood', 'Reed', 'Briggs',
  'Brownlee', 'Stephens', 'Oliver', 'Clemons', 'Pavlov',
  'Flowers', 'Mitchell', 'Andrews', 'Henry', 'Wallace',
  'Starks', 'Sparks', 'Martin', 'Hummel', 'Kolar', 'Barner',
  'O\'Conner', 'O\'Connell', 'Sheriff', 'Morris', 'Bieber',
  'Pollard', 'Spears', 'Chestnut', 'Helm', 'Jefferson', 'Key',
  'Barton', 'Kinsey', 'Penn', 'Teller', 'Womack',
  'Day', 'McCarthy', 'Mason', 'Nailor', 'Addison', 'Price',
  'Cashore', 'Metellus', 'Redmond', 'Rodriguez', 'Batty',
  'Dawkins', 'Willis', 'Musgrave', 'Fitzpatick', 'McDuffy',
  'Hadden', 'McKinney', 'Soto', 'Bullard', 'Winston', 'Tracy',
  'Ivanov', 'Petrov', 'Sidorov', 'Smirnoff', 'Volkov',
  'Popov', 'Bouchard', 'Tremblay', 'Bergeron', 'LeBlanc',
  'Schmid', 'Huber', 'Fischer', 'Meier', 'Berger', 'Frey',
  'Hurts', 'Molette', 'Jackson', 'Johnson', 'Smith', 'Jones',
  'Williams', 'Davis', 'Wilson', 'Anderson', 'McAfee',
  'Mendoza', 'Sarratt', 'Scarlett', 'Tate', 'Boykin', 
  'Sharpe', 'Unger', 'Utzinger', 'Ponds', 'Boyd', 'Ferrell',
  'Baldwin', 'Tuggle', 'Harkless', 'Morrow', 'Ohrstrom',
  'Ratcliff', 'Kennedy', 'Stockton', 'McCray', 'Frazier',
  'Branch', 'Bolden', 'Everett', 'Butler', 'Yates', 'Ennis',
  'McCulley', 'Ragnow', 'Snell'
];

// Nicknames pool for randomly generated players
const NICKNAMES = [
  'Tank', 'Bearcat', 'Iceman',
  'Bear', 'Wolverine', 'Brick',
  'Money', 'Bigfoot', 'Buckeye',
  'Ace', 'Worm', 'Roadrunner',
  'Spidey', 'Goober', 'Arrow',
  'Bobo', 'Onions', 'The Bolt',
  'Mammoth', 'Admiral', 'Crowbar',
  'Cash', 'Captain Bacon', 'Flea',
  'The Joker', 'Tarzan', 'Mongoose',
  'Doc', 'Pipsqueak', 'Burrito',
  'Nugget', 'Rambo', 'Smurf',
  'Pickles', 'Hades', 'The Rat',
  'Stinky', 'Caesar', 'Salmon',
  'Pancake', 'Ajax', 'Candy'
];

// Generate random player name
const usedNames = new Set<string>();
const generatePlayerName = (): string => {
  let name: string;
  let attempts = 0;
  do {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Ensure first name and last name are never the same
    while (firstName === lastName) {
      lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    }

    name = `${firstName} ${lastName}`;
    attempts++;
    if (attempts > 100) {
      // Fallback if we run out of unique combinations
      name = `${firstName} ${lastName} ${Math.floor(Math.random() * 100)}`;
      break;
    }
  } while (usedNames.has(name));

  usedNames.add(name);
  return name;
};

// Generate random rating
const generateRating = (min: number = 60, max: number = 90): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Assign potential based on weighted probabilities
// 1/25 Goat, 5/25 Star, 14/25 Standard, 5/25 Bust
const assignPotential = (): PlayerPotential => {
  const random = Math.floor(Math.random() * 25);

  if (random < 1) {
    // 1 out of 25: Goat
    return 'Goat';
  } else if (random < 6) {
    // 5 out of 25: Star (1-5 inclusive)
    return 'Star';
  } else if (random < 20) {
    // 14 out of 25: Standard (6-19 inclusive)
    return 'Standard';
  } else {
    // 5 out of 25: Bust (20-24 inclusive)
    return 'Bust';
  }
};

// Generate three position-specific ratings for a player
// Primary position gets higher rating, secondary positions get lower ratings
const generateThreePositionRatings = (primaryPosition: Position) => {
  const primaryRating = generateRating(65, 69);
  const secondaryMin = 0.6;
  const secondaryMax = 0.85;

  const secondary1 = Math.max(60, Math.floor(primaryRating * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
  const secondary2 = Math.max(60, Math.floor(primaryRating * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));

  const ratings = {
    forwardRating: 0,
    defenderRating: 0,
    goalieRating: 0,
  };

  if (primaryPosition === 'Forward') {
    ratings.forwardRating = primaryRating;
    ratings.defenderRating = secondary1;
    ratings.goalieRating = secondary2;
  } else if (primaryPosition === 'Defender') {
    ratings.defenderRating = primaryRating;
    ratings.forwardRating = secondary1;
    ratings.goalieRating = secondary2;
  } else { // Goalie
    ratings.goalieRating = primaryRating;
    ratings.forwardRating = secondary1;
    ratings.defenderRating = secondary2;
  }

  return ratings;
};

// Create a player with random ratings
const createPlayer = (
  position: Position,
  state: Player['state'],
  teamId?: string
): Player => {
  const ratings = generateThreePositionRatings(position);

  // Calculate overall based on current position
  let overall: number;
  switch (position) {
    case 'Forward':
      overall = ratings.forwardRating;
      break;
    case 'Defender':
      overall = ratings.defenderRating;
      break;
    case 'Goalie':
      overall = ratings.goalieRating;
      break;
  }

  // Random age between 17 and 20
  const age = Math.floor(Math.random() * 4) + 17;

  // 1 in 20 chance to get a random nickname
  const hasNickname = Math.floor(Math.random() * 20) === 0;
  const nickname = hasNickname ? NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] : undefined;

  return {
    id: generatePlayerId(),
    name: generatePlayerName(),
    nickname,
    position,
    overall,
    forwardRating: ratings.forwardRating,
    defenderRating: ratings.defenderRating,
    goalieRating: ratings.goalieRating,
    state,
    potential: assignPotential(),
    teamId,
    seasonStats: createEmptyStats(),
    careerStats: createEmptyStats(),
    yearsOfExperience: 0,
    age,
    consecutiveSeasonsWithoutGames: 0,
  };
};

// Create a specific player with known name, position, and three ratings
const createSpecificPlayer = (
  name: string,
  position: Position,
  forwardRating: number,
  defenderRating: number,
  goalieRating: number,
  state: Player['state'],
  age: number,
  teamId?: string,
  nickname?: string
): Player => {
  // Calculate overall based on current position
  let overall: number;
  switch (position) {
    case 'Forward':
      overall = forwardRating;
      break;
    case 'Defender':
      overall = defenderRating;
      break;
    case 'Goalie':
      overall = goalieRating;
      break;
  }

  // Special potential assignment for Jar of Peanut Butter
  // Star: 1/30 times, Bust: 29/30 times
  let potential: PlayerPotential;
  if (name === 'Jar of Peanut Butter') {
    const random = Math.floor(Math.random() * 30);
    potential = random < 1 ? 'Star' : 'Bust';
  } else {
    potential = assignPotential();
  }

  return {
    id: generatePlayerId(),
    name,
    nickname,
    position,
    overall,
    forwardRating,
    defenderRating,
    goalieRating,
    state,
    potential,
    teamId,
    seasonStats: createEmptyStats(),
    careerStats: createEmptyStats(),
    yearsOfExperience: 0,
    age,
    consecutiveSeasonsWithoutGames: 0,
  };
};

// Initial roster data - each player has ratings for all three positions
const INITIAL_ROSTERS = {
  'American Revolution': {
    forward: { name: 'Mikey Papa', forwardRating: 90, defenderRating: 77, goalieRating: 65 },
    defender: { name: 'Owen Brown', forwardRating: 65, defenderRating: 77, goalieRating: 65 },
    goalie: { name: 'Mike Marotta', forwardRating: 73, defenderRating: 80, goalieRating: 89 },
    bench: { name: 'Nick Marotta', position: 'Goalie' as Position, forwardRating: 60, defenderRating: 62, goalieRating: 71 }
  },
  'Alaskan Thunder': {
    forward: { name: 'Ricky Novia', forwardRating: 82, defenderRating: 80, goalieRating: 77 },
    defender: { name: 'Andy Levy', forwardRating: 75, defenderRating: 82, goalieRating: 53 },
    goalie: { name: 'Joe O\'Donnell', forwardRating: 62, defenderRating: 65, goalieRating: 77 },
    bench: { name: 'Brad Robidoux', position: 'Goalie' as Position, forwardRating: 55, defenderRating: 58, goalieRating: 65 }
  },
  'Boondock Beluga Whales': {
    forward: { name: 'Austin Ingarra', forwardRating: 83, defenderRating: 72, goalieRating: 80 },
    defender: { name: 'Ian Beling', forwardRating: 65, defenderRating: 77, goalieRating: 74 },
    goalie: { name: 'Alec Fowler', forwardRating: 66, defenderRating: 72, goalieRating: 81 },
    bench: { name: 'Shem Prudhomme', position: 'Forward' as Position, forwardRating: 67, defenderRating: 53, goalieRating: 66 }
  },
  'Florida Tropics': {
    forward: { name: 'Erik Galuska', forwardRating: 76, defenderRating: 64, goalieRating: 60 },
    defender: { name: 'Aidan Murray', forwardRating: 62, defenderRating: 74, goalieRating: 62 },
    goalie: { name: 'Collin Salatto', forwardRating: 51, defenderRating: 73, goalieRating: 95 },
    bench: { name: 'Chris Horowitz', position: 'Forward' as Position, forwardRating: 72, defenderRating: 70, goalieRating: 56 }
  },
  'Smashville Chippewas': {
    forward: { name: 'Vinny Cleary', forwardRating: 86, defenderRating: 82, goalieRating: 74 },
    defender: { name: 'Sal DeLucia', forwardRating: 69, defenderRating: 77, goalieRating: 72 },
    goalie: { name: 'Thom Bishop', forwardRating: 85, defenderRating: 81, goalieRating: 93 },
    bench: { name: 'Erik Levenduski', position: 'Forward' as Position, forwardRating: 79, defenderRating: 66, goalieRating: 62 }
  },
  'Southside Spartans': {
    forward: { name: 'Chris Papa', forwardRating: 95, defenderRating: 78, goalieRating: 75 },
    defender: { name: 'Matt Robidoux', forwardRating: 65, defenderRating: 77, goalieRating: 77 },
    goalie: { name: 'Matt Palma', forwardRating: 56, defenderRating: 70, goalieRating: 80 },
    bench: { name: 'George Bonadies', position: 'Goalie' as Position, forwardRating: 64, defenderRating: 66, goalieRating: 77 }
  }
};

// Generate initial teams with rosters
export const generateInitialTeams = (): Team[] => {
  const teams: Team[] = [];

  TEAM_NAMES.forEach((teamName, index) => {
    const teamId = `team_${index + 1}`;
    const rosterData = INITIAL_ROSTERS[teamName as keyof typeof INITIAL_ROSTERS];

    // Determine ages for specific players
    const getPlayerAge = (name: string): number => {
      // Andrew Levy and Nick Marotta always start at 21
      if (name === 'Andy Levy' || name === 'Nick Marotta') return 21;
      // Mikey Papa, Vinny Cleary, Eggy Levenduski, Quinn Donahue, Kyle Kulthau start at 17
      if (name === 'Mikey Papa' || name === 'Vinny Cleary' || name === 'Eggy Levenduski') return 17;
      // All other players get random age 17-20
      return Math.floor(Math.random() * 4) + 17;
    };

    // Determine nicknames for specific players
    const getPlayerNickname = (name: string): string | undefined => {
      const nicknameMap: { [key: string]: string } = {
        'Collin Salatto': 'Googus',
        'Joe O\'Donnell': 'Fienders',
        'Chris Papa': 'Commish',
        'Austin Ingarra': 'Safari Master',
        'Ricky Novia': 'The Animal',
        'Quinn Donahue': 'Diesel',
        'Erik Levenduski': 'Eggy'
      };
      return nicknameMap[name];
    };

    // Create 3 active players with specific names and three ratings each
    const activePlayers: Player[] = [
      createSpecificPlayer(rosterData.forward.name, 'Forward', rosterData.forward.forwardRating, rosterData.forward.defenderRating, rosterData.forward.goalieRating, 'Active', getPlayerAge(rosterData.forward.name), teamId, getPlayerNickname(rosterData.forward.name)),
      createSpecificPlayer(rosterData.goalie.name, 'Goalie', rosterData.goalie.forwardRating, rosterData.goalie.defenderRating, rosterData.goalie.goalieRating, 'Active', getPlayerAge(rosterData.goalie.name), teamId, getPlayerNickname(rosterData.goalie.name)),
      createSpecificPlayer(rosterData.defender.name, 'Defender', rosterData.defender.forwardRating, rosterData.defender.defenderRating, rosterData.defender.goalieRating, 'Active', getPlayerAge(rosterData.defender.name), teamId, getPlayerNickname(rosterData.defender.name)),
    ];

    // Create 1 bench player with specific name and three ratings
    const benchPlayer = createSpecificPlayer(
      rosterData.bench.name,
      rosterData.bench.position,
      rosterData.bench.forwardRating,
      rosterData.bench.defenderRating,
      rosterData.bench.goalieRating,
      'Bench',
      getPlayerAge(rosterData.bench.name),
      teamId,
      getPlayerNickname(rosterData.bench.name)
    );

    const team: Team = {
      id: teamId,
      name: teamName,
      activePlayers,
      benchPlayer,
      irPlayers: [],
      suspendedPlayers: [],
      wins: 0,
      losses: 0,
      overtimeLosses: 0,
      gamesPlayed: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      legacy: 0,
    };

    // Automatically swap bench player with active player if bench has higher overall
    autoSwapBenchWithActive(team);

    teams.push(team);
  });

  return teams;
};

// Generate initial free agents
export const generateInitialFreeAgents = (): Player[] => {
  const freeAgents: Player[] = [];

  // Helper to get age for specific free agents
  const getFreeAgentAge = (name: string): number => {
    if (name === 'Kyle Kulthau' || name === 'Quinn Donahue') return 16;
    return Math.floor(Math.random() * 4) + 17; // Random age 17-20 for others
  };

  // Add 10 specific free agents that are always available at season start
  freeAgents.push(
    createSpecificPlayer('Jarrett Hissick', 'Defender', 62, 70, 63, 'Free Agent', getFreeAgentAge('Jarrett Hissick')),
    createSpecificPlayer('Jar of Peanut Butter', 'Goalie', 1, 1, 2, 'Free Agent', getFreeAgentAge('Jar of Peanut Butter')),
    createSpecificPlayer('Yiannis Bagtzoglou', 'Goalie', 62, 60, 69, 'Free Agent', getFreeAgentAge('Yiannis Bagtzoglou')),
    createSpecificPlayer('Christos Bagtzoglou', 'Defender', 62, 69, 60, 'Free Agent', getFreeAgentAge('Christos Bagtzoglou')),
    createSpecificPlayer('Kyle Kulthau', 'Forward', 68, 60, 60, 'Free Agent', getFreeAgentAge('Kyle Kulthau')),
    createSpecificPlayer('Quinn Donahue', 'Defender', 63, 67, 65, 'Free Agent', getFreeAgentAge('Quinn Donahue')),
    createSpecificPlayer('Darren Barille', 'Forward', 57, 52, 55, 'Free Agent', getFreeAgentAge('Darren Barille')),
    createSpecificPlayer('Aaron Narine', 'Forward', 55, 55, 55, 'Free Agent', getFreeAgentAge('Aaron Narine')),
    createSpecificPlayer('Tim Winters', 'Goalie', 55, 57, 62, 'Free Agent', getFreeAgentAge('Tim Winters'))
  );

  // Add Eric "Suddy" Sudhoff - starts with ratings 1 lower than Tim Winters
  // His ratings will always track Tim Winters' ratings minus 1
  const ericSudhoff = createSpecificPlayer('Eric Sudhoff', 'Goalie', 54, 56, 61, 'Free Agent', getFreeAgentAge('Eric Sudhoff'), undefined, 'Suddy');
  // Override potential to always be Bust
  ericSudhoff.potential = 'Bust';
  freeAgents.push(ericSudhoff);

  // Create 1 additional random free agent
  for (let i = 0; i < 1; i++) {
    const positions: Position[] = ['Forward', 'Goalie', 'Defender'];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    freeAgents.push(createPlayer(randomPosition, 'Free Agent'));
  }

  return freeAgents;
};

// Analyst usernames for event feed
export const ANALYSTS = [
  '@CoachWoof',
  '@CrumbRingFandom',
  '@RinkReporter',
  '@richlevy19',
  '@arman_cabral',
  '@kevincarnale',
  '@GKHAOfficial',
  '@GKHAinside'
];

// Dedicated analyst for achievements
export const ACHIEVEMENT_ANALYST = '@dj_devy_dev';
