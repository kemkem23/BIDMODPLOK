import React, { useState, useCallback } from 'react';
import './App.css';
import './styles/layout.css';
import Header from './components/Header';
import VideoSection from './components/VideoSection';
import TrackView from './components/TrackView';
import LeaderboardView from './components/LeaderboardView';
import LoginModal from './components/LoginModal';
import AdminTrackPane from './components/AdminTrackPane';
import ErrorBoundary from './components/ErrorBoundary';
import useAuth from './hooks/useAuth';

function App() {
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
        {isAdmin ? (
          <>
            <div className="admin-bar">
              <span>Admin: {username}</span>
              <button className="admin-logout" onClick={logout}>ออกจากระบบ</button>
            </div>
            <AdminTrackPane />
            <LeaderboardView isAdmin={isAdmin} role={role} />
          </>
        ) : (
          <>
            <Header />
            <VideoSection />
            <div className="content-area">
              <TrackView />
              <LeaderboardView isAdmin={isAdmin} role={role} />
            </div>
            <button className="bottom-login-btn" onClick={handleLoginClick}>
              ทีมงาน login
            </button>
          </>
        )}
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
