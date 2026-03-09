import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught an error:", error, errorInfo);
            console.error("Error info:", errorInfo);
        }

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback)
                return this.props.fallback;
            
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-background-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        </div>

                        <h3 className="text-h3 text-text-black text-center mb-2">
                        Something went wrong
                        </h3>

                        <p className="text-gray-600 text-center mb-6">
                        We're sorry! An unexpected error occurred. Please try refreshing
                        the page or contact support if the problem persists.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                        <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
                            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                            Error Details (Development)
                            </summary>
                            <pre className="whitespace-pre-wrap text-red-600 overflow-auto max-h-32">
                            {this.state.error.stack}
                            </pre>
                        </details>
                        )}

                        <div className="flex space-x-3">
                        <button
                            onClick={this.handleReset}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={this.handleReload}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            Refresh Page
                        </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}