import React from 'react';
import { CountdownCard } from './CountdownCard';
import { useData } from '@/contexts/DataContext';

// Now Header only renders the Countdown since logo/icons are in Dashboard
export const Header: React.FC = () => {
    const { settings } = useData();

    return <CountdownCard settings={settings.countdownSettings} />;
};
