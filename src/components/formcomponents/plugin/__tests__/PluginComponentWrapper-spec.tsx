import { createPluginTestStore, PluginTestWrapper, defaultPluginTestResources } from '@test/test-utils';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { PluginComponentProps } from '@/types/componentPlugin';
import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { PluginComponentWrapper } from '../PluginComponentWrapper';

import { RenderContext } from '@/util/renderContext';

// Mock plugin component for testing
// eslint-disable-next-line react-refresh/only-export-components
const MockPluginComponent = ({ item, id }: PluginComponentProps): JSX.Element => (
  <div data-testid="mock-plugin">
    <span data-testid="plugin-id">{id}</span>
    <span data-testid="plugin-linkid">{item?.linkId}</span>
  </div>
);

describe('PluginComponentWrapper', () => {
  const testItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'integer',
    text: 'Test Question',
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
    const store = createPluginTestStore(testItem);

    render(<PluginComponentWrapper {...defaultProps} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    expect(screen.getByTestId('mock-plugin')).toBeInTheDocument();
  });

  it('passes correct id to plugin component', () => {
    const store = createPluginTestStore(testItem);

    render(<PluginComponentWrapper {...defaultProps} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    expect(screen.getByTestId('plugin-id')).toHaveTextContent('item_test-item');
  });

  it('passes item to plugin component', () => {
    const store = createPluginTestStore(testItem);

    render(<PluginComponentWrapper {...defaultProps} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    expect(screen.getByTestId('plugin-linkid')).toHaveTextContent('test-item');
  });

  it('renders with page_refero__component_plugin class', () => {
    const store = createPluginTestStore(testItem);

    const { container } = render(<PluginComponentWrapper {...defaultProps} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.page_refero__component_plugin')).toBeInTheDocument();
  });
});
