import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Topic, ColumnData } from '@/types';
import { COLUMN_HEADERS } from '@/constants';
import { useData } from '@/contexts/DataContext';

interface DateCardProps {
    tableId: 'table1' | 'table2';
    date: string;
    dateData: ColumnData;
    completedTopics: Record<string, Topic>;
    onAddTopic: (tableId: string, date: string) => void;
    onEditTopic: (topicId: string) => void;
    onDeleteCard: (tableId: string, date: string) => void;
    onDateChange: (oldDate: string, newDate: string) => void;
}

export const DateCard: React.FC<DateCardProps> = ({
    tableId, date, dateData, completedTopics,
    onAddTopic, onEditTopic, onDeleteCard, onDateChange
}) => {
    const { tableData, updateTableData, updateTopic } = useData();
    const [showPullModal, setShowPullModal] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

    const columns = COLUMN_HEADERS[tableId];

    const { totalTopics, completedCount, percentage } = useMemo(() => {
        let total = 0, completed = 0;
        columns.forEach((col) => {
            const ids = dateData[col] || [];
            ids.forEach((id) => {
                const topic = completedTopics[id];
                if (topic) {
                    total++;
                    if (topic.progress === 100) completed++;
                }
            });
        });
        return { totalTopics: total, completedCount: completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
    }, [columns, dateData, completedTopics]);

    // Get all topics from Targets (table1) that can be pulled to Daily Plan
    const availableTargetTopics = useMemo(() => {
        if (tableId !== 'table2') return [];

        const topics: { topicId: string; topic: Topic; targetTitle: string; column: string }[] = [];
        const alreadyInDailyPlan = new Set<string>();

        // Get all topic IDs already in this Daily Plan card
        Object.values(dateData).forEach(ids => {
            ids.forEach(id => alreadyInDailyPlan.add(id));
        });

        // Get topics from Targets that aren't in this Daily Plan card
        if (tableData.targetCards) {
            tableData.targetCards.forEach(card => {
                const targetTitle = card.data ? card.title : card.title; // Keep title simple
                // Fallback to table1 for data source if card.data is empty
                const hasNewData = card.data && Object.keys(card.data).length > 0;
                const targetData = hasNewData ? card.data : (tableData.table1[card.id] || {});

                Object.entries(targetData || {}).forEach(([colName, topicIds]) => {
                    if (Array.isArray(topicIds)) {
                        topicIds.forEach(id => {
                            const topic = completedTopics[id];
                            // Relaxed check: allow pulling even if 100% (user can decide), or at least to debug visibility.
                            // Checking topic existence and uniqueness in current daily card.
                            if (topic && !alreadyInDailyPlan.has(id)) {
                                topics.push({
                                    topicId: id,
                                    topic,
                                    targetTitle,
                                    column: colName
                                });
                            }
                        });
                    }
                });
            });
        }

        return topics;
    }, [tableId, tableData, dateData, completedTopics]);

    const handlePullTopic = (topicId: string, targetColumn: string) => {
        const newTableData = JSON.parse(JSON.stringify(tableData));
        if (!newTableData.table2[date]) {
            newTableData.table2[date] = {};
        }
        if (!newTableData.table2[date][targetColumn]) {
            newTableData.table2[date][targetColumn] = [];
        }
        newTableData.table2[date][targetColumn].push(topicId);
        updateTableData(newTableData);
        setShowPullModal(false);
        setSelectedColumn(null);
    };

    const getProgressGradient = () => {
        if (percentage === 100) return 'from-green-500 to-emerald-400';
        if (percentage >= 75) return 'from-blue-500 to-cyan-400';
        if (percentage >= 50) return 'from-yellow-500 to-amber-400';
        if (percentage >= 25) return 'from-orange-500 to-red-400';
        return 'from-gray-600 to-gray-500';
    };

    const PROGRESS_STEPS = [0, 20, 40, 60, 80, 100];

    // Already have useData hook called at top of component

    const handleProgressClick = (e: React.MouseEvent, topic: Topic, topicId: string) => {
        e.stopPropagation(); // Prevent opening edit modal
        const currentIndex = PROGRESS_STEPS.indexOf(topic.progress);
        const nextIndex = (currentIndex + 1) % PROGRESS_STEPS.length;
        updateTopic(topicId, { progress: PROGRESS_STEPS[nextIndex] });
    };

    return (
        <div className="bg-bg-card border border-border rounded-xl mb-4 overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <h3
                        contentEditable
                        suppressContentEditableWarning
                        className="text-lg font-bold text-white flex-1 truncate"
                        onBlur={(e) => {
                            const newDate = e.currentTarget.textContent?.trim();
                            if (newDate && newDate !== date) onDateChange(date, newDate);
                        }}
                    >
                        {date}
                    </h3>

                    {/* Delete Button */}
                    <button
                        onClick={() => onDeleteCard(tableId, date)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete card"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressGradient()} rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-400' : 'text-white'}`}>
                                {Math.round(percentage)}%
                            </span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {completedCount}/{totalTopics}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columns - Responsive Grid: Single Column Mobile, 4-Col Desktop */}
            <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                {columns.map((col) => (
                    <div key={col} className="bg-gray-800/40 rounded-lg p-3 md:p-2 min-h-[60px] border border-white/5">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide px-1 md:px-0">{col}</h4>
                        <div className="space-y-2 md:space-y-1">
                            {(dateData[col] || []).map((topicId) => {
                                const topic = completedTopics[topicId];
                                if (!topic) return null;
                                return (
                                    <div
                                        key={topicId}
                                        onClick={(e) => handleProgressClick(e, topic, topicId)}
                                        className="w-full text-left p-2 bg-bg-card border border-border rounded-lg hover:border-accent-purple transition-all group flex items-center gap-2 cursor-pointer relative pr-8"
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors mt-1 ${topic.progress === 100 ? 'bg-green-500' : 'bg-gray-600'
                                                } ${topic.progress > 0 && topic.progress < 100 ? 'border-2 border-accent-blue bg-transparent' : ''}`}
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <span className={`text-sm truncate ${topic.progress === 100 ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {topic.name}
                                            </span>
                                            {topic.note && (
                                                <span className="text-[10px] text-gray-500 truncate italic">
                                                    {topic.note}
                                                </span>
                                            )}
                                            {topic.estimatedTime && (
                                                <span className="text-[10px] text-accent-purple truncate font-mono flex items-center gap-1 mt-0.5">
                                                    <span className="text-xs">⏰</span> {topic.estimatedTime}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-mono font-medium ${topic.progress === 100 ? 'text-green-500' : 'text-gray-500'}`}
                                        >
                                            {topic.progress}%
                                        </span>

                                        {/* Edit Pencil - Hover Only */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditTopic(topicId);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 text-gray-400 hover:text-accent-blue bg-bg-card/80 rounded transition-all"
                                            title="Edit details"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                            {(dateData[col] || []).length === 0 && (
                                <p className="text-xs text-gray-600 italic">No topics</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 flex gap-2">
                <button
                    onClick={() => onAddTopic(tableId, date)}
                    className="flex-1 py-2.5 border-2 border-dashed border-white/20 rounded-xl text-gray-400 font-semibold hover:text-accent-blue hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                >
                    + Add New Topic
                </button>

                {/* Pull from Targets button - only show in Daily Plan */}
                {tableId === 'table2' && (
                    <button
                        onClick={() => setShowPullModal(true)}
                        className="pull-button px-4 py-2.5 rounded-xl font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                        ⬇ Pull
                    </button>
                )}
            </div>

            {/* Pull from Targets Modal - Using Portal to escape parent transforms */}
            {showPullModal && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
                    onClick={() => { setShowPullModal(false); setSelectedColumn(null); }}
                >
                    <div
                        className="w-full max-w-lg bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-white">📚 Pull from Targets</h3>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {/* Session Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Add to Session</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {columns.map(col => (
                                        <button
                                            key={col}
                                            onClick={() => setSelectedColumn(col)}
                                            className={`p-2.5 rounded-lg text-sm font-medium transition-all ${selectedColumn === col
                                                ? 'bg-accent-blue text-white'
                                                : 'bg-bg-hover border border-border text-gray-300 hover:border-accent-blue'
                                                }`}
                                        >
                                            {col}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topics List */}
                            {selectedColumn && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Available Topics ({availableTargetTopics.length})
                                    </label>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                        {availableTargetTopics.map(({ topicId, topic, targetTitle, column }) => (
                                            <button
                                                key={topicId}
                                                onClick={() => handlePullTopic(topicId, selectedColumn)}
                                                className="w-full p-3 text-left bg-bg-hover border border-border rounded-lg hover:border-accent-purple transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${topic.progress === 100 ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                        <span className="text-white font-medium text-sm">{topic.name}</span>
                                                    </div>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 group-hover:bg-accent-purple/20 group-hover:text-accent-purple">
                                                        + Add
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{column} • {targetTitle}</p>
                                            </button>
                                        ))}
                                        {availableTargetTopics.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm py-4">All topics already added</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-border bg-black/30 flex justify-end">
                            <button
                                onClick={() => { setShowPullModal(false); setSelectedColumn(null); }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};
