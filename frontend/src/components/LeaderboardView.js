import React from 'react';
import ClassSection from './ClassSection';
import AllTeamsTable from './AllTeamsTable';
import useLeaderboard from '../hooks/useLeaderboard';
import './LeaderboardView.css';

function LeaderboardView({ isAdmin, role }) {
  const { classes, allResults, loading, error } = useLeaderboard();

  if (loading) return <div className="leaderboard-view"><p>กำลังโหลด...</p></div>;
  if (error) return <div className="leaderboard-view"><p>เกิดข้อผิดพลาด</p></div>;

  return (
    <div className="leaderboard-view">
      <h2 className="leaderboard-title">LEADER BOARD</h2>
      <div className="leaderboard-content">
        {classes.map((cls) => (
          <ClassSection key={cls.className} raceClass={cls} />
        ))}
      </div>
      <AllTeamsTable allResults={allResults} isAdmin={isAdmin} role={role} />
    </div>
  );
}

export default React.memo(LeaderboardView);
