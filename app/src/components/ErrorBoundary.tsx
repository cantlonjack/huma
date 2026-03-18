"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.context || "unknown"}]:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="font-serif text-2xl text-earth-800 mb-3">
            Something went wrong
          </p>
          <p className="text-earth-600 mb-8 max-w-md">
            {this.props.context === "canvas"
              ? "Your canvas couldn't be rendered, but your map document is still available."
              : "An unexpected error occurred. Your conversation data is still saved."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
