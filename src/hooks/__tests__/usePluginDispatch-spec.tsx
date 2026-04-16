import type React from 'react';

import { createPluginTestStore, PluginTestWrapper, defaultPluginTestResources } from '@test/test-utils';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { usePluginDispatch } from '../usePluginDispatch';

const testItem: QuestionnaireItem = {
  linkId: 'test-item',
  type: 'integer',
  text: 'Test Question',
};

/**
 * Test component that uses usePluginDispatch and exposes it via a button click.
 */
// eslint-disable-next-line react-refresh/only-export-components
const TestDispatchComponent = ({ action, item }: { action: ReturnType<typeof vi.fn>; item: QuestionnaireItem }): React.JSX.Element => {
  const pluginDispatch = usePluginDispatch();

  const handleClick = (): void => {
    pluginDispatch(action, [{ linkId: item.linkId, index: 0 }], 42, item, { valueInteger: 42 });
  };

  return (
    <button data-testid="dispatch-btn" onClick={handleClick}>
      {'Dispatch'}
    </button>
  );
};

describe('usePluginDispatch', () => {
  it('calls the action with correct arguments when dispatched', async () => {
    const mockNewState = { refero: { form: { FormDefinition: { Content: null }, FormData: { Content: null }, Language: 'en' } } };
    const mockThunk = vi.fn().mockReturnValue(() => Promise.resolve(mockNewState));

    const store = createPluginTestStore(testItem);

    render(<TestDispatchComponent action={mockThunk} item={testItem} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-btn'));

    await waitFor(() => {
      expect(mockThunk).toHaveBeenCalledWith(
        [{ linkId: 'test-item', index: 0 }],
        42,
        testItem,
        undefined // multipleAnswers
      );
    });
  });

  it('dispatches the thunk returned by the action', async () => {
    const innerThunk = vi.fn().mockResolvedValue({
      refero: { form: { FormDefinition: { Content: null }, FormData: { Content: null }, Language: 'en' } },
    });
    const mockAction = vi.fn().mockReturnValue(innerThunk);

    const store = createPluginTestStore(testItem);

    render(<TestDispatchComponent action={mockAction} item={testItem} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-btn'));

    await waitFor(() => {
      expect(innerThunk).toHaveBeenCalled();
    });
  });

  it('passes multipleAnswers parameter when provided', async () => {
    const mockNewState = { refero: { form: { FormDefinition: { Content: null }, FormData: { Content: null }, Language: 'en' } } };
    const mockAction = vi.fn().mockReturnValue(() => Promise.resolve(mockNewState));

    const TestMultipleAnswers = (): React.JSX.Element => {
      const pluginDispatch = usePluginDispatch();
      const handleClick = (): void => {
        pluginDispatch(mockAction, [{ linkId: testItem.linkId, index: 0 }], 42, testItem, { valueInteger: 42 }, true);
      };
      return (
        <button data-testid="dispatch-multi-btn" onClick={handleClick}>
          {'Dispatch'}
        </button>
      );
    };

    const store = createPluginTestStore(testItem);

    render(<TestMultipleAnswers />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-multi-btn'));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        [{ linkId: 'test-item', index: 0 }],
        42,
        testItem,
        true // multipleAnswers
      );
    });
  });

  it('calls onChange callback when provided in referoProps', async () => {
    const onChange = vi.fn();
    const mockNewState = {
      refero: {
        form: {
          FormDefinition: { Content: { resourceType: 'Questionnaire' as const, status: 'active' as const, item: [testItem] } },
          FormData: {
            Content: {
              resourceType: 'QuestionnaireResponse' as const,
              status: 'in-progress' as const,
              item: [{ linkId: 'test-item', answer: [] }],
            },
          },
          Language: 'en',
        },
      },
    };
    const mockAction = vi.fn().mockReturnValue(() => Promise.resolve(mockNewState));

    const store = createPluginTestStore(testItem);

    render(<TestDispatchComponent action={mockAction} item={testItem} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources, onChange }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-btn'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
