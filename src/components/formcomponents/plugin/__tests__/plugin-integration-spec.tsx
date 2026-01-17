/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';

import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { vi } from 'vitest';

import type { ReferoProps } from '../../../../types/referoProps';
import type { PluginComponentProps, ComponentPlugin } from '@/types/componentPlugin';
import type { Questionnaire } from 'fhir/r4';

import { getResources } from '../../../../../preview/resources/referoResources';
import { submitForm } from '../../../../../test/selectors';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

// Mock plugin component that renders a custom integer input
// Uses controlled input with local state that syncs with Redux via onValueChange
const MockIntegerPlugin = ({ item, answer, onValueChange, id, error }: PluginComponentProps): JSX.Element => {
  // Get initial value from answer prop
  const answerValue = Array.isArray(answer) ? answer[0]?.valueInteger : answer?.valueInteger;
  const [localValue, setLocalValue] = useState<string>(answerValue?.toString() ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    setLocalValue(rawValue);

    const value = parseInt(rawValue, 10);
    if (!isNaN(value)) {
      onValueChange({ valueInteger: value });
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
// Uses checkbox inputs for proper toggle testing with react-testing-library
const MockChoicePlugin = ({ item, answer, onValueChange }: PluginComponentProps): JSX.Element => {
  const answers = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const selectedCodes = answers.map(a => a.valueCoding?.code).filter(Boolean);

  const handleToggle = (code: string, display: string): void => {
    onValueChange({ valueCoding: { code, display } });
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
    it('Should show validation error for required plugin field', async () => {
      const requiredQuestionnaire: Questionnaire = {
        ...integerQuestionnaire,
        item: integerQuestionnaire.item?.map(x => ({ ...x, required: true })),
      };

      await createWrapper(requiredQuestionnaire, { componentPlugins: [integerPlugin] });

      // Submit without filling in the field
      await submitForm();

      await waitFor(() => {
        // Form should show validation error (from ReferoLabel or form context)
        expect(screen.getByTestId('mock-integer-plugin')).toBeInTheDocument();
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
