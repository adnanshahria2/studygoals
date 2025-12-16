import React from 'react';
import { Modal } from '@/components/common/Modal';
import { SettingsContent } from '@/components/settings/SettingsContent';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="h-[550px] md:h-[480px]">
                <SettingsContent onLogout={onClose} />
            </div>
        </Modal>
    );
};
