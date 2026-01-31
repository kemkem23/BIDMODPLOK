import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TeamDetailModal from '../TeamDetailModal';
import { updateTeam as apiUpdateTeam } from '../../services/api';

jest.mock('../../services/api');

const mockTeam = {
  id: 1,
  number: 42,
  name: 'Racing Team',
  nickname: 'Racers',
  contactPerson: 'John',
  phone: '0812345678',
  amphur: '\u0e40\u0e21\u0e37\u0e2d\u0e07',
  photo: '',
};

const defaultProps = {
  team: mockTeam,
  isAdmin: false,
  role: 'time',
  onClose: jest.fn(),
  onSaved: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TeamDetailModal', () => {
  test('renders read-only for non-admin', () => {
    render(<TeamDetailModal {...defaultProps} isAdmin={false} role="time" />);
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs).toHaveLength(0);
    expect(screen.getByText('Racing Team')).toBeInTheDocument();
    expect(screen.getByText('Racers')).toBeInTheDocument();
  });

  test('renders editable inputs for admin with full role', () => {
    render(<TeamDetailModal {...defaultProps} isAdmin={true} role="full" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(5);
  });

  test('close button calls onClose', () => {
    const onClose = jest.fn();
    render(<TeamDetailModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('\u00D7'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('save calls apiUpdateTeam', async () => {
    apiUpdateTeam.mockResolvedValue({ success: true });
    const onSaved = jest.fn();

    render(
      <TeamDetailModal
        {...defaultProps}
        isAdmin={true}
        role="full"
        onSaved={onSaved}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01'));
    });

    expect(apiUpdateTeam).toHaveBeenCalledTimes(1);
    expect(apiUpdateTeam).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'Racing Team',
      nickname: 'Racers',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  test('shows success message after save', async () => {
    apiUpdateTeam.mockResolvedValue({ success: true });

    render(
      <TeamDetailModal
        {...defaultProps}
        isAdmin={true}
        role="full"
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01'));
    });

    expect(screen.getByText('\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08')).toBeInTheDocument();
  });

  test('shows error message when save fails', async () => {
    apiUpdateTeam.mockRejectedValue(new Error('fail'));

    render(
      <TeamDetailModal
        {...defaultProps}
        isAdmin={true}
        role="full"
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01'));
    });

    expect(screen.getByText('\u0e40\u0e01\u0e34\u0e14\u0e02\u0e49\u0e2d\u0e1c\u0e34\u0e14\u0e1e\u0e25\u0e32\u0e14')).toBeInTheDocument();
  });

  test('is React.memo wrapped', () => {
    const TeamDetailModalModule = require('../TeamDetailModal').default;
    expect(TeamDetailModalModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
