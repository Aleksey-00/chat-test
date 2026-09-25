import React from 'react';
import { SessionProvider, useSession } from '@/entities/session';
import { ChatProvider } from '@/entities/chat';
import { AuthPage } from '@/pages/auth';
import { ChatPage } from '@/pages/chat';
import './index.css';

const AppContent: React.FC = () => {
  const { isAuth } = useSession();

  if (!isAuth) {
    return <AuthPage />;
  }

  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
};

export const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};
