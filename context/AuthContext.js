'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '@/api/auth';

// Создаем контекст с дефолтным значением для избежания ошибок при SSR
const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => ({ success: false, error: 'Not initialized' }),
  register: async () => ({ success: false, error: 'Not initialized' }),
  logout: () => {},
  updateUser: () => {},
  previousPath: null,
  isAuthenticated: false,
  loading: true,
  updatePreviousPath: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Теперь контекст всегда будет иметь значение (дефолтное или реальное)
  // Проверяем только, что это не дефолтное значение (которое означает, что Provider не обернул компонент)
  if (context && context.loading === undefined && context.isAuthenticated === undefined) {
    // В режиме разработки выводим более подробную ошибку
    if (process.env.NODE_ENV === 'development') {
      console.error('useAuth must be used within AuthProvider. Make sure your component is wrapped in <AuthProvider> in app/layout.js');
    }
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

  const login = async (emailOrToken, passwordOrUser) => {
    try {
      // Если передан токен и пользователь (для обновления после верификации)
      if (typeof emailOrToken === 'string' && emailOrToken.length > 50 && passwordOrUser && typeof passwordOrUser === 'object') {
        const token = emailOrToken;
        const user = passwordOrUser;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        setToken(token);
        setUser(user);
        return { success: true };
      }
      
      // Обычный логин по email и паролю
      const response = await authAPI.login(emailOrToken, passwordOrUser);
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

  // Всегда возвращаем Provider, даже если контекст еще не инициализирован
  // Это гарантирует, что useAuth не выбросит ошибку
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

