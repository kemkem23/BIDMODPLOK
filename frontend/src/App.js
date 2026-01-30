import React, { useState, useCallback } from 'react';
import './App.css';
import './styles/layout.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoSection from './components/VideoSection';
import TrackView from './components/TrackView';
import LeaderboardView from './components/LeaderboardView';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import useAuth from './hooks/useAuth';

function App() {
  const [view, setView] = useState('TRACK');
  const [showLogin, setShowLogin] = useState(false);
  const { token, isAdmin, role, username, login, logout } = useAuth();

  const handleLoginClick = useCallback(() => setShowLogin(true), []);
  const handleLoginClose = useCallback(() => setShowLogin(false), []);
  const handleLoginSuccess = useCallback((data) => {
    login(data);
    setShowLogin(false);
  }, [login]);

  return (
    <ErrorBoundary>
      <div className="app-layout">
        <div className="main-content">
          <Header />
          <VideoSection />
          <div className="content-area">
            {view === 'TRACK' && <TrackView />}
            {view === 'LEADERBOARD' && <LeaderboardView isAdmin={isAdmin} role={role} />}
          </div>
          {isAdmin && <AdminPanel token={token} role={role} username={username} onLogout={logout} />}
        </div>
        <Sidebar
          activeView={view}
          onViewChange={setView}
          onLoginClick={handleLoginClick}
        />
        {showLogin && !isAdmin && (
          <LoginModal
            onClose={handleLoginClose}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
