import React from 'react';
import { useAppContext } from '../context/AppContext';

export const EventFeed: React.FC = () => {
  const { state } = useAppContext();

  // Sort posts by timestamp (newest first)
  const sortedPosts = [...state.feedPosts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="event-feed">
      <h2>GoogusNow</h2>
      <p className="feed-subtitle">The latest from knee hockey's top analysts</p>
      {sortedPosts.length === 0 ? (
        <p className="no-posts">No posts yet. Simulate games to see updates!</p>
      ) : (
        <div className="feed-posts">
          {sortedPosts.map((post) => (
            <div key={post.id} className={`feed-post ${post.isAchievement ? 'achievement' : ''} ${post.type === 'Hall Of Fame' ? 'hall-of-fame' : ''} ${post.type === 'Injury' ? 'injury' : ''} ${post.type === 'Retirement' ? 'retirement' : ''} ${post.type === 'Suspension' ? 'suspension' : ''}`}>
              <div className="post-header">
                <span className="analyst">{post.analyst}</span>
                <span className="post-type">{post.type}</span>
              </div>
              <p className="post-content">{post.content}</p>
              <span className="post-time">
                {new Date(post.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
