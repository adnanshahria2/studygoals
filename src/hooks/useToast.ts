import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '@/types';

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        const newToast: ToastMessage = { id, type, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after delay
        const duration = type === 'syncing' ? 4000 : type === 'error' ? 3000 : 2000;
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
};
