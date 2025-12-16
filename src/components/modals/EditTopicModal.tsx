import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/Dropdown';
import { useData } from '@/contexts/DataContext';

interface EditTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string | null;
    onDelete: (topicId: string) => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({ isOpen, onClose, topicId, onDelete }) => {
    const { completedTopics, settings, updateTopic } = useData();

    const [name, setName] = useState('');
    const [timedNote, setTimedNote] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [note, setNote] = useState('');
    const [hardness, setHardness] = useState('medium');
    const [studyStatus, setStudyStatus] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('low');

    useEffect(() => {
        if (topicId && completedTopics[topicId]) {
            const topic = completedTopics[topicId];
            setName(topic.name);
            setTimedNote(topic.timedNote || '');
            setEstimatedTime(topic.estimatedTime || '');
            setNote(topic.note || '');
            setHardness(topic.hardness);
            setStudyStatus(topic.studyStatus);
            setPriority(topic.priority);
        }
    }, [topicId, completedTopics]);

    const handleSave = () => {
        if (!topicId || !name.trim()) return;

        updateTopic(topicId, {
            name: name.trim(),
            timedNote: timedNote.trim(),
            estimatedTime: estimatedTime.trim(),
            note: note.trim(),
            hardness: hardness as 'easy' | 'medium' | 'hard',
            studyStatus,
            priority
        });

        onClose();
    };

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
            title="Edit Topic"
            footer={
                <div className="flex justify-between">
                    <Button variant="danger" onClick={() => topicId && onDelete(topicId)}>Delete</Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="success" onClick={handleSave}>Save</Button>
                    </div>
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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Timed Note</label>
                    <input
                        type="text"
                        value={timedNote}
                        onChange={(e) => setTimedNote(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Time</label>
                    <input
                        type="text"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue"
                        placeholder="e.g., 11 am - 9 pm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-blue resize-none"
                        placeholder="Add your notes here..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Hardness</label>
                        <Dropdown options={hardnessOptions} value={hardness} onChange={setHardness} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Study Type</label>
                        <Dropdown options={studyOptions} value={studyStatus} onChange={setStudyStatus} />
                    </div>
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
            </div>
        </Modal>
    );
};
