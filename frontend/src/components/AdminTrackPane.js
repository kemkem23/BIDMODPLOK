import React, { useState, useCallback } from 'react';
import useLeaderboard from '../hooks/useLeaderboard';
import { updateLeaderboard, postCurrentRace } from '../services/api';
import './AdminTrackPane.css';

const TIME_KEYS = ['qualify', 'run1', 'run2', 'run3'];
const TIME_LABELS = { qualify: 'Qualify', run1: 'Run 1', run2: 'Run 2', run3: 'Run 3' };

function useLane(allResults) {
  const [carNumber, setCarNumber] = useState('');
  const [times, setTimes] = useState({ qualify: '', run1: '', run2: '', run3: '' });
  const [saveStatus, setSaveStatus] = useState(null);

  const matched = allResults.find((r) => String(r.number) === String(carNumber));

  const onCarNumberChange = useCallback((val) => {
    setCarNumber(val);
    setSaveStatus(null);
    const found = allResults.find((r) => String(r.number) === String(val));
    if (found) {
      setTimes({
        qualify: found.times.qualify ?? '',
        run1: found.times.run1 ?? '',
        run2: found.times.run2 ?? '',
        run3: found.times.run3 ?? '',
      });
    } else {
      setTimes({ qualify: '', run1: '', run2: '', run3: '' });
    }
  }, [allResults]);

  const onTimeChange = useCallback((key, val) => {
    setTimes((prev) => ({ ...prev, [key]: val }));
  }, []);

  return { carNumber, setCarNumber: onCarNumberChange, matched, times, onTimeChange, saveStatus, setSaveStatus };
}

function parseTime(val) {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function AdminTrackPane() {
  const { allResults } = useLeaderboard();
  const left = useLane(allResults);
  const right = useLane(allResults);

  const handleSave = useCallback(async (lane, otherLane) => {
    if (!lane.matched) return;
    lane.setSaveStatus('saving');
    try {
      const parsedTimes = {};
      TIME_KEYS.forEach((k) => { parsedTimes[k] = parseTime(lane.times[k]); });

      await updateLeaderboard([{ teamId: lane.matched.team.id, times: parsedTimes }]);

      const buildSide = (l) => {
        if (!l.matched) return { team: null, times: { qualify: null, run1: null, run2: null, run3: null } };
        const t = {};
        TIME_KEYS.forEach((k) => { t[k] = parseTime(l.times[k]); });
        return { team: l.matched.team, times: t };
      };
      await postCurrentRace({ left: buildSide(left), right: buildSide(right) });

      lane.setSaveStatus('saved');
      setTimeout(() => lane.setSaveStatus(null), 2000);
    } catch {
      lane.setSaveStatus('error');
    }
  }, [left, right]);

  const renderLane = (label, lane, otherLane) => (
    <div className="admin-track-lane">
      <div className="admin-track-lane-label">{label}</div>
      <input
        className="admin-track-car-input"
        type="number"
        placeholder="หมายเลขรถ"
        value={lane.carNumber}
        onChange={(e) => lane.setCarNumber(e.target.value)}
      />
      {lane.carNumber && !lane.matched && (
        <div className="admin-track-not-found">ไม่พบหมายเลขนี้</div>
      )}
      {lane.matched && (
        <>
          <div className="admin-track-team-name">{lane.matched.team.name}</div>
          {TIME_KEYS.map((key) => (
            <div key={key} className="admin-track-time-field">
              <label>{TIME_LABELS[key]}</label>
              <input
                type="number"
                step="0.0001"
                value={lane.times[key]}
                onChange={(e) => lane.onTimeChange(key, e.target.value)}
                placeholder="xx"
              />
            </div>
          ))}
          <button
            className="admin-track-save-btn"
            onClick={() => handleSave(lane, otherLane)}
            disabled={lane.saveStatus === 'saving'}
          >
            {lane.saveStatus === 'saving' ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          {lane.saveStatus === 'saved' && <div className="admin-track-msg success">บันทึกสำเร็จ</div>}
          {lane.saveStatus === 'error' && <div className="admin-track-msg error">เกิดข้อผิดพลาด</div>}
        </>
      )}
    </div>
  );

  return (
    <div className="admin-track-pane">
      <div className="admin-track-lanes">
        {renderLane('เลนซ้าย', left, right)}
        {renderLane('เลนขวา', right, left)}
      </div>
    </div>
  );
}

export default React.memo(AdminTrackPane);
