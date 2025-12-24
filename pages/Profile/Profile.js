'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/api/auth';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import EmailVerification from '@/components/EmailVerification/EmailVerification';
import './Profile.css';

const Profile = () => {
  const { user, token, updateUser, login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    if (user && !requiresEmailVerification) {
      const userEmail = user.email || '';
      setFormData({
        email: userEmail,
        name: user.name || '',
        password: '',
        confirmPassword: '',
      });
      setOriginalEmail(userEmail);
      setNewEmail('');
    }
  }, [user, requiresEmailVerification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password && formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        email: formData.email,
        name: formData.name || null,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Если email изменился, отправляем код
      const emailChanged = formData.email !== originalEmail && formData.email !== user?.email;
      
      if (emailChanged) {
        const result = await authAPI.updateProfile(token, updateData);
        
        console.log('Update profile result:', result); // Отладка
        
        // Всегда показываем форму верификации при изменении email
        const emailToVerify = result.newEmail || result.email || formData.email;
        
        // Устанавливаем флаги для показа формы верификации
        setRequiresEmailVerification(true);
        setNewEmail(emailToVerify);
        setSuccess('Код подтверждения отправлен на новый email');
        
        console.log('Setting verification:', { requiresEmailVerification: true, newEmail: emailToVerify }); // Отладка
        
        // НЕ обновляем пользователя сразу, чтобы не сбросить состояние верификации через useEffect
        // Обновим только после подтверждения email
        // updateUser({
        //   ...user,
        //   email: emailToVerify,
        //   emailVerified: result.emailVerified || false,
        // });
        // setOriginalEmail(emailToVerify); // Обновляем оригинальный email
      } else {
        // Обычное обновление без изменения email
        const result = await authAPI.updateProfile(token, updateData);
        updateUser(result);
        setSuccess('Профиль успешно обновлен');
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setOriginalEmail(result.email); // Обновляем оригинальный email
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <Header />
      <div className="profile-page">
        <div className="profile-container">
          <h1 className="profile-title">Редактирование профиля</h1>
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-form-group">
              <label className="profile-label">Email:</label>
              <input
                type="email"
                name="email"
                className="profile-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                disabled={requiresEmailVerification}
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-label">Имя:</label>
              <input
                type="text"
                name="name"
                className="profile-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя (необязательно)"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-label">Новый пароль:</label>
              <input
                type="password"
                name="password"
                className="profile-input"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                placeholder="Оставьте пустым, если не хотите менять пароль"
              />
            </div>

            {formData.password && (
              <div className="profile-form-group">
                <label className="profile-label">Подтвердите пароль:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="profile-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Повторите новый пароль"
                />
              </div>
            )}

            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            {!requiresEmailVerification && (
              <div className="profile-buttons">
                <button
                  type="submit"
                  className="profile-submit"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button
                  type="button"
                  className="profile-cancel"
                  onClick={() => router.push('/problems')}
                >
                  Отмена
                </button>
              </div>
            )}
          </form>

          {requiresEmailVerification && newEmail && (
            <div className="profile-verification" style={{ marginTop: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#141414' }}>Подтверждение нового email</h3>
              <p style={{ marginBottom: '20px', color: '#7D7D7D' }}>
                Код подтверждения отправлен на <strong>{newEmail}</strong>
              </p>
              <EmailVerification
                email={newEmail}
                onVerify={async (code) => {
                  try {
                    // Используем verifyNewEmail для подтверждения нового email
                    const result = await authAPI.verifyNewEmail(token, code);
                    // Обновляем токен и пользователя
                    if (result.access_token) {
                      login(result.access_token, result.user);
                    }
                    setRequiresEmailVerification(false);
                    setNewEmail('');
                    setSuccess('Email успешно подтвержден!');
                    // Обновляем форму с новым подтвержденным email
                    setFormData(prev => ({
                      ...prev,
                      email: result.user.email,
                      password: '',
                      confirmPassword: '',
                    }));
                    setOriginalEmail(result.user.email); // Обновляем оригинальный email
                    
                    // Перенаправляем на главную страницу после успешной верификации
                    setTimeout(() => {
                      router.push('/');
                    }, 1000); // Небольшая задержка, чтобы пользователь увидел сообщение об успехе
                  } catch (err) {
                    setError(err.message || 'Ошибка подтверждения email');
                    throw err; // Пробрасываем ошибку, чтобы EmailVerification мог её обработать
                  }
                }}
                onResend={async () => {
                  try {
                    await authAPI.resendCode(newEmail);
                    setSuccess('Код подтверждения отправлен повторно');
                  } catch (err) {
                    setError(err.message || 'Ошибка отправки кода');
                    throw err;
                  }
                }}
              />
              <button
                type="button"
                className="profile-cancel"
                onClick={() => {
                  setRequiresEmailVerification(false);
                  setNewEmail('');
                  setError('');
                  setSuccess('');
                  // Возвращаем оригинальный email
                  setFormData(prev => ({
                    ...prev,
                    email: originalEmail || user?.email || '',
                  }));
                }}
                style={{ marginTop: '20px', width: '100%' }}
              >
                Отменить изменение email
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

