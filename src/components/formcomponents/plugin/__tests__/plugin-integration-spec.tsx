/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';

import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';
import { vi } from 'vitest';

import type { ReferoProps } from '../../../../types/referoProps';
import type { PluginComponentProps, ComponentPlugin } from '@/types/componentPlugin';
import type { Questionnaire } from 'fhir/r4';

import { getResources } from '../../../../../preview/resources/referoResources';
import { submitForm } from '../../../../../test/selectors';

import { newIntegerValueAsync, newCodingValueAsync, removeCodingValueAsync } from '@/actions/newValue';
import { maxValue, minValue, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'Verdien er ikke gyldig',
};

// Mock plugin component that renders a custom integer input
// Uses dispatch and onAnswerChange directly - same pattern as built-in components
// Handles its own validation by registering with react-hook-form
const MockIntegerPlugin = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  id,
  idWithLinkIdAndItemIndex,
  path,
  error,
  pdf,
  resources: pluginResources,
  promptLoginMessage,
}: PluginComponentProps): React.JSX.Element => {
  const { register, unregister, setValue, formState } = useFormContext<FieldValues>();

  // Get initial value from answer prop
  const answerValue = Array.isArray(answer) ? answer[0]?.valueInteger : answer?.valueInteger;
  const [localValue, setLocalValue] = useState<string>(answerValue?.toString() ?? '');

  // Register with react-hook-form for validation
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      const validationRules: RegisterOptions<FieldValues, string> = {
        required: required({ item, resources: pluginResources }),
        min: minValue({ item, resources: pluginResources }),
        max: maxValue({ item, resources: pluginResources }),
        shouldUnregister: true,
      };
      register(idWithLinkIdAndItemIndex, validationRules);
    }
    return (): void => {
      unregister(idWithLinkIdAndItemIndex);
    };
  }, [idWithLinkIdAndItemIndex, item, pdf, register, unregister, pluginResources]);

  // Update form value when answer changes
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      setValue(idWithLinkIdAndItemIndex, answerValue, { shouldValidate: formState.isSubmitted });
    }
  }, [answerValue, idWithLinkIdAndItemIndex, item, pdf, setValue, formState.isSubmitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    setLocalValue(rawValue);

    const value = parseInt(rawValue, 10);
    if (!isNaN(value)) {
      // Dispatch action and call onAnswerChange - same pattern as built-in Integer component
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueInteger: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  return (
    <div data-testid="mock-integer-plugin">
      <input
        type="number"
        data-testid={`plugin-input-${id}`}
        value={localValue}
        onChange={handleChange}
        aria-label={item.text || 'Integer input'}
      />
      {error && <span data-testid="plugin-error">{error.message}</span>}
    </div>
  );
};

// Mock plugin component for choice/checkbox items
// Uses dispatch and onAnswerChange directly - same pattern as built-in components
// Handles its own validation by registering with react-hook-form
const MockChoicePlugin = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  idWithLinkIdAndItemIndex,
  path,
  pdf,
  resources: pluginResources,
  promptLoginMessage,
}: PluginComponentProps): React.JSX.Element => {
  const { register, unregister, setValue, formState } = useFormContext<FieldValues>();
  const answers = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const selectedCodes = answers.map(a => a.valueCoding?.code).filter(Boolean);

  // Register with react-hook-form for validation
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      const validationRules: RegisterOptions<FieldValues, string> = {
        required: required({ item, resources: pluginResources }),
        shouldUnregister: true,
      };
      register(idWithLinkIdAndItemIndex, validationRules);
    }
    return (): void => {
      unregister(idWithLinkIdAndItemIndex);
    };
  }, [idWithLinkIdAndItemIndex, item, pdf, register, unregister, pluginResources]);

  // Update form value when answer changes
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      setValue(idWithLinkIdAndItemIndex, answer, { shouldValidate: formState.isSubmitted });
    }
  }, [answer, idWithLinkIdAndItemIndex, item, pdf, setValue, formState.isSubmitted]);

  const handleToggle = (code: string, display: string): void => {
    const coding = { code, display };
    const isSelected = selectedCodes.includes(code);

    if (isSelected) {
      // Remove the coding
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, item, { valueCoding: coding }));
    } else {
      // Add the coding (multipleAnswers = true for repeating choice)
      dispatch(newCodingValueAsync(path, coding, item, item.repeats))?.then(newState =>
        onAnswerChange(newState, item, { valueCoding: coding })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  return (
    <div data-testid="mock-choice-plugin">
      {item.answerOption?.map(opt => {
        const code = opt.valueCoding?.code || '';
        const display = opt.valueCoding?.display || '';
        const isSelected = selectedCodes.includes(code);
        return (
          <label key={code}>
            <input
              type="checkbox"
              data-testid={`plugin-checkbox-${code}`}
              checked={isSelected}
              onChange={() => handleToggle(code, display)}
            />
            {display}
          </label>
        );
      })}
    </div>
  );
};

// Questionnaire with integer item using custom itemControl
const integerQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    {
      linkId: 'test-integer',
      type: 'integer',
      text: 'Test Integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'custom-spinner',
              },
            ],
          },
        },
      ],
    },
  ],
};

