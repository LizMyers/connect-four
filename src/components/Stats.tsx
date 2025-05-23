import React, { useState, useEffect } from 'react';
import StatsManager from '../utils/StatsManager';
import '../styles/Stats.css';

const Stats: React.FC = () => {
  const [stats, setStats] = useState(StatsManager.getStats());
  
  useEffect(() => {
    // Update stats when the component mounts
    setStats(StatsManager.getStats());
    
    // Create a custom event listener to refresh stats when they change
    const handleStatsChange = () => {
      setStats(StatsManager.getStats());
    };
    
    window.addEventListener('stats-updated', handleStatsChange);
    
    return () => {
      window.removeEventListener('stats-updated', handleStatsChange);
    };
  }, []);
  
  return (
    <div className="stats">
      <h3>Game Statistics</h3>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-value">{stats.playerWins}</span>
          <span className="stat-label">Player Wins</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.aiWins}</span>
          <span className="stat-label">Computer Wins</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.gamesPlayed}</span>
          <span className="stat-label">Games Played</span>
        </div>
      </div>
      <button 
        className="reset-stats-btn" 
        onClick={() => {
          StatsManager.resetStats();
          setStats(StatsManager.getStats());
        }}
      >
        Reset Stats
      </button>
    </div>
  );
};

export default Stats; 