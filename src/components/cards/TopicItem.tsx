import React from 'react';
import { Topic } from '@/types';
import { HARDNESS_MAP, STUDY_TYPE_CLASSES, PRIORITY_CLASSES, PROGRESS_STEPS } from '@/constants';
import { useData } from '@/contexts/DataContext';

interface TopicItemProps {
    topicId: string;
    topic: Topic;
    onEdit: (topicId: string) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topicId, topic, onEdit }) => {
    const { updateTopic, settings } = useData();

    const handleProgressClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const currentIndex = PROGRESS_STEPS.indexOf(topic.progress);
        const nextIndex = (currentIndex + 1) % PROGRESS_STEPS.length;
        updateTopic(topicId, { progress: PROGRESS_STEPS[nextIndex] });
    };

    const handleProgressRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const currentIndex = PROGRESS_STEPS.indexOf(topic.progress);
        const prevIndex = Math.max(0, currentIndex - 1);
        updateTopic(topicId, { progress: PROGRESS_STEPS[prevIndex] });
    };

    const studyType = settings.customStudyTypes?.find((t) => t.key === topic.studyStatus);
    const studyTypeClass = STUDY_TYPE_CLASSES[topic.studyStatus] || STUDY_TYPE_CLASSES.custom;
    const isCompleted = topic.progress === 100;

    // Get short abbreviation for study type (first 3 chars or custom abbreviation)
    const getStudyTypeAbbr = () => {
        const name = studyType?.name || topic.studyStatus;
        if (name.length <= 3) return name.toUpperCase();
        // Return first 3 characters in uppercase
        return name.substring(0, 3).toUpperCase();
    };

    // Calculate progress ring values
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (topic.progress / 100) * circumference;

    const getProgressColor = () => {
        if (topic.progress === 100) return '#10b981';
        if (topic.progress >= 80) return '#3b82f6';
        if (topic.progress >= 60) return '#f59e0b';
        if (topic.progress >= 40) return '#f97316';
        if (topic.progress >= 20) return '#ef4444';
        return '#374151';
    };

    return (
        <div
            className={`topic-card flex items-center gap-2.5 p-2.5 group ${isCompleted ? 'completed' : ''}`}
        >
            {/* Priority + Hardness Indicator */}
            <div className="flex items-center gap-1">
                <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_CLASSES[topic.priority]}`}
                    title={`Priority: ${topic.priority}`}
                />
                <span className={`text-[9px] font-bold opacity-60 ${topic.hardness === 'hard' ? 'text-red-400' :
                        topic.hardness === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                    {HARDNESS_MAP[topic.hardness]}
                </span>
            </div>

            {/* Circular Progress Ring - Smaller */}
            <button
                onClick={handleProgressClick}
                onContextMenu={handleProgressRightClick}
                className="progress-ring flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title={`${topic.progress}% - Click to increase, Right-click to decrease`}
            >
                <svg width="36" height="36" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2.5"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke={getProgressColor()}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="progress-ring-circle"
                        style={{ filter: isCompleted ? 'drop-shadow(0 0 4px #10b981)' : 'none' }}
                    />
                    {/* Center text/icon */}
                    {isCompleted ? (
                        <path
                            d="M13 18l3 3 7-7"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <text
                            x="18"
                            y="21"
                            textAnchor="middle"
                            fill="white"
                            fontSize="9"
                            fontWeight="600"
                        >
                            {topic.progress}
                        </text>
                    )}
                </svg>
            </button>

            {/* Topic Info */}
            <div className="flex-1 min-w-0">
                <span className={`font-medium text-sm truncate block ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {topic.name}
                </span>
                {topic.timedNote && (
                    <span className="text-[10px] text-gray-500 mt-0.5 block truncate">{topic.timedNote}</span>
                )}
            </div>

            {/* Study Type Mini Badge - Right Side */}
            <div
                className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border opacity-80 ${studyTypeClass}`}
                title={studyType?.name || topic.studyStatus}
            >
                {getStudyTypeAbbr()}
            </div>

            {/* Edit Button */}
            <button
                onClick={() => onEdit(topicId)}
                className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0
                    ${topic.note
                        ? 'text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20'
                        : 'text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                title={topic.note || 'Edit topic'}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        </div>
    );
};

