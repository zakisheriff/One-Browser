import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
        if (window.electronAPI?.log) {
            window.electronAPI.log("ErrorBoundary Caught:", error.toString(), errorInfo.componentStack);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen bg-red-900 text-white p-10 overflow-auto font-mono">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <p className="text-xl mb-2">{this.state.error && this.state.error.toString()}</p>
                    <pre className="text-sm opacity-80 whitespace-pre-wrap">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        className="mt-8 px-4 py-2 bg-white text-black rounded"
                        onClick={() => window.location.reload()}
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
