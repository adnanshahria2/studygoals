// Topic Types
export interface Topic {
    progress: number;
    name: string;
    note: string;
    timedNote: string;
    priority: 'high' | 'medium' | 'low';
    hardness: 'easy' | 'medium' | 'hard';
    studyStatus: string;
    estimatedTime?: string;
}

export type CompletedTopics = Record<string, Topic>;

// Target Card Metadata (for long-term targets with date ranges)
export interface TargetCardMeta {
    id: string;
    title: string;
    startDate: string; // Format: YYYY-MM-DD
    endDate: string;   // Format: YYYY-MM-DD
    color?: string;    // Optional accent color
    data: ColumnData;  // Topic data for the card
}

// Table Data Types
export type ColumnData = Record<string, string[]>;
export type DateData = Record<string, ColumnData>;

export interface TableData {
    table1: DateData;
    table2: DateData;
    targetCards?: TargetCardMeta[]; // Metadata for Target cards
}

// Settings Types
export interface StudyType {
    key: string;
    name: string;
}

export interface CountdownSettings {
    title: string;
    targetDate: string;
    targetTime: string;
}

export interface AppSettings {
    customStudyTypes: StudyType[];
    countdownSettings: CountdownSettings;
}

// User Types
export interface User {
    email: string;
    displayName: string;
    createdAt: number;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

// App Data State
export interface AppData {
    completedTopics: CompletedTopics;
    tableData: TableData;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'syncing';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}
