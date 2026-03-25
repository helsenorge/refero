import { createPluginTestStore, PluginTestWrapper, defaultPluginTestResources } from '@test/test-utils';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { PluginComponentProps } from '@/types/componentPlugin';
import type { Resources } from '@/util/resources';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { PluginComponentWrapper } from '../PluginComponentWrapper';

import { RenderContext } from '@/util/renderContext';

// Mock plugin component for testing
// eslint-disable-next-line react-refresh/only-export-components
const MockPluginComponent = ({ item, id, answer, pdf, readOnly, error, resources, children }: PluginComponentProps): React.JSX.Element => (
  <div data-testid="mock-plugin">
    <span data-testid="plugin-id">{id}</span>
    <span data-testid="plugin-linkid">{item?.linkId}</span>
    <span data-testid="plugin-answer">{JSON.stringify(answer)}</span>
    <span data-testid="plugin-pdf">{String(!!pdf)}</span>
    <span data-testid="plugin-readonly">{String(!!readOnly)}</span>
    <span data-testid="plugin-has-error">{error ? 'yes' : 'no'}</span>
    <span data-testid="plugin-has-resources">{resources ? 'yes' : 'no'}</span>
    {children && <div data-testid="plugin-children">{children}</div>}
  </div>
);

// Plugin component that throws
// eslint-disable-next-line react-refresh/only-export-components
const ThrowingPluginComponent = (): React.JSX.Element => {
  throw new Error('Plugin crashed!');
};
ThrowingPluginComponent.displayName = 'ThrowingPlugin';

describe('PluginComponentWrapper', () => {
  const testItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'integer',
    text: 'Test Question',
  };

  const readOnlyItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'integer',
    text: 'ReadOnly Question',
    readOnly: true,
  };

  const defaultProps = {
    linkId: 'test-item',
    id: 'item_test-item',
    idWithLinkIdAndItemIndex: 'test-item-0',
    path: [{ linkId: 'test-item', index: 0 }],
    index: 0,
    pdf: false,
    renderContext: new RenderContext(),
    PluginComponent: MockPluginComponent,
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderWrapper = (props = defaultProps, item?: QuestionnaireItem, answerValue?: QuestionnaireResponseItemAnswer[]) => {
    const store = createPluginTestStore(item ?? testItem, answerValue);
    return render(<PluginComponentWrapper {...props} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });
  };

  it('renders null when item is not found', () => {
    const store = createPluginTestStore(); // No item in store

    const { container } = render(<PluginComponentWrapper {...defaultProps} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toBeNull();
  });

  it('renders the plugin component when item exists', () => {
    renderWrapper();
    expect(screen.getByTestId('mock-plugin')).toBeInTheDocument();
  });

  it('passes correct id to plugin component', () => {
    renderWrapper();
    expect(screen.getByTestId('plugin-id')).toHaveTextContent('item_test-item');
  });

  it('passes item to plugin component', () => {
    renderWrapper();
    expect(screen.getByTestId('plugin-linkid')).toHaveTextContent('test-item');
  });

  it('renders with page_refero__component_plugin class', () => {
    const { container } = renderWrapper();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.page_refero__component_plugin')).toBeInTheDocument();
  });

  it('passes answer to plugin component', () => {
    const answerValue: QuestionnaireResponseItemAnswer[] = [{ valueInteger: 42 }];
    renderWrapper(defaultProps, testItem, answerValue);
    expect(screen.getByTestId('plugin-answer')).toHaveTextContent('42');
  });

  it('passes resources to plugin component', () => {
    renderWrapper();
    expect(screen.getByTestId('plugin-has-resources')).toHaveTextContent('yes');
  });

  describe('PDF mode', () => {
    it('renders ReadOnly component when pdf is true', () => {
      const pdfProps = { ...defaultProps, pdf: true };
      const { container } = renderWrapper(pdfProps);

      // Should NOT render the plugin
      expect(screen.queryByTestId('mock-plugin')).not.toBeInTheDocument();
      // Should NOT have the plugin wrapper class
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(container.querySelector('.page_refero__component_plugin')).not.toBeInTheDocument();
    });
  });

  describe('ReadOnly mode', () => {
    it('renders ReadOnly component when item is readOnly', () => {
      const { container } = renderWrapper(defaultProps, readOnlyItem);

      // Should NOT render the plugin
      expect(screen.queryByTestId('mock-plugin')).not.toBeInTheDocument();
      // Should NOT have the plugin wrapper class
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(container.querySelector('.page_refero__component_plugin')).not.toBeInTheDocument();
    });
  });

  describe('Error boundary', () => {
    it('catches errors thrown by plugin component and renders fallback', () => {
      const errorProps = { ...defaultProps, PluginComponent: ThrowingPluginComponent };

      // Suppress console.error for expected error boundary logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWrapper(errorProps);

      // Should not crash, error boundary should catch it
      expect(screen.queryByTestId('mock-plugin')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('nested children', () => {
    it('renders nested children inside plugin when provided', () => {
      const store = createPluginTestStore(testItem);

      render(
        <PluginComponentWrapper {...defaultProps}>
          <div data-testid="nested-child">{'Nested content'}</div>
        </PluginComponentWrapper>,
        {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
              {children}
            </PluginTestWrapper>
          ),
        }
      );

      expect(screen.getByTestId('mock-plugin')).toBeInTheDocument();
      expect(screen.getByTestId('plugin-children')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });
});
