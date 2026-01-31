import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoSection from '../VideoSection';

describe('VideoSection', () => {
  test('renders placeholder text', () => {
    render(<VideoSection />);
    expect(screen.getByText('\u0e27\u0e35\u0e14\u0e35\u0e42\u0e2d\u0e2a\u0e14')).toBeInTheDocument();
  });

  test('is React.memo wrapped', () => {
    const VideoSectionModule = require('../VideoSection').default;
    expect(VideoSectionModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
