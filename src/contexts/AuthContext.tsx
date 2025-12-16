import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import {
    signIn as authSignIn,
    createAccount as authCreateAccount,
    getStoredSession,
    storeSession,
    clearSession
} from '@/services/auth.service';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<boolean>;
    createAccount: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for stored session on mount
    useEffect(() => {
        const stored = getStoredSession();
        if (stored) {
            setUser(stored);
        }
        setIsLoading(false);
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        const result = await authSignIn(email, password);

        if (result.success && result.user) {
            setUser(result.user);
            storeSession(result.user);
            setIsLoading(false);
            return true;
        } else {
            setError(result.error || 'Sign in failed');
            setIsLoading(false);
            return false;
        }
    };

    const createAccount = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        const result = await authCreateAccount(email, password);

        if (result.success && result.user) {
            setUser(result.user);
            storeSession(result.user);
            setIsLoading(false);
            return true;
        } else {
            setError(result.error || 'Account creation failed');
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        clearSession();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, signIn, createAccount, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
