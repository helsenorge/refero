import type React from 'react';

import { createPluginTestStore, PluginTestWrapper, defaultPluginTestResources } from '@test/test-utils';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFormContext, type FieldValues, type RegisterOptions } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { usePluginValidation, type UsePluginValidationOptions } from '../usePluginValidation';

/**
 * Test component that uses the hook and exposes results for assertions
 */
// eslint-disable-next-line react-refresh/only-export-components
const TestPluginField = ({
  item,
  idWithLinkIdAndItemIndex,
  pdf,
  resources,
  value,
  rules,
}: UsePluginValidationOptions): React.JSX.Element => {
  const { error, errorMessage, refCallback } = usePluginValidation({
    item,
    idWithLinkIdAndItemIndex,
    pdf,
    resources,
    value,
    rules,
  });
  const { handleSubmit } = useFormContext<FieldValues>();

  return (
    <div>
      <input ref={refCallback} data-testid="plugin-input" />
      <span data-testid="has-error">{error ? 'yes' : 'no'}</span>
      <span data-testid="error-message">{errorMessage ?? ''}</span>
      <button data-testid="submit" onClick={handleSubmit(() => {})}>
        {'Submit'}
      </button>
    </div>
  );
};

describe('usePluginValidation', () => {
  const requiredItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'integer',
    text: 'Required field',
    required: true,
  };

  const optionalItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'integer',
    text: 'Optional field',
    required: false,
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderWithHook = (options: UsePluginValidationOptions) => {
    const store = createPluginTestStore(options.item);
    return render(<TestPluginField {...options} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
          {children}
        </PluginTestWrapper>
      ),
    });
  };

  it('returns no error for optional field with no value', async () => {
    renderWithHook({
      item: optionalItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: undefined,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
  });

  it('returns error for required field with no value after submit', async () => {
    renderWithHook({
      item: requiredItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: undefined,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
      expect(screen.getByTestId('error-message')).not.toHaveTextContent('');
    });
  });

  it('clears error for required field when value is provided', async () => {
    const store = createPluginTestStore(requiredItem);

    const { rerender } = render(
      <TestPluginField
        item={requiredItem}
        idWithLinkIdAndItemIndex="test-item-0"
        value={undefined}
        resources={defaultPluginTestResources as Resources}
      />,
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
            {children}
          </PluginTestWrapper>
        ),
      }
    );

    // Trigger validation by submitting
    fireEvent.click(screen.getByTestId('submit'));
    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });

    // Provide a value — error should clear
    rerender(
      <TestPluginField
        item={requiredItem}
        idWithLinkIdAndItemIndex="test-item-0"
        value={42}
        resources={defaultPluginTestResources as Resources}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
  });

  it('does not validate when pdf is true', async () => {
    renderWithHook({
      item: requiredItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      pdf: true,
      value: undefined,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
  });

  it('applies custom validation rules', async () => {
    const customRules: RegisterOptions<FieldValues, string> = {
      validate: {
        isEven: (v: number) => (v !== undefined && v % 2 === 0) || 'Must be even',
      },
    };

    renderWithHook({
      item: optionalItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: 3,
      resources: defaultPluginTestResources as Resources,
      rules: customRules,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });
  });

  it('custom rules override base rules when they overlap', async () => {
    // Custom required rule that always passes (overrides item.required)
    const customRules: RegisterOptions<FieldValues, string> = {
      required: false,
    };

    renderWithHook({
      item: requiredItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: undefined,
      resources: defaultPluginTestResources as Resources,
      rules: customRules,
    });

    fireEvent.click(screen.getByTestId('submit'));

    // The custom required: false should override the base required rule
    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
  });

  it('unregisters field on unmount', async () => {
    const store = createPluginTestStore(requiredItem);

    const { unmount } = render(
      <TestPluginField
        item={requiredItem}
        idWithLinkIdAndItemIndex="test-item-0"
        value={undefined}
        resources={defaultPluginTestResources as Resources}
      />,
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <PluginTestWrapper store={store} referoProps={{ resources: defaultPluginTestResources as Resources }}>
            {children}
          </PluginTestWrapper>
        ),
      }
    );

    // Submit to register the validation error
    fireEvent.click(screen.getByTestId('submit'));
    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });

    // Unmount - field should be unregistered
    unmount();

    // No errors should remain (component is gone)
    expect(screen.queryByTestId('has-error')).not.toBeInTheDocument();
  });

  it('returns no error for item with no validation extensions', async () => {
    const plainItem: QuestionnaireItem = {
      linkId: 'test-item',
      type: 'integer',
      text: 'Plain field',
    };

    renderWithHook({
      item: plainItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: undefined,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
  });

  it('returns refCallback that can be attached to an element', () => {
    renderWithHook({
      item: optionalItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: undefined,
      resources: defaultPluginTestResources as Resources,
    });

    // refCallback should be applied to the input element without errors
    const input = screen.getByTestId('plugin-input');
    expect(input).toBeInTheDocument();
  });

  it('validates min value from item extensions', async () => {
    const minItem: QuestionnaireItem = {
      linkId: 'test-item',
      type: 'integer',
      text: 'Min value field',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 10,
        },
      ],
    };

    renderWithHook({
      item: minItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: 5,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });
  });

  it('validates max value from item extensions', async () => {
    const maxItem: QuestionnaireItem = {
      linkId: 'test-item',
      type: 'integer',
      text: 'Max value field',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10,
        },
      ],
    };

    renderWithHook({
      item: maxItem,
      idWithLinkIdAndItemIndex: 'test-item-0',
      value: 15,
      resources: defaultPluginTestResources as Resources,
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });
  });
});
