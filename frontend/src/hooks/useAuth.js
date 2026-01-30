import { useState, useCallback } from 'react';

function useAuth() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(null);       // "full" | "time"
  const [username, setUsername] = useState(null);

  const login = useCallback((data) => {
    setToken(data.token);
    setRole(data.role);
    setUsername(data.username);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUsername(null);
    setIsAdmin(false);
  }, []);

  return { token, isAdmin, role, username, login, logout };
}

export default useAuth;
