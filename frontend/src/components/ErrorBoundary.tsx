import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-card/25 backdrop-blur border border-card-border rounded-xl max-w-lg mx-auto mt-20">
          <AlertOctagon className="w-16 h-16 text-[var(--critical-color)] animate-bounce" />
          <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wider">
            Critical UI Thread Crash
          </h2>
          <p className="text-sm text-text-muted font-mono bg-background p-4 rounded border border-card-border overflow-x-auto max-w-full">
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-hover text-[var(--btn-copilot-text)] px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-[0_0_15px_var(--primary-glow)]"
          >
            RELOAD APPLICATION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
