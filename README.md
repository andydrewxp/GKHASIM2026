# Googus Knee Hockey Association (GKHA)

A comprehensive knee hockey league simulation application built with React, TypeScript, and Vite. Experience the thrill of managing a sports league with realistic game simulations, player progression, achievements, and a complete season-to-season experience.

## Features

### Core Gameplay
- **Complete League Simulation**: Simulate games individually, in batches, or advance through entire seasons
- **Live Game View**: Watch games unfold play-by-play with real-time commentary and scoring
- **Player Management**: Track rosters with Forwards, Defenders, and Goalies, each with unique ratings and attributes
- **Injury & Suspension System**: Players can be injured or suspended, affecting team performance
- **Free Agency**: Pick up free agents to fill roster gaps and improve your team

### Statistics & History
- **Comprehensive Stats Tracking**: Monitor player performance including goals, assists, points, hits, and saves
- **League Leaders**: Track top performers across all statistical categories
- **Season History**: View past champions and statistical leaders for each completed season
- **Hall of Fame**: Retired players with outstanding legacies are inducted into the Hall of Fame
- **Legacy System**: Career achievement scoring for both players and teams

### Playoffs & Championships
- **Playoff System**: Top teams compete in semifinal and championship series
- **Best-of-3 Series**: Strategic playoff matchups with series tracking
- **Championship Records**: All-time records of league champions

### Social Features
- **GoogusNow Feed**: Twitter-style event feed with AI-generated commentary about games, injuries, trades, and achievements
- **Multiple Analysts**: Different commentator personalities provide varied perspectives
- **Achievement System**: Unlock achievements for various milestones and accomplishments

### Player Development
- **Player Ratings**: Overall, Forward, Defender, and Goalie ratings for each player
- **Potential Levels**: Players categorized as Bust, Standard, Star, or GOAT
- **Career Progression**: Players gain experience and age over seasons
- **Retirement System**: Players retire based on age and performance, with potential Hall of Fame induction

## Tech Stack

- **React 19**: Latest React with hooks and modern patterns
- **TypeScript**: Full type safety across the application
- **Vite**: Lightning-fast build tool and dev server
- **Cloudflare Workers**: Deployment via Wrangler for edge hosting
- **ESLint**: Code quality and consistency

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

### Development

```bash
# Run linter
npm run lint

# Generate Cloudflare types
npm run cf-typegen
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Calendar.tsx     # Game schedule view
│   ├── Stats.tsx        # Statistics & standings
│   ├── LiveGame.tsx     # Live game simulation
│   ├── Playoffs.tsx     # Playoff bracket view
│   ├── Roster.tsx       # Team roster management
│   ├── Achievements.tsx # Achievement tracking
│   ├── EventFeed.tsx    # Social feed component
│   └── ...
├── engine/              # Game logic & simulation
│   ├── gameSimulator.ts # Core game simulation
│   ├── seasonManager.ts # Season progression
│   ├── playoffsManager.ts # Playoff logic
│   ├── rosterManager.ts # Player & team management
│   ├── statsManager.ts  # Statistics tracking
│   └── ...
├── context/             # React context for state
├── data/                # Seed data
└── types.ts             # TypeScript definitions
```

## Game Mechanics

### Roster Composition
Each team has:
- 3 Active Players (1 Forward, 1 Defender, 1 Goalie)
- 1 Bench Player
- Unlimited IR (Injured Reserve) slots
- Unlimited Suspended Player slots

### Scoring System
- 2 points for a win
- 1 point for an overtime loss
- 0 points for a regulation loss

### Game Simulation
Games are simulated minute-by-minute with various events:
- Goals and assists
- Saves by goalies
- Hits between players
- Injuries and suspensions
- Overtime periods when needed

## Deployment

This project is configured for deployment to Cloudflare Pages:

```bash
npm run deploy
```

The application uses Cloudflare's edge network for fast, global distribution.
