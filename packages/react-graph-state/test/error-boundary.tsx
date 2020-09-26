import React, { Component, ReactNode } from 'react';

interface ErrorBoundState {
  error?: Error;
}

interface ErrorBoundProps {
  fallback: ReactNode;
  children: ReactNode;
}

export default class ErrorBound extends Component<ErrorBoundProps, ErrorBoundState> {
  constructor(props: ErrorBoundProps) {
    super(props);
    this.state = { };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundState {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  render(): JSX.Element {
    const { state: { error }, props: { fallback, children } } = this;
    return <>{ error != null ? fallback : children }</>;
  }
}
