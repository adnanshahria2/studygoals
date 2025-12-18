import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { AppSettings, TableData, CompletedTopics, Topic, TargetCardMeta } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_TABLE_DATA } from '@/constants';
import { subscribeToData, subscribeToSettings, saveData, saveSettings, isOnline, processPendingSync } from '@/services/data.service';
import { useAuth } from './AuthContext';
import { useToastContext } from './ToastContext';

interface DataContextType {
    tableData: TableData;
    completedTopics: CompletedTopics;
    settings: AppSettings;
    isLoading: boolean;
    isOffline: boolean;
    updateTopic: (topicId: string, updates: Partial<Topic>) => void;
    addTopic: (tableId: string, date: string, column: string, topic: Topic, customTopicId?: string) => string;
    deleteTopic: (topicId: string) => void;
    updateTableData: (newTableData: TableData) => void;
    updateSettings: (newSettings: AppSettings) => void;
    addCard: (tableId: 'table1' | 'table2', date: string) => void;
    deleteCard: (tableId: string, date: string) => void;
    addTargetCard: (title: string, startDate: string, endDate: string) => string;
    updateTargetCard: (cardId: string, updates: { title?: string; startDate?: string; endDate?: string }) => void;
    deleteTargetCard: (cardId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToastContext();

    const [tableData, setTableData] = useState<TableData>({ ...DEFAULT_TABLE_DATA });
    const [completedTopics, setCompletedTopics] = useState<CompletedTopics>({});
    const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
    const [isLoading, setIsLoading] = useState(true);
    const [isOfflineState, setIsOfflineState] = useState(!isOnline());

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingLocalChangeRef = useRef<boolean>(false);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setIsOfflineState(false);
            showToast('success', 'Back online');
            processPendingSync();
        };
        const handleOffline = () => {
            setIsOfflineState(true);
            showToast('info', 'You are offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast]);

    // Subscribe to data when user changes
    useEffect(() => {
        if (!user) {
            setTableData({ ...DEFAULT_TABLE_DATA });
            setCompletedTopics({});
            setSettings({ ...DEFAULT_SETTINGS });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const unsubData = subscribeToData(
            user.email,
            (data) => {
                // Skip remote updates if we have pending local changes
                if (pendingLocalChangeRef.current) {
                    return;
                }
                setTableData(data.tableData);
                setCompletedTopics(data.completedTopics);
                setIsLoading(false);
            },
            (error) => {
                console.error('Data subscription error:', error);
                showToast('error', 'Failed to load data');
                setIsLoading(false);
            }
        );

        const unsubSettings = subscribeToSettings(
            user.email,
            (s) => setSettings(s),
            (error) => console.error('Settings error:', error)
        );

        return () => {
            unsubData();
            unsubSettings();
        };
    }, [user, showToast]);

    // Debounced save with pending flag
    const debouncedSave = useCallback((newTableData: TableData, newTopics: CompletedTopics) => {
        if (!user) return;

        pendingLocalChangeRef.current = true;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                showToast('syncing', 'Syncing...');
                await saveData(user.email, newTableData, newTopics);
                showToast('success', 'Synced');
            } catch (error) {
                showToast('error', 'Sync failed');
            } finally {
                pendingLocalChangeRef.current = false;
            }
        }, 1000);
    }, [user, showToast]);

    const updateTopic = useCallback((topicId: string, updates: Partial<Topic>) => {
        setCompletedTopics((prevTopics) => {
            const updated = { ...prevTopics, [topicId]: { ...prevTopics[topicId], ...updates } };
            // Use functional update to get current tableData
            setTableData(currentTableData => {
                debouncedSave(currentTableData, updated);
                return currentTableData;
            });
            return updated;
        });
    }, [debouncedSave]);

