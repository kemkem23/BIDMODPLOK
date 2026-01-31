import React, { useMemo } from 'react';
import { API_BASE } from '../config';
import './LaneCard.css';

const backendOrigin = API_BASE.replace(/\/api$/, '');

function LaneCard({ label, entry }) {
  const times = entry && entry.team ? entry.times : null;

  const timesDisplay = useMemo(() => {
    if (!times) return null;
    const formatTime = (t) => (t != null ? t.toFixed(4) : 'xx');
    return (
      <table className="lane-stats-table">
        <tbody>
          <tr><td>ควอลิฟาย</td><td>{formatTime(times.qualify)}</td></tr>
          <tr><td>Run 1</td><td>{formatTime(times.run1)}</td></tr>
          <tr><td>Run 2</td><td>{formatTime(times.run2)}</td></tr>
          <tr><td>Run 3</td><td>{formatTime(times.run3)}</td></tr>
        </tbody>
      </table>
    );
  }, [times]);

  if (!entry || !entry.team) {
    return (
      <div className="lane-card">
        <div className="lane-label">{label}</div>
        <p>ว่าง</p>
      </div>
    );
  }

  const { team } = entry;

  return (
    <div className="lane-card">
      <div className="lane-label">{label}</div>
      {team.number != null && (
        <div className="lane-car-number">bike number {team.number}</div>
      )}
      <div className="lane-team-info">
        <div className="lane-team-name">
          {team.name}
          {team.photo ? (
            <img src={team.photo.startsWith('/') ? backendOrigin + team.photo : team.photo} alt={team.name} className="lane-team-photo" />
          ) : (
            <div className="lane-photo-placeholder">ชื่อทีม + รูปทีม</div>
          )}
        </div>
      </div>
      <div className="lane-stats">
        <h4 className="lane-stats-title">สถิติ</h4>
        {timesDisplay}
      </div>
    </div>
  );
}

export default React.memo(LaneCard);
