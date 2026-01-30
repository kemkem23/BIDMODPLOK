import React from 'react';
import LaneCard from './LaneCard';
import useTrackData from '../hooks/useTrackData';
import './TrackView.css';

function TrackView() {
  const { race, loading, error } = useTrackData();

  if (loading) return <div className="track-view"><p>กำลังโหลด...</p></div>;
  if (error) return <div className="track-view"><p>เกิดข้อผิดพลาด</p></div>;
  if (!race) return <div className="track-view"><p>ยังไม่มีการแข่งขัน</p></div>;

  return (
    <div className="track-view">
      <h2 className="track-title">TRACK</h2>
      <div className="track-lanes">
        <LaneCard label="เลนซ้าย" entry={race.left} />
        <LaneCard label="เลนขวา" entry={race.right} />
      </div>
    </div>
  );
}

export default React.memo(TrackView);
