import React, { useState } from 'react';
import { updateTeam as apiUpdateTeam } from '../services/api';
import './TeamDetailModal.css';

function TeamDetailModal({ team, isAdmin, role, onClose, onSaved }) {
  const canEdit = isAdmin && role === 'full';

  const [form, setForm] = useState({
    name: team.name || '',
    nickname: team.nickname || '',
    contactPerson: team.contactPerson || '',
    phone: team.phone || '',
    amphur: team.amphur || '',
    photo: team.photo || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await apiUpdateTeam(team.id, form);
      setSaveStatus('success');
      if (onSaved) onSaved();
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const photoSrc = form.photo || null;

  return (
    <div className="team-modal-overlay" onClick={onClose}>
      <div className="team-modal" onClick={(e) => e.stopPropagation()}>
        <button className="team-modal-close" onClick={onClose}>&times;</button>
        <h2 className="team-modal-title">ข้อมูลทีม</h2>

        <div className="team-modal-photo-section">
          {photoSrc ? (
            <img src={photoSrc} alt={form.name} className="team-modal-photo" />
          ) : (
            <div className="team-modal-photo-placeholder">ไม่มีรูป</div>
          )}
        </div>

        {canEdit && (
          <div className="team-modal-field">
            <label>รูปทีม (URL)</label>
            <input
              type="text"
              value={form.photo}
              onChange={(e) => handleChange('photo', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        <div className="team-modal-field">
          <label>หมายเลข</label>
          <span className="team-modal-value">{team.number}</span>
        </div>

        <div className="team-modal-field">
          <label>ชื่อทีม</label>
          {canEdit ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          ) : (
            <span className="team-modal-value">{form.name}</span>
          )}
        </div>

        <div className="team-modal-field">
          <label>ชื่อเล่น</label>
          {canEdit ? (
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
            />
          ) : (
            <span className="team-modal-value">{form.nickname || '-'}</span>
          )}
        </div>

        <div className="team-modal-field">
          <label>ผู้ติดต่อ</label>
          {canEdit ? (
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
            />
          ) : (
            <span className="team-modal-value">{form.contactPerson || '-'}</span>
          )}
        </div>

        <div className="team-modal-field">
          <label>เบอร์โทร</label>
          {canEdit ? (
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          ) : (
            <span className="team-modal-value">{form.phone || '-'}</span>
          )}
        </div>

        <div className="team-modal-field">
          <label>อำเภอ</label>
          {canEdit ? (
            <input
              type="text"
              value={form.amphur}
              onChange={(e) => handleChange('amphur', e.target.value)}
            />
          ) : (
            <span className="team-modal-value">{form.amphur || '-'}</span>
          )}
        </div>

        {canEdit && (
          <div className="team-modal-actions">
            <button className="team-modal-save" onClick={handleSave} disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            {saveStatus === 'success' && <span className="team-modal-msg team-modal-success">บันทึกสำเร็จ</span>}
            {saveStatus === 'error' && <span className="team-modal-msg team-modal-error">เกิดข้อผิดพลาด</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(TeamDetailModal);
