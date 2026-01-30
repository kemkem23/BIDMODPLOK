import React, { useState, useEffect, useCallback } from 'react';
import { fetchCurrentRace, updateRaceTimes } from '../services/api';
import './AdminPanel.css';

function AdminPanel({ token, role, username, onLogout }) {
  const isFullEdit = role === 'full';
  const [race, setRace] = useState(null);
  const [leftTimes, setLeftTimes] = useState({ qualify: '', run1: '', run2: '', run3: '' });
  const [rightTimes, setRightTimes] = useState({ qualify: '', run1: '', run2: '', run3: '' });
  const [status, setStatus] = useState('waiting');
  const [message, setMessage] = useState('');

  const fetchRace = useCallback(async () => {
    try {
      const data = await fetchCurrentRace();
      if (data.currentRace) {
        setRace(data.currentRace);
        setStatus(data.currentRace.status);
        const lt = data.currentRace.left.times;
        const rt = data.currentRace.right.times;
        setLeftTimes({
          qualify: lt.qualify ?? '',
          run1: lt.run1 ?? '',
          run2: lt.run2 ?? '',
          run3: lt.run3 ?? '',
        });
        setRightTimes({
          qualify: rt.qualify ?? '',
          run1: rt.run1 ?? '',
          run2: rt.run2 ?? '',
          run3: rt.run3 ?? '',
        });
      }
    } catch {
      setMessage('ไม่สามารถดึงข้อมูลได้');
    }
  }, []);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  const parseTime = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const handleUpdateTimes = useCallback(async () => {
    try {
      const data = await updateRaceTimes({
        left: {
          qualify: parseTime(leftTimes.qualify),
          run1: parseTime(leftTimes.run1),
          run2: parseTime(leftTimes.run2),
          run3: parseTime(leftTimes.run3),
        },
        right: {
          qualify: parseTime(rightTimes.qualify),
          run1: parseTime(rightTimes.run1),
          run2: parseTime(rightTimes.run2),
          run3: parseTime(rightTimes.run3),
        },
        status,
      });
      setRace(data.currentRace);
      setMessage('อัพเดทเวลาสำเร็จ!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('เกิดข้อผิดพลาดในการอัพเดท');
    }
  }, [leftTimes, rightTimes, status]);

  const renderTimeInputs = (label, times, setTimes) => (
    <div className="admin-lane">
      <h4>{label}</h4>
      {['qualify', 'run1', 'run2', 'run3'].map((key) => (
        <div key={key} className="admin-time-field">
          <label>{key === 'qualify' ? 'Qualify' : key.replace('run', 'Run ')}</label>
          <input
            type="number"
            step="0.0001"
            value={times[key]}
            onChange={(e) => setTimes({ ...times, [key]: e.target.value })}
            placeholder="xx"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h3>Admin Panel — {username} ({isFullEdit ? 'Full Edit' : 'Time Edit'})</h3>
        <button className="admin-logout" onClick={onLogout}>ออกจากระบบ</button>
      </div>

      {race && (
        <div className="admin-race-info">
          <p><strong>รุ่น:</strong> {race.className}</p>
          <p><strong>รอบ:</strong> {race.round}</p>
          <p><strong>เลนซ้าย:</strong> {race.left.team?.name || 'ว่าง'}</p>
          <p><strong>เลนขวา:</strong> {race.right.team?.name || 'ว่าง'}</p>
        </div>
      )}

      <div className="admin-times-section">
        {renderTimeInputs('เลนซ้าย', leftTimes, setLeftTimes)}
        {renderTimeInputs('เลนขวา', rightTimes, setRightTimes)}
      </div>

      {isFullEdit && (
        <div className="admin-status">
          <label>สถานะ: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="waiting">Waiting</option>
            <option value="running">Running</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      )}

      <button className="admin-update-btn" onClick={handleUpdateTimes}>
        อัพเดทเวลา
      </button>

      {message && <p className="admin-message">{message}</p>}
    </div>
  );
}

export default React.memo(AdminPanel);
