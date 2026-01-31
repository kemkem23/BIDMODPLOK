import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminPanel from '../AdminPanel';
import { fetchCurrentRace, updateRaceTimes } from '../../services/api';

jest.mock('../../services/api');

const mockRaceData = {
  currentRace: {
    className: 'Pro Class',
    round: 'รอบชิง',
    status: 'waiting',
    left: {
      team: { name: 'Team A' },
      times: { qualify: 10.5, run1: 11.2, run2: null, run3: null },
    },
    right: {
      team: { name: 'Team B' },
      times: { qualify: 10.8, run1: null, run2: null, run3: null },
    },
  },
};

const defaultProps = {
  token: 'test-token',
  role: 'full',
  username: 'admin1',
  onLogout: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  fetchCurrentRace.mockResolvedValue(mockRaceData);
});

describe('AdminPanel', () => {
  test('renders header with username and role text', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });
    expect(screen.getByText(/admin1/)).toBeInTheDocument();
    expect(screen.getByText(/Full Edit/)).toBeInTheDocument();
  });

  test('renders Time Edit role text for non-full role', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} role="time" />);
    });
    expect(screen.getByText(/Time Edit/)).toBeInTheDocument();
  });

  test('renders logout button that calls onLogout', async () => {
    const onLogout = jest.fn();
    await act(async () => {
      render(<AdminPanel {...defaultProps} onLogout={onLogout} />);
    });
    fireEvent.click(screen.getByText('ออกจากระบบ'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('fetches race on mount and displays race info', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });
    expect(fetchCurrentRace).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Pro Class')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  test('renders 8 time inputs (4 per lane)', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(8);
  });

  test('shows status dropdown only for full role', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} role="full" />);
    });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('hides status dropdown for non-full role', async () => {
    await act(async () => {
      render(<AdminPanel {...defaultProps} role="time" />);
    });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('update button calls updateRaceTimes with correct payload', async () => {
    updateRaceTimes.mockResolvedValue({ currentRace: mockRaceData.currentRace });
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('อัพเดทเวลา'));
    });

    expect(updateRaceTimes).toHaveBeenCalledTimes(1);
    const call = updateRaceTimes.mock.calls[0][0];
    expect(call).toHaveProperty('left');
    expect(call).toHaveProperty('right');
    expect(call).toHaveProperty('status');
    expect(call.left).toEqual({
      qualify: 10.5,
      run1: 11.2,
      run2: null,
      run3: null,
    });
  });

  test('shows success message after update', async () => {
    updateRaceTimes.mockResolvedValue({ currentRace: mockRaceData.currentRace });
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('อัพเดทเวลา'));
    });

    expect(screen.getByText('อัพเดทเวลาสำเร็จ!')).toBeInTheDocument();
  });

  test('shows error message when update fails', async () => {
    updateRaceTimes.mockRejectedValue(new Error('fail'));
    await act(async () => {
      render(<AdminPanel {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('อัพเดทเวลา'));
    });

    expect(screen.getByText('เกิดข้อผิดพลาดในการอัพเดท')).toBeInTheDocument();
  });

  test('is React.memo wrapped', () => {
    const AdminPanelModule = require('../AdminPanel').default;
    expect(AdminPanelModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
