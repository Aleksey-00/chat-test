import React from 'react';
import { SessionProvider, useSession } from '@/entities/session';
import { ChatProvider } from '@/entities/chat';
import { AuthPage } from '@/pages/auth';
import { ChatPage } from '@/pages/chat';
import './index.css';

const AppContent: React.FC = () => {
    const { isAuth } = useSession();

    // Если не авторизован — показываем форму входа
    if (!isAuth) {
        return <AuthPage />;
    }

    // Если авторизован — подключаем хранилище чатов и открываем главный экран
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