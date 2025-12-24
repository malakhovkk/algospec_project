'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/api/auth';
import './EmailVerification.css';

const EmailVerification = ({ email, onVerified, onVerify, onResend, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { login: contextLogin } = useAuth();

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Разрешаем только один символ
    if (!/^\d*$/.test(value)) return; // Только цифры

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Автоматический переход на следующий input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      // Фокус на последний input
      setTimeout(() => {
        const lastInput = document.getElementById('code-5');
        if (lastInput) lastInput.focus();
      }, 0);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Введите полный код из 6 цифр');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Если есть кастомный обработчик onVerify, используем его
      if (onVerify) {
        await onVerify(codeString);
      } else {
        // Иначе используем стандартный verifyCode
        const response = await authAPI.verifyCode(email, codeString);
        if (response.access_token) {
          // Сохраняем токен и обновляем контекст
          localStorage.setItem('token', response.access_token);
          if (onVerified) {
            onVerified(response);
          } else {
            // Если нет callback, перенаправляем на страницу задач
            router.push('/problems');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Неверный код подтверждения');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      // Если есть кастомный обработчик onResend, используем его
      if (onResend) {
        await onResend();
      } else {
        // Иначе используем стандартный resendCode
        await authAPI.resendCode(email);
        alert('Код подтверждения отправлен повторно на ваш email');
      }
    } catch (err) {
      setError(err.message || 'Не удалось отправить код повторно');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="email-verification">
      <div className="email-verification__container">
        <h2 className="email-verification__title">Подтверждение email</h2>
        <p className="email-verification__subtitle">
          Мы отправили код подтверждения на <strong>{email}</strong>
        </p>
        
        <form onSubmit={handleVerify} className="email-verification__form">
          <div className="email-verification__code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="email-verification__code-input"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="email-verification__error">{error}</div>}

          <button
            type="submit"
            className="email-verification__submit"
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>

          <div className="email-verification__resend">
            <span>Не получили код?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="email-verification__resend-btn"
            >
              {resending ? 'Отправка...' : 'Отправить повторно'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;

