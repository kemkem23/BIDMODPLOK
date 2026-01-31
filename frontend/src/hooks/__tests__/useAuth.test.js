import { renderHook, act } from '@testing-library/react';
import useAuth from '../useAuth';

describe('useAuth', () => {
  it('has correct initial state (all null/false)', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('login sets token, role, username, and isAdmin=true', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({
        token: 'jwt-123',
        role: 'full',
        username: 'admin',
      });
    });

    expect(result.current.token).toBe('jwt-123');
    expect(result.current.role).toBe('full');
    expect(result.current.username).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
  });

  it('logout resets all state back to initial values', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({
        token: 'jwt-123',
        role: 'full',
        username: 'admin',
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('login and logout callbacks are stable references across renders', () => {
    const { result, rerender } = renderHook(() => useAuth());

    const loginRef1 = result.current.login;
    const logoutRef1 = result.current.logout;

    rerender();

    expect(result.current.login).toBe(loginRef1);
    expect(result.current.logout).toBe(logoutRef1);
  });
});
