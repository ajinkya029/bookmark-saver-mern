import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('bookmark_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('bookmark_token')).finally(() => setLoading(false));
  }, []);
  const authenticate = async (mode, payload) => {
    const { data } = await api.post(`/auth/${mode}`, payload);
    localStorage.setItem('bookmark_token', data.token); setUser(data.user); return data.user;
  };
  const logout = () => { localStorage.removeItem('bookmark_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
