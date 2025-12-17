import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
                    <p className="text-gray-300 mb-4">The application encountered an error.</p>
                    <pre className="bg-black/50 p-4 rounded text-xs text-left overflow-auto max-w-full mb-4 border border-white/10">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Clear Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
