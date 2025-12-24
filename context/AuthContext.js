'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '@/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousPath, setPreviousPath] = useState(null);
  useEffect(() => {
    // Проверяем токен при загрузке приложения
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          try {
            const userData = await authAPI.getProfile(storedToken);
            setUser(userData);
            setToken(storedToken);
          } catch (error) {
            // Токен невалиден, удаляем его
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access_token);
      }
      setToken(response.access_token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);
      // Если регистрация требует верификации, возвращаем специальный флаг
      if (response.requiresVerification) {
        return { success: false, requiresVerification: true, email: response.email };
      }
      if (typeof window !== 'undefined' && response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      setToken(response.access_token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };
  const updatePreviousPath = (path) => {
    setPreviousPath(path);
  };
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    previousPath,
    isAuthenticated: !!token,
    loading,
    updatePreviousPath
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

