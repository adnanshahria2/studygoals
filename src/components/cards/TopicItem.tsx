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

    const studyType = settings.customStudyTypes.find((t) => t.key === topic.studyStatus);
    const studyTypeClass = STUDY_TYPE_CLASSES[topic.studyStatus] || STUDY_TYPE_CLASSES.custom;
    const isCompleted = topic.progress === 100;

    // Calculate progress ring values
    const radius = 18;
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
            className={`topic-card flex items-center gap-3 p-3 group ${isCompleted ? 'completed' : ''}`}
        >
            {/* Priority Indicator */}
            <div className="flex flex-col items-center gap-1">
                <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_CLASSES[topic.priority]}`}
                    title={`Priority: ${topic.priority}`}
                />
            </div>

            {/* Circular Progress Ring */}
            <button
                onClick={handleProgressClick}
                onContextMenu={handleProgressRightClick}
                className="progress-ring flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title={`${topic.progress}% - Click to increase, Right-click to decrease`}
            >
                <svg width="44" height="44" viewBox="0 0 44 44">
                    {/* Background circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        stroke={getProgressColor()}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="progress-ring-circle"
                        style={{ filter: isCompleted ? 'drop-shadow(0 0 6px #10b981)' : 'none' }}
                    />
                    {/* Center text/icon */}
                    {isCompleted ? (
                        <path
                            d="M16 22l4 4 8-8"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <text
                            x="22"
                            y="26"
                            textAnchor="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="600"
                        >
                            {topic.progress}
                        </text>
                    )}
                </svg>
            </button>

            {/* Topic Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {topic.name}
                    </span>
                    {/* Hardness Badge */}
                    <span className={`badge badge-${topic.hardness}`}>
                        {HARDNESS_MAP[topic.hardness]}
                    </span>
                    {/* Study Type Badge */}
                    <span className={`badge ${studyTypeClass}`}>
                        {studyType?.name || topic.studyStatus}
                    </span>
                </div>
                {topic.timedNote && (
                    <span className="text-xs text-gray-500 italic mt-0.5 block">{topic.timedNote}</span>
                )}
            </div>

            {/* Edit Button */}
            <button
                onClick={() => onEdit(topicId)}
                className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 
                    ${topic.note
                        ? 'text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20'
                        : 'text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                title={topic.note || 'Edit topic'}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        </div>
    );
};
