import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import useAuth from '../hooks/useAuth';

jest.mock('../hooks/useAuth');
jest.mock('../hooks/useTrackData', () => () => ({ race: null, loading: false, error: null }));
jest.mock('../hooks/useLeaderboard', () => () => ({ classes: [], allResults: [], loading: false, error: null }));

jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../components/VideoSection', () => {
  return function MockVideoSection() {
    return <div data-testid="video-section">VideoSection</div>;
  };
});

jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('../components/TrackView', () => {
  return function MockTrackView() {
    return <div data-testid="track-view">TrackView</div>;
  };
});

jest.mock('../components/LeaderboardView', () => {
  return function MockLeaderboardView() {
    return <div data-testid="leaderboard-view">LeaderboardView</div>;
  };
});

jest.mock('../components/AdminPanel', () => {
  return function MockAdminPanel() {
    return <div data-testid="admin-panel">AdminPanel</div>;
  };
});

jest.mock('../components/LoginModal', () => {
  return function MockLoginModal() {
    return <div data-testid="login-modal">LoginModal</div>;
  };
});

const defaultAuth = {
  token: null,
  isAdmin: false,
  role: null,
  username: null,
  login: jest.fn(),
  logout: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ ...defaultAuth });
});

describe('App', () => {
  test('renders Header, VideoSection, Sidebar', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('video-section')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('default view shows TrackView', () => {
    render(<App />);
    expect(screen.getByTestId('track-view')).toBeInTheDocument();
  });

  test('AdminPanel shown when isAdmin', () => {
    useAuth.mockReturnValue({
      ...defaultAuth,
      token: 'test-token',
      isAdmin: true,
      role: 'full',
      username: 'admin',
    });
    render(<App />);
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });

  test('AdminPanel hidden when not admin', () => {
    useAuth.mockReturnValue({ ...defaultAuth, isAdmin: false });
    render(<App />);
    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
  });
});
