import React from 'react';
import './Header.css';

function Header() {
  return (
    <div className="header">
      <h1 className="header-title">งานบิดหมดปลอก</h1>
      <span className="header-live">LIVE</span>
    </div>
  );
}

export default React.memo(Header);
