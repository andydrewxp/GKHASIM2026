# Changelog

All notable changes to the Googus Knee Hockey Association (GKHA) simulator project will be documented in this file.

## [0.9.19] - 2025-12-07

### Added - Welcome Posts on Game Start

- Added two initial welcome posts that appear at the beginning of every new game on GoogusNow
- First post from @dj_devy_dev displays "Hello and Welcome to GKHA 2026!"
- Second post from @GKHAinside displays "Who's excited for some knockey!?"
- Posts appear in chronological order with the welcome post first
- **Component Changes:**
  - Updated [AppContext.tsx:4](src/context/AppContext.tsx#L4): Imported ACHIEVEMENT_ANALYST constant from seedData
  - Updated [AppContext.tsx:210-226](src/context/AppContext.tsx#L210-L226): Created two welcome posts in createDefaultState function with sequential timestamps
  - Updated [AppContext.tsx:237](src/context/AppContext.tsx#L237): Set feedPosts initial state to include both welcome posts

## [0.9.18] - 2025-11-29

### Added - Hall of Fame and Legacy Achievements

- Added three new achievements related to Hall of Fame inductions
- **Hall of Fame Opens**: Unlocks when the Hall of Fame becomes active (year > 2040), regardless of whether there are inductees
- **Legend Immortalized**: Unlocks when a player is inducted into the Hall of Fame
- **Hall of Legends**: Unlocks when 15 players have been inducted into the Hall of Fame
- Added new career milestone achievement
- **Legendary Status**: Unlocks when a player reaches 1000 career legacy score
- **Component Changes:**
  - Updated [AppContext.tsx:176-199](src/context/AppContext.tsx#L176-L199): Added three Hall of Fame achievements and one legacy achievement to default achievements list
  - Updated [achievementManager.ts:387-448](src/engine/achievementManager.ts#L387-L448): Created checkHallOfFameAchievements function to check for Hall of Fame milestone achievements
  - Updated [achievementManager.ts:345-358](src/engine/achievementManager.ts#L345-L358): Added career legacy milestone check to checkPlayerStatAchievements function
  - Updated [Playoffs.tsx:17](src/components/Playoffs.tsx#L17): Imported checkHallOfFameAchievements function
  - Updated [Playoffs.tsx:1129-1145](src/components/Playoffs.tsx#L1129-L1145): Integrated Hall of Fame achievement checks when year > 2040, triggering "Hall of Fame Opens" when Hall becomes active and other achievements based on inductee count

## [0.9.17] - 2025-11-29

### Fixed - Include Injured Players in Live Sim Final Stats

- Fixed issue where players who got injured during a game would not appear in the final stats table
- Players who score/assist/record stats and then get injured in the same game now correctly show their stats in the final statistics view
- Updated the assist calculation logic to account for injured players when determining teammates and scoring team
- **Component Changes:**
  - Updated [LiveGame.tsx:395](src/components/LiveGame.tsx#L395): Include IR players when initializing playerStats to capture players injured during the game
  - Updated [LiveGame.tsx:414-418](src/components/LiveGame.tsx#L414-L418): Include IR players when finding scoring team and teammates for assist calculation

## [0.9.16] - 2025-11-29

### Enhanced - Added Assists to Live Sim Final Stats

- Added assists column to the final stats table in live game simulations
- Removed "Official" from "Game Statistics" title for a cleaner presentation
- Updated stat headers to use full words "Goals" and "Assists" instead of abbreviations
- Assists are calculated based on goals scored with a 70% probability that a random teammate receives an assist
- Assists now display alongside goals, saves, and hits in the final statistics view
- Added spacing between final stats section and event list for better visual separation
- **Component Changes:**
  - Updated [LiveGame.tsx:484](src/components/LiveGame.tsx#L484): Changed title from "Official Game Statistics" to "Game Statistics"
  - Updated [LiveGame.tsx:391](src/components/LiveGame.tsx#L391): Added assists property to playerStats type definition
  - Updated [LiveGame.tsx:400](src/components/LiveGame.tsx#L400): Initialize assists to 0 for all players
  - Updated [LiveGame.tsx:413-422](src/components/LiveGame.tsx#L413-L422): Calculate assists when processing Goal events (70% chance per goal)
  - Updated [LiveGame.tsx:492-493](src/components/LiveGame.tsx#L492-L493): Changed home team stats headers from "G" and "A" to "Goals" and "Assists"
  - Updated [LiveGame.tsx:504](src/components/LiveGame.tsx#L504): Added assists stat value display for home team players
  - Updated [LiveGame.tsx:518-519](src/components/LiveGame.tsx#L518-L519): Changed away team stats headers from "G" and "A" to "Goals" and "Assists"
  - Updated [LiveGame.tsx:530](src/components/LiveGame.tsx#L530): Added assists stat value display for away team players
- **CSS Changes:**
  - Updated [App.css:808](src/App.css#L808): Added 30px top margin to event-list for spacing between final stats and event list

## [0.9.15] - 2025-11-29

### Enhanced - Move Return to Main Menu Button to Top

- Relocated the "Return to Main Menu" button from the bottom of the final stats view to the top of the page
- Allows users to quickly exit the final stats view without scrolling through all the statistics
- Provides immediate access to navigation once the game is complete
- **Component Changes:**
  - Updated [LiveGame.tsx:465-467](src/components/LiveGame.tsx#L465-L467): Moved return-button to appear before the FINAL header at the top of the game-complete section
  - Removed duplicate return-button from bottom of final stats section
- **CSS Changes:**
  - Updated [App.css:1035-1056](src/App.css#L1035-L1056): Changed margin-top to margin-bottom for proper spacing at the top position

## [0.9.14] - 2025-11-29

### Enhanced - Hide Live Game UI Elements After Completion

- Removed the "Live Game" header, running score display, venue information, and game controls (pause/resume and speed options) from the page once the game is complete
- These elements are now only visible during the live simulation and are replaced entirely by the final stats view when the game ends
- Creates a cleaner, more focused final stats presentation without distracting UI elements from the simulation phase
- **Component Changes:**
  - Updated [LiveGame.tsx:422-461](src/components/LiveGame.tsx#L422-L461): Wrapped the Live Game header, game-header, game-info, and game-controls sections in a conditional render that only displays when `!isComplete`

## [0.9.13] - 2025-11-29

### Enhanced - Official-Looking Final Stats View in Live Sim

- Completely redesigned the final stats view on the live game simulation to have a more professional, broadcast-quality appearance
- Replaced simple text-based final score with large, prominent score display featuring team names and scores in a structured layout
- Added "FINAL" header with bold, uppercase styling and dramatic text shadow for emphasis
- Created dedicated score display section with side-by-side team scores separated by a dash
- Added golden "OVERTIME" badge when games go to OT with prominent styling and shadow effects
- Transformed stats table into a proper table-like structure with column headers (Player, Pos, G, Saves, Hits)
- Changed stats display from inline conditional rendering to consistent tabular format with dashes for zero values
- Enhanced visual hierarchy with gradient backgrounds, borders, and refined spacing throughout
- Improved "Return to Main Menu" button with uppercase text, letter spacing, and enhanced hover effects
- Added comprehensive responsive styles for mobile devices to ensure proper display on all screen sizes
- **Component Changes:**
  - Updated [LiveGame.tsx:459-531](src/components/LiveGame.tsx#L459-L531): Restructured final stats display with dedicated score display section, overtime badge, table headers, and consistent stat value rendering
- **CSS Changes:**
  - Updated [App.css:841-916](src/App.css#L841-L916): Added styles for game-complete section including FINAL header, final-score-display, final-team-score, final-score-number, final-divider, and overtime-badge with dramatic styling
  - Updated [App.css:918-1033](src/App.css#L918-L1033): Redesigned final-stats section with official table-like structure including stats-header, improved column alignment, and refined player-stat-row styling
  - Updated [App.css:1035-1056](src/App.css#L1035-L1056): Enhanced return-button with uppercase text, letter spacing, border, and improved hover effects
  - Updated [App.css:1531-1576](src/App.css#L1531-L1576): Added comprehensive mobile responsive styles for final stats display ensuring proper sizing and layout on smaller screens

## [0.9.12] - 2025-11-29

### Enhanced - Live Sim Final Stats CSS

- Redesigned the final game statistics display with cleaner, more modern styling
- Added subtle background container with transparency for better visual hierarchy
- Improved player stat rows with hover effects and smooth transitions
- Enhanced spacing, borders, and typography for better readability
- Updated team headers with refined styling and better contrast
- Added minimum widths to stat items for consistent alignment
- **CSS Changes:**
  - Updated [App.css:859-941](src/App.css#L859-L941): Completely revised final stats styling with modern design patterns including transparent backgrounds, refined borders, hover effects, and improved spacing

## [0.9.11] - 2025-11-29

### Enhanced - Live Game Layout and CSS

- Improved the live game simulation to utilize full page width instead of being constrained to a narrow column
- Restructured the app layout so the live game view breaks out of the sidebar/main-content grid layout
- Enhanced CSS styling for better readability and visual presentation of the live game
- Added comprehensive styles for final game statistics display with better contrast and spacing
- Improved responsive design for mobile devices with adjusted padding and font sizes
- **Component Changes:**
  - Updated [App.tsx:108-128](src/App.tsx#L108-L128): Restructured the conditional rendering to wrap LiveGame in its own container outside of the app-content grid
- **CSS Changes:**
  - Updated [App.css:691-708](src/App.css#L691-L708): Added `.live-game-container` wrapper with full width and modified `.live-game` to use full width with proper padding
  - Updated [App.css:848-932](src/App.css#L848-L932): Added comprehensive styles for final stats display including team stats sections, player stat rows, and return button
  - Updated [App.css:1390-1409](src/App.css#L1390-L1409): Added responsive mobile styles for live game view

## [0.9.10] - 2025-11-29

### Added - Final Game Statistics Display in Live Sim

- Added a final game statistics display that shows after the live game simulation completes
- Statistics are calculated from all game events and displayed for each team
- Shows goals, saves, and hits for each player who participated in the game
- Players are listed with their name, position, and only the stats they recorded (stats with 0 values are not shown)
- The stats display appears between the final score message and the "Return to Main Menu" button
- **Component Changes:**
  - Updated [LiveGame.tsx:390-418](src/components/LiveGame.tsx#L390-L418): Added `playerStats` calculation that aggregates goals, saves, and hits from game events for all active players
  - Updated [LiveGame.tsx:476-512](src/components/LiveGame.tsx#L476-L512): Added final stats display section showing team-separated player statistics in the game complete screen

## [0.9.9] - 2025-11-29

### Fixed - OT Badge Display in Live Sim

- Fixed the OT badge to only appear in live game simulation once the overtime period actually begins (after minute 60)
- Previously, the OT badge would show from the start of the game if the game was predetermined to go to overtime
- **Component Changes:**
  - Updated [LiveGame.tsx:369-388](src/components/LiveGame.tsx#L369-L388): Added `currentMinute` tracking to determine the latest visible event minute and conditionally show OT badge only when `currentMinute > 60`
  - Updated [LiveGame.tsx:406](src/components/LiveGame.tsx#L406): Changed OT badge conditional from `game.overtime` to `showOT` variable

## [0.9.8] - 2025-11-29

### Fixed - Game End Event Timing in Live Sim

- Fixed game end event to occur at the same minute as the last goal scored instead of at a hardcoded minute
- For overtime games, the game end event now happens at the same minute as the OT goal (dynamically between 61-79) instead of always at minute 65
- For regulation games, the game end event continues to occur at minute 60 (when the last possible goal would have been scored)
- **Engine Changes:**
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L280-L386): Added `lastGoalMinute` tracking variable to capture the minute of the last goal and use it for the game end event timing

## [0.9.7] - 2025-11-29

### Enhanced - Overtime Hits and Saves in Live Sim

- Enhanced live game simulation to generate additional hits and saves during overtime period based on the length of overtime
- Overtime hits and saves are now scaled proportionally to the overtime duration using the same rate as regulation time
- For example, if overtime lasts 10 minutes (1/6 of regulation), approximately 1/6 of the normal hits and saves will be generated during OT
- This provides more realistic player statistics and a better visual representation of overtime action in the live sim
- **Engine Changes:**
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L311-L375): Added overtime duration calculation and proportional generation of hits and saves for the OT period

## [0.9.6] - 2025-11-29

### Changed - Live Game Return to Main Menu

- Modified live game to display a "Return to Main Menu" button after game completion instead of automatically returning after 2 seconds
- Users now have control over when to return to the main menu, allowing them to review the final game results at their own pace
- **Component Changes:**
  - Updated [LiveGame.tsx](src/components/LiveGame.tsx#L431-L433): Added "Return to Main Menu" button in game complete section
  - Updated [LiveGame.tsx](src/components/LiveGame.tsx#L344-L347): Removed automatic 2-second timeout that called onComplete

## [0.9.5] - 2025-11-29

### Fixed - Overtime Period Display in Live Sim

- Fixed issue where overtime games would show the final score after regulation instead of displaying a tied score followed by an overtime period
- Regulation time now ends with a tied score for games that go to overtime
- Added visible overtime goal event between minutes 61-79 to show which team scored the game-winning goal
- The live sim now properly displays the overtime period to users instead of just showing an "OT" badge without showing what happened
- **Root Cause:** The overtime flag wasn't being passed to `generateGameEvents`, so the function couldn't distinguish between regulation and overtime goals
- **Engine Changes:**
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L146-L160): Modified `generateGameEvents` to calculate regulation scores separately from final scores for OT games
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L263-L293): Added overtime goal event generation with special "OVERTIME GOAL!" description displayed after the 3rd period ends
- **Component Changes:**
  - Updated [LiveGame.tsx](src/components/LiveGame.tsx#L41-L45): Fixed to pass overtime flag to `generateGameEvents` before calling it, ensuring the function knows to separate regulation and OT goals

## [0.9.4] - 2025-11-29

### Changed - Live Game Event Display Order

- Modified live game event list to display most recent events at the top instead of at the bottom
- Events now appear in reverse chronological order for better visibility of the latest game action
- **Component Changes:**
  - Updated [LiveGame.tsx](src/components/LiveGame.tsx#L420-L427): Added `.slice().reverse()` to event list rendering to reverse display order

## [0.9.3] - 2025-11-29

### Fixed - Playoffs Not Starting After Simulating 10 Games

- Fixed issue where simulating 10 games that completed the regular season would not properly enable the "Start Playoffs" button
- Added explicit season completion check after all 10 games are simulated, matching the logic used in "Simulate Full Season"
- After the last game is simulated, the function now verifies all regular season games are final and sets `isSeasonComplete: true` if needed
- **Component Changes:**
  - Updated [SimulationControls.tsx](src/components/SimulationControls.tsx#L534-L560): Modified `simulateMultipleGames` function to include season completion verification after all games complete

## [0.9.2] - 2025-11-29

### Added - Feed Posts Limit

- Implemented a maximum limit of 300 googusnow (feed) posts to prevent excessive memory usage
- Once the limit is reached, older posts are automatically removed to make room for new posts
- The limit is enforced both in memory and when saving to localStorage
- Uses `.slice(-MAX_FEED_POSTS)` to keep the most recent 300 posts
- **Context Changes:**
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L11): Added `MAX_FEED_POSTS` constant set to 300
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L346-L352): Modified `saveState` to trim feedPosts before saving
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L355-L365): Modified auto-save useEffect to trim feedPosts in state when limit is exceeded

## [0.9.1] - 2025-11-29

### Changed - Team Legacy Display

- Updated team names in the Team Legacy view to display in white for better consistency with the Player Legacy view
- **Component Changes:**
  - Updated [Legacy.tsx](src/components/Legacy.tsx#L116): Added white color style to team name heading in team legacy cards

## [0.9.0] - 2025-11-29

### Fixed - Injury Recovery When Advancing to New Season

- Fixed injury logic to properly heal players during the offseason time jump when advancing from playoffs to January 1 of the new season
- Calculates the number of days between the championship date (June) and the new season start (January 1) and decrements all injury days accordingly
- Automatically processes IR returns for all healed players and creates appropriate feed posts
- Players who heal during the offseason are now correctly returned to active rosters or released to free agency based on their overall rating
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L985-L1067): Added injury recovery processing in `advanceToNextSeason` function to handle the time jump from playoffs to new season

## [0.8.9] - 2025-11-29

### Fixed - Simulate Entire Playoffs Button

- Fixed the "Simulate Entire Playoffs" button to properly simulate all playoff games in a single action
- Refactored `simulateEntirePlayoffs` function to use a single `setState` call with a while loop that processes all games within the state updater function
- The function now correctly handles championship series creation inline when semifinals are complete
- All game simulation logic (injuries, suspensions, achievements, feed posts, etc.) is now processed synchronously within the state update
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L483-L934): Completely rewrote `simulateEntirePlayoffs` to work with React state management and Strict Mode

## [0.8.8] - 2025-11-29

### Changed - Playoff Series Simulation Order

- Modified playoff series to only allow simulating one series at a time based on date order
- The series with the earliest game date must be completed before the next series can be simulated
- Removed "Simulate All Semifinal Games" and "Simulate All Championship Games" buttons
- Added visual indicator when a series is locked until the previous series completes
- Current game date now updates to match the playoff game's date when simulated
- **Engine Changes:**
  - Updated [playoffsManager.ts](src/engine/playoffsManager.ts#L210-L238): Added `getNextAvailableSeries` function to determine which series can be simulated based on game dates
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L12): Imported `getNextAvailableSeries` function
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L428-L429): Added logic to determine next available series based on date order
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L452): Added `isAvailable` check for each series
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L486-L489): Only show simulate button if series is available
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L492-L494): Show "Series locked" message for unavailable series
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L61-L282): Modified `simulateNextGame` to update `gameDate` to the playoff game's date and add championship post when championship series completes
  - Removed `simulateAllSemifinalGames` function (no longer needed)
  - Removed `simulateAllChampionshipGames` function (no longer needed)

### Added - Injury and Suspension Processing During Playoffs

- Injury and suspension return logic now applies during playoff games
- Injured players' injury days decrement after each playoff game
- Suspended players' suspension games decrement after each playoff game
- Players automatically return from IR when healed during playoffs
- Players automatically return from suspension when eligible during playoffs
- Feed posts are created for all injury and suspension returns during playoffs
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L14): Imported injury/suspension feed post creation functions
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L18): Imported `processAllTeamIRReturns` and `processAllTeamSuspensionReturns` from rosterManager
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L105-L259): Added complete injury recovery, suspension countdown, and automatic return processing to `simulateNextGame` function (matching regular season logic)

### Added - Injuries and Suspensions Can Occur During Playoff Games

- Players can now get injured during playoff games (same random chance as regular season)
- Players can now get suspended during playoff games (same random chance as regular season)
- Injured players are automatically moved to IR and replaced with bench player or free agent
- Suspended players are automatically moved to suspension list and replaced with bench player or free agent
- Feed posts are created for injuries, suspensions, IR moves, suspension list moves, and replacement signings
- Position switches occur when needed for replacement players
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L14): Imported additional feed post creation functions for injuries and suspensions
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L18): Imported `applyInjury`, `applySuspension`, `findBestReplacement`, and `switchPlayerPosition` from rosterManager
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L19): Imported `checkForInjuries` and `checkForSuspensions` from gameSimulator

### Added - Simulate Entire Playoffs

- Added "Simulate Entire Playoffs" button that simulates all remaining playoff games at once
- Button is visible when playoffs have started but championship hasn't been won yet
- Automatically simulates all semifinal games, starts championship series, and simulates championship games
- Includes all injury and suspension logic for each game (occurrence, processing, returns)
- Updates game date for each playoff game simulated
- Creates feed posts for all playoff events (game results, injuries, suspensions, returns)
- **Component Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L483-L734): Added `simulateEntirePlayoffs` function
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L937-L939): Added "Simulate Entire Playoffs" button in UI
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L106-L275): Added injury and suspension checking after playoff game simulation with automatic roster management (matching regular season logic)

## [0.8.7] - 2025-11-29

### Changed - Event Feed Post Styling

- Updated achievement post border color from gold to neon green (#39ff14)
- Updated Hall of Fame post border color to gold (#FFD700)
- **Styling Changes:**
  - Updated [App.css](src/App.css#L577-L585): Changed `.feed-post.achievement` to use neon green border and glow
  - Updated [App.css](src/App.css#L582-L585): Added `.feed-post.hall-of-fame` with golden border and glow
  - Updated [EventFeed.tsx](src/components/EventFeed.tsx#L19): Added conditional 'hall-of-fame' class for Hall of Fame posts

### Changed - Hall of Fame Voting System

- Added probabilistic voting for Hall of Fame induction based on legacy score
- Players with 600+ legacy are guaranteed induction (if highest eligible)
- Players with 550-599 legacy have only a 30% chance of induction each year
- **Engine Changes:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L560-L616): Modified `processHallOfFameInduction` to include random voting chance for players in 550-599 legacy range

### Added - Hall of Fame Retirement Year Display

- Added retirement year tracking and display to Hall of Fame inductee cards
- Retirement year is now stored when players retire and displayed below induction year with matching italic gold styling
- **Type Changes:**
  - Updated [types.ts](src/types.ts#L26-L35): Added `retirementYear` field to HallOfFameInductee interface
  - Updated [types.ts](src/types.ts#L58): Added `retirementYear` field to Player interface to track when players retire
- **Engine Changes:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L143-L146): Added `currentYear` parameter to `processRetirements` function
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L214): Set `player.retirementYear` when player retires
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L229): Set `ericSudhoff.retirementYear` when he retires with Tim Winters
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L786): Pass `currentYear` to `processRetirements` call
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L630-L644): Updated `processHallOfFameInduction` to use player's actual `retirementYear` instead of calculating it
- **Component Changes:**
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L139): Added retirement year paragraph below induction year
- **Styling Changes:**
  - Updated [App.css](src/App.css#L1216-L1221): Added `.retirement-year` class with italic gold styling matching `.induction-year`

## [0.8.6] - 2025-11-28

### Added - Hall of Fame System

- Added Hall of Fame feature to honor retired players with exceptional legacy scores
- Hall of Fame tab appears under History after the year 2040
- Induction logic runs automatically at the start of each season after 2040:
  - Only retired players with legacy scores over 600 are eligible
  - Maximum one player inducted per year (the player with the highest legacy score)
  - Minimum zero players inducted per year if no eligible players exist
- Hall of Fame display features:
  - Gold-themed cards with trophy icon and gradient background
  - Shows induction year, legacy score, position, and career stats
  - Cards displayed in reverse chronological order (newest first)
- Feed posts generated for Hall of Fame announcements by @dj_devy_dev analyst
  - Induction posts created when a player is inducted with their name and legacy score
  - No induction posts created when no players meet the criteria (no golden border)
  - Induction posts use 'Hall Of Fame' type with distinctive golden border styling
  - 4px solid gold (#FFD700) border with gradient background and golden glow effect
- **Type Changes:**
  - Updated [types.ts](src/types.ts#L25-L34): Added `HallOfFameInductee` interface
  - Updated [types.ts](src/types.ts#L128): Added 'Hall Of Fame' to FeedPost type union
  - Updated [types.ts](src/types.ts#L172): Added `hallOfFame` array to AppState
- **Component Changes:**
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L4): Added 'Hall of Fame' view to history navigation
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L33-L40): Hall of Fame button conditionally shown after 2040
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L130-L192): Added Hall of Fame view rendering
  - Updated [EventFeed.tsx](src/components/EventFeed.tsx#L19): Added 'hall-of-fame' CSS class for Hall of Fame posts
- **Engine Changes:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L563-L603): Added `processHallOfFameInduction` function
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L826-L834): Integrated Hall of Fame induction into season advancement
  - Updated [eventFeed.ts](src/engine/eventFeed.ts#L432-L448): Added `createHallOfFameInductionPost` function
  - Updated [eventFeed.ts](src/engine/eventFeed.ts#L450-L466): Added `createHallOfFameNoInductionPost` function
- **Context Changes:**
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L198): Initialize `hallOfFame` as empty array in default state
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L328-L331): Migration logic to add `hallOfFame` to existing saves
- **Playoff Changes:**
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L13): Import both Hall of Fame post creation functions
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L284): Pass `hallOfFame` array to `advanceSeason`
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L321-L340): Create feed post for induction or no induction after 2040
- **Styling:**
  - Updated [App.css](src/App.css#L1151-L1249): Added comprehensive Hall of Fame card styling with gold theme
  - Updated [App.css](src/App.css#L594-L598): Added `.feed-post.hall-of-fame` styling for GoogusNow posts

## [0.8.5] - 2025-11-28

### Added - Team Legacy System

- Added legacy points system for teams to track franchise achievements across seasons and games
- Teams earn legacy points based on season performance:
  - +10 for making the playoffs
  - +15 additional for making the finals
  - +25 additional for winning the championship
  - +10 for most goals scored in a season
  - +10 for allowing the least goals in a season
- Teams earn legacy points during games (regular season and playoffs):
  - +1 for scoring 7+ goals in a game
  - +1 for a shutout (allowing 0 goals in a game)
- **Type Changes:**
  - Updated [types.ts](src/types.ts#L48-L64): Added `legacy: number` attribute to Team interface
- **Data Changes:**
  - Updated [seedData.ts](src/data/seedData.ts#L429-L444): Initialize all teams with `legacy: 0`
- **Season Manager Changes:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L560-L608): Created `awardTeamLegacyPoints()` function to award team legacy points at season end
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L663): Call `awardTeamLegacyPoints()` during season advancement
- **Game Simulation Changes:**
  - Updated [SimulationControls.tsx](src/components/SimulationControls.tsx#L120-L135): Award legacy points after each regular season game for 7+ goals and shutouts
  - Updated [playoffsManager.ts](src/engine/playoffsManager.ts#L121-L136): Award legacy points after each playoff game for 7+ goals and shutouts
- **UI Changes:**
  - Updated [Legacy.tsx](src/components/Legacy.tsx): Added Player/Team sub-navigation using "toggle" CSS class to match Leaders component styling, added "Legacy" h2 header
  - Player legacy view shows all players (active, free agents, retired) ranked by legacy points
  - Team legacy view shows all teams ranked by legacy points with championship count displayed
- Previous functionality remains intact: player legacy system continues to work as before

## [0.8.4] - 2025-11-28

### Changed - Legacy Tab Organization

- Moved the Legacy sub-option from the History tab to the Stats tab for better organization
- **Component Changes:**
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx): Removed Legacy sub-option, removed getAllPlayers import, removed Legacy view section
  - Updated [Stats.tsx](src/components/Stats.tsx): Added Legacy sub-option to StatsView type, added Legacy button to navigation, added Legacy view rendering
  - Created [Legacy.tsx](src/components/Legacy.tsx): New component containing the Legacy view logic and UI extracted from LeagueHistory
- Legacy rankings now appear under Stats tab alongside Standings and Leaders
- Previous functionality remains intact: all History tab features (Past Season Results, Retired Players) continue to work as before

## [0.8.3] - 2025-11-28

### Added - Eric "Suddy" Sudhoff Special Player

- Added Eric "Suddy" Sudhoff as a new free agent player who starts at the beginning of the simulation
- Eric Sudhoff has unique progression mechanics:
  - Always has Bust potential
  - Does not progress through normal player development system
  - Ratings are always exactly 1 point lower than Tim Winters' ratings in all categories (forward, defender, goalie)
  - Starting ratings: 54 forward, 55 defender, 59 goalie (1 lower than Tim Winters' 55/56/60)
- **Data Model Changes:**
  - Updated [seedData.ts](src/data/seedData.ts#L464-L482): Added Eric Sudhoff to initial free agents with nickname "Suddy", set potential to Bust
- **Progression Logic:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L27-L140): Modified `processPlayerDevelopment()` to:
    - Skip Eric Sudhoff during normal progression loop
    - Sync Eric Sudhoff's ratings to Tim Winters minus 1 AFTER all other players have completed their development
    - This ensures the synchronization happens after Tim Winters has progressed, maintaining the exact 1-point difference
- **Retirement Logic:**
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L150-L230): Modified `processRetirements()` to:
    - Skip Eric Sudhoff during normal retirement processing
    - Track when Tim Winters retires
    - Only retire Eric Sudhoff if Tim Winters retires
    - Eric Sudhoff will never retire independently, ensuring he remains active as long as Tim Winters is active

## [0.8.2] - 2025-11-28

### Added - Player Nicknames

- Added optional `nickname` field to the `Player` interface in [types.ts](src/types.ts#L29)
- Auto-generated players now have a 1 in 20 (5%) chance of receiving a random nickname from a pool of 14 options: Tank, Bear, Money, Ace, Spidey, Bobo, Mammoth, Cash, The Joker, Doc, Nugget, Pickles, Stinky, Pancake
- Assigned specific nicknames to initial players:
  - Collin Salatto: "Googus"
  - Joe O'Donnell: "Fienders"
  - Chris Papa: "Commish"
  - Austin Ingarra: "Safari Master"
  - Ricky Novia: "The Animal"
  - Quinn Donahue: "Diesel"
- **Initial Player Generation:**
  - Updated `createPlayer()` function in [seedData.ts](src/data/seedData.ts#L240-L241) to assign random nicknames
  - Updated `createSpecificPlayer()` function in [seedData.ts](src/data/seedData.ts#L268) to support optional nickname parameter
  - Created `getPlayerNickname()` helper function in [seedData.ts](src/data/seedData.ts#L371-L381) to assign nicknames to specific players
- **Offseason Player Generation:**
  - Added NICKNAMES array to [seasonManager.ts](src/engine/seasonManager.ts#L294-L309)
  - Updated `generateReplacementPlayers()` function in [seasonManager.ts](src/engine/seasonManager.ts#L378-L379) to assign random nicknames to offseason replacement players with same 1 in 20 probability
- **UI Display:**
  - Updated [Roster.tsx](src/components/Roster.tsx#L37-L38) to display player nicknames in the detailed stats dropdown section when expanded
  - Nicknames appear as the first stat item when present: `Nickname: "Player Nickname"`
  - Updated [eventFeed.ts](src/engine/eventFeed.ts#L14-L22) to display player nicknames in GoogusNow feed posts
  - Created `formatPlayerName()` helper function that formats player names with nicknames between first and last name (e.g., `Austin "Safari Master" Ingarra`)
  - Updated 8 feed post generation functions to use the `formatPlayerName()` helper for nickname display: signings, IR returns (active and bench), retirements, suspension returns (active and bench), position switches, and new free agents
  - The following 5 post types intentionally exclude nicknames to maintain formal/serious tone: injuries, suspensions, releases, IR placements, and suspension list moves

## [0.8.1] - 2025-11-28

### Added - Legacy Stat System

- Added a new "Legacy" stat to track player career achievements and accomplishments
- **Data Model Changes:**
  - Updated [types.ts](src/types.ts#L14-L23): Added `legacy?: number` field to `PlayerStats` interface (line 22)
  - Updated [seedData.ts](src/data/seedData.ts#L5-L14): Initialize legacy to 0 for all new players
  - Updated [seasonManager.ts](src/engine/seasonManager.ts#L367-L390): Initialize legacy to 0 for generated replacement players
  - Updated [statsManager.ts](src/engine/statsManager.ts#L81-L94): Preserve legacy score when resetting season stats (line 91)
- **Legacy Point Awards:**
  - Created `awardLegacyPoints()` function in [seasonManager.ts](src/engine/seasonManager.ts#L396-L486):
    - +5 points: Team makes playoffs
    - +15 points: Team makes finals
    - +50 points: Team wins championship
    - +25 points: Lead league in goals, assists, saves, or hits
    - +10 points: Lead league in points
    - +5 points: Finish 2nd-5th in any stat category
  - Integrated legacy point awards in `advanceSeason()` function (line 538-541)
  - Updated [Playoffs.tsx](src/components/Playoffs.tsx#L257-L284): Pass playoff and finalist team names to `advanceSeason()` for legacy calculations
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L364-L367): Award +1 legacy for hat tricks (3+ goals in a single game)
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L396-L399): Award +1 legacy for exceptional goaltending (10+ saves in a single game)
  - Updated [gameSimulator.ts](src/engine/gameSimulator.ts#L407-L410): Award +1 legacy for physical dominance (10+ hits in a single game)
- **UI Display Updates:**
  - Updated [statsManager.ts](src/engine/statsManager.ts#L9-L37): Added 'legacy' as a supported category for `getLeagueLeaders()` and `getTopLeader()` functions
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L5): Added 'Legacy' as third sub-navigation option under History tab
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L139-L181): Created enhanced Legacy view with:
    - Card-based layout displaying all players ranked by legacy score
    - Gold (#FFD700) ranking numbers and legacy score highlighting
    - Player name, position, and status (Active/Retired/Free Agent) badges
    - Retired players shown with light blue (#87CEEB) border and name styling
    - Hover effects with transform and shadow animations
    - Responsive card design with centered layout (max-width: 800px)
  - Added comprehensive CSS styling in [App.css](src/App.css#L438-L541):
    - `.legacy-list`: Flexbox column layout with 15px gap
    - `.legacy-card`: Card component with green background, white border, hover effects
    - `.legacy-rank`: Gold-colored ranking display with text shadow
    - `.legacy-player-info`: Player details section with name and badges
    - `.legacy-status`: Colored status badges (Retired: light blue, Active: green, Free Agent: gray)
    - `.legacy-score`: Gold-bordered score display box with large value
  - Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx#L126-L129): Display legacy stat for retired players in Retired Players view
  - Updated [Roster.tsx](src/components/Roster.tsx#L46): Display career legacy score in player detailed stats
- **Data Migration:**
  - Updated [AppContext.tsx](src/context/AppContext.tsx#L266-L272): Added migration logic to initialize legacy field for existing saved data
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.8.0] - 2025-11-28

### Added - Stats Main Menu with Sub-Navigation

- Created new [Stats.tsx](src/components/Stats.tsx) component that combines Standings and Leaders views with sub-navigation
- Updated [App.tsx](src/App.tsx) to replace separate "Standings" and "Leaders" menu items with a single "Stats" menu item
  - Changed `View` type from including 'standings' and 'leaders' to just 'stats' (line 14)
  - Updated imports to use `Stats` component instead of individual `Standings` and `LeagueLeaders` imports (lines 4-12)
  - Replaced navigation buttons for Standings and Leaders with a single Stats button (lines 63-68)
  - Updated main content rendering to show Stats component (line 118)
  - Changed default view to 'stats' (line 27)
- Stats component features:
  - Two sub-navigation buttons: "Standings" and "Leaders" (lines 15-27 in Stats.tsx)
  - `useState` hook to toggle between the two views (line 8)
  - Renders existing Standings and LeagueLeaders components based on active view (lines 31-34)
- Added CSS styling in [App.css:169-200](src/App.css#L169-L200):
  - `.stats` and `.stats h2` for main stats container
  - `.stats-nav` for sub-navigation button container
  - `.stats-nav button` and `.stats-nav button.active` for button styling with hover and active states
- Navigation now shows: Stats | History | GoogusNow | Calendar | Playoffs | Roster | Achievements
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

### Added - League History Sub-Navigation with Retired Players View

- Updated [LeagueHistory.tsx](src/components/LeagueHistory.tsx) to include two sub-navigation options:
  - **Past Season Results**: Displays the existing season history with champions and stat leaders (lines 36-61)
  - **Retired Players**: Displays career stats for all retired players with minimum 30 games played (lines 64-123)
- Added `useState` hook to manage the active view between the two options (line 8)
- Retired Players view shows comprehensive career information:
  - Player name, position, years of experience, and final age
  - Complete career stats including games played, goals, assists, points, hits
  - Additional goalie-specific stat (saves) for retired goalies
- Added sub-navigation buttons with active state styling (lines 20-33)
- Updated CSS in [App.css:258-403](src/App.css#L258-L403) with new styles:
  - `.history-nav` for sub-navigation button container
  - `.history-nav button` and `.history-nav button.active` for button styling
  - `.retired-players-list` with responsive grid layout
  - `.retired-player-card`, `.retired-player-header`, `.player-position` for retired player cards
  - `.stats-grid`, `.stat-item`, `.stat-label`, `.stat-value` for career statistics display
- Utilizes existing `state.retiredPlayers` array from AppState
- Filters retired players to only show those with 30+ career games played (lines 11-13)
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.24] - 2025-11-28

### Fixed - League History Empty State Text Color

- Updated CSS styling in [App.css:254-256](src/App.css#L254-L256) to make the "No historical data yet" message text white instead of blue
- Added `.league-history p` style rule with `color: white` to ensure proper visibility against the dark green background
- Previous functionality remains intact

## [0.7.23] - 2025-11-27

### Updated - Initial Random Free Agent Rating Range

- Updated `generateThreePositionRatings()` function in [seedData.ts:181](src/data/seedData.ts#L181)
- Changed initial random free agent primary rating range from 65-90 to 65-70
- This ensures the one random free agent generated at game start matches the same rating range as offseason-generated replacement players
- Previous functionality remains intact

## [0.7.22] - 2025-11-27

### Updated - Offseason Player Improvement Ranges by Potential

- Updated offseason player development logic in [seasonManager.ts:71-98](src/engine/seasonManager.ts#L71-L98)
- Changed improvement ranges when players practice to be differentiated by all four potential types:
  - **Goat**: +2 to +4 (previously +1 to +4)
  - **Star**: +1 to +3 (unchanged)
  - **Standard**: +1 to +2 (previously +1 to +3)
  - **Bust**: +1 only (previously +1 to +3)
- This creates a more distinct progression curve where higher potential players have better growth potential
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.21] - 2025-11-27

### Fixed - Player Name Generation Improvements

- Updated `generatePlayerName()` function in [seedData.ts:104](src/data/seedData.ts#L104) to prevent first name and last name from being the same
- Updated `generateReplacementPlayers()` function in [seasonManager.ts:270](src/engine/seasonManager.ts#L270) to prevent first name and last name from being the same in offseason-generated players
- Added "Jr." suffix to 1 in every 30 offseason-generated players for added name variety in [seasonManager.ts:283](src/engine/seasonManager.ts#L283)
- Added hyphenated last names to 1 in every 60 offseason-generated players (when not already a Jr.) for additional variety in [seasonManager.ts:288](src/engine/seasonManager.ts#L288)
  - Examples: "Connor Smith-Johnson", "Tyler Garcia-Martinez"
- Added Tim Winters as a new starting free agent in [seedData.ts:431](src/data/seedData.ts#L431)
  - Position: Forward
  - All ratings: 66 (Forward, Defender, Goalie)
- Removed duplicate first names from the `FIRST_NAMES` constant: 'Drew', 'Shawn', 'Owen', 'Blake', 'Ivan', 'Logan' (kept 5 intentional 'Chauncey' entries)
- Removed duplicate last names from the `LAST_NAMES` constant: 'Adams', 'Allen', 'Austin', 'Beck', 'Brooks' (appeared 3 times), 'Davis', 'Douglas', 'Harris', 'King', 'Lewis', 'Stone', 'Warren'
- These changes ensure more variety in randomly generated player names and prevent awkward names like "Blake Blake" or "King King" in both initial generation and offseason replacement players
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.20] - 2025-11-27

### Fixed - Season Stats Reset for Suspended Players

- Fixed bug where suspended players' season stats were not being reset between seasons, causing `gamesPlayed` to accumulate beyond the 20-game regular season limit
- Updated `getAllPlayers()` function in [statsManager.ts:120-122](src/engine/statsManager.ts#L120-L122) to include `suspendedPlayers` array
- This ensures suspended players are included when:
  - Resetting season stats at the end of each season
  - Calculating stat leaders
  - Checking for name collisions when generating new players
  - Displaying league leader statistics
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.19] - 2025-11-27

### Updated - Achievement Thresholds

- Updated three achievement thresholds to make them more challenging:
  - "Wall" - Changed from 175 to 180 saves in a single season
  - "Brick Wall" - Changed from 1500 to 2500 career saves
  - "Intimidator" - Changed from 1500 to 2000 career hits
- Updated achievement descriptions in [AppContext.tsx:144-165](src/context/AppContext.tsx#L144-L165)
- Updated checking logic in [achievementManager.ts:287-343](src/engine/achievementManager.ts#L287-L343)
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.18] - 2025-11-27

### Added - Dynasty Achievement

- Added new consecutive championship achievement:
  - "Dynasty" - Unlocked when a team wins 3 consecutive championships
- Created new achievement definition in [AppContext.tsx:167-172](src/context/AppContext.tsx#L167-L172)
- Implemented `checkConsecutiveChampionshipAchievement()` function in [achievementManager.ts:349-385](src/engine/achievementManager.ts#L349-L385) to check season history for consecutive championships
- Integrated achievement check into playoffs completion flow in [Playoffs.tsx:347-361](src/components/Playoffs.tsx#L347-L361)
- Check runs after championship is determined and season history is updated
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.17] - 2025-11-27

### Added - Hits Milestone Achievements

- Added two new hits milestone achievements to the game:
  - "Enforcer" - Unlocked when a player records 150 hits in a single season
  - "Intimidator" - Unlocked when a player reaches 1500 career hits
- Created new achievement definitions in [AppContext.tsx:155-166](src/context/AppContext.tsx#L155-L166)
- Updated `checkPlayerStatAchievements()` function in [achievementManager.ts:317-343](src/engine/achievementManager.ts#L317-L343) to check for hits milestones
- Achievement checks are integrated into existing game simulation flow (both instant and live games)
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.16] - 2025-11-27

### Added - Saves Milestone Achievements

- Added two new saves milestone achievements for goalies:
  - "Wall" - Unlocked when a goalie records 175 saves in a single season
  - "Brick Wall" - Unlocked when a goalie reaches 1500 career saves
- Created new achievement definitions in [AppContext.tsx:143-154](src/context/AppContext.tsx#L143-L154)
- Updated `checkPlayerStatAchievements()` function in [achievementManager.ts:287-315](src/engine/achievementManager.ts#L287-L315) to check for saves milestones
- Added proper undefined checks for saves stat (as it only exists for goalies)
- Achievement checks are integrated into existing game simulation flow (both instant and live games)
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.15] - 2025-11-27

### Added - Points Milestone Achievements

- Added two new points milestone achievements to the game:
  - "Point Producer" - Unlocked when a player scores 60 points in a single season
  - "Elite Scorer" - Unlocked when a player reaches 750 career points
- Created new achievement definitions in [AppContext.tsx:131-142](src/context/AppContext.tsx#L131-L142)
- Updated `checkPlayerStatAchievements()` function in [achievementManager.ts:259-285](src/engine/achievementManager.ts#L259-L285) to check for points milestones
- Achievement checks are integrated into existing game simulation flow (both instant and live games)
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.14] - 2025-11-27

### Added - Assist Milestone Achievements

- Added two new assist milestone achievements to the game:
  - "Playmaker" - Unlocked when a player records 25 assists in a single season
  - "Master Distributor" - Unlocked when a player reaches 200 career assists
- Created new achievement definitions in [AppContext.tsx:119-130](src/context/AppContext.tsx#L119-L130)
- Updated `checkPlayerStatAchievements()` function in [achievementManager.ts:231-257](src/engine/achievementManager.ts#L231-L257) to check for assist milestones
- Achievement checks are integrated into existing game simulation flow (both instant and live games)
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.13] - 2025-11-27

### Added - Player Milestone Achievements

- Added two new player milestone achievements to the game:
  - "Fifty Goals" - Unlocked when a player scores 50 goals in a single season
  - "The Great One" - Unlocked when a player reaches 600 career goals
- Created new achievement definitions in [AppContext.tsx:107-118](src/context/AppContext.tsx#L107-L118)
- Implemented `checkPlayerStatAchievements()` function in [achievementManager.ts:188-233](src/engine/achievementManager.ts#L188-L233) to check for player stat milestones
- Integrated achievement checks into game simulation flow:
  - [SimulationControls.tsx:72-86](src/components/SimulationControls.tsx#L72-L86) - Checks all players after each simulated game
  - [LiveGame.tsx:105-119](src/components/LiveGame.tsx#L105-L119) - Checks all players after live game completion
- Achievement posts appear in GoogusNow feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.12] - 2025-11-27

### Added - Hits to League Leaders and History

- Added hits stat to League Leaders page in [LeagueLeaders.tsx:18,83-92](src/components/LeagueLeaders.tsx#L18)
- Added hits stat to League History page in [LeagueHistory.tsx:25](src/components/LeagueHistory.tsx#L25)
- Updated `getLeagueLeaders()` and `getTopLeader()` functions in [statsManager.ts:11,32](src/engine/statsManager.ts#L11) to support 'hits' category
- Updated `SeasonHistory` interface in [types.ts:127](src/types.ts#L127) to track hits leader for each season
- Updated season history tracking in [seasonManager.ts:292,313-315](src/engine/seasonManager.ts#L292) to record hits leader
- Added data migration in [AppContext.tsx:245-252](src/context/AppContext.tsx#L245-L252) to ensure existing season history includes hits stat leader
- Hits leaders now displayed alongside Goals, Assists, Points, and Saves in both current season and historical records
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.11] - 2025-11-27

### Added - Hits Stat

- Added hits as a new tracked statistic for all players
- Updated `PlayerStats` interface in [types.ts:19](src/types.ts#L19) to include `hits` field
- Updated `GameEvent` type in [types.ts:88](src/types.ts#L88) to include 'Hit' as a valid event type
- Implemented hit generation in [gameSimulator.ts:221-256](src/engine/gameSimulator.ts#L221-L256):
  - 15-30 hits generated per game
  - Position-based probabilities: Defenders 60%, Forwards 35%, Goalies 5%
  - Defenders are most likely to deliver hits, goalies are least likely
- Hit events appear in live game simulation with description "{player} delivers a big hit!"
- Updated `updatePlayerStats()` in [gameSimulator.ts:392-396](src/engine/gameSimulator.ts#L392-L396) to track hits in both season and career stats
- Updated `resetSeasonStats()` in [statsManager.ts:88](src/engine/statsManager.ts#L88) to reset hits at season end
- Initialized hits to 0 for new players in [seasonManager.ts:250,259](src/engine/seasonManager.ts#L250) and [seedData.ts:10](src/data/seedData.ts#L10)
- Added data migration in [AppContext.tsx:193-199](src/context/AppContext.tsx#L193-L199) to ensure existing saved games initialize hits to 0
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.10] - 2025-11-27

### Changed - Maximum Player Overall Increased

- Maximum player overall rating increased from 95 to 99
- Updated `processPlayerDevelopment()` function in [seasonManager.ts:75-77](src/engine/seasonManager.ts#L75-L77) to cap ratings at 99 instead of 95
- Players can now reach higher overall ratings through development
- All position-specific ratings (forwardRating, defenderRating, goalieRating) now capped at 99
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.9] - 2025-11-27

### Changed - Jar of Peanut Butter Special Potential Distribution

- "Jar of Peanut Butter" now has a special potential distribution, limited to only Star or Bust
- Updated `createSpecificPlayer()` function in [seedData.ts:195-203](src/data/seedData.ts#L195-L203) to assign custom potential for this player
- Jar of Peanut Butter potential probabilities:
  - **Star**: 3 out of 25 times (12% chance)
  - **Bust**: 22 out of 25 times (88% chance)
  - **Goat**: Never (0% chance)
  - **Standard**: Never (0% chance)
- This creates a high-risk, high-reward dynamic for this unique player
- With 88% chance of Bust (30% practice rate), most Jar of Peanut Butter players will struggle to improve
- With 12% chance of Star (80% practice rate), lucky players get a legendary long-term asset
- Combined with immunity to age penalties and retirement at 100, creates an interesting gamble
- All other players maintain normal potential distribution (1/25 Goat, 7/25 Star, 12/25 Standard, 5/25 Bust)
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.8] - 2025-11-27

### Changed - Jar of Peanut Butter Immune to Age Penalties

- "Jar of Peanut Butter" is now immune to age-based practice penalties in player development
- Updated `processPlayerDevelopment()` function in [seasonManager.ts:54-67](src/engine/seasonManager.ts#L54-L67) to exempt this special player from age restrictions
- Jar of Peanut Butter can now continue to practice and improve after age 35, unlike all other players
- This special player maintains full practice probability based on potential throughout their entire career
- Combined with their special retirement age of 100, this creates a truly legendary player arc
- All other players still follow normal age-based practice decline (0% at age 35+)
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.7] - 2025-11-27

### Changed - Retirement Post Threshold

- Retirement posts are now only created for players with more than 30 career games played
- Updated retirement post logic in [Playoffs.tsx:272-275](src/components/Playoffs.tsx#L272-L275) to check `player.careerStats.gamesPlayed > 30` before creating post
- Prevents cluttering the event feed with retirement announcements for players who barely played
- Players with 30 or fewer career games still retire normally, but no public announcement is made
- Previous functionality remains intact

## [0.7.6] - 2025-11-27

### Changed - Potential-Based Retirement Rates

- Players with higher potential now have longer careers due to their exceptional talent and drive
- Updated `processRetirements()` function in [seasonManager.ts:136-142](src/engine/seasonManager.ts#L136-L142) to apply potential-based retirement multipliers
- Retirement probability adjustments by potential:
  - **Bust, Standard**: No change (100% of base retirement probability)
  - **Star**: 90% of base retirement probability (10% reduction)
  - **Goat**: 50% of base retirement probability (50% reduction)
- Example: A 35-year-old Standard player has 15% retirement chance, while a Star has 13.5% and a Goat has only 7.5%
- Example: A 40-year-old Standard player has 40% retirement chance, while a Star has 36% and a Goat has only 20%
- Goat and Star players will have longer careers on average, maximizing their value to teams
- Makes drafting and developing high-potential players even more strategically important
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.5] - 2025-11-27

### Changed - Enhanced Goat Player Development

- Goat potential players can now improve by up to 4 rating points per offseason (instead of 3)
- Updated `processPlayerDevelopment()` function in [seasonManager.ts:71-74](src/engine/seasonManager.ts#L71-L74) to use potential-based improvement ranges
- Improvement ranges by potential:
  - **Bust, Standard, Star**: +1 to +3 rating points (unchanged)
  - **Goat**: +1 to +4 rating points (new)
- Makes Goat potential players even more valuable for long-term team building
- When combined with their 98% practice probability, Goat players will develop significantly faster
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.4] - 2025-11-27

### Fixed - Player Development Double Execution in React Strict Mode

- Fixed issue where player development was running twice due to React Strict Mode
- Added guard in `advanceSeason()` function in [seasonManager.ts:400-402](src/engine/seasonManager.ts#L400-L402) to prevent `processPlayerDevelopment()` from executing twice
- Guard checks if season history was already recorded (indicating the function has already run)
- Players will now only improve or regress once per season instead of potentially twice
- This fix ensures consistent and predictable player development
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.3] - 2025-11-27

### Changed - Age-Based Player Development Penalties

- Player development now includes age-based penalties, making older players less likely to improve
- Updated `processPlayerDevelopment()` function in [seasonManager.ts:26-89](src/engine/seasonManager.ts#L26-L89) to apply age multipliers
- Age-based practice probability:
  - **Under 30**: Full practice probability based on potential (no penalty)
  - **Age 30**: 100% of base probability (e.g., Goat: 95% → 95%)
  - **Age 31**: 80% of base probability (e.g., Goat: 95% → 76%)
  - **Age 32**: 60% of base probability (e.g., Goat: 95% → 57%)
  - **Age 33**: 40% of base probability (e.g., Goat: 95% → 38%)
  - **Age 34**: 20% of base probability (e.g., Goat: 95% → 19%)
  - **Age 35+**: 0% practice probability (always regress)
- Older players will naturally decline in skill over time, making younger players more valuable
- Creates realistic aging curves where veteran players eventually lose their edge
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.2] - 2025-11-27

### Changed - Player Development Influenced by Potential

- Player rating updates at the end of the season are now influenced by the potential attribute
- Updated `processPlayerDevelopment()` function in [seasonManager.ts:26-73](src/engine/seasonManager.ts#L26-L73) to use potential-based practice probabilities
- Practice probability by potential:
  - **Bust**: 30% chance to practice and improve (70% chance to regress)
  - **Standard**: 60% chance to practice and improve (40% chance to regress)
  - **Star**: 80% chance to practice and improve (20% chance to regress)
  - **Goat**: 95% chance to practice and improve (5% chance to regress)
- Players with higher potential are significantly more likely to improve their ratings during the offseason
- Players with bust potential are more likely to decline over time
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.1] - 2025-11-27

### Added - Display Player Potential in Roster

- Added player potential display in the roster section's detailed dropdown
- Potential is shown after Age and Experience in the expanded player details
- Updated `getDetailedStats()` function in [Roster.tsx:38](src/components/Roster.tsx#L38) to include potential attribute
- Potential displays as "Potential: [Bust/Standard/Star/Goat]" in the player details section
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.7.0] - 2025-11-27

### Added - Player Potential Attribute

- Added new `potential` attribute to all players to indicate their development potential
- Potential values: Bust, Standard, Star, Goat
- Probability distribution: 1/20 Goat, 5/20 Star, 10/20 Standard, 4/20 Bust
- Added `PlayerPotential` type definition in [types.ts:8](src/types.ts#L8)
- Updated `Player` interface in [types.ts:33](src/types.ts#L33) to include potential attribute
- Created `assignPotential()` function in [seedData.ts:75-91](src/data/seedData.ts#L75-L91) to randomly assign potential based on weighted probabilities
- Updated `createPlayer()` function in [seedData.ts:160](src/data/seedData.ts#L160) to assign potential on player creation
- Updated `createSpecificPlayer()` function in [seedData.ts:204](src/data/seedData.ts#L204) to assign potential on player creation
- Created `assignPotential()` function in [seasonManager.ts:7-23](src/engine/seasonManager.ts#L7-L23) for replacement player generation
- Updated `generateReplacementPlayers()` function in [seasonManager.ts:195](src/engine/seasonManager.ts#L195) to assign potential to new free agents
- All existing players and newly generated players now have a potential value assigned
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.6.12] - 2025-11-27

### Changed - Bench Player Replacement on Injury/Suspension

- When a bench player is promoted to the active roster to replace an injured or suspended player, the team now automatically signs a free agent to fill the vacated bench spot
- Updated injury replacement logic in [SimulationControls.tsx:146-166](src/components/SimulationControls.tsx#L146-L166) to call `findBestReplacement()` again after bench player is promoted
- Updated suspension replacement logic in [SimulationControls.tsx:231-251](src/components/SimulationControls.tsx#L231-L251) with the same bench refill behavior
- The newly signed bench player is the best available free agent for the position, and may have their position switched if needed
- Feed posts are generated for the new bench player signing
- Ensures teams maintain full roster depth when using bench players as injury/suspension replacements
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.6.11] - 2025-11-27

### Added - Season-End Achievements

- Added 5 new achievements that are unlocked based on team performance at the end of the regular season
- **Offensive Powerhouse**: A team finishes the regular season with 70+ goals scored
- **Defensive Disaster**: A team finishes the regular season with 70+ goals allowed
- **Dominant Season**: A team finishes the regular season with 35+ total points
- **Basement Dweller**: A team finishes the regular season with 10 or less total points
- **Overtime Specialist**: A team finishes the regular season with 5+ overtime losses
- Created new `checkSeasonEndAchievements` function in [achievementManager.ts:99-186](src/engine/achievementManager.ts#L99-L186) to evaluate team stats when the regular season completes
- Integrated season-end achievement checks in [SimulationControls.tsx:430-444](src/components/SimulationControls.tsx#L430-L444) and [LiveGame.tsx:304-318](src/components/LiveGame.tsx#L304-L318)
- Added achievement definitions in [AppContext.tsx:77-106](src/context/AppContext.tsx#L77-L106)
- Achievement notifications are posted to the event feed when unlocked
- Build verified successfully with no TypeScript errors
- Previous functionality remains intact

## [0.6.10] - 2025-11-27

### Changed - Increased Save Events Per Game

- Increased the minimum number of save events per game from 5 to 10
- Modified [gameSimulator.ts:204](src/engine/gameSimulator.ts#L204) to generate 10-19 total saves per game (previously 5-14)
- Save events are still randomly distributed between both teams' goalies
- Build verified successfully with no TypeScript errors

## [0.6.9] - 2025-11-27

### Fixed - Assist Attribution Logic

- Fixed assist logic in `updatePlayerStats` function to credit random teammates instead of the goal scorer
- Modified [gameSimulator.ts:324-339](src/engine/gameSimulator.ts#L324-L339) to select a random teammate (excluding the goal scorer) to receive the assist
- Increased assist probability from 40% to 70% per goal scored
- Assists now correctly represent playmaking contributions from teammates rather than incorrectly crediting the goal scorer
- Build verified successfully with no TypeScript errors

## [0.6.8] - 2025-11-27

### Changed - Increased New Player Generation After 2040

- Modified season advancement to generate 2-4 new free agent players (instead of 1-4) after the year 2040
- Updated [seasonManager.ts:310-312](src/engine/seasonManager.ts#L310-L312) to use dynamic min/max ranges based on the year
- Years up to and including 2040 continue to generate 1-4 new players per season
- Years after 2040 now generate 2-4 new players per season (minimum raised from 1 to 2)
- Ensures league maintains sufficient player influx in later years of simulation
- Previous functionality remains intact for years 2040 and earlier

## [0.6.7] - 2025-11-26

### Changed - Career Stats Now Include Retired Players

- Updated League Leaders component to include retired players when displaying career statistics
- Modified [LeagueLeaders.tsx:9-12](src/components/LeagueLeaders.tsx#L9-L12) to conditionally include `state.retiredPlayers` when viewing career stats
- Season stats continue to show only active players and free agents (retired players have no current season activity)
- Career stats now properly display historical achievements from retired players in the all-time leaderboards
- Ensures retired players' career accomplishments are preserved and visible in the league history
- Added light blue (#87CEEB) text styling to retired players on leaderboards in [LeagueLeaders.tsx:42,53,64,75](src/components/LeagueLeaders.tsx#L42)
- Retired players are now visually distinguished from active players for easy identification

## [0.6.6] - 2025-11-26

### Added - Pallet Town Remembers Achievement

- Added new achievement "Pallet Town Remembers" that unlocks when a player named Chauncey is randomly generated and joins the league
- Updated [AppContext.tsx:71-76](src/context/AppContext.tsx#L71-L76) to include the new achievement in default achievements list
- Added "Chauncey" to the FIRST_NAMES array in [seasonManager.ts:108](src/engine/seasonManager.ts#L108) to enable random generation
- Created `checkNewPlayerAchievements` function in [achievementManager.ts:71-97](src/engine/achievementManager.ts#L71-L97) to check for new player-related achievements
- Integrated achievement check in [Playoffs.tsx:298-311](src/components/Playoffs.tsx#L298-L311) to trigger when new players are generated during season advancement
- Achievement appears in event feed with gold border styling when unlocked

## [0.6.5] - 2025-11-26

### Added - Jar of Peanut Butter Retirement Achievement

- Added special retirement logic for "Jar of Peanut Butter" player to retire only at age 100
- Updated [seasonManager.ts:46-50](src/engine/seasonManager.ts#L46-L50) to check if player is "Jar of Peanut Butter" and only allow retirement at age 100 or older
- Added new achievement "The Legend Retires" that unlocks when Jar of Peanut Butter retires at age 100
- Updated [AppContext.tsx:65-70](src/context/AppContext.tsx#L65-L70) to include the new achievement in default achievements list
- Updated [Playoffs.tsx:274-284](src/components/Playoffs.tsx#L274-L284) to check for Jar of Peanut Butter retirement and unlock achievement when appropriate
- Achievement appears in event feed with gold border styling when unlocked
- Build verified successfully with no TypeScript errors

## [0.6.4] - 2025-11-26

### Changed - Random Number of New Players Per Season

- Modified season advancement to add a random number of new free agent players (1-4) instead of always adding exactly 1 player
- Updated [seasonManager.ts:294](src/engine/seasonManager.ts#L294) to generate `Math.floor(Math.random() * 4) + 1` new players
- Each season now introduces between 1 and 4 new players to the free agent pool
- New players still follow the same generation rules: ages 17-20, ratings 65-78, and unique names
- React Strict Mode compatibility maintained - players are still marked with `seasonGenerated` to prevent duplicates
- Adds more variability and unpredictability to roster dynamics across seasons
- Build verified successfully with no TypeScript errors

## [0.6.3] - 2025-11-26

### Added - Aaron Narine as Guaranteed Free Agent

- Added Aaron Narine as a guaranteed free agent available at the start of every season
- Aaron Narine has 55 rating in all skill categories (Forward: 55, Defender: 55, Goalie: 55)
- Modified [seedData.ts:302-312](src/data/seedData.ts#L302-L312) to include Aaron Narine in the list of specific free agents
- Aaron Narine plays the Forward position with 55 overall rating
- Updated free agent count from 7 to 8 specific players that are always available at season start
- Aaron Narine receives a random age between 17-20 like other non-special free agents
- Build verified successfully with no TypeScript errors

## [0.6.2] - 2025-11-26

### Fixed - Auto-Generated Player Overall Rating Cap

- Updated auto-generated players to have maximum overall rating of 78 instead of 90
- Modified [seasonManager.ts:124](src/engine/seasonManager.ts#L124) in `generateReplacementPlayers()` function
- Changed overall rating range from 65-90 to 65-78 (Math.floor(Math.random() * 14) + 65)
- New players entering the league as replacements for retired players will now have ratings between 65-78
- New free agents added at the beginning of each season will also respect the 78 overall cap
- Ensures auto-generated players maintain balanced ratings relative to existing roster players

## [0.6.1] - 2025-11-26

### Changed - Injury/Suspension Replacement Logic to Compare Bench vs Free Agents

- Updated injury and suspension replacement logic to intelligently compare bench players vs. free agents instead of automatically signing the first matching free agent
- Created new `findBestReplacement()` helper function in [rosterManager.ts:981-1035](src/engine/rosterManager.ts#L981-L1035) to evaluate replacement options:
  - Calculates bench player's rating for the needed position using `getPlayerRatingForPosition()`
  - Finds the best available free agent for the position and calculates their rating
  - Compares ratings and selects the player with the higher position-specific rating
  - Returns whether replacement is bench player or free agent, plus position switch information
- Updated injury replacement logic in [SimulationControls.tsx:127-163](src/components/SimulationControls.tsx#L127-L163):
  - Uses `findBestReplacement()` to evaluate both bench player and free agents
  - If bench player has higher/equal rating, promotes bench player to active roster
  - If free agent has higher rating, signs the free agent
  - Handles position switches when needed (e.g., Defender with high Forward rating can replace injured Forward)
  - Creates position switch feed posts when players change positions
- Updated suspension replacement logic in [SimulationControls.tsx:190-226](src/components/SimulationControls.tsx#L190-L226):
  - Uses identical logic to injury replacements for consistency
  - Compares bench vs. free agents for suspended player's position
  - Promotes/signs best available replacement regardless of source
- Replacement decision now considers player skill at the specific position needed, not just matching positions
- Example: Team loses a Forward to injury with bench Defender (75 FWD rating) and best free agent Forward (70 FWD rating) → promotes bench Defender and switches to Forward
- System maximizes team strength by selecting the highest-rated replacement for each situation
- Maintains roster integrity while optimizing player placement based on position-specific ratings
- Build verified successfully with no TypeScript errors

## [0.6.0] - 2025-11-26

### Added - Player Suspension System

- Implemented comprehensive player suspension system similar to the injury system
- Added `Suspended` player state to [types.ts:5](src/types.ts#L5) PlayerState type
- Added `suspensionGamesRemaining` property to [types.ts:34](src/types.ts#L34) Player interface
- Added `suspendedPlayers` array to [types.ts:48](src/types.ts#L48) Team interface
- Added `Suspension` interface in [types.ts:96-101](src/types.ts#L96-L101) with playerId, gamesRemaining, and reason fields
- Added `suspensions` array to [types.ts:145](src/types.ts#L145) AppState to track all active suspensions
- Added `'Suspension'` as new post type to [types.ts:109](src/types.ts#L109) FeedPost interface
- Created `checkForSuspensions()` function in [gameSimulator.ts:267-293](src/engine/gameSimulator.ts#L267-L293) with 1% chance per player per game
- Suspension types with varying durations:
  - Fighting: 2 games
  - High-sticking: 1 game
  - Unsportsmanlike conduct: 3 games
  - Illegal check: 2 games
  - Off-ice conduct violation: 5 games
  - Repeated minor infractions: 1 game
- Created suspension management functions in [rosterManager.ts](src/engine/rosterManager.ts):
  - `moveToSuspension()` (lines 280-339): Moves suspended player to suspension list and signs replacement
  - `returnFromSuspension()` (lines 341-422): Returns player from suspension
  - `processSuspensions()` (lines 424-452): Decrements games remaining for all suspended players
  - `applySuspension()` (lines 454-461): Applies suspension to player
  - `autoReturnFromSuspension()` (lines 463-579): Automatic intelligent return similar to IR system
  - `processAllTeamSuspensionReturns()` (lines 581-612): Processes all teams for suspension returns
- Created suspension event feed post functions in [eventFeed.ts](src/engine/eventFeed.ts):
  - `createSuspensionPost()` (lines 259-277): Announces player suspension with reason and duration
  - `createSuspensionListPost()` (lines 279-297): Announces move to suspension list
  - `createSuspensionReturnToActivePost()` (lines 299-322): Announces return to active roster
  - `createSuspensionReturnToBenchPost()` (lines 324-342): Announces return to bench
- Integrated suspension logic into game simulation in [SimulationControls.tsx:150-194](src/components/SimulationControls.tsx#L150-L194):
  - Checks for suspensions after each game (after injury checks)
  - Automatically moves suspended players to suspension list
  - Automatically signs replacement free agent with matching position
  - Creates suspension and roster move feed posts
- Integrated suspension countdown processing in [SimulationControls.tsx:231-307](src/components/SimulationControls.tsx#L231-L307):
  - Decrements suspension games remaining after each game (before IR processing)
  - Removes completed suspensions from tracking array
  - Automatically returns players with completed suspensions
  - Creates appropriate feed posts for returns (to active, to bench, or released)
- Updated [Roster.tsx:111-122](src/components/Roster.tsx#L111-L122) to display suspended players section:
  - Shows "Suspended" heading for teams with suspended players
  - Displays games remaining or "Eligible to Return" status
  - Format: "Suspended - X game(s) remaining" or "Suspended - Eligible to Return"
- Initialized `suspendedPlayers` array in [seedData.ts:273](src/data/seedData.ts#L273) team generation
- Initialized `suspensions` array in [AppContext.tsx:83](src/context/AppContext.tsx#L83) initial state
- Suspension system differences from injury system:
  - Duration measured in **games played by team** instead of days
  - 1% chance per game instead of 5% for injuries
  - Different violation types (disciplinary vs medical)
  - Suspensions countdown only when team plays a game
- Automatic suspension management:
  - Player automatically moved to suspension list when suspended
  - Team automatically signs replacement free agent if available
  - Suspension decrements by 1 after each game team plays
  - Player automatically returns when suspension completes (similar to IR return logic)
  - Can return to active roster, bench, or be released based on overall rating
- Added orange border for suspension posts on GoogusNow event feed in [App.css:340-342](src/App.css#L340-L342)
- Updated [EventFeed.tsx:19](src/components/EventFeed.tsx#L19) to apply `suspension` CSS class for suspension posts
- Suspension posts now display with prominent orange border to distinguish them from injuries (red), retirements (blue), and achievements (gold)
- Build verified successfully with no TypeScript errors

## [0.5.10] - 2025-11-26

### Fixed - Duplicate New Free Agent Player and Posts in React Strict Mode

- Fixed bug where the same new free agent player appeared twice in the free agents roster and had two GoogusNow posts when advancing seasons
- Root cause: React Strict Mode causes setState functions to execute twice, and shallow copying in [Playoffs.tsx:243](src/components/Playoffs.tsx#L243) meant both calls mutated the same `freeAgents` array reference
- While `advanceSeason()` correctly detected already-generated players using the `seasonGenerated` field, it was re-adding the same player on the second call
- Modified [seasonManager.ts:303-314](src/engine/seasonManager.ts#L303-L314) to check for duplicate player IDs before adding to the free agents array
- Added deduplication logic: filters `newSeasonFreeAgent` to exclude any players already present in `existingFreeAgents`
- On first call: New player is generated and added to `freeAgents`
- On second call (Strict Mode): Same player is detected via `seasonGenerated`, included in `existingFreeAgents` (via snapshot), and filtered out of `newPlayersToAdd` to prevent duplicate
- Added duplicate post prevention in [Playoffs.tsx:275-284](src/components/Playoffs.tsx#L275-L284) to check if GoogusNow post already exists before creating
- Exactly one new free agent player is now generated per season and appears once in roster and GoogusNow feed, even in React Strict Mode
- Build verified successfully with no TypeScript errors

## [0.5.9] - 2025-11-26

### Fixed - Duplicate Experience and Age Increment Bug

- Fixed bug where player experience years, age, and consecutive inactive seasons were being incremented twice per season
- Root cause: React Strict Mode causes `setState` updater functions to run twice in development, and the `advanceSeason()` function was mutating player state directly
- Modified [seasonManager.ts:225-245](src/engine/seasonManager.ts#L225-L245) to add deduplication logic for experience/age updates
- Function now checks if season history was already recorded (`alreadyRecorded` flag) to detect duplicate calls
- If already processed, the experience, age, and inactive season increments are skipped on the second pass
- Moved console.log debugging statement from `processRetirements()` to `advanceSeason()` (line 243) to prevent duplicate logging
- Ensures player stats are incremented exactly once per season, preventing inflation of age and experience values
- After first season, players now correctly show maximum of 1 inactive season (not higher values)
- Build verified successfully with no TypeScript errors

## [0.5.8] - 2025-11-26

### Fixed - Retirement Processing Order

- Fixed bug where retirement processing was occurring before experience years were updated
- Root cause: `advanceSeason()` was processing retirements before incrementing `consecutiveSeasonsWithoutGames`
- Modified [seasonManager.ts:226-302](src/engine/seasonManager.ts#L226-L302) to reorder operations:
  - Experience years and age are now incremented FIRST (lines 226-239)
  - Retirement processing now happens AFTER experience update (lines 241-258)
- This ensures `consecutiveSeasonsWithoutGames` is properly updated before checking retirement conditions
- Prevents incorrect retirement eligibility checks based on stale player data
- Removed debug console log statement from `processRetirements` function

## [0.5.7] - 2025-11-26

### Changed - Inactive Player Retirement Criteria

- Updated automatic retirement system for inactive players to require 4 consecutive seasons without games (previously 3 seasons)
- Added free agent status requirement: players now only retire due to inactivity if they are free agents
- Modified [seasonManager.ts:41-47](src/engine/seasonManager.ts#L41-L47) to update threshold constant and add state check
- Players on team rosters (active, bench, or IR) will no longer retire due to inactivity, regardless of games played
- Only free agents who haven't played a game in 4 straight seasons will automatically retire
- Age-based retirement probability still applies to all players regardless of state (unchanged)
- Prevents valuable bench and IR players from retiring while still under team control
- Build verified successfully with no TypeScript errors

### Fixed - Duplicate Retirement Processing Bug

- Fixed bug where retirement processing was occurring twice per season advancement due to React Strict Mode
- Root cause: `advanceSeason()` function was being called twice in development due to React Strict Mode, causing `processRetirements()` to execute twice
- Added deduplication logic in [seasonManager.ts:226-237](src/engine/seasonManager.ts#L226-L237) to detect if retirements were already processed
- Function now checks if any players are already in 'Retired' state before processing retirements again
- If retirements were already processed (from first call), it reuses those already-retired players instead of processing again
- Prevents double-processing of retirements and duplicate state mutations
- Ensures retirement logic executes exactly once per season advancement
- Build verified successfully with no TypeScript errors

## [0.5.6] - 2025-11-26

### Fixed - Double Player Generation Bug

- Fixed bug where 2 new players were being generated per season instead of 1
- Root cause: `advanceSeason()` function was being called twice in development due to React Strict Mode, and the function was mutating shared state
- Modified [seasonManager.ts:239-263](src/engine/seasonManager.ts#L239-L263) to add deduplication logic
- Function now tracks original free agent IDs at the start and detects if a new player was already generated on a previous call
- If a new player already exists (from first call), it reuses that player instead of generating a duplicate
- Prevents duplicate player generation even when function is called multiple times with same state reference
- System now correctly generates exactly 1 new random free agent per season
- Build verified successfully with no TypeScript errors

## [0.5.5] - 2025-11-26

### Changed - Removed Automatic Replacement Player Generation on Retirement

- Removed automatic generation of replacement players when players retire
- Modified [seasonManager.ts:245-251](src/engine/seasonManager.ts#L245-L251) to remove replacement player generation logic
- System now only generates one new random free agent at the beginning of each season (unchanged)
- When players retire, they are removed from the league without automatic 1:1 replacement
- Free agent pool will naturally shrink as retirements occur, unless teams release players or new season free agent is added
- League roster size now fluctuates more naturally based on retirement and signing patterns
- Build verified successfully with no TypeScript errors

## [0.5.4] - 2025-11-26

### Added - Automatic Retirement for Inactive Players

- Implemented automatic retirement system for players who don't play any games for 3 consecutive seasons
- Added `consecutiveSeasonsWithoutGames` property to Player interface in [types.ts:36](src/types.ts#L36)
- Updated [seasonManager.ts:253-264](src/engine/seasonManager.ts#L253-L264) to track consecutive inactive seasons:
  - Resets to 0 when a player plays at least 1 game in a season
  - Increments by 1 when a player finishes a season with 0 games played
- Modified `processRetirements()` function in [seasonManager.ts:36-88](src/engine/seasonManager.ts#L36-L88) to force retirement after 3 consecutive inactive seasons
- Players who haven't played a game in 3 straight seasons will automatically retire regardless of age
- Age-based retirement probability still applies to active players (unchanged)
- Prevents free agents or bench players from remaining in the league indefinitely without playing
- Initialized `consecutiveSeasonsWithoutGames` to 0 for all new players in [seedData.ts:143,186](src/data/seedData.ts#L143) and [seasonManager.ts:178](src/engine/seasonManager.ts#L178)
- Added migration logic in [AppContext.tsx:146-149](src/context/AppContext.tsx#L146-L149) to initialize field for existing players
- Build verified successfully with no TypeScript errors

## [0.5.3] - 2025-11-26

### Changed - Player Retirement System to Age-Based Probability Model

- Updated player retirement system to use age-based probability distribution with average retirement age of 35
- Modified `processRetirements()` function in [seasonManager.ts:36-88](src/engine/seasonManager.ts#L36-L88) to calculate retirement probability based on player age
- Retirement probability distribution:
  - Age < 25: 0.1% chance (very rare early retirement)
  - Age 25-29: 1% chance (low probability during prime years)
  - Age 30-34: 5% + 2% per year over 30 (moderate probability, 5%/7%/9%/11%/13%)
  - Age 35-39: 15% + 5% per year over 35 (high probability, 15%/20%/25%/30%/35%)
  - Age 40+: 40% + 8% per year over 40 (very high probability, increases exponentially)
- Maximum retirement probability capped at 95% to allow for occasional legendary long careers
- Players can retire at any age, but probability increases significantly after age 35
- Removed previous requirement of 100+ games played for retirement eligibility
- Age-based system creates more realistic retirement patterns that mirror real hockey careers
- Build verified successfully with no TypeScript errors

## [0.5.2] - 2025-11-26

### Added - Player Age Tracking System

- Implemented comprehensive age tracking system for all players in the league
- Added `age` property to Player interface in [types.ts:35](src/types.ts#L35)
- Players start at different ages based on their identity:
  - Andrew Levy (Andy Levy) and Nick Marotta always start at 21 years old
  - Mikey Papa, Vinny Cleary, Eggy Levenduski, Quinn Donahue, and Kyle Kulthau always start at 16 years old
  - All other players (roster and free agents) start at random ages between 17-20 years old
- Updated [seedData.ts:127](src/data/seedData.ts#L127) to initialize random ages (17-20) for generated players
- Updated [seedData.ts:147-186](src/data/seedData.ts#L147-L186) to accept age parameter in `createSpecificPlayer()` function
- Added age determination logic in [seedData.ts:236-244](src/data/seedData.ts#L236-L244) for team roster players
- Added age determination logic in [seedData.ts:293-297](src/data/seedData.ts#L293-L297) for free agents
- Modified [seasonManager.ts:223-231](src/engine/seasonManager.ts#L223-L231) to increment all player ages by 1 at the end of each season
- Updated [seasonManager.ts:112-113](src/engine/seasonManager.ts#L112-L113) to assign random ages (17-20) to replacement players generated when veterans retire
- Age increments happen for all players (active, bench, IR, and free agents) during season advancement
- Players age naturally throughout their careers, increasing realism and enabling future age-based features
- Added Age display to roster page dropdown in [Roster.tsx:36](src/components/Roster.tsx#L36)
- Age appears as first stat in player details dropdown, above EXP (years of experience)
- Age is visible for all players (active roster, bench, IR, and free agents) when player details are expanded
- Build verified successfully with no TypeScript errors

## [0.5.1] - 2025-11-26

### Changed - Roster Page Player Details Layout

- Updated player details dropdown on roster page to display stats vertically instead of inline
- Modified `.player-details` CSS in [App.css:791](src/App.css#L791) to use `flex-direction: column`
- Stats now stack one on top of the other for improved readability
- Each stat (EXP, FWD, DEF, G, GP, Goals, A, P, Saves, GA) appears on its own line
- Build verified successfully with no TypeScript errors

## [0.5.0] - 2025-11-26

### Added - Years of Experience Tracking for Players

- Implemented years of experience tracking system to monitor player career longevity
- Added `yearsOfExperience` property to Player interface in [types.ts:34](src/types.ts#L34)
- Initialized yearsOfExperience to 0 for all new players in [seedData.ts:138](src/data/seedData.ts#L138) and [seedData.ts:178](src/data/seedData.ts#L178)
- Added automatic increment logic in [seasonManager.ts:222-227](src/engine/seasonManager.ts#L222-L227) at end of season
- Years of experience increments by 1 for players who played at least 1 game during the season
- Players who did not play any games during a season maintain their current years of experience value
- Added migration logic in [AppContext.tsx:142-145](src/context/AppContext.tsx#L142-L145) to initialize yearsOfExperience for existing players
- New replacement players generated during season advancement also initialize with yearsOfExperience in [seasonManager.ts:137](src/engine/seasonManager.ts#L137)
- All players start their first season with 0 years of experience, which increments at end of each active season
- Added EXP (experience) display to roster page dropdown details in [Roster.tsx:36](src/components/Roster.tsx#L36)
- Years of experience visible in expandable player details section for all players (active, bench, IR, and free agents)
- EXP displays as first stat in the dropdown, appearing before position-specific ratings
- Build verified successfully with no TypeScript errors

## [0.4.8] - 2025-11-26

### Added - Blue Border for Retirement Updates on GoogusNow

- Implemented visual distinction for retirement posts in the GoogusNow event feed with blue borders
- Added 'Retirement' as a new post type in [types.ts:96](src/types.ts#L96) FeedPost interface
- Modified [eventFeed.ts:210](src/engine/eventFeed.ts#L210) createRetirementPost function to use 'Retirement' type instead of 'Other'
- Updated [EventFeed.tsx:19](src/components/EventFeed.tsx#L19) to conditionally apply `retirement` CSS class
- Added `.feed-post.retirement` CSS rule in [App.css:336-338](src/App.css#L336-L338) with 3px solid blue border
- Retirement posts now display with prominent blue border to distinguish them from other post types
- Build verified successfully with no TypeScript errors

### Added - Red Border for Injury Updates on GoogusNow

- Implemented visual distinction for injury posts in the GoogusNow event feed with red borders
- Modified [EventFeed.tsx:19](src/components/EventFeed.tsx#L19) to conditionally apply `injury` CSS class based on post type
- Added `.feed-post.injury` CSS rule in [App.css:332-334](src/App.css#L332-L334) with 3px solid red border
- Injury posts now display with prominent red border to draw attention to player injuries
- Visual styling consistent with achievement posts (which have gold borders)
- Red border helps users quickly identify injury updates while browsing the event feed
- Build verified successfully with no TypeScript errors

## [0.4.7] - 2025-11-22

### Added - Goals For (GF) and Goals Against (GA) Tracking in Standings

- Implemented comprehensive goal tracking system to display total goals scored and goals allowed in the standings table
- Added `goalsFor` and `goalsAgainst` properties to `Team` interface in [types.ts:48-49](src/types.ts#L48-L49)
- Updated `TeamStanding` interface in [statsManager.ts:47-48](src/engine/statsManager.ts#L47-L48) to include goals data
- Modified `getStandings()` function in [statsManager.ts:59-60](src/engine/statsManager.ts#L59-L60) to return goals for/against
- Updated `resetTeamRecords()` function in [statsManager.ts:102-103](src/engine/statsManager.ts#L102-L103) to reset goal counters for new seasons
- Enhanced standings table in [Standings.tsx:22-23](src/components/Standings.tsx#L22-L23) to display GF and GA columns
- Updated game simulation logic to track goals:
  - Regular season instant simulation in [SimulationControls.tsx:78-81](src/components/SimulationControls.tsx#L78-L81)
  - Live game simulation in [LiveGame.tsx:112-115](src/components/LiveGame.tsx#L112-L115)
  - Playoff game simulation in [playoffsManager.ts:116-119](src/engine/playoffsManager.ts#L116-L119)
- Updated team initialization in [seedData.ts:257-258](src/data/seedData.ts#L257-L258) to include default values (0) for both fields
- Goals are automatically incremented after each game completes:
  - Home team's goalsFor increases by home score, goalsAgainst by away score
  - Away team's goalsFor increases by away score, goalsAgainst by home score
- Standings now display comprehensive team performance including offensive and defensive statistics
- Users can now analyze team performance beyond just wins/losses by examining goal differential
- Build verified successfully with no TypeScript errors

## [0.4.6] - 2025-11-22

### Changed - Game Simulation to Use Position-Specific Offensive and Defensive Ratings

- Completely redesigned game simulation logic to calculate scores based on team offensive and defensive ratings instead of pre-determining winners
- Updated `generateScore()` function in [gameSimulator.ts:25-50](src/engine/gameSimulator.ts#L25-L50) to accept a dynamic lambda parameter for Poisson distribution
- Added `calculateOffensiveStrength()` function in [gameSimulator.ts:52-63](src/engine/gameSimulator.ts#L52-L63) to calculate team offense:
  - Forward rating counted twice, Defender rating once, averaged: (F + F + D) / 3
  - Example: 75 Forward + 81 Defender = (75 + 75 + 81) / 3 = 77 offensive strength
- Added `calculateDefensiveStrength()` function in [gameSimulator.ts:65-76](src/engine/gameSimulator.ts#L65-L76) to calculate team defense:
  - Goalie rating counted twice, Defender rating once, averaged: (G + G + D) / 3
  - Example: 81 Goalie + 84 Defender = (81 + 81 + 84) / 3 = 82 defensive strength
- Refactored `determineWinner()` function in [gameSimulator.ts:72-124](src/engine/gameSimulator.ts#L72-L124) to use offensive vs defensive matchup logic:
  - Home team lambda = base (2.5) × (home offense / avg offense) × (avg defense / away defense) × 1.05 (home advantage)
  - Away team lambda = base (2.5) × (away offense / avg offense) × (avg defense / home defense)
  - Higher lambda = higher expected goals
- Scores are now generated independently based on team strength matchups rather than forcing scores to match a pre-determined winner
- Eliminated artificial 1-point margin bug where tied games were force-adjusted to create winners
- All tied games now go to overtime (100% of ties, not 70%)
- Overtime winner determined by overall team strength comparison with 5% home advantage
- Teams with strong forwards now score more goals against weak defenses
- Teams with strong defenders and goalies now allow fewer goals
- Game outcomes are now determined naturally by the generated scores, not by pre-calculation
- Removed flawed tie-breaking logic that created unrealistic score distributions
- Score distributions now more realistically reflect team strength matchups
- 1-0 games will only occur when teams actually generate those scores naturally
- Adjusted normalization values (avgOffense: 60, avgDefense: 80) to increase average scoring and create more exciting games

## [0.4.5] - 2025-11-22

### Added - Game-Based Achievements

- Added three new achievements for exciting game results:
  - "Offensive Explosion" - A team scores 10 or more goals in a single game
  - "Overtime Nail-Biter" - A game ends 1-0 in overtime
  - "High-Scoring Thriller" - A game ends with a final score of 9-6
- Created [achievementManager.ts](src/engine/achievementManager.ts) with `checkGameAchievements()` function to detect game-based achievements
- Updated [AppContext.tsx:47-64](src/context/AppContext.tsx#L47-L64) `createDefaultAchievements()` to include new game achievements
- Integrated achievement checking into all game simulation flows:
  - [SimulationControls.tsx:143-155](src/components/SimulationControls.tsx#L143-L155) for instant game simulation
  - [LiveGame.tsx:177-187](src/components/LiveGame.tsx#L177-L187) for live game simulation
  - [Playoffs.tsx:86-96](src/components/Playoffs.tsx#L86-L96) for playoff game simulation (single game)
  - [Playoffs.tsx:140-150](src/components/Playoffs.tsx#L140-L150) for playoff game simulation (full series)
- Achievement checking runs automatically after each game completes and before game result post is created
- Achievements unlock immediately when conditions are met and appear in GoogusNow feed with gold border
- All seven achievements (1, 10, 50, 100 seasons + 3 game achievements) now tracked in Achievements tab
- Build verified successfully with no TypeScript errors

## [0.4.4] - 2025-11-22

### Added - Season Milestone Achievements

- Added three new achievements for completing multiple full seasons:
  - "Decade of Hockey" - Complete 10 full seasons
  - "Golden Anniversary" - Complete 50 full seasons
  - "Century of Champions" - Complete 100 full seasons
- Updated [createDefaultAchievements()](src/context/AppContext.tsx#L21-L48) function to include new season milestone achievements
- Added unlock logic in [Playoffs.tsx:263-280](src/components/Playoffs.tsx#L263-L280) to check season completion milestones
- System tracks completed seasons using `seasonHistory.length` to determine when milestones are reached
- Achievements unlock automatically when advancing to the next season after reaching milestone (exactly on 10th, 50th, or 100th season)
- Championship game date is captured in [Playoffs.tsx:226-228](src/components/Playoffs.tsx#L226-L228) by finding the final completed championship game
- All season completion achievements (1, 10, 50, 100 seasons) use the championship game date as the unlock date
- Achievement posts automatically generated on GoogusNow feed when milestones are unlocked with championship date
- Added migration logic in [AppContext.tsx:142-150](src/context/AppContext.tsx#L142-L150) to ensure existing saves get new achievements
- Migration compares existing achievements against default achievements and adds any missing ones
- Fixed achievement unlock date display in [Achievements.tsx:4-9](src/components/Achievements.tsx#L4-L9) to avoid timezone issues
- Added `formatDate()` helper function to manually parse date components and prevent UTC conversion issues
- Achievement unlock dates now display correctly without being offset by one day
- Fixed GoogusNow post timestamp generation in [eventFeed.ts:14-24](src/engine/eventFeed.ts#L14-L24) to avoid UTC conversion
- Updated `generateTimestamp()` to manually parse date components as local time instead of using `new Date(gameDate)`
- GoogusNow post dates now display correctly without being offset by one day
- All four achievements (1, 10, 50, 100 seasons) now tracked and displayed in Achievements tab
- Build verified successfully with no TypeScript errors

## [0.4.3] - 2025-11-22

### Added - Achievement Posts to GoogusNow Event Feed

- Implemented automatic GoogusNow posts when achievements are unlocked
- Added `createAchievementPost()` function in [eventFeed.ts:305-322](src/engine/eventFeed.ts#L305-L322) to generate achievement announcement posts
- Added dedicated achievement analyst `@dj_devy_dev` in [seedData.ts:306](src/data/seedData.ts#L306) who posts all achievement updates
- Updated `FeedPost` interface in [types.ts:89-96](src/types.ts#L89-L96) to include:
  - `'Achievement'` as a new post type
  - `isAchievement` boolean flag for gold border styling
- Modified [Playoffs.tsx:257](src/components/Playoffs.tsx#L257) to automatically post achievement to GoogusNow when "Complete One Season" achievement is unlocked
- Achievement posts display with gold border (3px solid gold) and golden glow effect
- Added CSS styling in [App.css:327-330](src/App.css#L327-L330) for `.feed-post.achievement` class
- Updated [EventFeed.tsx:19](src/components/EventFeed.tsx#L19) to conditionally apply `achievement` CSS class based on `isAchievement` flag
- Achievement posts include 4 different message variations celebrating the milestone
- All achievement posts are attributed to `@dj_devy_dev` analyst
- Posts use in-game date with random afternoon timestamp for realistic timeline
- Gold border styling matches the visual treatment of unlocked achievements in the Achievements tab
- Build verified successfully with no TypeScript errors

## [0.4.2] - 2025-11-22

### Added - Specific Free Agents Available at Season Start

- Added 7 specific free agents that are always available at the beginning of each season
- Modified [generateInitialFreeAgents()](src/data/seedData.ts#L268-L290) function to create specific named players
- Free agents that start every season:
  - Jarrett Hissick (Defender) - 69 OVR at Defender position (F-62, D-69, G-60)
  - Jar of Peanut Butter (Goalie) - 10 OVR at Goalie position (F-60, D-60, G-10)
  - Yiannis Bagtzoglou (Goalie) - 68 OVR at Goalie position (F-60, D-60, G-68)
  - Christos Bagtzoglou (Defender) - 68 OVR at Defender position (F-61, D-68, G-60)
  - Kyle Kulthau (Forward) - 67 OVR at Forward position (F-67, D-60, G-60)
  - Quinn Donahue (Defender) - 66 OVR at Defender position (F-60, D-66, G-60)
  - Darren Barille (Forward) - 56 OVR at Forward position (F-56, D-60, G-60)
- Reduced random free agents from 10 to 3 to maintain total of 10 free agents
- These specific players use `createSpecificPlayer()` function to ensure exact ratings
- Players are created at the start of each new season with consistent attributes
- Build verified successfully with no TypeScript errors

## [0.4.1] - 2025-11-22

### Changed - Player Creation System to Use Three Separate Position Ratings

- Redesigned player creation system to define all three position ratings (Forward, Defender, Goalie) independently for each player
- Modified [seedData.ts:66-102](src/data/seedData.ts#L66-L102):
  - Renamed `generateOverall()` to `generateRating()` for generating individual ratings
  - Replaced `generatePositionRatings()` with `generateThreePositionRatings()` that creates three independent ratings
  - Primary position gets rating of 65-90, secondary positions get 60-85% of primary (minimum 60)
- Updated [createPlayer()](src/data/seedData.ts#L104-L139) function to use `generateThreePositionRatings()` and calculate `overall` from position ratings
- Updated [createSpecificPlayer()](src/data/seedData.ts#L141-L177) to accept three separate ratings (forwardRating, defenderRating, goalieRating)
- Modified `INITIAL_ROSTERS` constant in [seedData.ts:180-217](src/data/seedData.ts#L180-L217) to include all three ratings for each player
- Updated [generateInitialTeams()](src/data/seedData.ts#L219-L265) to pass three ratings when creating players
- Initial roster with all three position ratings per player:
  - **American Revolution**:
    - Mikey Papa (F-90, D-70, G-65), Owen Brown (F-65, D-77, G-65), Mike Marotta (F-65, D-70, G-89), Nick Marotta Bench (F-60, D-62, G-71)
  - **Alaskan Thunder**:
    - Ricky Novia (F-82, D-68, G-65), Andy Levy (F-70, D-82, G-68), Joe O'Donnell (F-62, D-65, G-77), Brad Robidoux Bench (F-55, D-58, G-65)
  - **Boondock Beluga Whales**:
    - Austin Ingarra (F-83, D-70, G-66), Ian Beling (F-65, D-77, G-64), Alec Fowler (F-66, D-68, G-81), Shem Prudhomme Bench (F-62, D-73, G-60)
  - **Florida Tropics**:
    - Erik Galuska (F-76, D-64, G-60), Aidan Murray (F-62, D-74, G-62), Collin Salatto (F-75, D-78, G-94), Kyle Kulthau Bench (F-60, D-72, G-60)
  - **Smashville Chippewas**:
    - Vinny Cleary (F-86, D-72, G-68), Sal DeLucia (F-66, D-78, G-65), Thom Bishop (F-75, D-78, G-94), Eggy Levenduski Bench (F-79, D-66, G-62)
  - **Southside Spartans**:
    - Chris Papa (F-95, D-78, G-75), Matt Robidoux (F-65, D-77, G-64), Matt Palma (F-66, D-68, G-80), George Bonadies Bench (F-64, D-66, G-77)
- `overall` rating is now a computed value that always equals the player's rating at their current position
- All three position ratings are now the source of truth, with overall being derived from current position
- System supports full flexibility for position changes with accurate ratings for each position
- Build verified successfully with no TypeScript errors

## [0.4.0] - 2025-11-22

### Fixed - Playoff Screen Text Visibility

- Fixed visibility issue where multiple text elements in the Playoffs screen were displaying in blue on dark green background
- Added comprehensive CSS rules in [App.css:574-657](src/App.css#L574-L657) to ensure all playoff text is white:
  - `.playoffs p` - General paragraph text (e.g., "Complete the regular season before starting playoffs.")
  - `.playoff-game .status` - Game status text
  - `.playoff-game .game-label` - Game number labels
  - `.series-header` and `.series-header strong` - Team matchup text (e.g., "Boondock Beluga Whales vs American Revolution")
  - `.series-score` - Series score display
  - `.series-winner` - Series winner announcement
- All text in the playoffs screen now displays in white with proper contrast against dark green background
- Build verified successfully with no errors

### Added - User Achievements System

- Implemented comprehensive achievement tracking system to reward users for milestones
- Added `Achievement` interface in [types.ts:143-149](src/types.ts#L143-L149) with properties for id, title, description, unlock status, and unlock date
- Added `achievements` array to `AppState` interface in [types.ts:134](src/types.ts#L134)
- Created `createDefaultAchievements()` function in [AppContext.tsx:21-30](src/context/AppContext.tsx#L21-L30) to initialize achievements
- Added first achievement: "First Championship" - unlocked when user completes one full season
- Created new [Achievements.tsx](src/components/Achievements.tsx) component to display all achievements with unlock status
- Added "Achievements" tab to main navigation menu in [App.tsx:107-111](src/App.tsx#L107-L111)
- Implemented visual distinction between locked and unlocked achievements:
  - Locked achievements: Show lock icon (🔒), reduced opacity, darker background, white border
  - Unlocked achievements: Show trophy icon (🏆), full opacity, golden border with glow effect
- Added achievement unlock logic in [Playoffs.tsx:248-255](src/components/Playoffs.tsx#L248-L255) that triggers when advancing to next season
- Achievement displays unlock date in human-readable format when completed
- Added comprehensive CSS styling in [App.css:764-829](src/App.css#L764-L829) with responsive grid layout
- Golden border uses `border-color: gold` with box-shadow glow effect for unlocked achievements
- Achievements persist in localStorage along with all other simulation data
- Added migration logic in [AppContext.tsx:139-141](src/context/AppContext.tsx#L139-L141) to add achievements to existing save data
- Achievement grid uses responsive auto-fit layout adapting to screen size
- All existing functionality remains intact - build completes with no TypeScript errors

## [0.3.10] - 2025-11-22

### Added - New Random Free Agent at Beginning of Each Season

- Implemented automatic generation of one new random free agent at the start of every season
- Modified [seasonManager.ts:208-210](src/engine/seasonManager.ts#L208-L210) in `advanceSeason()` function to generate additional free agent
- New free agent is generated after replacement players for retired players are added
- Uses existing `generateReplacementPlayers()` function to create player with random position and ratings (65-90 overall)
- New player receives unique name that doesn't conflict with existing players in the league
- Free agent pool now grows each season by at least 1 player (plus any retirement replacements)
- Ensures fresh talent continuously enters the league and provides more signing options for teams
- Build verified successfully with no TypeScript errors

### Added - GoogusNow Posts for Retirements and New Free Agents

- Implemented automatic GoogusNow event feed posts for player retirements and new free agents entering the league
- Added `createNewFreeAgentPost()` function in [eventFeed.ts:284-303](src/engine/eventFeed.ts#L284-L303) to announce new players joining the free agent pool
- Modified [seasonManager.ts:151](src/engine/seasonManager.ts#L151) to return `newFreeAgents` array tracking all players added to free agent pool
- Modified [seasonManager.ts:212-213](src/engine/seasonManager.ts#L212-L213) to track both replacement players and new season free agents
- Updated [Playoffs.tsx:238-246](src/components/Playoffs.tsx#L238-L246) in `advanceToNextSeason()` to generate posts for:
  - Player retirements with career stats (games played, points, goals, assists)
  - New free agents entering the league with position and overall rating
- Posts generated when advancing to new season after championship completion
- New free agent posts include 5 different message variations celebrating fresh talent
- Retirement posts already existed but now properly integrated to fire when players retire
- All posts use in-game date and random afternoon timestamps for realistic timeline
- Event feed now provides complete visibility into league roster changes during offseason

## [0.3.9] - 2025-11-22

### Changed - Game Scoring System and Overtime Frequency

- Completely redesigned scoring system to use Poisson distribution for more realistic goal totals
- Teams can now score 0-10 goals per game with an average of 2.5 goals per team
- Added `generateScore()` function in [gameSimulator.ts:9-35](src/engine/gameSimulator.ts#L9-L35) using cumulative probability distribution
- Previous system generated 2-5 goals (average 3.5), new system generates 0-10 goals (average 2.5)
- Score distribution follows realistic hockey statistics:
  - 8.21% chance of 0 goals (shutouts more common)
  - 20.52% chance of 1 goal
  - 25.65% chance of 2 goals (most common)
  - 21.38% chance of 3 goals
  - Lower probabilities for higher scores (10 goals very rare at 0.03%)
- Increased goalie and defender scoring probability from 30% to 40% of all goals
- Changed forward scoring probability from 70% to 60% in [gameSimulator.ts:96](src/engine/gameSimulator.ts#L96)
- Increased overtime frequency from 15% to 30% when scores are tied in [gameSimulator.ts:58](src/engine/gameSimulator.ts#L58)
- Games now feature more variety in final scores, from defensive battles (0-1, 1-0) to high-scoring affairs (7-6, 8-5)

### Changed - Game Winner Determined by Position-Specific Ratings

- Updated game simulation to determine winners based on position-specific ratings instead of overall ratings
- Modified `calculateTeamStrength()` function in [gameSimulator.ts:4-23](src/engine/gameSimulator.ts#L4-L23) to use position-specific ratings
- Team strength now calculated by summing each player's rating for their current position:
  - Forward position uses `forwardRating`
  - Defender position uses `defenderRating`
  - Goalie position uses `goalieRating`
- Win probability calculation now accurately reflects each player's effectiveness at their assigned position
- Example: A 75 overall Forward (with 75 FWD, 68 DEF, 62 G) playing Forward contributes 75 to team strength
- Example: Same player switched to Defender position would contribute 68 to team strength
- Game outcomes now better reflect the strategic value of having players in their strongest positions
- Incentivizes roster management decisions to align player positions with their highest ratings
- Build verified successfully with no errors

## [0.3.8] - 2025-11-22

### Fixed - Live Game Score Display

- Fixed bug where final score was displayed before game events appeared during live game simulation
- Issue: Score displayed as final result (e.g., "5-3") from the start, spoiling the outcome before events began showing
- Modified [LiveGame.tsx:317-328](src/components/LiveGame.tsx:317-328) to calculate running score based on visible goal events
- Added logic to count goal events as they appear and increment home/away scores in real-time
- Scores now start at 0-0 and update incrementally each time a goal event is displayed
- Users now experience suspense as the game unfolds, with score updating only when goals happen
- Real-time score tracking based on `visibleEvents` array and `teamId` matching for each goal

## [0.3.7] - 2025-11-22

### Changed - GoogusNow Posts Display In-Game Dates

- Updated all GoogusNow event feed posts to display in-game dates instead of real-life timestamps
- Modified all post creation functions in [eventFeed.ts](src/engine/eventFeed.ts) to accept `gameDate` parameter
- Added `generateTimestamp()` helper function in [eventFeed.ts:14-22](src/engine/eventFeed.ts#L14-L22) to convert game dates to timestamps with random afternoon times (12 PM - 5 PM)
- Updated all post creation functions to use in-game date with random afternoon time:
  - `createGameResultPost()` - uses game.date for game result posts
  - `createInjuryPost()` - uses game.date when injuries occur
  - `createSigningPost()` - uses current gameDate for roster moves
  - `createReleasePost()` - uses current gameDate for player releases
  - `createIRPost()` - uses game.date when players move to IR
  - `createSeasonStartPost()` - uses current gameDate for season announcements
  - `createPlayoffsStartPost()` - uses current gameDate for playoff start
  - `createChampionshipPost()` - uses current gameDate for championship celebration
  - `createRetirementPost()` - uses current gameDate for retirement announcements
  - `createIRReturnToActivePost()` - uses current gameDate for IR returns
  - `createIRReturnToBenchPost()` - uses current gameDate for IR returns
  - `createPositionSwitchPost()` - uses current gameDate for position changes
- Updated all function calls in [SimulationControls.tsx](src/components/SimulationControls.tsx), [LiveGame.tsx](src/components/LiveGame.tsx), and [Playoffs.tsx](src/components/Playoffs.tsx) to pass appropriate date parameters
- Game-related posts now use the specific game's date (game.date)
- Non-game roster moves use the current simulation date (newState.gameDate)
- Posts now display realistic in-game dates that match the game schedule instead of real-world computer time
- Event feed timestamps reflect when events occurred within the simulation timeline
- Each post receives a random afternoon time (between 12:00 PM and 5:00 PM) on the in-game date for variety

## [0.3.6] - 2025-11-22

### Added - Automatic Bench Player Position Optimization

- Implemented automatic position optimization for bench players to maximize their overall rating
- Added `getPlayerBestPosition()` function in [rosterManager.ts:498-507](src/engine/rosterManager.ts:498-507) to determine player's highest-rated position
- Added `switchPlayerToBestPosition()` function in [rosterManager.ts:509-515](src/engine/rosterManager.ts:509-515) to optimize player position
- Bench players now automatically switch to their best position when moved from active roster
- Applied in multiple roster management scenarios:
  - [swapBenchWithActive()](src/engine/rosterManager.ts:43) - Manual bench/active swaps
  - [autoSwapBenchWithActive()](src/engine/rosterManager.ts:312) - Automatic roster optimization swaps
  - [autoReturnFromIR()](src/engine/rosterManager.ts:391) - Active player moved to bench when IR player returns
  - [autoReturnFromIR()](src/engine/rosterManager.ts:423) - Healed player returns to bench
- Position optimization happens silently without GoogusNow event feed posts (internal roster optimization)
- Example: Defender with 75 Forward, 68 Defender, 62 Goalie ratings automatically switches to Forward when benched
- Ensures bench players maintain maximum value by playing their strongest position
- Bench player overall ratings automatically update to reflect their new position
- Players can return to active roster at different position than when they were benched, if that's their best position

## [0.3.5] - 2025-11-22

### Added - GoogusNow Position Switch Event Feed Posts

- Implemented dedicated event feed posts for position switches displayed on GoogusNow
- Added `createPositionSwitchPost()` function in [eventFeed.ts:244-268](src/engine/eventFeed.ts:244-268) to generate position switch announcements
- Enhanced `autoFillMissingPosition()` in [rosterManager.ts:524-614](src/engine/rosterManager.ts:524-614) to return position switch information
- Enhanced `validateAndFixAllTeamRosters()` in [rosterManager.ts:616-665](src/engine/rosterManager.ts:616-665) to track all position switches
- Integrated position switch event generation in [SimulationControls.tsx:233-243](src/components/SimulationControls.tsx:233-243) and [LiveGame.tsx:267-277](src/components/LiveGame.tsx:267-277)
- Position switch posts include:
  - Player name and team
  - Old position and new position
  - New overall rating after the switch
  - Analyst commentary emphasizing roster flexibility and versatility
- Example posts:
  - "Code Crushers moves Jake Wilson from Defender to Forward. New overall: 73. Versatility!"
  - "Position change: Sarah Lee switches from Goalie to Defender for Silicon Sliders. (68 OVR)"
- Position switch events appear separately from signing events for better visibility
- Analysts celebrate team's strategic roster flexibility when players change positions
- Users now receive clear notifications on GoogusNow whenever a player switches positions due to roster needs

## [0.3.4] - 2025-11-22

### Added - Intelligent Position Switching for Roster Management

- Implemented intelligent position switching to fill vacant roster spots when no players of the required position are available
- Added `getPlayerRatingForPosition()` helper function in [rosterManager.ts:480-490](src/engine/rosterManager.ts:480-490) to retrieve a player's rating for any position
- Added `switchPlayerPosition()` function in [rosterManager.ts:492-496](src/engine/rosterManager.ts:492-496) to change a player's position and update their overall rating
- Enhanced `autoFillMissingPosition()` function in [rosterManager.ts:524-614](src/engine/rosterManager.ts:524-614) to evaluate all players based on position-specific ratings:
  - Compares bench player's rating at missing position vs all free agents' ratings at that position
  - Selects the player with highest position-specific rating regardless of their current position
  - Automatically switches player's position and updates overall rating when needed
  - Returns position switch information for event feed generation
- Example scenarios:
  - Team missing Forward with only Defender free agents available: Signs Defender with highest Forward rating and switches them to Forward
  - Team has Defender on bench with 75 Forward rating, best free agent Defender has 70 Forward rating: Promotes bench Defender and switches to Forward
- Ensures roster spots can always be filled even with limited position diversity in free agent pool
- Leverages existing position-specific rating system for optimal roster decisions

## [0.3.3] - 2025-11-22

### Added - Automatic Roster Minimum Enforcement

- Implemented automatic roster validation and enforcement to ensure teams always have minimum 3 active players (1 Forward, 1 Goalie, 1 Defender)
- Added `validateTeamRoster()` function in [rosterManager.ts:498-522](src/engine/rosterManager.ts:498-522) to check if team has required positions
- Added `autoFillMissingPosition()` function in [rosterManager.ts:524-608](src/engine/rosterManager.ts:524-608) to automatically fill vacant roster spots
- Added `validateAndFixAllTeamRosters()` function in [rosterManager.ts:610-634](src/engine/rosterManager.ts:610-634) to process all teams
- Automatic roster filling logic evaluates best available options:
  - If bench player matches missing position and is better than best free agent, promote bench player to active roster
  - If best free agent is better than bench player (or no bench player available), sign the best free agent for the position
  - System always selects the highest overall rated player available for the missing position
- Integrated roster validation in [SimulationControls.tsx:223-233](src/components/SimulationControls.tsx:223-233) after injury processing
- Integrated roster validation in [LiveGame.tsx:257-267](src/components/LiveGame.tsx:257-267) after injury processing
- Validation runs automatically after IR returns to ensure no team is left with incomplete roster
- Event feed posts automatically generated when players are signed to fill roster gaps
- Ensures teams can always field a complete lineup and prevents simulation errors due to incomplete rosters
- Handles edge cases where multiple injuries could leave a team below the 3-player minimum

## [0.3.2] - 2025-11-21

### Changed - Roster Page Player Stats Display to Expandable Dropdown

- Converted roster page player stats from always-visible side-by-side display to expandable dropdown format
- Position and OVR remain always visible for quick reference
- All detailed stats (FWD, DEF, G, GP, Goals, A, P, Saves, GA) now hidden by default in collapsible section
- Click anywhere on player row to expand/collapse detailed stats
- Added state management using `useState` with `Set<string>` to track which players are expanded in [Roster.tsx:7](src/components/Roster.tsx#L7)
- Created `togglePlayerExpanded()` function in [Roster.tsx:22-31](src/components/Roster.tsx#L22-L31) to handle expand/collapse logic
- Created `getDetailedStats()` function in [Roster.tsx:34-51](src/components/Roster.tsx#L34-L51) to generate stats for expanded view
- Restructured `renderPlayer()` function in [Roster.tsx:53-82](src/components/Roster.tsx#L53-L82) with:
  - `.player-header` div that handles click events and displays basic info
  - `.player-basic-info` div containing Position, OVR, and expand indicator (▶/▼)
  - Conditional `.player-details` div that renders when expanded
- Added new CSS classes in [App.css:684-730](src/App.css#L684-L730):
  - `.player-header` - flexbox layout with hover effect
  - `.player-basic-info` - displays Position, OVR, and arrow indicator
  - `.expand-indicator` - shows ▶ when collapsed, ▼ when expanded
  - `.player-details` - displays detailed stats with top border separator
- Improved roster page density and scannability
- Users can quickly scan all players by Position and OVR, then expand to see full details as needed

## [0.3.1] - 2025-11-21

### Added - Overall (OVR) Attribute Display on Roster Page

- Added "OVR" (Overall) attribute to roster page that displays the position rating for the player's current position
- Created `getCurrentPositionRating()` helper function in [Roster.tsx:8-19](src/components/Roster.tsx#L8-L19) to calculate OVR based on player's position
- OVR is calculated dynamically based on player position:
  - Forward position displays `forwardRating` as OVR
  - Defender position displays `defenderRating` as OVR
  - Goalie position displays `goalieRating` as OVR
- Updated `getPlayerAttributes()` in [Roster.tsx:21-41](src/components/Roster.tsx#L21-L41) to include OVR attribute
- OVR appears immediately after Position attribute in the player attribute list
- Provides quick visibility of player's effectiveness at their current position
- Makes it easier to compare players and make roster decisions

## [0.3.0] - 2025-11-21

### Added - Position-Specific Skill Ratings

- Implemented position-specific skill ratings system where each player has separate ratings for Forward, Defender, and Goalie positions
- Updated Player interface in [types.ts:26-28](src/types.ts#L26-L28) to include `forwardRating`, `defenderRating`, and `goalieRating` fields
- Player's `overall` rating now matches their primary position's rating (e.g., a Forward's overall equals their forwardRating)
- Secondary position ratings are generated at 60-85% of their primary position rating (minimum 60)
- Modified [seedData.ts:71-99](src/data/seedData.ts#L71-L99) to add `generatePositionRatings()` function that creates position-specific ratings on player creation
- Updated [seedData.ts:107-108](src/data/seedData.ts#L107-L108) in `createPlayer()` to initialize all three position ratings for new players
- Modified [seasonManager.ts:6-32](src/engine/seasonManager.ts#L6-L32) in `processPlayerDevelopment()` to update all position ratings during yearly development
- All position ratings improve/regress independently each season, then overall is synced to match current position rating
- Updated [seasonManager.ts:90-109](src/engine/seasonManager.ts#L90-L109) in `generateReplacementPlayers()` to include position ratings for rookie players
- Modified [Roster.tsx:10-13](src/components/Roster.tsx#L10-L13) to display all three position ratings (FWD, DEF, G) in roster view
- Added migration logic in [AppContext.tsx:72-106](src/context/AppContext.tsx#L72-L106) to automatically add position ratings to existing saved players
- Example: A player might be an 81 overall Forward (81 FWD rating), 75 DEF rating, and 60 G rating
- Position ratings evolve independently over time through the yearly development system
- Provides deeper player progression tracking and potential for future position changes

## [0.2.11] - 2025-11-21

### Fixed - Playoffs Not Ready After Simulating to End of Season

- Fixed race condition where `isSeasonComplete` flag was not set to true after using "Simulate Full Season" button
- Issue occurred when the final game's state update completed after the simulation loop ended, leaving playoffs unavailable
- Modified [SimulationControls.tsx:258-273](src/components/SimulationControls.tsx#L258-L273) in `simulateFullSeason()` to add final season completion check
- Added 100ms delay after all games are simulated to ensure state has propagated
- Final check verifies all regular season games are marked as 'Final' before setting `isSeasonComplete` to true
- Playoffs are now immediately available after simulating full season without requiring page reload
- Ensures consistent behavior regardless of React state batching or update timing

## [0.2.10] - 2025-11-21

### Fixed - React Duplicate Key Error in League History

- Fixed React warning "Encountered two children with the same key, `2026`" when opening the History tab
- Root cause: Duplicate season entries in `seasonHistory` array combined with non-unique React keys
- Modified [LeagueHistory.tsx:14-15](src/components/LeagueHistory.tsx#L14-L15) to use composite key combining year and index
- Changed from `key={season.year}` to `key={`${season.year}-${index}`}` to ensure uniqueness
- Added duplicate prevention check in [seasonManager.ts:126-146](src/engine/seasonManager.ts#L126-L146)
- `advanceSeason()` now checks if season year already exists before adding to history array
- Prevents duplicate season records from being created during state mutations or re-renders
- Ensures React can properly track and render each season history item without key conflicts

## [0.2.9] - 2025-11-21

### Fixed - Playoff Game Simulation State Mutation Bug

- Fixed bug where clicking "Simulate Game 1" button would not simulate any games due to improper state management
- Root cause: Shallow copying of arrays with spread operator created new arrays but retained references to objects within those arrays
- When `simulatePlayoffGame()` mutated game and series objects, it was mutating objects shared between old and new state
- Modified [Playoffs.tsx:62-64](src/components/Playoffs.tsx:62-64) in `simulateNextGame()` to create deep copies of games and playoff series objects using `.map(obj => ({ ...obj }))`
- Modified [Playoffs.tsx:104-107](src/components/Playoffs.tsx:104-107) in `simulateAllSemifinalGames()` to create deep copies of objects
- Modified [Playoffs.tsx:170-173](src/components/Playoffs.tsx:170-173) in `simulateAllChampionshipGames()` to create deep copies of objects
- Each object in the games and playoffSeries arrays is now properly copied before mutations occur
- Game 1 button now correctly simulates only Game 1 and creates Game 2 in "Scheduled" state
- Game 2 button correctly simulates only Game 2 and creates Game 3 if needed
- Prevents unintended side effects from state mutations across React re-renders

## [0.2.8] - 2025-11-21

### Fixed - Season Simulation Race Condition

- Fixed race condition in "Simulate Full Season" functionality that prevented one or more games from being marked as Final
- Issue occurred when multiple game simulations were triggered with short setTimeout intervals (50ms), causing state updates to overlap
- Modified [SimulationControls.tsx:252-272](src/components/SimulationControls.tsx:252-272) to use recursive sequential simulation instead of parallel forEach with setTimeout
- Changed `simulateFullSeason()` to use `simulateNextGame()` helper function that processes games one at a time
- Each game now waits for the previous game's state update to complete before simulating the next game
- Added `Game` type import to support the new implementation
- Playoffs now properly become available after simulating the full season
- Ensures all regular season games are marked as Final before playoffs can begin
- Resolves issue where `isSeasonComplete` flag was not set to true due to incomplete game simulations

## [0.2.7] - 2025-11-21

### Fixed - Playoffs Not Starting When Regular Season Complete

- Fixed bug where `isSeasonComplete` flag was not properly set to true after all regular season games were final
- Issue occurred when playoff games were added to the games array, causing season completion check to return false
- Modified [scheduleGenerator.ts:129-133](src/engine/scheduleGenerator.ts:129-133) to filter out playoff games (games with `seriesId`) when checking if regular season is complete
- Updated `isSeasonComplete()` to only check regular season games, not playoff games
- Updated [scheduleGenerator.ts:119-121](src/engine/scheduleGenerator.ts:119-121) `getNextScheduledGame()` to exclude playoff games
- Updated [scheduleGenerator.ts:124-126](src/engine/scheduleGenerator.ts:124-126) `getNextScheduledGames()` to exclude playoff games
- Updated [SimulationControls.tsx:254](src/components/SimulationControls.tsx:254) `simulateFullSeason()` to only simulate regular season games
- Updated [SimulationControls.tsx:266](src/components/SimulationControls.tsx:266) `hasScheduledGames` check to exclude playoff games
- Regular season simulation controls now properly disable when regular season is complete
- Playoffs can now be started immediately after regular season completion
- Playoff games are now handled exclusively through the Playoffs component, not the simulation controls

## [0.2.6] - 2025-11-21

### Fixed - Schedule Generation to Generate 20 Games Per Team

- Updated schedule generator to ensure each team plays exactly 20 games (10 home, 10 away) as specified in VISION.md
- Previous implementation was only generating 10 games per team (5 home, 5 away)
- Modified [scheduleGenerator.ts:27-98](src/engine/scheduleGenerator.ts:27-98) to track matchups using Maps instead of arrays
- Updated logic to ensure each team plays each opponent 4 times total (2 home, 2 away)
- With 6 teams, each team now plays its 5 opponents 4 times each (5 × 4 = 20 games)
- Changed tracking structure from simple arrays to `Map<string, number>` to count games per opponent
- Added `gamesPerOpponentPerVenue` constant set to 2 to configure home/away balance
- Schedule now generates 60 total games per season (6 teams × 10 home games each)
- All teams properly balanced with 10 home games and 10 away games
- Maintains random date assignment and exactly 1 Outdoor Rink game per season

## [0.2.5] - 2025-11-21

### Fixed - Duplicate Game Stat Updates

- Fixed bug where game completion logic was executing multiple times, causing duplicate stat increments
- Applied fix to both live game simulation and instant simulation modes
- Added status check in [LiveGame.tsx:88](src/components/LiveGame.tsx:88) inside setState callback to return early if game is already marked as 'Final'
- Added status check in [SimulationControls.tsx:49](src/components/SimulationControls.tsx:49) inside simulateGameInstant to prevent processing already-completed games
- Added `hasCompletedGame` useRef in [LiveGame.tsx:25](src/components/LiveGame.tsx:25) to prevent useEffect from triggering multiple setState calls
- Prevents `gamesPlayed`, `wins`, `losses`, and other stats from being incremented more than once per game
- Fixes affect all simulation modes:
  - Single game (live view)
  - Single game (instant)
  - Simulate 10 games
  - Simulate full season
- Resolves issue caused by React 18 StrictMode double-invoking effects and setState callback re-execution
- Each game now correctly increments stats exactly once regardless of simulation mode

## [0.2.4] - 2025-11-21

### Fixed - Game Simulation Scorer Selection Error

- Fixed "Cannot read properties of undefined (reading 'name')" error that occurred during full season simulation
- Improved scorer selection logic in [gameSimulator.ts:91-108](src/engine/gameSimulator.ts:91-108) to handle edge cases
- Added fallback logic to ensure a valid scorer is always selected when generating goal events:
  - Primary: 70% chance to select a forward (if forwards exist)
  - Fallback 1: Select from other positions if forwards weren't chosen
  - Fallback 2: Select from forwards if other positions array is empty
  - Fallback 3: Select any active player as last resort
- Prevents undefined scorer errors that could occur when player position arrays are empty
- Ensures game simulation completes successfully for full season simulations

## [0.2.3] - 2025-11-21

### Fixed - Duplicate Playoff Games Bug

- Fixed bug where duplicate Game 1s were appearing during playoff simulation
- Added duplicate prevention logic in [playoffsManager.ts:75-79](src/engine/playoffsManager.ts:75-79) to check if game ID already exists before generating new game
- Modified `generateNextSeriesGame()` to return null if a game with the calculated ID already exists in the games array
- Removed redundant duplicate checks in [Playoffs.tsx](src/components/Playoffs.tsx) since duplicates are now prevented at generation time
- Playoff series now correctly display exactly one game of each number (Game 1, Game 2, and optionally Game 3)
- Ensures proper best-of-3 series progression without duplicate games appearing in UI

## [0.2.2] - 2025-11-21

### Added - Automatic IR Return and Roster Management

- Implemented intelligent automatic roster management when players return from Injury Reserve
- Added [autoReturnFromIR()](src/engine/rosterManager.ts:335-445) function to handle individual player returns with three possible outcomes
- Added [processAllTeamIRReturns()](src/engine/rosterManager.ts:447-478) function to process all healed players across all teams
- Automatic return logic evaluates healed players and makes roster decisions:
  - **Scenario 1 - Better than active player**: Healed player moves to active roster, current active player of same position moves to bench, bench player is released to free agency
  - **Scenario 2 - Better than bench player**: Healed player moves to bench, current bench player is released to free agency
  - **Scenario 3 - Worse than both**: Healed player is released directly to free agency
- Enhanced [SimulationControls.tsx](src/components/SimulationControls.tsx:156-218) to process IR returns after injury recovery
- Enhanced [LiveGame.tsx](src/components/LiveGame.tsx:186-244) to process IR returns after injury recovery
- Added new event feed post types in [eventFeed.ts](src/engine/eventFeed.ts:200-242):
  - `createIRReturnToActivePost()` - announces when player returns to active roster
  - `createIRReturnToBenchPost()` - announces when player returns to bench
  - Enhanced use of `createReleasePost()` for players dropped during IR returns
- System automatically generates feed posts for all roster moves during IR returns
- All roster transactions maintain proper player states and team associations
- Ensures teams always have their best available players on active roster and bench

## [0.2.1] - 2025-11-21

### Added - Automatic Injury Recovery System

- Implemented automatic injury recovery that decrements injury duration after each game simulation
- Players on Injury Reserve (IR) now heal progressively as games are simulated
- Injury tracking now properly counts down days remaining for each injured player
- Modified [SimulationControls.tsx](src/components/SimulationControls.tsx:138-154) to process injury recovery after each instant game simulation
- Modified [LiveGame.tsx](src/components/LiveGame.tsx:168-184) to process injury recovery after each live game simulation
- Injury recovery logic:
  - Decrements `injuryDaysRemaining` by 1 for each IR player after every game
  - Synchronizes the player's injury status with the global `injuries` tracking array
  - Automatically removes healed injuries (0 days remaining) from the injuries array
- Enhanced [Roster.tsx](src/components/Roster.tsx:55-61) to display injury status with improved formatting:
  - Shows "IR - X days remaining" for injured players (with proper singular/plural handling)
  - Shows "IR - Healthy (Ready to Return)" when `injuryDaysRemaining` reaches 0
  - Handles undefined values gracefully using nullish coalescing
- Players become eligible to return from IR once their injury days reach 0
- Example: A player with a 14-day injury will show "14 days remaining" initially, then "13 days remaining" after the next game, continuing until they reach "Healthy (Ready to Return)"
- Ensures realistic injury progression throughout the season

## [0.2.0] - 2025-11-21

### Added - Automatic Bench Player Promotion

- Implemented automatic roster optimization system that promotes bench players with higher overall ratings to active roster
- Added `autoSwapBenchWithActive()` function in [rosterManager.ts](src/engine/rosterManager.ts:278) to handle individual team roster swaps
- Added `processAllTeamAutoSwaps()` function in [rosterManager.ts](src/engine/rosterManager.ts:318) to process all teams at once
- Auto-swap logic automatically triggers during:
  - Team initialization in [seedData.ts](src/data/seedData.ts:123) when teams are first created
  - Season advancement in [seasonManager.ts](src/engine/seasonManager.ts:175) after player development occurs
- System only swaps players at the same position (Forward, Goalie, or Defender)
- Bench player must have strictly higher overall rating (>, not ≥) than active player to trigger swap
- Player states are properly updated ('Active' and 'Bench') when swaps occur
- Ensures teams always field their best available lineup at each position

## [0.1.9] - 2025-11-21

### Fixed - Duplicate React Keys in Playoff Games

- Fixed React warning about duplicate keys when rendering playoff games
- Added check to prevent duplicate game IDs from being added to the games array
- Modified `simulateNextGame()`, `simulateAllSemifinalGames()`, and `simulateAllChampionshipGames()` functions in `Playoffs.tsx` to verify game doesn't already exist before adding it to state
- Each function now uses `!newState.games.some(g => g.id === newGame.id)` check before pushing new games
- Eliminates console warnings about non-unique keys that could cause unpredictable React behavior

## [0.1.8] - 2025-11-21

### Changed - Game Scheduling Periods

- Updated regular season game schedule to run from January 2 through May 31
- Updated playoff games to take place in June
- Modified `scheduleGenerator.ts` to generate regular season games only between January 2 and May 31 (previously January 1 - December 31)
- Modified `Playoffs.tsx` to schedule semifinal games starting June 1st (previously December 20)
- Modified `Playoffs.tsx` to schedule championship games starting June 15th (previously December 28)
- Updated all playoff-related fallback dates to use June dates (06-01 and 06-15) instead of December dates
- Season now follows a realistic timeline: regular season (January-May) followed by playoffs (June)

## [0.1.7] - 2025-11-21

### Added - Current Game Date Display

- Added current game date display to the main header section of the application
- Date appears below the tagline "The Premier Knee Hockey League" in the header
- Date format is human-readable (e.g., "January 1, 2026") using `toLocaleDateString()`
- Date automatically updates when games are simulated and advances to the next scheduled game
- Created `formatDate()` helper function to convert ISO date strings to readable format
- Added CSS styling for `.current-date` class with white text, font-weight 600, and 0.95 opacity
- Date is displayed on all views and provides clear visibility of current simulation progress

### Fixed - Game Date Display and Update Issues

- Fixed date formatting to parse ISO date strings as local time instead of UTC to prevent timezone offset issues
- Updated `formatDate()` function to manually parse date components (year, month, day) to avoid displaying previous day
- Added missing gameDate update logic to LiveGame component to ensure date advances after live game simulations
- Date now correctly starts at January 1, 2026 instead of displaying as December 31, 2025
- Game date now updates properly after both instant simulations (SimulationControls) and live game simulations (LiveGame)

## [0.1.6] - 2025-11-21

### Changed - Color Scheme

- Updated application color scheme from purple/gray to dark green and white theme
- Changed body background gradient from black (#0a0a0a to #1a1a1a) to dark green (#0d3d0d to #1a5c1a)
- Updated all borders from green neon (#00ff00) and gray (#ddd) to white
- Changed all headings and text colors to white for visibility on dark green backgrounds
- Updated sidebar and main content backgrounds to dark green (#0d3d0d)
- Changed all navigation buttons: white background with dark green text (#0d3d0d), dark green background with white text when active
- Updated all table elements to display white text on dark green backgrounds
- Changed all card backgrounds to dark green shades (#0d3d0d and #1a5c1a)
- Updated all button backgrounds to white with dark green text, dark green active states
- Changed game header gradient from purple (#667eea to #764ba2) to dark green (#1a5c1a to #2d7a2d)
- Updated all hover effects to use white box shadows instead of dark shadows
- Changed disabled button states to dark green backgrounds
- All text is now visible with proper contrast throughout the application

## [0.1.5] - 2025-11-21

### Added - Date Tracking System

- Implemented comprehensive date tracking system to track game dates throughout the simulation
- Added `gameDate` field to `AppState` to track the current simulation date
- Updated `Game` interface to use actual ISO date strings (YYYY-MM-DD) instead of day numbers
- Game dates are now randomly assigned throughout the calendar year when schedule is generated
- Calendar view now displays actual dates (e.g., "Jan 15, 2026") instead of generic day numbers
- Current game date advances automatically to the next scheduled game after each simulation
- Season progression now properly resets game date to January 1 of the new year
- Playoff games are scheduled in late December (semifinals start Dec 20, championship starts Dec 28)
- Migration logic added to automatically convert existing saved games from day-based to date-based system
- Date format uses ISO 8601 standard (YYYY-MM-DD) for consistency and easy sorting
- Date display formatting includes month abbreviation, day, and year for improved readability
- Schedule generator updated to use Date API for precise date calculations
- All playoff simulation functions updated to work with dates instead of day numbers

### Technical Changes

- Modified `scheduleGenerator.ts`:
  - Added `getRandomDateInYear()` helper function to generate random dates within a year
  - Updated `generateSchedule()` to accept year parameter and assign actual dates to games
  - Games are sorted by date string using `localeCompare()` for chronological ordering
- Modified `playoffsManager.ts`:
  - Updated `generateSeriesGames()` to accept date string instead of day number
  - Updated `generateNextSeriesGame()` to calculate subsequent game dates from series start date
  - Updated `simulatePlayoffGame()` signature to use date strings
- Modified `AppContext.tsx`:
  - Added backward compatibility migration for old `day` field to new `date` field
  - Migration converts day numbers to actual dates based on current year
  - Automatically adds `gameDate` to saved states that are missing it
- Modified `SimulationControls.tsx`:
  - Added logic to update `gameDate` to next scheduled game's date after simulation
- Modified `seasonManager.ts`:
  - Updated `advanceSeason()` to return new game date set to January 1 of new year
- Modified `Playoffs.tsx`:
  - Updated all playoff simulation functions to use date-based logic
  - Playoff start dates calculated using Date API for December scheduling
- Modified `Calendar.tsx`:
  - Added `formatDate()` function to display human-readable dates
  - Updated grouping logic to group games by date string instead of day number
  - Dates displayed in format "MMM D, YYYY" (e.g., "Jan 15, 2026")

## [0.1.4] - 2025-11-21

### Added - Roster View

- Added new "Roster" menu item to main navigation
- Created Roster component to display comprehensive team rosters and free agents
- Roster view displays all 6 teams with their complete roster information:
  - Active players (3 per team: Forward, Goalie, Defender)
  - Bench player (if present)
  - Injury Reserve section (only shown when team has players on IR)
- Player information displayed includes:
  - Player name and position
  - Overall rating
  - Season stats (GP, G, A, P)
  - Goalie-specific stats (Saves, Goals Against) when applicable
- Injured players display days remaining until recovery
- Free agents section shows all available players with their attributes
- Added responsive grid layout for team rosters (2 columns on desktop, 1 on mobile)
- Styled with consistent purple theme matching existing application design
- Player cards use left border color coding and attribute badges for clear data visualization

### Enhanced - Multiple Injury Reserve Slots

- Changed IR from single slot to unlimited array of injured players
- Teams can now have multiple players on IR simultaneously
- IR section only displays in roster view when team actually has injured players
- Updated Team interface to use `irPlayers: Player[]` instead of `irPlayer?: Player`
- Updated all injury handling logic to support multiple IR players:
  - SimulationControls and LiveGame now push injured players to IR array
  - rosterManager functions updated to work with IR array
  - statsManager and seasonManager updated to iterate over IR arrays
- Backward compatibility: AppContext automatically migrates old saved data from single `irPlayer` to `irPlayers` array
- Seed data generation updated to initialize empty IR arrays for new teams

### Enhanced - Automatic Injury Reserve Management

- Implemented automatic IR placement when players are injured during games
- When a player gets injured:
  - Injured player is automatically moved from active roster to IR
  - System automatically signs a replacement free agent with the same position
  - Team maintains 3 active players at all times (if replacement available)
- Updated both instant simulation and live game simulation with automatic IR handling
- Event feed posts automatically generated for:
  - Injury announcements
  - IR placements
  - Replacement player signings
- Ensures roster management follows vision.md specifications:
  - IR utilized immediately upon injury
  - Free agents signed automatically to maintain active roster size
  - Position matching enforced for replacements

## [0.1.3] - 2025-11-21

### Fixed - Best-of-3 Playoff Series Game Generation

- Fixed bug where all 3 games of a playoff series were generated upfront, causing unnecessary Game 3 to appear in UI even when series ended 2-0 or 2-1
- Modified `generateSeriesGames()` in `playoffsManager.ts` to only generate Game 1 initially instead of all 3 games
- Added new `generateNextSeriesGame()` function to dynamically create Game 2 or Game 3 only when needed
- Updated `simulatePlayoffGame()` to return the next game if series continues, or null if series is complete
- Modified all playoff simulation functions in `Playoffs.tsx` to handle dynamic game generation:
  - `simulateNextGame()`: Now adds newly generated game to state after simulation
  - `simulateAllSemifinalGames()`: Generates next game in loop only if series continues
  - `simulateAllChampionshipGames()`: Generates next game in loop only if series continues
- UI now correctly displays only the games that have been played or are currently scheduled (max 2 games for a 2-0 sweep, max 3 games for a 2-1 series)
- Maintains proper home team alternation (Game 1: team1 home, Game 2: team2 home, Game 3: team1 home)
- Fixed game numbering bug where next game was incorrectly numbered by changing logic to find the highest existing game number rather than counting games

## [0.1.2] - 2025-11-21

### Changed - Reset Button Position

- Repositioned "Reset Sim" button to bottom left of entire application viewport
- Changed from absolute positioning within nav container to fixed positioning on viewport
- Button now remains visible at bottom left corner regardless of scroll position
- Added z-index to ensure button stays above other content

## [0.1.1] - 2025-11-21

### Added - Reset Simulation Button

- Added "Reset Sim" button positioned at the bottom left of the navigation area
- Button includes confirmation dialog to prevent accidental resets
- Styled with red background color (#dc3545) to indicate destructive action
- Resets all simulation state including teams, games, history, and events
- Returns user to standings view after reset
- Created new navigation container structure to properly position reset button without overlapping main menu items

## [0.1.0] - 2025-11-21

### Changed - Best-of-3 Playoff Series

- Updated playoff structure from single elimination to best-of-3 series format
- Modified playoff semifinals: Each series now requires first team to win 2 games to advance
- Modified championship: Best-of-3 series to determine champion (first to 2 wins)
- Added `PlayoffSeries` interface to track series state (team matchups, wins, and winners)
- Enhanced `Game` interface with `seriesId` and `gameNumber` fields for series tracking
- Updated `playoffsManager.ts` with new functions:
  - `generatePlayoffSeries()`: Creates semifinal series instead of single games
  - `generateSeriesGames()`: Generates up to 3 games per series
  - `simulatePlayoffGame()`: Now updates series win counts
  - `isSeriesComplete()`: Checks if a team has won 2 games
  - `getNextSeriesGame()`: Finds next unplayed game in a series
  - `createChampionshipSeries()`: Creates championship series from semifinal winners
- Redesigned `Playoffs.tsx` component:
  - Displays series scores (wins) for each matchup
  - Shows individual game results within each series
  - Allows simulation of individual games or entire series
  - Separates semifinal and championship series controls
- Updated `AppState` to include `playoffSeries` array
- Updated `VISION.md` to document best-of-3 playoff format
- Home team alternates between games in each series (Game 1: team1 home, Game 2: team2 home, Game 3: team1 home)

## [0.0.0] - 2025-01-21

### Added - Initial Release

#### Core Data Models & Types
- Created comprehensive TypeScript types for all game entities (Player, Team, Game, Injury, Season)
- Defined position types (Forward, Goalie, Defender) and player states (Active, Bench, IR, Free Agent, Retired)
- Implemented game status tracking (Scheduled, In Progress, Final)
- Added simulation speed and mode types

#### Game Simulation Engine
- Implemented winner determination algorithm based on team overall ratings
- Added 5% home team advantage calculation
- Created realistic score generation (2-5 goals per team)
- Implemented overtime mechanics (15% chance when scores are tied)
- Built live game event generation system (goals, saves, shots, injuries, period ends)
- Added injury checking system (5% chance per player per game with variable duration)
- Implemented comprehensive player stats tracking (goals, assists, points, saves, games played)

#### Schedule & Season Management
- Built schedule generator creating 20 games per team (10 home, 10 away)
- Implemented random day assignment for games (1-365)
- Added venue assignment logic (exactly 1 game per year at Outdoor Rink, rest at Google Plus Arena)
- Created season completion detection
- Implemented team record calculation (wins, losses, overtime losses, points)

#### Roster Management System
- Built bench player swap functionality (requires higher overall rating)
- Implemented free agent signing system (must have higher overall than current bench player)
- Created comprehensive IR (Injury Reserve) system:
  - Move injured players to IR slot
  - Sign replacement players from free agency
  - Return healed players from IR
  - Automatic roster validation
- Added player position matching requirements for all roster moves

#### Stats & Standings
- Implemented league-wide stat tracking for all players
- Created league leaders system for goals, assists, points, and saves
- Built team standings calculator with proper point system (2 pts for win, 1 pt for OT loss)
- Added both season and career stat tracking
- Implemented top 10 leaders display for each category

#### Playoffs System
- Built playoff bracket generator (top 4 teams qualify)
- Implemented semifinal matchups (Seed 1 vs 4, Seed 2 vs 3)
- Created championship game system
- Added playoff game simulation
- Implemented champion determination

#### Season Progression
- Built year advancement system
- Implemented player development algorithm:
  - 60% chance players improve (1-3 points increase)
  - 40% chance players regress (1-2 points decrease)
  - Overall rating capped at 95 (max) and 60 (min)
- Created player retirement system (10% chance for veterans with 60+ career games)
- Implemented automatic replacement player generation
- Added league history recording (champions and stat leaders by season)

#### Event Feed System (GoogusNow)
- Built social media-style event feed
- Created 6 unique analyst personas with @ usernames:
  - @GoogusGuru
  - @KneeHockeyKing
  - @PuckProphet
  - @RinkReporter
  - @StickSavant
  - @GoalieGazer
- Implemented automatic post generation for:
  - Game results (with final scores and overtime notation)
  - Player injuries
  - Roster moves (signings, releases, IR placements)
  - Season start announcements
  - Playoff start announcements
  - Championship celebrations
  - Player retirements

#### Seed Data Generation
- Created 6 teams with unique names:
  - Googus Goons
  - Silicon Sliders
  - Code Crushers
  - Byte Bashers
  - Debug Demons
  - Stack Smashers
- Implemented random player name generation (35 first names, 30 last names)
- Built initial roster generation (3 active players, 1 bench player per team)
- Created 10 initial free agents with random positions and ratings
- Set overall rating range (65-90) for realistic gameplay

#### User Interface Components

**Main Application**
- Built main app shell with navigation system
- Implemented view switching (Standings, Leaders, History, Feed, Calendar, Playoffs)
- Created responsive layout with sidebar and main content area
- Added live game view integration

**Standings View**
- Created sortable standings table
- Displayed GP, W, L, OTL, and PTS columns
- Implemented real-time updates after game simulation

**League Leaders View**
- Built 4-column grid layout for stat categories
- Added toggle between season and career stats
- Implemented top 10 display for each category
- Created ranked list format with player names and values

**League History View**
- Built chronological display of past seasons
- Added champion highlighting
- Displayed stat leaders for each completed season
- Implemented "no data yet" state for new leagues

**Event Feed (GoogusNow) View**
- Created social media-style post layout
- Added analyst attribution with color coding
- Implemented timestamp display
- Built post type badges (Game Result, Injury, Roster Move, Other)
- Added reverse chronological sorting

**Calendar View**
- Built visual calendar grid layout
- Displayed games grouped by day
- Added venue information for each game
- Implemented color-coded game status (scheduled, in progress, final)
- Showed final scores for completed games

**Simulation Controls**
- Created sidebar control panel
- Implemented 3 simulation modes:
  - Single Game (with live view option)
  - Simulate 10 Games
  - Simulate Full Season
- Added button state management (disabled when appropriate)
- Implemented simulation progress indicator

**Live Game View**
- Built full-screen live game experience
- Created large scoreboard display with team names and scores
- Implemented real-time event feed with animated appearance
- Added pause/resume functionality
- Built speed controls (Slow/Fast toggle)
- Created event type color coding (goals, saves, injuries)
- Added minute-by-minute event display
- Implemented game completion summary

**Playoffs View**
- Built playoff bracket visualization
- Created semifinal and championship sections
- Added simulation controls for each playoff round
- Implemented "Advance to Next Season" button after championship
- Displayed matchups and results

#### Data Persistence
- Implemented localStorage-based state management
- Created automatic save on state changes
- Built state restoration on app load
- Added reset functionality
- Implemented error handling for corrupted save data

#### Styling & Design
- Created modern purple gradient theme (#667eea to #764ba2)
- Implemented clean, card-based UI design
- Built responsive layout (mobile, tablet, desktop)
- Added smooth transitions and hover effects
- Created color-coded elements:
  - Active buttons: purple gradient
  - Game statuses: blue (scheduled), yellow (in progress), green (final)
  - Event types: green (goals), blue (saves), red (injuries)
- Implemented shadow effects for depth
- Added rounded corners throughout
- Created professional typography hierarchy

#### Technical Infrastructure
- Set up React 19 with TypeScript
- Configured Vite build system
- Integrated Cloudflare Workers support
- Implemented React Context for state management
- Created modular engine architecture
- Built type-safe codebase with strict TypeScript
- Set up ESLint for code quality
- Configured SWC for fast compilation

### Project Structure
```
src/
   types.ts                      # Core TypeScript type definitions
   App.tsx                       # Main application component
   App.css                       # Global styles
   context/
      AppContext.tsx           # State management & localStorage
   data/
      seedData.ts              # Initial team & player generation
   engine/
      gameSimulator.ts         # Game simulation logic
      scheduleGenerator.ts     # Schedule creation
      rosterManager.ts         # Roster & IR management
      statsManager.ts          # Stats & standings
      playoffsManager.ts       # Playoff bracket & simulation
      seasonManager.ts         # Season progression & development
      eventFeed.ts             # GoogusNow post generation
   components/
       Standings.tsx            # Standings table view
       LeagueLeaders.tsx        # Stat leaders view
       LeagueHistory.tsx        # Historical records view
       EventFeed.tsx            # GoogusNow feed view
       Calendar.tsx             # Schedule calendar view
       SimulationControls.tsx   # Simulation mode controls
       LiveGame.tsx             # Live game simulation view
       Playoffs.tsx             # Playoff bracket view
```

### Features Summary

 **6 Teams** with full roster management
 **3 Simulation Modes** (single, 10 games, full season)
 **Live Game View** with speed controls and pause/resume
 **Injury System** with IR management
 **Free Agent Market** with signing restrictions
 **20-Game Schedule** with random day distribution
 **Venue Variety** (1 outdoor game per year)
 **4-Team Playoffs** with bracket system
 **Season Progression** with player development
 **Retirement System** with career stat preservation
 **Event Feed** with 6 analyst personas
 **Stats Tracking** (season and career)
 **League History** with champions and records
 **localStorage Persistence** for save/load functionality
 **Responsive Design** for all screen sizes

### Known Limitations
- Single-browser persistence (no cloud sync)
- No multiplayer or user team control
- Fixed team roster size (3 active, 1 bench, 1 IR)
- Automated GM decisions only

### Development Notes
- Built with React 19.1.1 and TypeScript 5.8.3
- Uses Vite 7.1.2 for fast development and builds
- Deployable to Cloudflare Workers
- All code is type-safe with strict TypeScript configuration
- Successfully builds with zero errors
