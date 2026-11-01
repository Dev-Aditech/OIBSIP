import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Merge changes (for example a new name) into the saved user
  const updateUser = (changes) => {
    const next = { ...user, ...changes };
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}

// The hook lives next to the provider on purpose. This rule only affects hot reloading, not how the app works.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);