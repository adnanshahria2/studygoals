import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/Dropdown';
import { useData } from '@/contexts/DataContext';
import { COLUMN_HEADERS } from '@/constants';
import { Topic } from '@/types';

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string;
    date: string;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose, tableId, date }) => {
    const { settings, addTopic, tableData } = useData();
    const [name, setName] = useState('');
    const [timedNote, setTimedNote] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [column, setColumn] = useState(COLUMN_HEADERS[tableId as keyof typeof COLUMN_HEADERS][0]);
    const [hardness, setHardness] = useState('medium');
    const [studyStatus, setStudyStatus] = useState(settings.customStudyTypes[0]?.key || '');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('low');

    // Sync Logic: Check if current date falls within any Target Card
    const targetCardMatch = tableId === 'table2' ? (tableData.targetCards || []).find(card => {
        const start = new Date(card.startDate);
        const end = new Date(card.endDate);
        const current = new Date(date.split('/').reverse().join('-')); // assuming date is DD/MM/YYYY or YYYY-MM-DD. Let's check format.
        // Actually, date passed to modal from DateCard is likely YYYY-MM-DD.
        // Let's use simple string comparison if format matches, or Date objects.
        // Safer to use Date objects.
        const d = new Date(date);
        return d >= start && d <= end;
    }) : undefined;

    const [targetSubject, setTargetSubject] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;

        const topic: Topic = {
            name: name.trim(),
            note: '',
            timedNote: timedNote.trim(),
            estimatedTime: estimatedTime.trim(),
            progress: 0,
            priority,
            hardness: hardness as 'easy' | 'medium' | 'hard',
            studyStatus
        };

        // Add to current table (e.g., Daily Plan)
        const newTopicId = addTopic(tableId, date, column, topic);

        // If syncing is enabled (Target Subject selected), add to Target Card too
        if (targetCardMatch && targetSubject) {
            addTopic('table1', targetCardMatch.id, targetSubject, topic, newTopicId);
        }

        // Reset form
        setName('');
        setTimedNote('');
        setEstimatedTime('');
        setPriority('low');
        setTargetSubject('');
        onClose();
    };

    const columns = COLUMN_HEADERS[tableId as keyof typeof COLUMN_HEADERS];
    const columnOptions = columns.map((c) => ({ value: c, label: c }));
    const hardnessOptions = [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
    ];
    const studyOptions = settings.customStudyTypes.map((t) => ({ value: t.key, label: t.name }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Topic"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>Save Topic</Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Topic Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue"
                        placeholder="Enter topic name"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Timed Note</label>
                    <input
                        type="text"
                        value={timedNote}
                        onChange={(e) => setTimedNote(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue"
                        placeholder="e.g., 30 min or 10:00 AM"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Time (Optional)</label>
                    <input
                        type="text"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue"
                        placeholder="e.g., 11 am - 9 pm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {tableId === 'table1' ? 'Subject' : 'Session'}
                        </label>
                        <Dropdown options={columnOptions} value={column} onChange={setColumn} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Hardness</label>
                        <Dropdown options={hardnessOptions} value={hardness} onChange={setHardness} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Study Type</label>
                    <Dropdown options={studyOptions} value={studyStatus} onChange={setStudyStatus} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${priority === p
                                    ? p === 'high' ? 'border-accent-red bg-accent-red/20 text-white'
                                        : p === 'medium' ? 'border-accent-gold bg-accent-gold/20 text-white'
                                            : 'border-border-light bg-bg-hover text-white'
                                    : 'border-border text-gray-400 hover:border-border-light'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${p === 'high' ? 'bg-accent-red' : p === 'medium' ? 'bg-accent-gold' : 'bg-gray-500'
                                    }`} />
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Sync Section */}
                {targetCardMatch && (
                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-sm font-medium text-accent-purple mb-1 flex items-center gap-2">
                            <span className="animate-pulse">🔗</span> Link to Target: {targetCardMatch.title}
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Select a subject to automatically add this task to your long-term plan.</p>
                        <Dropdown
                            options={[
                                { value: '', label: 'Do not link' },
                                ...COLUMN_HEADERS.table1.map(c => ({ value: c, label: c }))
                            ]}
                            value={targetSubject}
                            onChange={setTargetSubject}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};
