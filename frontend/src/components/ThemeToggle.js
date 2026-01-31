import React, { useState, useEffect } from 'react';

const THEME_KEY = 'racing-theme';

function ThemeToggle() {
  const [isRacing, setIsRacing] = useState(() => localStorage.getItem(THEME_KEY) === 'on');

  useEffect(() => {
    let link = document.getElementById('racing-theme-link');
    if (isRacing) {
      if (!link) {
        link = document.createElement('link');
        link.id = 'racing-theme-link';
        link.rel = 'stylesheet';
        link.href = '/racing-theme.css';
        document.head.appendChild(link);
      }
      localStorage.setItem(THEME_KEY, 'on');
    } else {
      if (link) link.remove();
      localStorage.setItem(THEME_KEY, 'off');
    }
  }, [isRacing]);

  return (
    <button
      onClick={() => setIsRacing(prev => !prev)}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        padding: '8px 14px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        border: '2px solid #999',
        borderRadius: 6,
        cursor: 'pointer',
        background: isRacing ? '#D10000' : '#f0f0f0',
        color: isRacing ? '#fff' : '#333',
        opacity: 0.85,
        transition: 'all 0.2s',
      }}
    >
      {isRacing ? 'RACING' : 'LITE'}
    </button>
  );
}

export default ThemeToggle;
