import React from 'react';
import { PROGRESS_STEPS, PROGRESS_CLASSES } from '@/constants';

interface ProgressBoxProps {
    progress: number;
    topicId: string;
    onProgressChange: (topicId: string, newProgress: number) => void;
}

export const ProgressBox: React.FC<ProgressBoxProps> = ({ progress, topicId, onProgressChange }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const currentIndex = PROGRESS_STEPS.indexOf(progress);
        const nextIndex = (currentIndex + 1) % PROGRESS_STEPS.length;
        onProgressChange(topicId, PROGRESS_STEPS[nextIndex]);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const currentIndex = PROGRESS_STEPS.indexOf(progress);
        const prevIndex = Math.max(0, currentIndex - 1);
        onProgressChange(topicId, PROGRESS_STEPS[prevIndex]);
    };

    return (
        <button
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        font-bold text-xs text-white cursor-pointer select-none
        transition-all duration-200 hover:scale-105 active:scale-95
        shadow-lg border border-white/10
        ${PROGRESS_CLASSES[progress] || PROGRESS_CLASSES[0]}
      `}
            title={`Progress: ${progress}% (Click to increase, Right-click to decrease)`}
        >
            {progress}%
        </button>
    );
};
