import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, onClose, onConfirm, message, confirmText = 'Yes, Delete', confirmVariant = 'danger'
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Are you sure?" size="sm">
            <p className="text-gray-300 mb-4">{message}</p>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant={confirmVariant} onClick={() => { onConfirm(); onClose(); }}>
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};
