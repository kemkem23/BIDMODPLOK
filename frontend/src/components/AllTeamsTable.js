import React, { useState, useEffect, useCallback } from 'react';
import TeamDetailModal from './TeamDetailModal';
import { updateLeaderboard } from '../services/api';
import './AllTeamsTable.css';

function AllTeamsTable({ allResults, isAdmin, role }) {
  const [editData, setEditData] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (allResults && !isEditing) {
      setEditData(allResults.map((row) => ({
        teamId: row.team.id,
        number: row.number,
        classNumber: row.classNumber,
        team: row.team,
        times: { ...row.times },
      })));
    }
  }, [allResults, isEditing]);

  const handleSave = useCallback(async () => {
    setSaveStatus(null);
    try {
      const payload = editData.map((row) => ({
        teamId: row.teamId,
        times: row.times,
      }));
      await updateLeaderboard(payload);
      setSaveStatus('success');
      setIsEditing(false);
    } catch (err) {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  }, [editData]);

  const handleTeamClick = useCallback((e, row) => {
    e.stopPropagation();
    setSelectedTeam(row.team);
  }, []);

  if (!allResults || allResults.length === 0) {
    return null;
  }

  const formatTime = (t) => (t != null ? t.toFixed(4) : '');
  const canEditAll = isAdmin && role === 'full';
  const canEditTimes = isAdmin && (role === 'full' || role === 'time');

  const handleTimeBlur = (index, field, value) => {
    const parsed = value === '' ? null : parseFloat(value);
    const current = editData[index]?.times?.[field] ?? null;
    if (parsed === current) return;
    setIsEditing(true);
    setEditData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        times: {
          ...updated[index].times,
          [field]: parsed,
        },
      };
      return updated;
    });
  };

  const handleFieldBlur = (index, field, value) => {
    const parsed = value === '' ? null : isNaN(Number(value)) ? value : Number(value);
    const current = editData[index]?.[field] ?? null;
    if (parsed === current) return;
    setIsEditing(true);
    setEditData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: parsed,
      };
      return updated;
    });
  };

  const timeFields = ['qualify', 'run1', 'run2', 'run3'];

  const getBestTime = (times) => {
    const values = timeFields.map((f) => times[f]).filter((v) => v != null);
    return values.length > 0 ? Math.min(...values) : null;
  };

  const renderTimeCell = (row, index, field) => {
    const value = row.times[field];
    const best = getBestTime(row.times);
    const isBest = value != null && best != null && value === best;
    if (canEditTimes) {
      return (
        <td key={field} className={isBest ? 'has-time' : ''}>
          <input
            key={`${row.teamId}-${field}-${value}`}
            type="number"
            step="0.0001"
            className="edit-time-input"
            defaultValue={value != null ? value : ''}
            onBlur={(e) => handleTimeBlur(index, field, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      );
    }
    return (
      <td key={field} className={isBest ? 'has-time' : ''}>
        {formatTime(value)}
      </td>
    );
  };

  return (
    <div className="all-teams-section">
      <h2 className="all-teams-title">All</h2>
      <table className="all-teams-table">
        <thead>
          <tr>
            <th>หมายเลข</th>
            <th>รุ่น</th>
            <th>ชื่อทีม</th>
            <th>Qualify</th>
            <th>Run1</th>
            <th>Run2</th>
            <th>Run3</th>
          </tr>
        </thead>
        <tbody>
          {editData.map((row, index) => (
            <tr key={row.teamId}>
              <td>
                {canEditAll ? (
                  <input
                    key={`${row.teamId}-number-${row.number}`}
                    type="number"
                    className="edit-field-input"
                    defaultValue={row.number != null ? row.number : ''}
                    onBlur={(e) => handleFieldBlur(index, 'number', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : row.number}
              </td>
              <td className={row.classNumber != null ? 'has-value' : ''}>
                {canEditAll ? (
                  <input
                    key={`${row.teamId}-classNumber-${row.classNumber}`}
                    type="number"
                    className="edit-field-input"
                    defaultValue={row.classNumber != null ? row.classNumber : ''}
                    onBlur={(e) => handleFieldBlur(index, 'classNumber', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : row.classNumber}
              </td>
              <td className="team-name-cell clickable-cell" onClick={(e) => handleTeamClick(e, row)}>{row.team.name}</td>
              {timeFields.map((field) => renderTimeCell(row, index, field))}
            </tr>
          ))}
        </tbody>
      </table>
      {isAdmin && (
        <div className="save-section">
          <button className="save-btn" onClick={handleSave}>บันทึก</button>
          {saveStatus === 'success' && <span className="save-msg save-success">บันทึกสำเร็จ</span>}
          {saveStatus === 'error' && <span className="save-msg save-error">เกิดข้อผิดพลาดในการบันทึก</span>}
        </div>
      )}
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          isAdmin={isAdmin}
          role={role}
          onClose={() => setSelectedTeam(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}

export default React.memo(AllTeamsTable);
