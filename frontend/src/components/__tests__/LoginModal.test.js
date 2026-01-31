import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LoginModal from '../LoginModal';
import { login as apiLogin } from '../../services/api';

jest.mock('../../services/api');

const defaultProps = {
  onClose: jest.fn(),
  onLoginSuccess: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginModal', () => {
  test('renders username and password fields', () => {
    render(<LoginModal {...defaultProps} />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    // There should be two inputs in the form
    const textInput = document.querySelector('input[type="text"]');
    const passInput = document.querySelector('input[type="password"]');
    expect(textInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();
  });

  test('overlay click calls onClose', () => {
    const onClose = jest.fn();
    render(<LoginModal {...defaultProps} onClose={onClose} />);
    const overlay = document.querySelector('.login-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('modal click does NOT call onClose', () => {
    const onClose = jest.fn();
    render(<LoginModal {...defaultProps} onClose={onClose} />);
    const modal = document.querySelector('.login-modal');
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('successful login calls onLoginSuccess', async () => {
    const onLoginSuccess = jest.fn();
    apiLogin.mockResolvedValue({
      success: true,
      token: 'abc123',
      role: 'full',
      username: 'admin',
    });

    render(<LoginModal {...defaultProps} onLoginSuccess={onLoginSuccess} />);

    const textInput = document.querySelector('input[type="text"]');
    const passInput = document.querySelector('input[type="password"]');
    fireEvent.change(textInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'pass' } });

    await act(async () => {
      fireEvent.click(screen.getByText('เข้าสู่ระบบ'));
    });

    expect(apiLogin).toHaveBeenCalledWith({ username: 'admin', password: 'pass' });
    expect(onLoginSuccess).toHaveBeenCalledWith({
      token: 'abc123',
      role: 'full',
      username: 'admin',
    });
  });

  test('failed login shows error', async () => {
    apiLogin.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(<LoginModal {...defaultProps} />);

    const textInput = document.querySelector('input[type="text"]');
    const passInput = document.querySelector('input[type="password"]');
    fireEvent.change(textInput, { target: { value: 'bad' } });
    fireEvent.change(passInput, { target: { value: 'bad' } });

    await act(async () => {
      fireEvent.click(screen.getByText('เข้าสู่ระบบ'));
    });

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('network error shows connection error', async () => {
    apiLogin.mockRejectedValue(new Error('Network error'));

    render(<LoginModal {...defaultProps} />);

    const textInput = document.querySelector('input[type="text"]');
    const passInput = document.querySelector('input[type="password"]');
    fireEvent.change(textInput, { target: { value: 'user' } });
    fireEvent.change(passInput, { target: { value: 'pass' } });

    await act(async () => {
      fireEvent.click(screen.getByText('เข้าสู่ระบบ'));
    });

    expect(screen.getByText('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์')).toBeInTheDocument();
  });

  test('is React.memo wrapped', () => {
    const LoginModalModule = require('../LoginModal').default;
    expect(LoginModalModule.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
