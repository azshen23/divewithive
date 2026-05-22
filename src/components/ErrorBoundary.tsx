import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside React Error Boundary:", error, errorInfo);
    
    // Auto-reload once on error to see if it resolves itself
    const now = Date.now();
    const lastReload = sessionStorage.getItem("last-react-error-reload");
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem("last-react-error-reload", String(now));
      window.location.reload();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-inter flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-pink-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="font-outfit font-bold text-2xl text-white/90 mb-3">
              Ocean gets a bit rough!
            </h1>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              We encountered an issue restoring the app state. Please refresh the page to submerge back into updates.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-outfit font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-[0.98] mb-4"
            >
              Refresh Page
            </button>

            {this.state.error && (
              <details className="text-left bg-black/30 border border-white/5 rounded-lg p-3 mt-4 text-[10px] font-mono text-white/40 cursor-pointer">
                <summary className="hover:text-white/60 transition-colors select-none font-sans font-medium text-xs mb-1">
                  View Error Details
                </summary>
                <div className="overflow-x-auto whitespace-pre-wrap mt-2 max-h-32 leading-normal select-text">
                  {this.state.error.toString()}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
