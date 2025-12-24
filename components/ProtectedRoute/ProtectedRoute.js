'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Предотвращаем множественные перенаправления
    if (!loading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      // Используем setTimeout для избежания проблем с асинхронными операциями
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  }, [isAuthenticated, loading, router]);

  // Показываем загрузку во время проверки авторизации
  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
  }

  // Если не авторизован, не показываем контент (идет перенаправление)
  if (!isAuthenticated) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Перенаправление...</div>;
  }

  // Показываем контент только для авторизованных пользователей
  return <>{children}</>;
};

export default ProtectedRoute;

