import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface DropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full flex items-center justify-between px-3 py-2
          bg-bg-hover border border-border rounded-lg
          text-white transition-all duration-200
          ${isOpen ? 'border-accent-blue ring-2 ring-accent-blue/20' : 'hover:border-border-light'}
        `}
            >
                <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 py-1 bg-bg-card border border-border-light rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={`
                w-full px-3 py-2 text-left transition-colors
                ${option.value === value
                                    ? 'bg-accent-blue text-white font-semibold'
                                    : 'text-white hover:bg-bg-hover'}
              `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
