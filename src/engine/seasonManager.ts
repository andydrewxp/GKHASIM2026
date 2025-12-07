import type { Player, Team, SeasonHistory, PlayerPotential, HallOfFameInductee } from '../types';
import { resetSeasonStats, resetTeamRecords, getTopLeader, getAllPlayers, getLeagueLeaders } from './statsManager';
import { processAllTeamAutoSwaps } from './rosterManager';

// Assign potential based on weighted probabilities
// 1/20 Goat, 6/20 Star, 9/20 Standard, 4/20 Bust
const assignPotential = (): PlayerPotential => {
  const random = Math.floor(Math.random() * 20);

  if (random < 1) {
    // 1 out of 20: Goat
    return 'Goat';
  } else if (random < 7) {
    // 6 out of 20: Star (1-6 inclusive)
    return 'Star';
  } else if (random < 16) {
    // 9 out of 20: Standard (7-15 inclusive)
    return 'Standard';
  } else {
    // 4 out of 20: Bust (16-19 inclusive)
    return 'Bust';
  }
};

// Process player development during offseason
export const processPlayerDevelopment = (players: Player[]): void => {
  // Find Tim Winters and Eric Sudhoff
  const timWinters = players.find((p) => p.name === 'Tim Winters');
  const ericSudhoff = players.find((p) => p.name === 'Eric Sudhoff');

  players.forEach((player) => {
    // Skip Eric Sudhoff during normal progression - he'll be handled after Tim Winters
    if (player.name === 'Eric Sudhoff') {
      return;
    }

    // Practice probability based on potential
    // Bust: 25% chance to practice (75% chance to regress)
    // Standard: 51% chance to practice (49% chance to regress)
    // Star: 80% chance to practice (20% chance to regress)
    // Goat: 98% chance to practice (2% chance to regress)
    let practiceProbability = 0.5; // Default for Standard

    switch (player.potential) {
      case 'Bust':
        practiceProbability = 0.25;
        break;
      case 'Standard':
        practiceProbability = 0.51;
        break;
      case 'Star':
        practiceProbability = 0.80;
        break;
      case 'Goat':
        practiceProbability = 0.98;
        break;
    }

    // Apply age penalty
    // Players 35+ never practice (0% chance)
    // Players 30-34 have reduced practice probability (linear decline from 100% to 0%)
    // Exception: Jar of Peanut Butter is immune to age penalties
    if (player.name !== 'Jar of Peanut Butter') {
      if (player.age >= 35) {
        practiceProbability = 0;
      } else if (player.age >= 29) {
        // Linear decline from age 29 to 34
        // At 29: multiplier = 1.0 (100%)
        // At 30: multiplier = 0.8 (80%)
        // At 31: multiplier = 0.6 (60%)
        // At 32: multiplier = 0.4 (40%)
        // At 33: multiplier = 0.2 (20%)
        const ageMultiplier = 1 - ((player.age - 29) / 5);
        practiceProbability *= ageMultiplier;
      }
    }

    const practiced = Math.random() < practiceProbability;

    if (practiced) {
      // Improve all position-specific ratings based on potential
      // Goat: +1 to +5, Star: +1 to +3, Standard: +1 to +2, Bust: +1
      let improvementRange = 1;
      let minImprovement = 1;

      switch (player.potential) {
        case 'Goat':
          improvementRange = 5;
          minImprovement = 1;
          break;
        case 'Star':
          improvementRange = 3;
          minImprovement = 1;
          break;
        case 'Standard':
          improvementRange = 2;
          minImprovement = 1;
          break;
        case 'Bust':
          improvementRange = 1;
          minImprovement = 1;
          break;
      }

      player.forwardRating = Math.min(99, player.forwardRating + Math.floor(Math.random() * improvementRange) + minImprovement);
      player.defenderRating = Math.min(99, player.defenderRating + Math.floor(Math.random() * improvementRange) + minImprovement);
      player.goalieRating = Math.min(99, player.goalieRating + Math.floor(Math.random() * improvementRange) + minImprovement);
    } else {
      // Regress all position-specific ratings
      player.forwardRating = Math.max(1, player.forwardRating - Math.floor(Math.random() * 3));
      player.defenderRating = Math.max(1, player.defenderRating - Math.floor(Math.random() * 3));
      player.goalieRating = Math.max(1, player.goalieRating - Math.floor(Math.random() * 3));
    }

    // Update overall to match their current position rating
    if (player.position === 'Forward') {
      player.overall = player.forwardRating;
    } else if (player.position === 'Defender') {
      player.overall = player.defenderRating;
    } else { // Goalie
      player.overall = player.goalieRating;
    }
  });

  // After all other players have been processed, sync Eric Sudhoff to Tim Winters minus 1
  if (ericSudhoff && timWinters) {
    ericSudhoff.forwardRating = Math.max(1, timWinters.forwardRating - 1);
    ericSudhoff.defenderRating = Math.max(1, timWinters.defenderRating - 1);
    ericSudhoff.goalieRating = Math.max(1, timWinters.goalieRating - 1);

    // Update overall to match their current position rating
    if (ericSudhoff.position === 'Forward') {
      ericSudhoff.overall = ericSudhoff.forwardRating;
    } else if (ericSudhoff.position === 'Defender') {
      ericSudhoff.overall = ericSudhoff.defenderRating;
    } else { // Goalie
      ericSudhoff.overall = ericSudhoff.goalieRating;
    }
  }
};

