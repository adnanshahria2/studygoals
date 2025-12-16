import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    existingDates: string[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelectDate, existingDates }) => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const formatDate = (day: number) => {
        const d = String(day).padStart(2, '0');
        const m = String(month + 1).padStart(2, '0');
        return `${d}/${m}/${year}`;
    };

    const isPast = (day: number) => {
        const date = new Date(year, month, day);
        return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const isToday = (day: number) =>
        year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

    const hasCard = (day: number) => existingDates.includes(formatDate(day));

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(year - 1); }
        else setMonth(month - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(year + 1); }
        else setMonth(month + 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-bg-hover rounded-full text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-lg font-semibold text-white">{MONTH_NAMES[month]} {year}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-bg-hover rounded-full text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => <div key={d} className="text-center text-xs font-semibold text-gray-500">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map((day) => (
                    <button
                        key={day}
                        disabled={isPast(day)}
                        onClick={() => { onSelectDate(formatDate(day)); onClose(); }}
                        className={`
              p-2 text-center rounded-lg transition-all relative
              ${isPast(day) ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-bg-hover cursor-pointer'}
              ${isToday(day) ? 'border border-accent-gold text-accent-gold font-bold' : 'text-white'}
              ${hasCard(day) ? 'border border-accent-blue shadow-glow-blue' : ''}
            `}
                    >
                        {day}
                        {hasCard(day) && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent-blue rounded-full" />}
                    </button>
                ))}
            </div>

            <Button variant="secondary" onClick={onClose} className="w-full mt-4">Cancel</Button>
        </Modal>
    );
};
