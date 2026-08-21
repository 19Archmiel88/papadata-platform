import type {
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  Component,
} from 'react';

import {
  ErrorState,
} from '../design-system/components';

export type ErrorBoundaryProps = {
  readonly children: ReactNode;
  readonly description: string;
  readonly errorCode: string;
  /**
   * Extra side effect to run when the user retries, in addition to the
   * boundary always resetting its own error state (e.g. a full reload at the
   * app root, where a broken session/runtime global is more likely than a
   * one-off render bug in a single screen).
   */
  readonly onRetry?: (() => void) | undefined;
  readonly retryLabel?: string;
  readonly title: string;
};

type ErrorBoundaryState = {
  readonly hasError: boolean;
};

/**
 * Catches render/runtime errors in its subtree and shows ErrorState instead
 * of letting React unmount the whole tree to a blank page. Never surfaces
 * the raw error/stack to the user -- componentDidCatch is the only place
 * that sees it, and that only reaches the browser console.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      '[ErrorBoundary] unhandled render error',
      error,
      info.componentStack,
    );
  }

  private readonly handleRetry = (): void => {
    this.props.onRetry?.();
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          errorCode={this.props.errorCode}
          message={this.props.description}
          onRetry={this.handleRetry}
          retryLabel={this.props.retryLabel ?? 'Spróbuj ponownie'}
          title={this.props.title}
          variant="system"
        />
      );
    }

    return this.props.children;
  }
}