// Process player retirements
export const processRetirements = (
  players: Player[],
  retiredPlayers: Player[],
  currentYear: number
): Player[] => {
  const retiringPlayers: Player[] = [];
  const CONSECUTIVE_INACTIVE_SEASONS_THRESHOLD = 4;

  // Track if Tim Winters is retiring
  let timWintersRetiring = false;

  players.forEach((player) => {
    let shouldRetire = false;

    // Special case: Eric Sudhoff only retires if Tim Winters retires
    if (player.name === 'Eric Sudhoff') {
      // We'll determine this after Tim Winters is processed
      return;
    }

    // Special case: Jar of Peanut Butter retires only at age 100
    if (player.name === 'Jar of Peanut Butter') {
      if (player.age >= 100) {
        shouldRetire = true;
      }
    } else {
      // Check if player hasn't played for 4 consecutive seasons AND is a free agent
      if ((player.consecutiveSeasonsWithoutGames || 0) >= CONSECUTIVE_INACTIVE_SEASONS_THRESHOLD && player.state === 'Free Agent') {
        shouldRetire = true;
      } else {
        // Calculate retirement probability based on age
        // Uses exponential growth to create an average retirement age of 35
        // Players can retire at any age, but probability increases with age
        let retirementProbability = 0;

        if (player.age < 25) {
          // Very low probability for young players
          retirementProbability = 0.001;
        } else if (player.age >= 25 && player.age < 30) {
          // Low probability for players in their prime
          retirementProbability = 0.01;
        } else if (player.age >= 30 && player.age < 35) {
          // Moderate probability as players approach average retirement age
          retirementProbability = 0.05 + (player.age - 30) * 0.02;
        } else if (player.age >= 35 && player.age < 40) {
          // High probability after average retirement age
          retirementProbability = 0.15 + (player.age - 35) * 0.05;
        } else {
          // Very high probability for older players
          retirementProbability = 0.40 + (player.age - 40) * 0.08;
        }

        // Apply potential-based retirement multiplier
        // Goat players have longer careers due to their exceptional talent and drive
        if (player.potential === 'Goat') {
          retirementProbability *= 0.5; // Goat players have half the retirement probability
        } else if (player.potential === 'Star') {
          retirementProbability *= 0.9; // Star players have 10% reduced retirement probability
        }

        // Cap probability at 95% to allow for occasional long careers
        retirementProbability = Math.min(0.95, retirementProbability);

        if (Math.random() < retirementProbability) {
          shouldRetire = true;
        }
      }
    }

    if (shouldRetire) {
      player.state = 'Retired';
      player.retirementYear = currentYear;
      retiringPlayers.push(player);
      retiredPlayers.push(player);

      // Track if Tim Winters is retiring
      if (player.name === 'Tim Winters') {
        timWintersRetiring = true;
      }
    }
  });

  // Handle Eric Sudhoff retirement - only retires if Tim Winters retired
  const ericSudhoff = players.find((p) => p.name === 'Eric Sudhoff');
  if (ericSudhoff && timWintersRetiring) {
    ericSudhoff.state = 'Retired';
    ericSudhoff.retirementYear = currentYear;
    retiringPlayers.push(ericSudhoff);
    retiredPlayers.push(ericSudhoff);
  }

  return retiringPlayers;
};

