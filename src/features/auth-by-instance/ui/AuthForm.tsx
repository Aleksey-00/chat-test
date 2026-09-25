import React, { useState } from 'react';
import { useSession } from '@/entities/session';
import { GreenApiService } from '@/shared/api';

export const AuthForm: React.FC = () => {
  const defaultId = import.meta.env.VITE_ID_INSTANCE || '';
  const defaultToken = import.meta.env.VITE_API_TOKEN_INSTANCE || '';

  const { login } = useSession();
  const [idInstance, setIdInstance] = useState(defaultId);
  const [apiTokenInstance, setApiTokenInstance] = useState(defaultToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInstance || !apiTokenInstance) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setError(null);

    const checkerService = new GreenApiService(
      idInstance,
      apiTokenInstance,
      import.meta.env.VITE_API_BASE_URL,
    );
    const isValid = await checkerService.getStateInstance();

    setIsLoading(false);

    if (isValid) {
      login(idInstance, apiTokenInstance);
    } else {
      setError('Не удалось подключиться. Проверьте ID и Token инстанса.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Вход в Telegram (Green-API)</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.inputGroup}>
        <label style={styles.label}>idInstance</label>
        <input
          type="text"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          placeholder="Например: 1101234567"
          style={styles.input}
          disabled={isLoading}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>apiTokenInstance</label>
        <input
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          placeholder="Ваш токен от инстанса"
          style={styles.input}
          disabled={isLoading}
        />
      </div>

      <button type="submit" style={styles.button} disabled={isLoading}>
        {isLoading ? 'Проверка...' : 'Войти'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box' as const,
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    textAlign: 'center' as const,
    color: '#333',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#2481cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    marginTop: '10px',
  },
  error: {
    background: '#fde8e8',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
};
