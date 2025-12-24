'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmailVerification from '@/components/EmailVerification/EmailVerification';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
        if (result.success) {
          router.push('/problems');
        } else {
          setError(result.error);
        }
      } else {
        result = await register(email, password, name);
        // После регистрации показываем форму верификации
        if (result.requiresVerification) {
          setShowVerification(true);
        } else if (result.success) {
          router.push('/problems');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (response) => {
    // После верификации обновляем контекст и перенаправляем
    if (response.access_token && response.user) {
      localStorage.setItem('token', response.access_token);
      router.push('/problems');
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  if (showVerification) {
    return (
      <div className="login-page">
        <EmailVerification email={email} onVerified={handleVerified} />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login">
        <button className="login__close" onClick={handleClose} aria-label="Закрыть">
          ×
        </button>
        <div className="login__get_key">
          {isLogin ? 'Войти' : 'Регистрация'}
        </div>
        <form className="login__form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="login__caption">Имя:</div>
              <input
                type="text"
                name="name"
                className="login__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя (необязательно)"
              />
            </>
          )}
          <div className="login__caption">Email:</div>
          <input
            type="email"
            name="email"
            className="login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
          <div className="login__caption">Пароль:</div>
          <input
            type="password"
            name="password"
            className="login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Минимум 6 символов"
          />
          {error && <div className="login__error">{error}</div>}
          <input
            type="submit"
            value={loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            className="login__submit"
            disabled={loading}
          />
          <div className="login__switch">
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  className="login__switch-btn"
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  className="login__switch-btn"
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

