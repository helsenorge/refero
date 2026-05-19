import type React from 'react';

import { createPluginTestStore, PluginTestWrapper, defaultPluginTestResources } from '@test/test-utils';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { usePluginDispatch, type PluginAsyncThunk } from '../usePluginDispatch';

const testItem: QuestionnaireItem = {
  linkId: 'test-item',
  type: 'integer',
  text: 'Test Question',
};

/**
 * Test component that uses usePluginDispatch and exposes it via a button click.
 */
// eslint-disable-next-line react-refresh/only-export-components
const TestDispatchComponent = ({ thunk, item }: { thunk: PluginAsyncThunk; item: QuestionnaireItem }): React.JSX.Element => {
  const pluginDispatch = usePluginDispatch();

  const handleClick = (): void => {
    pluginDispatch(thunk, item, { valueInteger: 42 });
  };

  return (
    <button data-testid="dispatch-btn" onClick={handleClick}>
      {'Dispatch'}
    </button>
  );
};

describe('usePluginDispatch', () => {
  it('dispatches the provided thunk', async () => {
    const mockNewState = { refero: { form: { FormDefinition: { Content: null }, FormData: { Content: null }, Language: 'en' } } };
    const mockThunk = vi.fn().mockResolvedValue(mockNewState) as unknown as PluginAsyncThunk;

    const store = createPluginTestStore(testItem);

    render(<TestDispatchComponent thunk={mockThunk} item={testItem} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-btn'));

    await waitFor(() => {
      expect(mockThunk).toHaveBeenCalled();
    });
  });

  it('works without an answer payload (e.g. removeCodingStringValueAsync)', async () => {
    const mockNewState = { refero: { form: { FormDefinition: { Content: null }, FormData: { Content: null }, Language: 'en' } } };
    const mockThunk = vi.fn().mockResolvedValue(mockNewState) as unknown as PluginAsyncThunk;

    const NoAnswerComponent = (): React.JSX.Element => {
      const pluginDispatch = usePluginDispatch();
      const handleClick = (): void => {
        pluginDispatch(mockThunk, testItem);
      };
      return (
        <button data-testid="dispatch-no-answer-btn" onClick={handleClick}>
          {'Dispatch'}
        </button>
      );
    };

    const store = createPluginTestStore(testItem);

    render(<NoAnswerComponent />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });

    fireEvent.click(screen.getByTestId('dispatch-no-answer-btn'));

    await waitFor(() => {
      expect(mockThunk).toHaveBeenCalled();
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
    const mockThunk = vi.fn().mockResolvedValue(mockNewState) as unknown as PluginAsyncThunk;

    const store = createPluginTestStore(testItem);

    render(<TestDispatchComponent thunk={mockThunk} item={testItem} />, {
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