// Generate replacement players for retired players
export const generateReplacementPlayers = (
  retiredCount: number,
  usedNames: Set<string>
): Player[] => {
  const replacements: Player[] = [];
  const positions: Player['position'][] = ['Forward', 'Goalie', 'Defender'];

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
    'Benny', 'Victor', 'Luke', 'Lucas',
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
    'Sneed', 'Johnson', 'Gibbs', 'Parsons', 'Brown', 'Black',
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

  for (let i = 0; i < retiredCount; i++) {
    let name: string;
    let attempts = 0;
    do {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

      // Ensure first name and last name are never the same
      while (firstName === lastName) {
        lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      }

      // 1 in 30 chance to add "Jr." suffix
      const addJrSuffix = Math.floor(Math.random() * 30) === 0;
      if (addJrSuffix) {
        lastName = `${lastName} Jr.`;
      } else {
        // If not a Jr., 1 in 60 chance to hyphenate last name
        const addHyphenatedName = Math.floor(Math.random() * 60) === 0;
        if (addHyphenatedName) {
          let secondLastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          // Ensure the two last names are different
          while (secondLastName === lastName) {
            secondLastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          }
          lastName = `${lastName}-${secondLastName}`;
        }
      }

      name = `${firstName} ${lastName}`;
      attempts++;
      if (attempts > 100) {
        name = `${firstName} ${lastName} ${Math.floor(Math.random() * 1000)}`;
        break;
      }
    } while (usedNames.has(name));

    usedNames.add(name);

    const position = positions[Math.floor(Math.random() * positions.length)];
    const overall = Math.floor(Math.random() * 14) + 66; // 66-79

    // Generate position-specific ratings
    const secondaryMin = 0.6;
    const secondaryMax = 0.85;
    let forwardRating = 0;
    let defenderRating = 0;
    let goalieRating = 0;

    if (position === 'Forward') {
      forwardRating = overall;
      defenderRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
      goalieRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
    } else if (position === 'Defender') {
      defenderRating = overall;
      forwardRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
      goalieRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
    } else { // Goalie
      goalieRating = overall;
      forwardRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
      defenderRating = Math.max(60, Math.floor(overall * (secondaryMin + Math.random() * (secondaryMax - secondaryMin))));
    }

    // Random age between 17 and 19 for new players
    const age = Math.floor(Math.random() * 3) + 17;

    // 1 in 8 chance to get a random nickname
    const hasNickname = Math.floor(Math.random() * 8) === 0;
    const nickname = hasNickname ? NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] : undefined;

    replacements.push({
      id: `player_new_${Date.now()}_${i}`,
      name,
      nickname,
      position,
      overall,
      forwardRating,
      defenderRating,
      goalieRating,
      state: 'Free Agent',
      potential: assignPotential(),
      seasonStats: {
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        points: 0,
        hits: 0,
        saves: 0,
        goalsAgainst: 0,
        legacy: 0,
      },
      careerStats: {
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        points: 0,
        hits: 0,
        saves: 0,
        goalsAgainst: 0,
        legacy: 0,
      },
      yearsOfExperience: 0,
      age,
      consecutiveSeasonsWithoutGames: 0,
    });
  }

  return replacements;
};

