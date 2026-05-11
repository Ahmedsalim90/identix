import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../data/mockData.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('attendtrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    setLoading(true);
    setLoginError('');
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 900));
    const found = USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() &&
           u.password === password &&
           u.role === role
    );
    if (found) {
      const { password: _pw, ...safeUser } = found;
      setUser(safeUser);
      sessionStorage.setItem('attendtrack_user', JSON.stringify(safeUser));
      setLoading(false);
      return true;
    } else {
      setLoginError('Invalid credentials or role mismatch. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('attendtrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
