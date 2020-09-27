/** @jsx h */
import {
  h,
  Component,
  VNode,
  Fragment,
} from 'preact';

interface ErrorBoundState {
  error?: Error;
}

interface ErrorBoundProps {
  fallback: VNode;
  children: VNode;
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
    return <Fragment>{ error != null ? fallback : children }</Fragment>;
  }
}