// Award legacy points to players based on season achievements
export const awardLegacyPoints = (
  teams: Team[],
  freeAgents: Player[],
  championTeamName: string,
  playoffTeamNames: string[],
  finalistsTeamNames: string[]
): void => {
  const allPlayers = getAllPlayers(teams).concat(freeAgents);

  // Get stat leaders for all categories
  const goalsLeader = getTopLeader(allPlayers, 'goals', true);
  const assistsLeader = getTopLeader(allPlayers, 'assists', true);
  const pointsLeader = getTopLeader(allPlayers, 'points', true);
  const savesLeader = getTopLeader(allPlayers, 'saves', true);
  const hitsLeader = getTopLeader(allPlayers, 'hits', true);

  // Get top 2-5 players for each category
  const goalsTop5 = getLeagueLeaders(allPlayers, 'goals', true, 5);
  const assistsTop5 = getLeagueLeaders(allPlayers, 'assists', true, 5);
  const pointsTop5 = getLeagueLeaders(allPlayers, 'points', true, 5);
  const savesTop5 = getLeagueLeaders(allPlayers, 'saves', true, 5);
  const hitsTop5 = getLeagueLeaders(allPlayers, 'hits', true, 5);

  // Award points to all players based on their achievements
  allPlayers.forEach((player) => {
    let legacyPoints = 0;

    // Check if player's team made playoffs (+5)
    const playerTeam = teams.find((t) => t.id === player.teamId);
    if (playerTeam && playoffTeamNames.includes(playerTeam.name)) {
      legacyPoints += 5;
    }

    // Check if player's team made finals (+15)
    if (playerTeam && finalistsTeamNames.includes(playerTeam.name)) {
      legacyPoints += 10;
    }

    // Check if player's team won championship (+50)
    if (playerTeam && playerTeam.name === championTeamName) {
      legacyPoints += 35;
    }

    // Check if player led league in points (+10)
    if (pointsLeader && player.id === pointsLeader.player.id) {
      legacyPoints += 10;
    }

    // Check if player led league in other stat categories (+25 each)
    if (goalsLeader && player.id === goalsLeader.player.id) {
      legacyPoints += 25;
    }
    if (assistsLeader && player.id === assistsLeader.player.id) {
      legacyPoints += 20;
    }
    if (savesLeader && player.id === savesLeader.player.id) {
      legacyPoints += 25;
    }
    if (hitsLeader && player.id === hitsLeader.player.id) {
      legacyPoints += 20;
    }

    // Check if player was top 2-5 in any stat category (+5 for each category)
    const isTop2to5 = (top5List: ReturnType<typeof getLeagueLeaders>, playerId: string): boolean => {
      const playerRank = top5List.findIndex((entry) => entry.player.id === playerId);
      return playerRank >= 1 && playerRank <= 4; // Indices 1-4 are ranks 2-5
    };

    if (isTop2to5(goalsTop5, player.id)) {
      legacyPoints += 5;
    }
    if (isTop2to5(assistsTop5, player.id)) {
      legacyPoints += 5;
    }
    if (isTop2to5(pointsTop5, player.id)) {
      legacyPoints += 5;
    }
    if (isTop2to5(savesTop5, player.id)) {
      legacyPoints += 5;
    }
    if (isTop2to5(hitsTop5, player.id)) {
      legacyPoints += 5;
    }

    // Add legacy points to career stats
    if (legacyPoints > 0) {
      player.careerStats.legacy = (player.careerStats.legacy || 0) + legacyPoints;
    }
  });
};

