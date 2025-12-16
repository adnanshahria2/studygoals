import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { CountdownSettings } from '@/types';

interface CountdownCardProps {
    settings: CountdownSettings;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ settings }) => {
    const { days, hours, minutes, seconds, isExpired } = useCountdown(settings);

    const segments = [
        { label: 'Days', value: days, color: 'from-accent-red to-red-700' },
        { label: 'Hours', value: hours, color: 'from-accent-orange to-orange-700' },
        { label: 'Mins', value: minutes, color: 'from-accent-gold to-yellow-700' },
        { label: 'Secs', value: seconds, color: 'from-accent-green to-green-700' }
    ];

    return (
        <div className="bg-gradient-to-br from-blue-900/50 to-bg-primary border border-accent-blue/50 rounded-lg px-3 py-2 shadow-glow-blue flex flex-col justify-center min-w-[280px]">
            <h3 className="text-center text-xs font-black uppercase tracking-wide mb-1.5 bg-gradient-to-r from-accent-gold via-accent-red to-accent-blue bg-clip-text text-transparent">
                {settings.title || 'Countdown'}
            </h3>

            {isExpired ? (
                <div className="text-center text-accent-red font-bold text-sm py-1">
                    🎉 Time's Up! 🎉
                </div>
            ) : (
                <div className="flex justify-center gap-2">
                    {segments.map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                            <div className="text-[0.55rem] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
                                {label}
                            </div>
                            <div className={`
                font-mono text-lg font-black text-white
                px-2 py-1 rounded-md min-w-[45px]
                bg-gradient-to-br ${color}
                shadow-md leading-none
              `}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