// Questionnaire with choice item (checkbox) using custom itemControl
const choiceQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    {
      linkId: 'test-choice',
      type: 'choice',
      text: 'Test Choice',
      repeats: true, // Multiple answers allowed (checkbox behavior)
      answerOption: [
        { valueCoding: { code: 'opt1', display: 'Option 1' } },
        { valueCoding: { code: 'opt2', display: 'Option 2' } },
        { valueCoding: { code: 'opt3', display: 'Option 3' } },
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'custom-pills',
              },
            ],
          },
        },
      ],
    },
  ],
};

// Plugin registrations
const integerPlugin: ComponentPlugin = {
  itemType: 'integer',
  itemControlCode: 'custom-spinner',
  component: MockIntegerPlugin,
};

const choicePlugin: ComponentPlugin = {
  itemType: 'choice',
  itemControlCode: 'custom-pills',
  component: MockChoicePlugin,
};

describe('Plugin Integration', () => {
  describe('Integer plugin', () => {
    it('Should render plugin component instead of default integer component', async () => {
      await createWrapper(integerQuestionnaire, { componentPlugins: [integerPlugin] });

      // Plugin should be rendered
      expect(screen.getByTestId('mock-integer-plugin')).toBeInTheDocument();

      // Default integer input should NOT be rendered
      expect(screen.queryByTestId(/test-integer-item/i)).not.toBeInTheDocument();
    });

    it('Should render default component when no plugin is registered', async () => {
      await createWrapper(integerQuestionnaire, {}); // No plugins

      // Plugin should NOT be rendered
      expect(screen.queryByTestId('mock-integer-plugin')).not.toBeInTheDocument();
    });

    it('Should update value when plugin calls onValueChange', async () => {
      await createWrapper(integerQuestionnaire, { componentPlugins: [integerPlugin] });

      const input = screen.getByTestId(/plugin-input/i);

      // Use single digit like existing integer-spec.tsx tests do for simple value checks
      await userEvent.type(input, '8');

      // Value should be updated - same pattern as integer-spec.tsx
      expect(input).toHaveValue(8);
    });

    it('Should trigger onChange callback when plugin updates value', async () => {
      const onChange = vi.fn();
      await createWrapper(integerQuestionnaire, {
        componentPlugins: [integerPlugin],
        onChange,
      });

      const input = screen.getByTestId(/plugin-input/i);
      await userEvent.clear(input);
      await userEvent.type(input, '123');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Choice plugin with toggle behavior', () => {
    it('Should render plugin component for choice items', async () => {
      await createWrapper(choiceQuestionnaire, { componentPlugins: [choicePlugin] });

      expect(screen.getByTestId('mock-choice-plugin')).toBeInTheDocument();
      expect(screen.getByTestId('plugin-checkbox-opt1')).toBeInTheDocument();
      expect(screen.getByTestId('plugin-checkbox-opt2')).toBeInTheDocument();
      expect(screen.getByTestId('plugin-checkbox-opt3')).toBeInTheDocument();
    });

    it('Should select option when clicked', async () => {
      await createWrapper(choiceQuestionnaire, { componentPlugins: [choicePlugin] });

      const checkbox1 = screen.getByTestId('plugin-checkbox-opt1');
      expect(checkbox1).not.toBeChecked();

      await userEvent.click(checkbox1);

      await waitFor(() => {
        expect(checkbox1).toBeChecked();
      });
    });

    it('Should allow multiple selections for repeating choice items', async () => {
      await createWrapper(choiceQuestionnaire, { componentPlugins: [choicePlugin] });

      const checkbox1 = screen.getByTestId('plugin-checkbox-opt1');
      const checkbox2 = screen.getByTestId('plugin-checkbox-opt2');

      await userEvent.click(checkbox1);
      await waitFor(() => {
        expect(checkbox1).toBeChecked();
      });

      await userEvent.click(checkbox2);
      await waitFor(() => {
        expect(checkbox1).toBeChecked();
        expect(checkbox2).toBeChecked();
      });
    });

    it('Should toggle off when clicking selected option', async () => {
      await createWrapper(choiceQuestionnaire, { componentPlugins: [choicePlugin] });

      const checkbox1 = screen.getByTestId('plugin-checkbox-opt1');

      // Select
      await userEvent.click(checkbox1);
      await waitFor(() => {
        expect(checkbox1).toBeChecked();
      });

      // Toggle off
      await userEvent.click(checkbox1);
      await waitFor(() => {
        expect(checkbox1).not.toBeChecked();
      });
    });
  });

  describe('Plugin with validation', () => {
    it('Should show validation error for required plugin field when submitting empty', async () => {
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, { componentPlugins: [integerPlugin] });

      // Submit without filling in the field
      await submitForm();

      await waitFor(() => {
        // Form should show validation error message (there will be multiple - validation summary + field error + plugin error)
        expect(screen.getAllByText(resources.formRequiredErrorMessage).length).toBeGreaterThan(0);
      });
    });

    it('Should not show validation error for required plugin field when filled', async () => {
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, { componentPlugins: [integerPlugin] });

      // Fill in the field
      const input = screen.getByTestId(/plugin-input/i);
      await userEvent.type(input, '5');

      // Submit form
      await submitForm();

      // Should not show validation error (field is filled)
      expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });

    it('Should not call onSubmit when required plugin field is empty', async () => {
      const onSubmit = vi.fn();
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, {
        componentPlugins: [integerPlugin],
        onSubmit,
      });

      // Submit without filling in the field
      await submitForm();

      // onSubmit should NOT be called since field is required but empty
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('Should call onSubmit when required plugin field is properly filled', async () => {
      const onSubmit = vi.fn();
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, {
        componentPlugins: [integerPlugin],
        onSubmit,
      });

      // Fill in the field
      const input = screen.getByTestId(/plugin-input/i);
      await userEvent.type(input, '5');

      // Submit form
      await submitForm();

      // onSubmit should be called since field is filled
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('Should pass error prop to plugin component when validation fails', async () => {
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, { componentPlugins: [integerPlugin] });

      // Submit without filling in the field
      await submitForm();

      await waitFor(() => {
        // Plugin should receive error prop and display it
        expect(screen.getByTestId('plugin-error')).toBeInTheDocument();
      });
    });

    it('Should remove validation error when required plugin field is filled after submission', async () => {
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, { componentPlugins: [integerPlugin] });

      // Submit without filling in the field
      await submitForm();

      // Error should be shown (there will be multiple - validation summary + field error)
      await waitFor(() => {
        expect(screen.getAllByText(resources.formRequiredErrorMessage).length).toBeGreaterThan(0);
      });

      // Fill in the field
      const input = screen.getByTestId(/plugin-input/i);
      await userEvent.type(input, '5');

      // Error should be removed after filling
      await waitFor(() => {
        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });

    it('Should show validation error for required choice plugin field when submitting empty', async () => {
      const requiredChoiceQuestionnaire: Questionnaire = {
        ...choiceQuestionnaire,
        item: choiceQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredChoiceQuestionnaire, { componentPlugins: [choicePlugin] });

      // Submit without selecting any option
      await submitForm();

      await waitFor(() => {
        // Form should show validation error message (there will be multiple - validation summary + field error)
        expect(screen.getAllByText(resources.formRequiredErrorMessage).length).toBeGreaterThan(0);
      });
    });

    it('Should not show validation error for required choice plugin field when option selected', async () => {
      const requiredChoiceQuestionnaire: Questionnaire = {
        ...choiceQuestionnaire,
        item: choiceQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredChoiceQuestionnaire, { componentPlugins: [choicePlugin] });

      // Select an option
      const checkbox1 = screen.getByTestId('plugin-checkbox-opt1');
      await userEvent.click(checkbox1);

      // Submit form
      await submitForm();

      // Should not show validation error (field has value)
      expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });

    it('Should validate min/max for integer plugin fields', async () => {
      const minMaxQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-integer',
            type: 'integer',
            text: 'Test Integer',
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://hl7.org/fhir/questionnaire-item-control',
                      code: 'custom-spinner',
                    },
                  ],
                },
              },
              {
                url: 'http://hl7.org/fhir/StructureDefinition/minValue',
                valueInteger: 5,
              },
              {
                url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
                valueInteger: 10,
              },
            ],
          },
        ],
      };

      await createWrapper(minMaxQuestionnaire, { componentPlugins: [integerPlugin] });

      // Enter a value below minimum
      const input = screen.getByTestId(/plugin-input/i);
      await userEvent.type(input, '2');

      // Submit form
      await submitForm();

      // Should show validation error for min value
      await waitFor(() => {
        expect(screen.getAllByText(resources.oppgiGyldigVerdi!).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Plugin resolution', () => {
    it('Should not use plugin when itemControl code does not match', async () => {
      const nonMatchingQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-integer',
            type: 'integer',
            text: 'Test Integer',
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://hl7.org/fhir/questionnaire-item-control',
                      code: 'different-code', // Does not match plugin
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await createWrapper(nonMatchingQuestionnaire, { componentPlugins: [integerPlugin] });

      // Plugin should NOT be rendered because code doesn't match
      expect(screen.queryByTestId('mock-integer-plugin')).not.toBeInTheDocument();
    });

    it('Should not use plugin when item type does not match', async () => {
      const stringQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-string',
            type: 'string', // Different type
            text: 'Test String',
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://hl7.org/fhir/questionnaire-item-control',
                      code: 'custom-spinner', // Same code but wrong type
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await createWrapper(stringQuestionnaire, { componentPlugins: [integerPlugin] });

      // Plugin should NOT be rendered because type doesn't match
      expect(screen.queryByTestId('mock-integer-plugin')).not.toBeInTheDocument();
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => {
    return renderRefero({ questionnaire, props: { ...props, resources } });
  });
};
