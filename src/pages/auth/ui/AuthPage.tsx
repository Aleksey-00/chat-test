import React from 'react';
import { AuthForm } from '@/features/auth-by-instance';

export const AuthPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <AuthForm />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f2f5',
  },
};
