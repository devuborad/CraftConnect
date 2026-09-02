import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CraftConnect ErrorBoundary Caught Exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetSession = () => {
    localStorage.removeItem('craft_current_user');
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-100 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-[#C85A32]">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-stone-900">
                CraftConnect Recovery Mode
              </h2>
              <p className="text-sm text-stone-600">
                The application encountered an unexpected runtime state. We've captured the details so you can recover instantly.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left overflow-x-auto max-h-40">
                <p className="text-xs font-mono font-semibold text-red-600">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#C85A32] text-white font-bold text-sm shadow-md hover:bg-[#b04b27] flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetSession}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 text-stone-800 font-bold text-sm hover:bg-stone-200 border border-stone-300 flex items-center justify-center space-x-2 transition-all"
              >
                <Home className="w-4 h-4 text-stone-600" />
                <span>Reset & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
