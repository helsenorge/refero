import { Component, type ErrorInfo, type ReactNode } from 'react';

interface PluginErrorBoundaryProps {
  pluginName?: string;
  children: ReactNode;
}

interface PluginErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary that catches errors in plugin components and prevents them
 * from crashing the entire form. Renders a fallback message instead.
 */
export class PluginErrorBoundary extends Component<PluginErrorBoundaryProps, PluginErrorBoundaryState> {
  constructor(props: PluginErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PluginErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(`[Refero] Plugin${this.props.pluginName ? ` "${this.props.pluginName}"` : ''} crashed:`, error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="page_refero__component page_refero__component_plugin page_refero__component_plugin--error">
          <p>{'This component failed to render.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
