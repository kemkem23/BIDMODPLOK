import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllTeamsTable from '../AllTeamsTable';
import { updateLeaderboard } from '../../services/api';

jest.mock('../../services/api');

jest.mock('../TeamDetailModal', () => {
  const MockTeamDetailModal = ({ team, onClose }) => (
    <div data-testid="team-detail-modal">
      <span>Modal: {team.name}</span>
      <button onClick={onClose}>Close</button>
    </div>
  );
  return MockTeamDetailModal;
});

const mockAllResults = [
  {
    team: { id: 1, name: 'Alpha Team' },
    number: 10,
    classNumber: 1,
    times: { qualify: 5.1234, run1: 4.5678, run2: null, run3: 6.0000 },
  },
  {
    team: { id: 2, name: 'Beta Team' },
    number: 20,
    classNumber: 2,
    times: { qualify: null, run1: 7.8901, run2: 7.0000, run3: null },
  },
];

describe('AllTeamsTable', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns null when allResults is empty', () => {
    const { container } = render(<AllTeamsTable allResults={[]} isAdmin={false} role="viewer" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when allResults is null', () => {
    const { container } = render(<AllTeamsTable allResults={null} isAdmin={false} role="viewer" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders table with correct rows', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={false} role="viewer" />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('หมายเลข')).toBeInTheDocument();
    expect(screen.getByText('รุ่น')).toBeInTheDocument();
    expect(screen.getByText('ชื่อทีม')).toBeInTheDocument();
    expect(screen.getByText('Qualify')).toBeInTheDocument();
    expect(screen.getByText('Run1')).toBeInTheDocument();
    expect(screen.getByText('Run2')).toBeInTheDocument();
    expect(screen.getByText('Run3')).toBeInTheDocument();
    expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    expect(screen.getByText('Beta Team')).toBeInTheDocument();
  });

  it('displays team data correctly', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={false} role="viewer" />);
    expect(screen.getByText('5.1234')).toBeInTheDocument();
    expect(screen.getByText('4.5678')).toBeInTheDocument();
    expect(screen.getByText('6.0000')).toBeInTheDocument();
    expect(screen.getByText('7.8901')).toBeInTheDocument();
    expect(screen.getByText('7.0000')).toBeInTheDocument();
  });

  it('highlights best time with has-time class', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={false} role="viewer" />);
    const bestCell = screen.getByText('4.5678').closest('td');
    expect(bestCell).toHaveClass('has-time');
    const nonBestCell = screen.getByText('5.1234').closest('td');
    expect(nonBestCell).not.toHaveClass('has-time');
  });

  it('shows editable inputs for admin with time role', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={true} role="time" />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(8);
  });

  it('shows editable inputs for admin with full role', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={true} role="full" />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(12);
  });

  it('save button calls updateLeaderboard', async () => {
    updateLeaderboard.mockResolvedValue({ success: true });
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={true} role="time" />);
    const saveBtn = screen.getByText('บันทึก');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateLeaderboard).toHaveBeenCalledTimes(1);
    });
    const callArg = updateLeaderboard.mock.calls[0][0];
    expect(callArg).toHaveLength(2);
    expect(callArg[0].teamId).toBe(1);
    expect(callArg[1].teamId).toBe(2);
  });

  it('shows success message after save', async () => {
    updateLeaderboard.mockResolvedValue({ success: true });
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={true} role="time" />);
    fireEvent.click(screen.getByText('บันทึก'));
    await waitFor(() => {
      expect(screen.getByText('บันทึกสำเร็จ')).toBeInTheDocument();
    });
  });

  it('shows error message on save failure', async () => {
    updateLeaderboard.mockRejectedValue(new Error('Save failed'));
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={true} role="time" />);
    fireEvent.click(screen.getByText('บันทึก'));
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดในการบันทึก')).toBeInTheDocument();
    });
  });

  it('clicking team name opens TeamDetailModal', () => {
    render(<AllTeamsTable allResults={mockAllResults} isAdmin={false} role="viewer" />);
    fireEvent.click(screen.getByText('Alpha Team'));
    expect(screen.getByTestId('team-detail-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal: Alpha Team')).toBeInTheDocument();
  });

  it('is React.memo wrapped', () => {
    const imported = require('../AllTeamsTable').default;
    expect(imported[String.fromCharCode(36,36) + 'typeof']).toBe(Symbol.for('react.memo'));
  });
});
