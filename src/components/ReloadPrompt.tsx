import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
            // Auto-check for updates every hour
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    // Auto-dismiss offline ready notification after 3 seconds
    useEffect(() => {
        if (offlineReady) {
            const timer = setTimeout(() => {
                setOfflineReady(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [offlineReady, setOfflineReady]);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    // Show compact offline-ready notification
    if (offlineReady) {
        return (
            <div
                className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg bg-emerald-500/90 text-white text-sm font-medium shadow-lg backdrop-blur-md flex items-center gap-2 animate-slide-in cursor-pointer"
                onClick={close}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ready for offline use</span>
            </div>
        );
    }

    // Show update prompt only for critical updates
    if (needRefresh) {
        return (
            <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-md max-w-[300px] animate-slide-in">
                <div className="mb-3">
                    <h3 className="font-semibold text-white text-sm">
                        Update Available
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        A new version is available. Reload to update.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex-1 px-3 py-1.5 bg-accent-blue text-white text-xs font-bold rounded-lg hover:bg-accent-blue/90 transition-colors"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Reload Now
                    </button>
                    <button
                        className="flex-1 px-3 py-1.5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/5 transition-colors"
                        onClick={close}
                    >
                        Later
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

