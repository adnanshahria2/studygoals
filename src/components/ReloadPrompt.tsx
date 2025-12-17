import { useRegisterSW } from 'virtual:pwa-register/react';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-md max-w-[300px] animate-slide-in">
            <div className="mb-3">
                <h3 className="font-semibold text-white text-sm">
                    {offlineReady ? 'App ready to work offline' : 'New version available!'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                    {offlineReady
                        ? 'You can use this app without internet.'
                        : 'Click reload to update to the latest version.'}
                </p>
            </div>
            <div className="flex gap-2">
                {needRefresh && (
                    <button
                        className="flex-1 px-3 py-1.5 bg-accent-green text-black text-xs font-bold rounded-lg hover:bg-accent-green/90 transition-colors"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Reload
                    </button>
                )}
                <button
                    className="flex-1 px-3 py-1.5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/5 transition-colors"
                    onClick={close}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};
