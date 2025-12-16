import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TargetCardMeta } from '@/types';
import { useData } from '@/contexts/DataContext';

interface EditTargetCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardMeta: TargetCardMeta | null;
}

export const EditTargetCardModal: React.FC<EditTargetCardModalProps> = ({ isOpen, onClose, cardMeta }) => {
    const { updateTargetCard } = useData();

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (cardMeta) {
            setTitle(cardMeta.title);
            setStartDate(cardMeta.startDate);
            setEndDate(cardMeta.endDate);
        }
    }, [cardMeta]);

    const handleSave = () => {
        if (!cardMeta || !title.trim() || !startDate || !endDate) return;

        updateTargetCard(cardMeta.id, {
            title: title.trim(),
            startDate,
            endDate
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Target"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="success" onClick={handleSave} disabled={!title.trim() || !startDate || !endDate}>
                        Save Changes
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Target Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Complete Physics Syllabus"
                        className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-purple"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-green"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white focus:outline-none focus:border-accent-red"
                        />
                    </div>
                </div>

                {/* Duration Preview */}
                {startDate && endDate && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-accent-blue font-mono">
                                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
