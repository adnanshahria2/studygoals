import React from 'react';

interface ProgressBarProps {
    percentage: number;
    completed: number;
    total: number;
    label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, completed, total, label }) => {
    return (
        <div className="bg-bg-card px-4 py-2.5 rounded-lg border border-border shadow-md">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-white">
                    {label || 'Overall Progress'}
                </span>
                <span className="text-sm font-bold text-accent-green">{Math.round(percentage)}%</span>
            </div>

            <div className="w-full bg-bg-hover rounded-full h-2 overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-accent-green to-green-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="text-right mt-1">
                <span className="bg-accent-green/20 text-accent-green text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                    {completed} / {total} Done
                </span>
            </div>
        </div>
    );
};
