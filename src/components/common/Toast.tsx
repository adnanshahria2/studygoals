import React from 'react';
import { useToastContext } from '@/contexts/ToastContext';

const toastStyles = {
    success: 'bg-accent-green text-white border-green-600 px-4 py-3',
    error: 'bg-accent-red text-white border-red-600 px-4 py-3',
    info: 'bg-bg-card text-white border-border-light px-4 py-3',
    syncing: 'bg-white/90 text-gray-700 border-gray-200 px-2.5 py-1.5 text-xs'
};

export const Toast: React.FC = () => {
    const { toasts, removeToast } = useToastContext();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            flex items-center gap-2 rounded-lg border shadow-lg
            animate-slideUp cursor-pointer transition-transform hover:scale-105
            ${toastStyles[toast.type]}
          `}
                    onClick={() => removeToast(toast.id)}
                >
                    {toast.type === 'syncing' && (
                        <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {toast.type === 'success' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {toast.type === 'error' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span className={toast.type === 'syncing' ? 'font-medium' : 'font-semibold'}>{toast.message}</span>
                </div>
            ))}
        </div>
    );
};
