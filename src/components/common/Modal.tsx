import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div className={`
        w-full ${sizeClasses[size]} bg-bg-card border border-border rounded-xl
        shadow-2xl transform transition-all duration-300 scale-100
        max-h-[90vh] flex flex-col
      `}>
                {title && (
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="text-xl font-semibold text-white">{title}</h3>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-border bg-black/30">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
