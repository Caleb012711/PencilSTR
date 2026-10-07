import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('PencilSTR Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('pencilstr_store_v1');
      localStorage.removeItem('pencilstr_store_v2');
      localStorage.removeItem('pencilstr_store_v3');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed clearing storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#111110] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E5E4DF] shadow-xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6.5V9.5M8 11.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-[#111110]">
                PencilSTR Session Recovered
              </h2>
              <p className="text-xs text-[#666562]">
                An unexpected state mismatch was detected in local storage. Click below to restore pristine demo cohorts.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E5E4DF] text-left font-mono text-[11px] text-[#DC2626] overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#111110] text-white rounded-lg text-xs font-mono font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Reset App &amp; Load Demo Cohorts
              </button>
              <button
                onClick={() => window.location.reload()}
                className="py-2.5 px-4 bg-white border border-[#E5E4DF] text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
