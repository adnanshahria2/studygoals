import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType } from '@/types';

interface ToastContextType {
    toasts: ToastMessage[];
    showToast: (type: ToastType, message: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        // Prevent duplicate syncing toasts
        if (type === 'syncing') {
            setToasts((prev) => {
                // Check if syncing toast already exists
                if (prev.some(t => t.type === 'syncing')) {
                    return prev; // Don't add another syncing toast
                }
                const id = Date.now().toString();
                setTimeout(() => {
                    setToasts((p) => p.filter((t) => t.id !== id));
                }, 3000);
                return [...prev, { id, type, message }];
            });
            return;
        }

        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);

        const duration = type === 'error' ? 3500 : 2500;
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToastContext = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within ToastProvider');
    }
    return context;
};
