import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

const defaultProps = {
  activeView: 'TRACK',
  onViewChange: jest.fn(),
  onLoginClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Sidebar', () => {
  test('renders 3 buttons', () => {
    render(<Sidebar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  test('active class on correct button for TRACK', () => {
    render(<Sidebar {...defaultProps} activeView="TRACK" />);
    const trackBtn = screen.getByText('TRACK');
    const leaderboardBtn = screen.getByText('LEADERBOARD');
    expect(trackBtn).toHaveClass('active');
    expect(leaderboardBtn).not.toHaveClass('active');
  });

  test('active class on correct button for LEADERBOARD', () => {
    render(<Sidebar {...defaultProps} activeView="LEADERBOARD" />);
    const trackBtn = screen.getByText('TRACK');
    const leaderboardBtn = screen.getByText('LEADERBOARD');
    expect(trackBtn).not.toHaveClass('active');
    expect(leaderboardBtn).toHaveClass('active');
  });

  test('click handlers call correct callbacks', () => {
    const onViewChange = jest.fn();
    const onLoginClick = jest.fn();
    render(
      <Sidebar
        {...defaultProps}
        onViewChange={onViewChange}
        onLoginClick={onLoginClick}
      />
    );

    fireEvent.click(screen.getByText('\u0e17\u0e35\u0e21\u0e07\u0e32\u0e19 login'));
    expect(onLoginClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('TRACK'));
    expect(onViewChange).toHaveBeenCalledWith('TRACK');

    fireEvent.click(screen.getByText('LEADERBOARD'));
    expect(onViewChange).toHaveBeenCalledWith('LEADERBOARD');
  });

  test('is React.memo wrapped', () => {
    const SidebarModule = require('../Sidebar').default;
    expect(SidebarModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
