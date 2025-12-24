const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/auth';

export const authAPI = {
  async register(email, password, name) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка регистрации' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Неверный email или пароль' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  async getProfile(token) {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения профиля');
    }

    return response.json();
  },

  async updateProfile(token, updateData) {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка обновления профиля' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  async verifyCode(email, code) {
    try {
      const response = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка верификации кода' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  async resendCode(email) {
    try {
      const response = await fetch(`${API_URL}/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка отправки кода' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },

  async verifyNewEmail(token, code) {
    try {
      const response = await fetch(`${API_URL}/verify-new-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка верификации кода' }));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3001');
      }
      throw error;
    }
  },
};

