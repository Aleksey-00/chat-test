import React, { createContext, useContext, useState, useMemo } from 'react';
import { GreenApiService } from '@/shared/api';

interface SessionContextType {
    idInstance: string | null;
    apiTokenInstance: string | null;
    apiService: GreenApiService | null;
    login: (id: string, token: string) => void;
    logout: () => void;
    isAuth: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [idInstance, setIdInstance] = useState<string | null>(localStorage.getItem('idInstance'));
    const [apiTokenInstance, setApiTokenInstance] = useState<string | null>(localStorage.getItem('apiTokenInstance'));

    // Вычисляем apiService на лету с помощью useMemo, без использования useEffect и лишних setState
    const apiService = useMemo(() => {
        if (idInstance && apiTokenInstance) {
            return new GreenApiService(idInstance, apiTokenInstance);
        }
        return null;
    }, [idInstance, apiTokenInstance]);

    const login = (id: string, token: string) => {
        localStorage.setItem('idInstance', id);
        localStorage.setItem('apiTokenInstance', token);
        setIdInstance(id);
        setApiTokenInstance(token);
    };

    const logout = () => {
        localStorage.removeItem('idInstance');
        localStorage.removeItem('apiTokenInstance');
        setIdInstance(null);
        setApiTokenInstance(null);
    };

    return (
        <SessionContext.Provider
            value={{
                idInstance,
                apiTokenInstance,
                apiService,
                login,
                logout,
                isAuth: !!idInstance && !!apiTokenInstance
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};