// Process Hall of Fame inductions
// Only runs after 2040, inducts the retired player with the most legacy (if over 550)
// Players with 600+ legacy are guaranteed induction
// Players with 550-599 legacy have a 30% chance of induction
// Maximum one player inducted per year
export const processHallOfFameInduction = (
  retiredPlayers: Player[],
  hallOfFame: HallOfFameInductee[],
  currentYear: number
): HallOfFameInductee | null => {
  // Only process after 2040
  if (currentYear <= 2040) {
    return null;
  }

  // Get all retired players who haven't been inducted yet
  const inductedPlayerIds = new Set(hallOfFame.map((inductee) => inductee.playerId));
  const eligiblePlayers = retiredPlayers.filter(
    (player) => !inductedPlayerIds.has(player.id) && (player.careerStats.legacy || 0) > 499
  );

  // If no eligible players, no induction this year
  if (eligiblePlayers.length === 0) {
    return null;
  }

  // Find the player with the highest legacy score
  const topPlayer = eligiblePlayers.reduce((best, current) => {
    const currentLegacy = current.careerStats.legacy || 0;
    const bestLegacy = best.careerStats.legacy || 0;
    return currentLegacy > bestLegacy ? current : best;
  });

  const topPlayerLegacy = topPlayer.careerStats.legacy || 0;

    // If legacy is between 500 and 549, only 6% chance of induction
  if (topPlayerLegacy >= 500 && topPlayerLegacy < 550) {
    const randomChance = Math.random();
    if (randomChance > 0.06) {
      // Failed the 6% vote
      return null;
    }
  }

  // If legacy is between 550 and 599, only 30% chance of induction
  if (topPlayerLegacy >= 550 && topPlayerLegacy < 600) {
    const randomChance = Math.random();
    if (randomChance > 0.3) {
      // Failed the 30% vote
      return null;
    }
  }

  // If legacy is between 600 and 649, only 60% chance of induction
  if (topPlayerLegacy >= 600 && topPlayerLegacy < 650) {
    const randomChance = Math.random();
    if (randomChance > 0.6) {
      // Failed the 60% vote
      return null;
    }
  }

  // If legacy is between 650 and 699, only 90% chance of induction
  if (topPlayerLegacy >= 650 && topPlayerLegacy < 700) {
    const randomChance = Math.random();
    if (randomChance > 0.9) {
      // Failed the 90% vote
      return null;
    }
  }

  // Create Hall of Fame inductee
  // Note: currentYear is the induction year (the new season starting)
  // Use the player's actual retirement year from when they retired
  const inductee: HallOfFameInductee = {
    playerId: topPlayer.id,
    playerName: topPlayer.name,
    inductionYear: currentYear,
    retirementYear: topPlayer.retirementYear || currentYear - 1, // Fallback for legacy data
    legacyScore: topPlayer.careerStats.legacy || 0,
    position: topPlayer.position,
    yearsOfExperience: topPlayer.yearsOfExperience,
    careerStats: { ...topPlayer.careerStats },
  };

  return inductee;
};

// Award legacy points to teams based on season achievements
export const awardTeamLegacyPoints = (
  teams: Team[],
  championTeamName: string,
  playoffTeamNames: string[],
  finalistsTeamNames: string[]
): void => {
  // Sort teams by goals scored to find the team with most goals
  const teamsByGoalsFor = [...teams].sort((a, b) => b.goalsFor - a.goalsFor);
  const mostGoalsTeamName = teamsByGoalsFor.length > 0 ? teamsByGoalsFor[0].name : '';

  // Sort teams by goals allowed to find the team with least goals allowed
  const teamsByGoalsAgainst = [...teams].sort((a, b) => a.goalsAgainst - b.goalsAgainst);
  const leastGoalsAgainstTeamName = teamsByGoalsAgainst.length > 0 ? teamsByGoalsAgainst[0].name : '';

  teams.forEach((team) => {
    let legacyPoints = 0;

    // Award points for making the playoffs (+10)
    if (playoffTeamNames.includes(team.name)) {
      legacyPoints += 10;
    }

    // Award points for making the finals (+15 additional)
    if (finalistsTeamNames.includes(team.name)) {
      legacyPoints += 15;
    }

    // Award points for winning the championship (+25 additional)
    if (team.name === championTeamName) {
      legacyPoints += 25;
    }

    // Award points for most goals scored in the season (+10)
    if (team.name === mostGoalsTeamName) {
      legacyPoints += 10;
    }

    // Award points for allowing the least goals in the season (+10)
    if (team.name === leastGoalsAgainstTeamName) {
      legacyPoints += 10;
    }

    // Add legacy points to team
    if (legacyPoints > 0) {
      team.legacy = (team.legacy || 0) + legacyPoints;
    }
  });
};

