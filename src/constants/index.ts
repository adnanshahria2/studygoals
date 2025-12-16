import { AppSettings, TableData, StudyType } from '@/types';

export const COLUMN_HEADERS = {
    table1: ['Phy', 'Chem', 'Bio', 'GK', 'English'],
    table2: ['Morning Session', 'Noon Session', 'Night Session', 'Exam']
};

export const PROGRESS_STEPS = [0, 20, 40, 60, 80, 100];

export const HARDNESS_MAP: Record<string, string> = {
    easy: 'E',
    medium: 'M',
    hard: 'H'
};

export const DEFAULT_STUDY_TYPES: StudyType[] = [
    { key: 'mqb', name: 'MQB' },
    { key: 'ret', name: 'Retina QB' },
    { key: 'med', name: 'Meditrics' },
    { key: 'camp', name: 'Campus Exam' },
    { key: 'week', name: 'Weekly Exam' },
    { key: 'rev', name: 'Revision Class' },
    { key: 'new', name: 'Lecture' },
    { key: 'secret', name: 'Secret Files' }
];

export const DEFAULT_SETTINGS: AppSettings = {
    customStudyTypes: [...DEFAULT_STUDY_TYPES],
    countdownSettings: {
        title: 'Countdown to Goal',
        targetDate: '2025-12-31',
        targetTime: '00:00'
    }
};

export const DEFAULT_TABLE_DATA: TableData = {
    table1: {},
    table2: {},
    targetCards: []
};

export const STUDY_TYPE_CLASSES: Record<string, string> = {
    mqb: 'border-accent-orange text-accent-orange bg-accent-orange/10',
    ret: 'border-accent-cyan text-accent-cyan bg-accent-cyan/10',
    med: 'border-accent-pink text-accent-pink bg-accent-pink/10',
    camp: 'border-accent-purple text-accent-purple bg-accent-purple/10',
    week: 'border-accent-gold text-accent-gold bg-accent-gold/10',
    rev: 'border-accent-green text-accent-green bg-accent-green/10',
    new: 'border-accent-blue text-accent-blue bg-accent-blue/10',
    secret: 'border-accent-purple text-accent-purple bg-accent-purple/20',
    custom: 'border-border-light text-gray-400 bg-gray-500/10'
};

export const PRIORITY_CLASSES: Record<string, string> = {
    high: 'bg-accent-red shadow-glow-red',
    medium: 'bg-accent-gold shadow-glow-gold',
    low: 'bg-border'
};

export const PROGRESS_CLASSES: Record<number, string> = {
    0: 'bg-border',
    20: 'bg-accent-red',
    40: 'bg-accent-orange',
    60: 'bg-accent-gold',
    80: 'bg-accent-blue',
    100: 'bg-accent-green'
};
