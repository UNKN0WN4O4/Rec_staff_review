import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Reload Page
                        </button>

                        {/* Optional: Show error details in dev mode */}
                        {import.meta.env.DEV && (
                            <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-950 rounded text-left text-xs overflow-auto max-h-40 text-red-600">
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
