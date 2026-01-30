import React from 'react';
import './Sidebar.css';

function Sidebar({ activeView, onViewChange, onLoginClick }) {
  return (
    <div className="sidebar">
      <button className="sidebar-btn" onClick={onLoginClick}>
        ทีมงาน login
      </button>
      <button
        className={`sidebar-btn ${activeView === 'TRACK' ? 'active' : ''}`}
        onClick={() => onViewChange('TRACK')}
      >
        TRACK
      </button>
      <button
        className={`sidebar-btn ${activeView === 'LEADERBOARD' ? 'active' : ''}`}
        onClick={() => onViewChange('LEADERBOARD')}
      >
        LEADERBOARD
      </button>
    </div>
  );
}

export default React.memo(Sidebar);
