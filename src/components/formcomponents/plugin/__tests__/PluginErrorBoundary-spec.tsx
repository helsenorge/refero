import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PluginErrorBoundary } from '../PluginErrorBoundary';

// Suppress expected console.error output from error boundary
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// eslint-disable-next-line react-refresh/only-export-components
const ThrowingComponent = ({ message }: { message: string }): React.JSX.Element => {
  throw new Error(message);
};

// eslint-disable-next-line react-refresh/only-export-components
const WorkingComponent = (): React.JSX.Element => <div data-testid="working">{'It works'}</div>;

describe('PluginErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <PluginErrorBoundary>
        <WorkingComponent />
      </PluginErrorBoundary>
    );

    expect(screen.getByTestId('working')).toHaveTextContent('It works');
  });

  it('renders fallback message when child throws', () => {
    render(
      <PluginErrorBoundary>
        <ThrowingComponent message="kaboom" />
      </PluginErrorBoundary>
    );

    expect(screen.getByText('This component failed to render.')).toBeInTheDocument();
  });

  it('does not crash sibling components when one plugin fails', () => {
    render(
      <div>
        <PluginErrorBoundary pluginName="broken">
          <ThrowingComponent message="kaboom" />
        </PluginErrorBoundary>
        <div data-testid="sibling">{'Still here'}</div>
      </div>
    );

    expect(screen.getByText('This component failed to render.')).toBeInTheDocument();
    expect(screen.getByTestId('sibling')).toHaveTextContent('Still here');
  });

  it('logs error with plugin name when provided', () => {
    render(
      <PluginErrorBoundary pluginName="MySlider">
        <ThrowingComponent message="kaboom" />
      </PluginErrorBoundary>
    );

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[Refero] Plugin "MySlider" crashed:'),
      expect.any(Error),
      expect.anything()
    );
  });

  it('logs error without plugin name when not provided', () => {
    render(
      <PluginErrorBoundary>
        <ThrowingComponent message="kaboom" />
      </PluginErrorBoundary>
    );

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[Refero] Plugin crashed:'), expect.any(Error), expect.anything());
  });

  it('renders the error container with correct CSS classes', () => {
    const { container } = render(
      <PluginErrorBoundary>
        <ThrowingComponent message="kaboom" />
      </PluginErrorBoundary>
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const errorDiv = container.querySelector('.page_refero__component_plugin--error');
    expect(errorDiv).toBeInTheDocument();
  });
});
