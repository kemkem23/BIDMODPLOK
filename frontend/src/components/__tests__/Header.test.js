import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  test('renders title text', () => {
    render(<Header />);
    expect(screen.getByText('\u0e07\u0e32\u0e19\u0e1a\u0e34\u0e14\u0e2b\u0e21\u0e14\u0e1b\u0e25\u0e2d\u0e01')).toBeInTheDocument();
  });

  test('renders LIVE badge', () => {
    render(<Header />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  test('is React.memo wrapped', () => {
    const HeaderModule = require('../Header').default;
    expect(HeaderModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
