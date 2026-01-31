import React from 'react';
import './Header.css';

function Header() {
  return (
    <div className="header">
      <img src="/main-logo.png" alt="บิดหมดปลอก" className="header-logo" />
      <h1 className="header-title">งานบิดหมดปลอก</h1>
      <span className="header-live">LIVE</span>
    </div>
  );
}

export default React.memo(Header);
