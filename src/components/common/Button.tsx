import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const variantClasses = {
    primary: 'bg-accent-blue hover:bg-blue-600 text-white shadow-glow-blue/30',
    secondary: 'bg-bg-hover hover:bg-border text-white border border-border',
    danger: 'bg-accent-red hover:bg-red-600 text-white',
    success: 'bg-accent-green hover:bg-green-600 text-white',
    ghost: 'bg-transparent hover:bg-bg-hover text-gray-400 hover:text-white'
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    children,
    ...props
}) => {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};