    const addTopic = useCallback((tableId: string, cardId: string, column: string, topic: Topic, customTopicId?: string): string => {
        const topicId = customTopicId || `topic_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
        const table = tableId as 'table1' | 'table2';

        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev));
            if (!updated[table][cardId]) {
                updated[table][cardId] = {};
            }
            if (!updated[table][cardId][column]) {
                updated[table][cardId][column] = [];
            }
            updated[table][cardId][column].push(topicId);
            return updated;
        });

        setCompletedTopics((prev) => {
            const updated = { ...prev, [topicId]: topic };
            // Trigger save after both states are updated
            setTimeout(() => {
                setTableData(currentTableData => {
                    debouncedSave(currentTableData, updated);
                    return currentTableData;
                });
            }, 0);
            return updated;
        });

        return topicId;
    }, [debouncedSave]);

    const deleteTopic = useCallback((topicId: string) => {
        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            (['table1', 'table2'] as const).forEach((tableId) => {
                Object.keys(updated[tableId]).forEach((cardId) => {
                    Object.keys(updated[tableId][cardId]).forEach((col) => {
                        updated[tableId][cardId][col] = updated[tableId][cardId][col].filter((id) => id !== topicId);
                    });
                });
            });
            return updated;
        });

        setCompletedTopics((prev) => {
            const { [topicId]: _, ...rest } = prev;
            // Trigger save after both states are updated
            setTimeout(() => {
                setTableData(currentTableData => {
                    debouncedSave(currentTableData, rest);
                    return currentTableData;
                });
            }, 0);
            return rest;
        });
    }, [debouncedSave]);

    const updateTableData = useCallback((newTableData: TableData) => {
        setTableData(newTableData);
        // Use functional update to get current completedTopics
        setCompletedTopics(currentTopics => {
            debouncedSave(newTableData, currentTopics);
            return currentTopics;
        });
    }, [debouncedSave]);

    const updateSettings = useCallback(async (newSettings: AppSettings) => {
        if (!user) return;
        setSettings(newSettings);
        try {
            await saveSettings(user.email, newSettings);
            showToast('success', 'Settings saved');
        } catch {
            showToast('error', 'Failed to save settings');
        }
    }, [user, showToast]);

    const addCard = useCallback((tableId: 'table1' | 'table2', date: string) => {
        setTableData((prev) => {
            if (prev[tableId][date]) return prev;
            const updated = { ...prev, [tableId]: { ...prev[tableId], [date]: {} } };
            // Use functional update to get current completedTopics
            setCompletedTopics(currentTopics => {
                debouncedSave(updated, currentTopics);
                return currentTopics;
            });
            return updated;
        });
    }, [debouncedSave]);

    const addTargetCard = useCallback((title: string, startDate: string, endDate: string): string => {
        const cardId = `target_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
        const newCard: TargetCardMeta = { id: cardId, title, startDate, endDate, data: {} };

        setTableData((prev) => {
            const updated = {
                ...prev,
                targetCards: [...(prev.targetCards || []), newCard]
            };
            setCompletedTopics(currentTopics => {
                debouncedSave(updated, currentTopics);
                return currentTopics;
            });
            return updated;
        });

        return cardId;
    }, [debouncedSave]);

    const updateTargetCard = useCallback((cardId: string, updates: { title?: string; startDate?: string; endDate?: string }) => {
        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            updated.targetCards = (updated.targetCards || []).map(card =>
                card.id === cardId ? { ...card, ...updates } : card
            );
            setCompletedTopics(currentTopics => {
                debouncedSave(updated, currentTopics);
                return currentTopics;
            });
            return updated;
        });
    }, [debouncedSave]);

    const deleteTargetCard = useCallback((cardId: string) => {
        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            delete updated.table1[cardId];
            updated.targetCards = (updated.targetCards || []).filter(c => c.id !== cardId);
            setCompletedTopics(currentTopics => {
                debouncedSave(updated, currentTopics);
                return currentTopics;
            });
            return updated;
        });
    }, [debouncedSave]);

    const deleteCard = useCallback((tableId: string, cardId: string) => {
        const table = tableId as 'table1' | 'table2';
        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            delete updated[table][cardId];
            setCompletedTopics(currentTopics => {
                debouncedSave(updated, currentTopics);
                return currentTopics;
            });
            return updated;
        });
    }, [debouncedSave]);

    return (
        <DataContext.Provider value={{
            tableData, completedTopics, settings, isLoading, isOffline: isOfflineState,
            updateTopic, addTopic, deleteTopic, updateTableData, updateSettings, addCard, deleteCard,
            addTargetCard, updateTargetCard, deleteTargetCard
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
