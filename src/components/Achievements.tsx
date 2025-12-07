import { useAppContext } from '../context/AppContext';

// Helper function to format date without timezone issues
const formatDate = (dateString: string): string => {
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const Achievements = () => {
  const { state } = useAppContext();

  return (
    <div className="achievements">
      <h2>Achievements</h2>
      <p className="achievements-subtitle">Track your accomplishments throughout your simulation journey</p>

      <div className="achievements-grid">
        {state.achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">
              {achievement.isUnlocked ? '🏆' : '🔒'}
            </div>
            <div className="achievement-content">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              {achievement.isUnlocked && achievement.unlockedDate && (
                <p className="unlock-date">
                  Unlocked: {formatDate(achievement.unlockedDate)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