// Advance to next season
export const advanceSeason = (
  teams: Team[],
  freeAgents: Player[],
  retiredPlayers: Player[],
  currentYear: number,
  championName: string,
  seasonHistory: SeasonHistory[],
  playoffTeamNames?: string[],
  finalistsTeamNames?: string[],
  hallOfFame?: HallOfFameInductee[]
): { newYear: number; newGameDate: string; retiringPlayers: Player[]; newFreeAgents: Player[]; newInductee?: HallOfFameInductee } => {
  // Create a snapshot of current free agents to detect newly generated players
  // This prevents issues with React Strict Mode calling this function twice
  const originalFreeAgentIds = new Set(freeAgents.map((p) => p.id));

  const allPlayers = getAllPlayers(teams).concat(freeAgents);

  // Get stat leaders before resetting
  const goalsLeader = getTopLeader(allPlayers, 'goals', true);
  const assistsLeader = getTopLeader(allPlayers, 'assists', true);
  const pointsLeader = getTopLeader(allPlayers, 'points', true);
  const savesLeader = getTopLeader(allPlayers, 'saves', true);
  const hitsLeader = getTopLeader(allPlayers, 'hits', true);

  // Record season history (only if not already recorded)
  const alreadyRecorded = seasonHistory.some(s => s.year === currentYear);
  if (!alreadyRecorded) {
    seasonHistory.push({
      year: currentYear,
      champion: championName,
      statLeaders: {
        goals: goalsLeader
          ? { playerName: goalsLeader.player.name, value: goalsLeader.value }
          : { playerName: 'N/A', value: 0 },
        assists: assistsLeader
          ? { playerName: assistsLeader.player.name, value: assistsLeader.value }
          : { playerName: 'N/A', value: 0 },
        points: pointsLeader
          ? { playerName: pointsLeader.player.name, value: pointsLeader.value }
          : { playerName: 'N/A', value: 0 },
        saves: savesLeader
          ? { playerName: savesLeader.player.name, value: savesLeader.value }
          : { playerName: 'N/A', value: 0 },
        hits: hitsLeader
          ? { playerName: hitsLeader.player.name, value: hitsLeader.value }
          : { playerName: 'N/A', value: 0 },
      },
    });
  }

  // Award legacy points based on season achievements (only if not already processed)
  if (!alreadyRecorded && playoffTeamNames && finalistsTeamNames) {
    awardLegacyPoints(teams, freeAgents, championName, playoffTeamNames, finalistsTeamNames);
    awardTeamLegacyPoints(teams, championName, playoffTeamNames, finalistsTeamNames);
  }

  // Increment years of experience for players who played at least 1 game this season
  // Track consecutive seasons without games, and increment age for all players
  // Check if we've already added this season to history - if so, we've already incremented everything
  // This prevents duplicate increments in React Strict Mode
  const experienceAlreadyProcessed = alreadyRecorded;

  if (!experienceAlreadyProcessed) {
    allPlayers.forEach((player) => {
      if (player.seasonStats.gamesPlayed > 0) {
        player.yearsOfExperience++;
        // Reset consecutive seasons without games if they played this season
        player.consecutiveSeasonsWithoutGames = 0;
      } else {
        // Increment consecutive seasons without games if they didn't play
        player.consecutiveSeasonsWithoutGames = (player.consecutiveSeasonsWithoutGames || 0) + 1;
      }
      // Every player ages by 1 year at the end of each season
      player.age++;
    });
  }

  // Process retirements (with deduplication for React Strict Mode)
  // Check if any players in allPlayers already have state 'Retired' (but aren't in retiredPlayers yet)
  // This indicates processRetirements was already called on the first pass
  const newlyRetiredNotInArray = allPlayers.filter((p) =>
    p.state === 'Retired' && !retiredPlayers.some(r => r.id === p.id)
  );
  const alreadyProcessed = newlyRetiredNotInArray.length > 0;

  let retiringPlayers: Player[] = [];
  if (!alreadyProcessed) {
    // First call - process retirements normally
    retiringPlayers = processRetirements(allPlayers, retiredPlayers, currentYear);
  } else {
    // Second call (React Strict Mode) - retirements already processed
    // Players are already marked as 'Retired', just add them to retiredPlayers array
    retiringPlayers = newlyRetiredNotInArray;
    retiredPlayers.push(...retiringPlayers);
  }

  // Remove retired players from teams
  teams.forEach((team) => {
    team.activePlayers = team.activePlayers.filter((p) => p.state !== 'Retired');
    if (team.benchPlayer && team.benchPlayer.state === 'Retired') {
      team.benchPlayer = undefined;
    }
    if (team.irPlayers && team.irPlayers.length > 0) {
      team.irPlayers = team.irPlayers.filter((p) => p.state !== 'Retired');
    }
  });

  // Remove retired players from free agents and add new season free agent
  const retiredIds = new Set(retiringPlayers.map((p) => p.id));
  const activeFreeAgents = freeAgents.filter((p) => !retiredIds.has(p.id));

  // Add 1-4 random new free agents at the beginning of each season (2-4 after year 2040)
  // Check if new players were already added for this year (prevents duplicate in React Strict Mode)
  const nextYear = currentYear + 1;
  const alreadyGeneratedThisYear = activeFreeAgents.some((p) => p.seasonGenerated === nextYear);

  let newSeasonFreeAgent: Player[] = [];
  if (!alreadyGeneratedThisYear) {
    // Include ALL players (including any already in activeFreeAgents) to prevent name collisions
    const allCurrentPlayers = getAllPlayers(teams).concat(activeFreeAgents);
    const usedNames = new Set(allCurrentPlayers.map((p) => p.name));
    // Generate random number of players between 1 and 4 (2-4 after year 2040)
    const minPlayers = nextYear > 2038 ? 2 : 1;
    const maxRange = nextYear > 2038 ? 3 : 4;
    const numberOfNewPlayers = Math.floor(Math.random() * maxRange) + minPlayers;
    newSeasonFreeAgent = generateReplacementPlayers(numberOfNewPlayers, usedNames);
    // Mark the new players with the year they were generated
    newSeasonFreeAgent.forEach((p) => {
      p.seasonGenerated = nextYear;
    });
  } else {
    // Use the already-generated player(s) for this year
    newSeasonFreeAgent = activeFreeAgents.filter((p) => p.seasonGenerated === nextYear);
  }

  // Update freeAgents array with non-retired players plus new players
  // Only include players that were in the original snapshot (excludes already-generated new players)
  const existingFreeAgents = activeFreeAgents.filter((p) => originalFreeAgentIds.has(p.id));

  // Create set of existing IDs to check for duplicates
  const existingIds = new Set(existingFreeAgents.map((p) => p.id));

  // Only add new players if they're not already in existingFreeAgents
  const newPlayersToAdd = newSeasonFreeAgent.filter((p) => !existingIds.has(p.id));

  freeAgents.length = 0;
  freeAgents.push(...existingFreeAgents, ...newPlayersToAdd);

  // Track all new free agents added this season
  const allNewFreeAgents = [...newSeasonFreeAgent];

  // Process player development (with guard for React Strict Mode)
  // Check if development was already processed by seeing if season history was already recorded
  // (since development happens after history recording)
  const activePlayersAfterRetirement = getAllPlayers(teams).concat(freeAgents);
  if (!alreadyRecorded) {
    processPlayerDevelopment(activePlayersAfterRetirement);
  }

  // Auto-swap bench players with active players if bench has higher overall (after development)
  processAllTeamAutoSwaps(teams);

  // Reset season stats
  resetSeasonStats(activePlayersAfterRetirement);

  // Reset team records
  resetTeamRecords(teams);

  const newYear = currentYear + 1;

  // Process Hall of Fame induction for the new year
  let newInductee: HallOfFameInductee | undefined = undefined;
  if (hallOfFame && newYear > 2040) {
    const inductee = processHallOfFameInduction(retiredPlayers, hallOfFame, newYear);
    if (inductee) {
      hallOfFame.push(inductee);
      newInductee = inductee;
    }
  }

  return {
    newYear,
    newGameDate: `${newYear}-01-01`,
    retiringPlayers,
    newFreeAgents: allNewFreeAgents,
    newInductee,
  };
};
