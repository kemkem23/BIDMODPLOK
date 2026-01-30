import React from 'react';
import './VideoSection.css';

function VideoSection() {
  return (
    <div className="video-section">
      <p className="video-placeholder-text">วีดีโอสด</p>
    </div>
  );
}

export default React.memo(VideoSection);
