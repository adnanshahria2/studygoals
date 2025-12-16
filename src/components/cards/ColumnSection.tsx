import React from 'react';
import { TopicItem } from './TopicItem';
import { Topic } from '@/types';

interface ColumnSectionProps {
    columnName: string;
    topicIds: string[];
    completedTopics: Record<string, Topic>;
    tableId: string;
    onEditTopic: (topicId: string) => void;
}

export const ColumnSection: React.FC<ColumnSectionProps> = ({
    columnName,
    topicIds,
    completedTopics,
    onEditTopic
}) => {
    // Only render if there are topics
    if (topicIds.length === 0) return null;

    return (
        <div className="py-2">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {columnName}
                </span>
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                    {topicIds.length}
                </span>
            </div>

            {/* Topics */}
            <div className="space-y-2">
                {topicIds.map((topicId) => {
                    const topic = completedTopics[topicId];
                    if (!topic) return null;
                    return (
                        <TopicItem
                            key={topicId}
                            topicId={topicId}
                            topic={topic}
                            onEdit={onEditTopic}
                        />
                    );
                })}
            </div>
        </div>
    );
};
