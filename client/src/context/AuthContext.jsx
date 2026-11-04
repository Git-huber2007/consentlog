import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('consentlog_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [activeNoticeInfo, setActiveNoticeInfo] = useState({
    version: '2.0',
    hasAccepted: true,
    notice: null,
  });

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('consentlog_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const [meRes, noticeRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/notices/active').catch(() => ({ data: null })),
      ]);

      if (meRes.data?.user) {
        setUser(meRes.data.user);
        localStorage.setItem('consentlog_user', JSON.stringify(meRes.data.user));
      }

      if (noticeRes.data?.notice) {
        setActiveNoticeInfo({
          version: noticeRes.data.notice.version,
          hasAccepted: noticeRes.data.hasAccepted,
          requiresAction: noticeRes.data.requiresAction,
          notice: noticeRes.data.notice,
        });
      }
    } catch (err) {
      localStorage.removeItem('consentlog_token');
      localStorage.removeItem('consentlog_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('consentlog_token', res.data.token);
    localStorage.setItem('consentlog_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    await refreshSession();
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('consentlog_token', res.data.token);
    localStorage.setItem('consentlog_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    await refreshSession();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('consentlog_token');
    localStorage.removeItem('consentlog_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refreshSession,
        activeNoticeInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

