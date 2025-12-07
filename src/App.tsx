import { useState } from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import { Stats } from './components/Stats';
import { LeagueHistory } from './components/LeagueHistory';
import { EventFeed } from './components/EventFeed';
import { Calendar } from './components/Calendar';
import { SimulationControls } from './components/SimulationControls';
import { LiveGame } from './components/LiveGame';
import { Playoffs } from './components/Playoffs';
import { Roster } from './components/Roster';
import { Achievements } from './components/Achievements';

type View = 'stats' | 'history' | 'feed' | 'calendar' | 'playoffs' | 'roster' | 'achievements';

// Helper function to format date
const formatDate = (dateString: string): string => {
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

function AppContent() {
  const { state, resetState } = useAppContext();
  const [currentView, setCurrentView] = useState<View>('stats');
  const [liveGameId, setLiveGameId] = useState<string | null>(null);

  const handleLiveGameStart = (gameId: string) => {
    setLiveGameId(gameId);
  };

  const handleLiveGameComplete = () => {
    setLiveGameId(null);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire simulation? This will delete all progress and cannot be undone.')) {
      resetState();
      setCurrentView('stats');
      setLiveGameId(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛸️ Googus Knee Hockey Association</h1>
        <p className="tagline">The Premier Knee Hockey League</p>
        <p className="current-date">{formatDate(state.gameDate)}</p>
      </header>

      <button
        className="reset-button"
        onClick={handleReset}
      >
        Reset Sim
      </button>

      <div className="nav-container">
        <nav className="app-nav">
          <button
            className={currentView === 'stats' ? 'active' : ''}
            onClick={() => setCurrentView('stats')}
          >
            Stats
          </button>
          <button
            className={currentView === 'history' ? 'active' : ''}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
          <button
            className={currentView === 'feed' ? 'active' : ''}
            onClick={() => setCurrentView('feed')}
          >
            GoogusNow
          </button>
          <button
            className={currentView === 'calendar' ? 'active' : ''}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </button>
          <button
            className={currentView === 'playoffs' ? 'active' : ''}
            onClick={() => setCurrentView('playoffs')}
          >
            Playoffs
          </button>
          <button
            className={currentView === 'roster' ? 'active' : ''}
            onClick={() => setCurrentView('roster')}
          >
            Roster
          </button>
          <button
            className={currentView === 'achievements' ? 'active' : ''}
            onClick={() => setCurrentView('achievements')}
          >
            Achievements
          </button>
        </nav>
      </div>

      {liveGameId ? (
        <div className="live-game-container">
          <LiveGame gameId={liveGameId} onComplete={handleLiveGameComplete} />
        </div>
      ) : (
        <div className="app-content">
          <aside className="sidebar">
            <SimulationControls onLiveGameStart={handleLiveGameStart} />
          </aside>

          <main className="main-content">
            {currentView === 'stats' && <Stats />}
            {currentView === 'history' && <LeagueHistory />}
            {currentView === 'feed' && <EventFeed />}
            {currentView === 'calendar' && <Calendar />}
            {currentView === 'playoffs' && <Playoffs />}
            {currentView === 'roster' && <Roster />}
            {currentView === 'achievements' && <Achievements />}
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
