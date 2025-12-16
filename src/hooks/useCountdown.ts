import { useState, useEffect, useCallback } from 'react';
import { CountdownSettings } from '@/types';

interface CountdownValues {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
}

export const useCountdown = (settings: CountdownSettings | null): CountdownValues => {
    const [countdown, setCountdown] = useState<CountdownValues>({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        isExpired: false
    });

    const calculateCountdown = useCallback(() => {
        if (!settings) return;

        const targetDateTime = `${settings.targetDate}T${settings.targetTime || '00:00'}`;
        const countDownDate = new Date(targetDateTime).getTime();
        const now = Date.now();
        const distance = countDownDate - now;

        if (distance < 0) {
            setCountdown({
                days: '00',
                hours: '00',
                minutes: '00',
                seconds: '00',
                isExpired: true
            });
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
            isExpired: false
        });
    }, [settings]);

    useEffect(() => {
        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, [calculateCountdown]);

    return countdown;
};
