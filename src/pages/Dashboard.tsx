import React, { useState, useMemo } from 'react';
import { DateCard } from '@/components/cards/DateCard';
import { TargetCard } from '@/components/cards/TargetCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { AddTopicModal } from '@/components/modals/AddTopicModal';
import { EditTopicModal } from '@/components/modals/EditTopicModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useCountdown } from '@/hooks/useCountdown';

type ViewMode = 'table1' | 'table2';

export const Dashboard: React.FC = () => {
    const { tableData, completedTopics, addCard, deleteCard, deleteTopic, updateTableData, addTargetCard, deleteTargetCard, settings } = useData();
    const { days, hours, minutes, seconds } = useCountdown(settings.countdownSettings);

    const [view, setView] = useState<ViewMode>('table1');
    const [showSettings, setShowSettings] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showCreateTarget, setShowCreateTarget] = useState(false);
    const [addTopicInfo, setAddTopicInfo] = useState<{ tableId: string; cardId: string } | null>(null);
    const [editTopicId, setEditTopicId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ tableId: string; cardId: string } | null>(null);

    // Create Target form state
    const [newTargetTitle, setNewTargetTitle] = useState('');
    const [newTargetStart, setNewTargetStart] = useState('');
    const [newTargetEnd, setNewTargetEnd] = useState('');

    const timeLeft = [days, hours, minutes, seconds];

    // Get sorted dates for Daily Plan
    const sortedDailyDates = useMemo(() => {
        return Object.keys(tableData.table2).sort((a, b) => {
            const [dA, mA, yA] = a.split('/').map(Number);
            const [dB, mB, yB] = b.split('/').map(Number);
            return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
        });
    }, [tableData.table2]);

    // Get target cards sorted by end date
    const sortedTargetCards = useMemo(() => {
        return [...(tableData.targetCards || [])].sort((a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        );
    }, [tableData.targetCards]);

    const stats = useMemo(() => {
        const activeTopicIds = new Set<string>();

        // Collect IDs from Target Cards
        (tableData.targetCards || []).forEach(card => {
            // Check both card.data (new) and table1 (legacy/current)
            // Fix: card.data might be initialized as {} so we must check if it has keys
            const hasNewData = card.data && Object.keys(card.data).length > 0;
            const data = hasNewData ? card.data : (tableData.table1[card.id] || {});

            Object.values(data || {}).forEach(columnTopics => {
                if (Array.isArray(columnTopics)) {
                    columnTopics.forEach(id => activeTopicIds.add(id));
                }
            });
        });

        // Collect IDs from Daily Plan (table2)
        Object.values(tableData.table2).forEach(dateColumns => {
            Object.values(dateColumns).forEach(columnTopics => {
                if (Array.isArray(columnTopics)) {
                    columnTopics.forEach(id => activeTopicIds.add(id));
                }
            });
        });

        let total = 0, completed = 0;
        activeTopicIds.forEach(id => {
            const topic = completedTopics[id];
            if (topic) {
                total++;
                if (topic.progress === 100) completed++;
            }
        });

        return { total, completed, pct: total > 0 ? (completed / total) * 100 : 0 };
    }, [tableData, completedTopics]);

    const existingDates = useMemo(() =>
        Object.keys(tableData.table1).concat(Object.keys(tableData.table2)),
        [tableData]
    );

    const handleCalendarSelect = (date: string) => {
        addCard('table2', date);
    };

    const handleDateChange = (oldDate: string, newDate: string) => {
        const newTableData = JSON.parse(JSON.stringify(tableData));
        newTableData[view][newDate] = newTableData[view][oldDate];
        delete newTableData[view][oldDate];
        updateTableData(newTableData);
    };

    const handleDeleteTopic = (topicId: string) => {
        deleteTopic(topicId);
        setEditTopicId(null);
    };

    const handleCreateTarget = () => {
        if (!newTargetTitle.trim() || !newTargetStart || !newTargetEnd) return;
        addTargetCard(newTargetTitle.trim(), newTargetStart, newTargetEnd);
        setNewTargetTitle('');
        setNewTargetStart('');
        setNewTargetEnd('');
        setShowCreateTarget(false);
    };

    const handleDeleteTarget = (cardId: string) => {
        deleteTargetCard(cardId);
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* HEADER REDESIGN */}
                <div className="mb-6">
                    {/* MOBILE LAYOUT (md:hidden) */}
                    <div className="block md:hidden space-y-4">
                        {/* Row 1: Brand & Actions */}
                        <div className="flex items-center justify-between p-1">
                            <h1 className="text-2xl font-bold text-white">
                                Study<span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">Goals</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                        <path strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0-1.17-2.82H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 2.82-1.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 1.17 2.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Stats & Countdown Stack */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* Mobile Stats - Compact */}
                            <div className="glass-card p-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/60 to-slate-800/60 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                                            Progress
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-accent-purple/30 pb-24 md:pb-0">
                                                {/* Mobile Header (Only on Dashboard Tab) */}
                                                <div className={`md:hidden p-4 flex justify-between items-center sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-md border-b border-white/5 ${activeMobileTab !== 'dashboard' ? 'hidden' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/20">
                                                            <span className="text-xl">🎓</span>
                                                        </div>
                                                        <div>
                                                            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                                                StudyGoals
                                                            </h1>
                                                            <p className="text-xs text-gray-400">Welcome back, {user?.displayName?.split(' ')[0]}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content Container */}
                                                <div className="max-w-7xl mx-auto p-4 md:p-8 md:h-screen md:overflow-hidden flex flex-col">

                                                    {/* DESKTOP LAYOUT (Unchanged) */}
                                                    <div className="hidden md:flex flex-col h-full gap-6">
                                                        {/* Header Section */}
                                                        <div className="flex items-center justify-between bg-bg-card border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                            <div className="flex items-center gap-6 relative z-10 w-full">
                                                                {/* Column 1: Title & Toggles */}
                                                                <div className="flex items-center gap-8 bg-bg-card/80 border border-accent-purple/30 shadow-[0_0_15px_-5px_rgba(168,85,247,0.25)] rounded-2xl p-3 pr-6 backdrop-blur-sm">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-14 h-14 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-accent-purple/20 animate-float">
                                                                            🎓
                                                                        </div>
                                                                        <div>
                                                                            <h1 className="text-3xl font-bold text-white tracking-tight">StudyGoals</h1>
                                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                                                <span>Ready to focus</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="h-10 w-px bg-white/10" />

                                                                    <div className="flex bg-black/40 rounded-xl p-1 border border-accent-purple/30 shadow-[0_0_10px_-3px_rgba(168,85,247,0.2)]">
                                                                        <button
                                                                            onClick={() => setView('table1')}
                                                                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${view === 'table1'
                                                                                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                                                                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                                        >
                                                                            Target Plan
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setView('table2')}
                                                                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${view === 'table2'
                                                                                ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/25'
                                                                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                                        >
                                                                            Daily Plan
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Column 2: Stats (Marks) */}
                                                                <div className="flex-1 flex items-center gap-4 bg-bg-card/50 border border-accent-green/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] rounded-2xl p-3 hover:border-accent-green/50 transition-colors">
                                                                    <div className="p-3 bg-accent-green/10 rounded-xl text-accent-green">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between text-sm mb-1">
                                                                            <span className="text-gray-400">Total Marks</span>
                                                                            <span className="font-mono font-bold text-accent-green">{totalMarksAchieved}/{totalMarksPossible}</span>
                                                                        </div>
                                                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-accent-green transition-all duration-1000 ease-out relative overflow-hidden"
                                                                                style={{ width: `${(totalMarksAchieved / totalMarksPossible) * 100}%` }}
                                                                            >
                                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Column 3: Countdown */}
                                                                <div className="flex-1 flex items-center gap-4 bg-bg-card/50 border border-accent-blue/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.25)] rounded-2xl p-3 hover:border-accent-blue/50 transition-colors">
                                                                    <div className="p-3 bg-accent-blue/10 rounded-xl text-accent-blue">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wider">{settings.countdownSettings.title}</p>
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className="text-2xl font-bold text-white tabular-nums">{settings.countdownSettings.daysRemaining}</span>
                                                                            <span className="text-sm text-gray-500">days left</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Settings Button */}
                                                                <button
                                                                    onClick={() => setShowSettings(true)}
                                                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95 group/settings"
                                                                >
                                                                    <svg className="w-6 h-6 text-gray-400 group-hover/settings:text-white group-hover/settings:rotate-90 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Columns Grid */}
                                                        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                                                            {/* Target Plan Column */}
                                                            <div className={`flex flex-col bg-bg-card/30 border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 ${view === 'table1' ? 'opacity-100 scale-100' : 'opacity-50 scale-95 grayscale'}`}>
                                                                <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-accent-purple/20 rounded-lg text-accent-purple">
                                                                            🎯
                                                                        </div>
                                                                        <h2 className="text-lg font-bold">Long Term Targets</h2>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setAddTopicInfo({ tableId: 'table1', cardId: 'new' })}
                                                                        className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-purple/25 transition-all hover:-translate-y-0.5"
                                                                    >
                                                                        + Create Target
                                                                    </button>
                                                                </div>
                                                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                                                    {validTargetCards.length > 0 ? (
                                                                        validTargetCards.map((card) => (
                                                                            <TargetCard
                                                                                key={card.id}
                                                                                cardMeta={card}
                                                                                dateData={tableData.table1[card.id] || {}}
                                                                                completedTopics={completedTopics}
                                                                                onAddTopic={(tId, cId) => setAddTopicInfo({ tableId: tId, cardId: cId })}
                                                                                onEditTopic={setEditTopicId}
                                                                                onDeleteCard={(cId) => setDeleteConfirm({ tableId: 'table1', cardId: 'new', targetCardId: cId })} // Pass targetCardId for special handling
                                                                            />
                                                                        ))
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                                            <span className="text-4xl mb-4 opacity-50">🎯</span>
                                                                            <p>No targets set yet</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Daily Plan Column */}
                                                            <div className={`flex flex-col bg-bg-card/30 border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 ${view === 'table2' ? 'opacity-100 scale-100' : 'opacity-50 scale-95 grayscale'}`}>
                                                                <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-accent-cyan/20 rounded-lg text-accent-cyan">
                                                                            📅
                                                                        </div>
                                                                        <h2 className="text-lg font-bold">Daily Plan</h2>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setShowCalendar(true)}
                                                                        className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-black rounded-xl text-sm font-semibold shadow-lg shadow-accent-cyan/25 transition-all hover:-translate-y-0.5"
                                                                    >
                                                                        + New Day
                                                                    </button>
                                                                </div>
                                                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                                                    {sortedDailyDatesMobile.length > 0 ? (
                                                                        sortedDailyDatesMobile.map((date) => (
                                                                            <DateCard
                                                                                key={date}
                                                                                tableId="table2"
                                                                                date={date}
                                                                                dateData={tableData.table2[date]}
                                                                                completedTopics={completedTopics}
                                                                                onAddTopic={(tId, d) => setAddTopicInfo({ tableId: tId, cardId: d })}
                                                                                onEditTopic={setEditTopicId}
                                                                                onDeleteCard={(tId, d) => setDeleteConfirm({ tableId: tId, cardId: d })}
                                                                                onDateChange={handleDateChange}
                                                                            />
                                                                        ))
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                                                📅
                                                                            </div>
                                                                            <p>No daily plans yet</p>
                                                                            <button
                                                                                onClick={() => setShowCalendar(true)}
                                                                                className="px-6 py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:text-accent-cyan hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all"
                                                                            >
                                                                                + Start Today
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* MOBILE LAYOUT (Tabs) */}
                                                    <div className="md:hidden space-y-4">
                                                        {/* DASHBOARD TAB */}
                                                        {activeMobileTab === 'dashboard' && (
                                                            <div className="space-y-4 animate-fadeIn">
                                                                {/* Stats Card */}
                                                                <div className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div>
                                                                            <p className="text-sm text-gray-400 font-medium mb-1">Total Progress</p>
                                                                            <h3 className="text-3xl font-bold text-white tracking-tight">
                                                                                {totalMarksAchieved}<span className="text-lg text-gray-500 font-normal">/{totalMarksPossible}</span>
                                                                            </h3>
                                                                        </div>
                                                                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative pt-2">
                                                                        <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                                                                                style={{ width: `${(totalMarksAchieved / totalMarksPossible) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        <p className="text-right text-xs text-emerald-400 mt-2 font-mono">
                                                                            {Math.round((totalMarksAchieved / totalMarksPossible) * 100)}% Complete
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Countdown Card */}
                                                                <div className="bg-gradient-to-br from-blue-900/30 via-slate-900/50 to-purple-900/30 border border-blue-500/20 rounded-2xl p-5 shadow-lg relative">
                                                                    <div className="absolute top-0 right-0 p-4 opacity-20 text-blue-400">
                                                                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className="text-sm text-blue-300 font-medium mb-1 uppercase tracking-wider">{settings.countdownSettings.title}</p>
                                                                    <div className="flex items-end gap-2 mb-2">
                                                                        <span className="text-5xl font-bold text-white tracking-tighter tabular-nums drop-shadow-glow">{settings.countdownSettings.daysRemaining}</span>
                                                                        <span className="text-lg text-blue-200/80 mb-2 font-medium">days remaining</span>
                                                                    </div>
                                                                    <div className="mt-4 flex gap-2">
                                                                        <div className="flex-1 bg-black/20 rounded-lg p-2 text-center border border-white/5">
                                                                            <div className="text-xs text-gray-400">Target</div>
                                                                            <div className="text-sm font-mono text-blue-300">{settings.countdownSettings.targetDate}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* TARGETS TAB */}
                                                        {activeMobileTab === 'targets' && (
                                                            <div className="space-y-4 animate-fadeIn pb-20">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <h2 className="text-xl font-bold text-white">Your Targets</h2>
                                                                    <button
                                                                        onClick={() => setAddTopicInfo({ tableId: 'table1', cardId: 'new' })}
                                                                        className="p-2 bg-accent-purple/20 text-accent-purple rounded-lg border border-accent-purple/30"
                                                                    >
                                                                        + New
                                                                    </button>
                                                                </div>

                                                                {validTargetCards.length > 0 ? (
                                                                    validTargetCards.map((card) => (
                                                                        <TargetCard
                                                                            key={card.id}
                                                                            cardMeta={card}
                                                                            dateData={tableData.table1[card.id] || {}}
                                                                            completedTopics={completedTopics}
                                                                            onAddTopic={(tId, cId) => setAddTopicInfo({ tableId: tId, cardId: cId })}
                                                                            onEditTopic={setEditTopicId}
                                                                            onDeleteCard={(cId) => setDeleteConfirm({ tableId: 'table1', cardId: 'new', targetCardId: cId })}
                                                                        />
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center py-10 text-gray-500">No targets yet</div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* DAILY TAB */}
                                                        {activeMobileTab === 'daily' && (
                                                            <div className="space-y-4 animate-fadeIn pb-20">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <h2 className="text-xl font-bold text-white">Daily Plan</h2>
                                                                    <button
                                                                        onClick={() => setShowCalendar(true)}
                                                                        className="p-2 bg-accent-cyan/20 text-accent-cyan rounded-lg border border-accent-cyan/30"
                                                                    >
                                                                        + Day
                                                                    </button>
                                                                </div>

                                                                {sortedDailyDatesMobile.length > 0 ? (
                                                                    sortedDailyDatesMobile.map((date) => (
                                                                        <DateCard
                                                                            key={date}
                                                                            tableId="table2"
                                                                            date={date}
                                                                            dateData={tableData.table2[date]}
                                                                            completedTopics={completedTopics}
                                                                            onAddTopic={(tId, d) => setAddTopicInfo({ tableId: tId, cardId: d })}
                                                                            onEditTopic={setEditTopicId}
                                                                            onDeleteCard={(tId, d) => setDeleteConfirm({ tableId: tId, cardId: d })}
                                                                            onDateChange={handleDateChange}
                                                                        />
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center py-10">
                                                                        <p className="text-gray-500 mb-4">No days added</p>
                                                                        <button
                                                                            onClick={() => setShowCalendar(true)}
                                                                            className="px-6 py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400"
                                                                        >
                                                                            + Start Today
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* SETTINGS TAB */}
                                                        {activeMobileTab === 'settings' && (
                                                            <div className="animate-fadeIn pb-20">
                                                                <SettingsContent onLogout={logout} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bottom Nav (Mobile Only) */}
                                                <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

                                                {/* Modals */}
                                                <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
                                                <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onSelectDate={handleCalendarSelect} existingDates={existingDates} />
                                                {addTopicInfo && (
                                                    <AddTopicModal isOpen onClose={() => setAddTopicInfo(null)} tableId={addTopicInfo.tableId} date={addTopicInfo.cardId} />
                                                )}
                                                <EditTopicModal isOpen={!!editTopicId} onClose={() => setEditTopicId(null)} topicId={editTopicId} onDelete={handleDeleteTopic} />
                                                <ConfirmModal
                                                    isOpen={!!deleteConfirm}
                                                    onClose={() => setDeleteConfirm(null)}
                                                    onConfirm={() => {
                                                        if (deleteConfirm) {
                                                            if (deleteConfirm.targetCardId) {
                                                                deleteTargetCard(deleteConfirm.targetCardId);
                                                            } else {
                                                                deleteCard(deleteConfirm.tableId, deleteConfirm.cardId);
                                                            }
                                                        }
                                                        setDeleteConfirm(null);
                                                    }}
                                                    message="This will delete the card and all its topics. Continue?"
                                                />

                                                {/* Create Target Modal */}
                                                {showCreateTarget && (
                                                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateTarget(false)}>
                                                        <div className="glass-card rounded-2xl p-6 max-w-md w-full animate-slideUp" onClick={e => e.stopPropagation()}>
                                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                                <span className="text-2xl">🎯</span> Create New Target
                                                            </h3>

                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm text-gray-400 mb-1">Target Title</label>
                                                                    <input
                                                                        type="text"
                                                                        value={newTargetTitle}
                                                                        onChange={(e) => setNewTargetTitle(e.target.value)}
                                                                        placeholder="e.g., Complete Physics Syllabus"
                                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={newTargetStart}
                                                                            onChange={(e) => setNewTargetStart(e.target.value)}
                                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={newTargetEnd}
                                                                            onChange={(e) => setNewTargetEnd(e.target.value)}
                                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3 mt-6">
                                                                <button
                                                                    onClick={() => setShowCreateTarget(false)}
                                                                    className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={handleCreateTarget}
                                                                    disabled={!newTargetTitle.trim() || !newTargetStart || !newTargetEnd}
                                                                    className="flex-1 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                                                                >
                                                                    Create Target
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
};

