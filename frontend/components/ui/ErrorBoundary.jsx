import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Telemetry Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ink-panel p-6 border-l-2 border-l-[#ef4444] bg-[#0c0f19] flex flex-col items-center justify-center text-center font-mono">
          <div className="w-8 h-8 rounded-full bg-red-950/50 flex items-center justify-center mb-3">
            <span className="text-[#ef4444] font-bold">!</span>
          </div>
          <h4 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest">System Boundary Alert</h4>
          <p className="text-[11px] text-zinc-500 mt-2 max-w-md">
            The data stream failed to load. A telemetry handshake reset might be required.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-300 uppercase tracking-wider font-semibold"
          >
            Re-Initialize Stream
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
