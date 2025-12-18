import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, sanitizeEmail } from './firebase';
import { AppData, AppSettings, TableData, CompletedTopics } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_TABLE_DATA } from '@/constants';

const getDataPath = (userId: string) => `data/${userId}/studyProgress/data_v4`;
const getSettingsPath = (userId: string) => `data/${userId}/studyProgress/settings_v1`;

// LocalStorage keys
const LOCAL_DATA_KEY = 'studygoals_data_cache';
const LOCAL_SETTINGS_KEY = 'studygoals_settings_cache';
const LOCAL_PENDING_SYNC_KEY = 'studygoals_pending_sync';

// Helper to save data to localStorage for offline access
const saveToLocalStorage = (key: string, data: unknown): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        console.warn('Failed to save to localStorage');
    }
};

// Helper to load data from localStorage
const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored) as T;
        }
    } catch {
        console.warn('Failed to load from localStorage');
    }
    return defaultValue;
};

// Check if online
export const isOnline = (): boolean => {
    return navigator.onLine;
};

// Subscribe to user data with offline fallback
export const subscribeToData = (
    userEmail: string,
    onData: (data: AppData) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const userId = sanitizeEmail(userEmail);
    const dataRef = doc(db, getDataPath(userId));
    const localCacheKey = `${LOCAL_DATA_KEY}_${userId}`;

    // Load from local cache immediately for fast startup
    const cachedData = loadFromLocalStorage<AppData | null>(localCacheKey, null);
    if (cachedData) {
        onData(cachedData);
    }

    return onSnapshot(
        dataRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const appData: AppData = {
                    completedTopics: data.completedTopics || {},
                    tableData: data.tableData || { ...DEFAULT_TABLE_DATA }
                };
                // Save to localStorage for offline access
                saveToLocalStorage(localCacheKey, appData);
                onData(appData);
            } else {
                const defaultData: AppData = {
                    completedTopics: {},
                    tableData: { ...DEFAULT_TABLE_DATA }
                };
                saveToLocalStorage(localCacheKey, defaultData);
                onData(defaultData);
            }
        },
        (error) => {
            // If offline and we have cached data, don't report error
            if (!isOnline() && cachedData) {
                console.log('Offline: using cached data');
                return;
            }
            onError(error);
        }
    );
};

// Subscribe to settings with offline fallback
export const subscribeToSettings = (
    userEmail: string,
    onSettings: (settings: AppSettings) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const userId = sanitizeEmail(userEmail);
    const settingsRef = doc(db, getSettingsPath(userId));
    const localCacheKey = `${LOCAL_SETTINGS_KEY}_${userId}`;

    // Load from local cache immediately
    const cachedSettings = loadFromLocalStorage<AppSettings | null>(localCacheKey, null);
    if (cachedSettings) {
        onSettings(cachedSettings);
    }

    return onSnapshot(
        settingsRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as AppSettings;
                const settings: AppSettings = {
                    customStudyTypes: data.customStudyTypes || DEFAULT_SETTINGS.customStudyTypes,
                    countdownSettings: data.countdownSettings || DEFAULT_SETTINGS.countdownSettings,
                    subjects: data.subjects || DEFAULT_SETTINGS.subjects
                };
                saveToLocalStorage(localCacheKey, settings);
                onSettings(settings);
            } else {
                const defaultSettings = { ...DEFAULT_SETTINGS };
                saveToLocalStorage(localCacheKey, defaultSettings);
                onSettings(defaultSettings);
            }
        },
        (error) => {
            if (!isOnline() && cachedSettings) {
                console.log('Offline: using cached settings');
                return;
            }
            onError(error);
        }
    );
};

// Queue for offline data sync
interface PendingSync {
    type: 'data' | 'settings';
    userId: string;
    payload: unknown;
    timestamp: number;
}

// Add to pending sync queue
const addToPendingSync = (sync: Omit<PendingSync, 'timestamp'>): void => {
    try {
        const pending = loadFromLocalStorage<PendingSync[]>(LOCAL_PENDING_SYNC_KEY, []);
        // Remove older entries of same type/userId
        const filtered = pending.filter(p => !(p.type === sync.type && p.userId === sync.userId));
        filtered.push({ ...sync, timestamp: Date.now() });
        saveToLocalStorage(LOCAL_PENDING_SYNC_KEY, filtered);
    } catch {
        console.warn('Failed to queue for pending sync');
    }
};

// Process pending syncs when online
export const processPendingSync = async (): Promise<void> => {
    if (!isOnline()) return;

    const pending = loadFromLocalStorage<PendingSync[]>(LOCAL_PENDING_SYNC_KEY, []);
    if (pending.length === 0) return;

    const remaining: PendingSync[] = [];

    for (const sync of pending) {
        try {
            if (sync.type === 'data') {
                const { tableData, completedTopics } = sync.payload as { tableData: TableData; completedTopics: CompletedTopics };
                const dataRef = doc(db, getDataPath(sync.userId));
                await setDoc(dataRef, { tableData, completedTopics }, { merge: false });
            } else if (sync.type === 'settings') {
                const settings = sync.payload as AppSettings;
                const settingsRef = doc(db, getSettingsPath(sync.userId));
                await setDoc(settingsRef, settings, { merge: true });
            }
        } catch {
            // Keep in pending queue if failed
            remaining.push(sync);
        }
    }

    saveToLocalStorage(LOCAL_PENDING_SYNC_KEY, remaining);
};

// Save data with offline support
export const saveData = async (
    userEmail: string,
    tableData: TableData,
    completedTopics: CompletedTopics
): Promise<void> => {
    const userId = sanitizeEmail(userEmail);
    const localCacheKey = `${LOCAL_DATA_KEY}_${userId}`;

    // Always save to localStorage first (local-first approach)
    saveToLocalStorage(localCacheKey, { tableData, completedTopics });

    if (!isOnline()) {
        // Queue for later sync
        addToPendingSync({ type: 'data', userId, payload: { tableData, completedTopics } });
        return;
    }

    const dataRef = doc(db, getDataPath(userId));
    await setDoc(dataRef, { tableData, completedTopics }, { merge: false });
};

// Save settings with offline support
export const saveSettings = async (
    userEmail: string,
    settings: AppSettings
): Promise<void> => {
    const userId = sanitizeEmail(userEmail);
    const localCacheKey = `${LOCAL_SETTINGS_KEY}_${userId}`;

    // Always save to localStorage first
    saveToLocalStorage(localCacheKey, settings);

    if (!isOnline()) {
        addToPendingSync({ type: 'settings', userId, payload: settings });
        return;
    }

    const settingsRef = doc(db, getSettingsPath(userId));
    await setDoc(settingsRef, settings, { merge: true });
};
