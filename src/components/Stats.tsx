import React, { useState } from 'react';
import { Standings } from './Standings';
import { LeagueLeaders } from './LeagueLeaders';
import { Legacy } from './Legacy';

type StatsView = 'Standings' | 'Leaders' | 'Legacy';

export const Stats: React.FC = () => {
  const [activeView, setActiveView] = useState<StatsView>('Standings');

  return (
    <div className="stats">
      <h2>Stats</h2>

      {/* Sub-navigation */}
      <div className="stats-nav">
        <button
          className={activeView === 'Standings' ? 'active' : ''}
          onClick={() => setActiveView('Standings')}
        >
          Standings
        </button>
        <button
          className={activeView === 'Leaders' ? 'active' : ''}
          onClick={() => setActiveView('Leaders')}
        >
          Leaders
        </button>
        <button
          className={activeView === 'Legacy' ? 'active' : ''}
          onClick={() => setActiveView('Legacy')}
        >
          Legacy
        </button>
      </div>

      {/* Standings View */}
      {activeView === 'Standings' && <Standings />}

      {/* Leaders View */}
      {activeView === 'Leaders' && <LeagueLeaders />}

      {/* Legacy View */}
      {activeView === 'Legacy' && <Legacy />}
    </div>
  );
};
