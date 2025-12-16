import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, sanitizeEmail } from './firebase';
import { AppData, AppSettings, TableData, CompletedTopics } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_TABLE_DATA } from '@/constants';

const getDataPath = (userId: string) => `data/${userId}/studyProgress/data_v4`;
const getSettingsPath = (userId: string) => `data/${userId}/studyProgress/settings_v1`;

// Subscribe to user data
export const subscribeToData = (
    userEmail: string,
    onData: (data: AppData) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const userId = sanitizeEmail(userEmail);
    const dataRef = doc(db, getDataPath(userId));

    return onSnapshot(
        dataRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                onData({
                    completedTopics: data.completedTopics || {},
                    tableData: data.tableData || { ...DEFAULT_TABLE_DATA }
                });
            } else {
                onData({
                    completedTopics: {},
                    tableData: { ...DEFAULT_TABLE_DATA }
                });
            }
        },
        onError
    );
};

// Subscribe to settings
export const subscribeToSettings = (
    userEmail: string,
    onSettings: (settings: AppSettings) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const userId = sanitizeEmail(userEmail);
    const settingsRef = doc(db, getSettingsPath(userId));

    return onSnapshot(
        settingsRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as AppSettings;
                onSettings({
                    customStudyTypes: data.customStudyTypes || DEFAULT_SETTINGS.customStudyTypes,
                    countdownSettings: data.countdownSettings || DEFAULT_SETTINGS.countdownSettings
                });
            } else {
                onSettings({ ...DEFAULT_SETTINGS });
            }
        },
        onError
    );
};

// Save data
export const saveData = async (
    userEmail: string,
    tableData: TableData,
    completedTopics: CompletedTopics
): Promise<void> => {
    const userId = sanitizeEmail(userEmail);
    const dataRef = doc(db, getDataPath(userId));
    await setDoc(dataRef, { tableData, completedTopics }, { merge: false });
};

// Save settings
export const saveSettings = async (
    userEmail: string,
    settings: AppSettings
): Promise<void> => {
    const userId = sanitizeEmail(userEmail);
    const settingsRef = doc(db, getSettingsPath(userId));
    await setDoc(settingsRef, settings, { merge: true });
};
