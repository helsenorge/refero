import { renderReferoWithStore } from '@test/test-utils';
import { screen } from '@testing-library/react';

import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';

// Characterises which items the form renders: the rules in ItemRenderer and ResponseItem, one test per rule.

const questionnaireWith = (...items: QuestionnaireItem[]): Questionnaire => ({
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [{ linkId: 'visible', type: 'string', text: 'Visible' }, ...items],
});

const renderWithResponse = async (
  questionnaire: Questionnaire,
  toItems: (items: QuestionnaireResponseItem[]) => QuestionnaireResponseItem[]
): Promise<void> => {
  const response = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
  const state = {
    refero: {
      form: {
        FormDefinition: { Content: questionnaire },
        FormData: { Content: { ...response, item: toItems(response.item ?? []) } },
        Language: 'nb',
      },
    },
  } as Parameters<typeof renderReferoWithStore>[0]['initialState'];
  await renderReferoWithStore({ questionnaire, initialState: state });
};

const getValues = (label: string): string[] => screen.queryAllByLabelText(label).map(input => (input as HTMLInputElement).value);

describe('which items the form renders', () => {
  it('renders an ordinary item', async () => {
    await renderReferoWithStore({ questionnaire: questionnaireWith() });

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
  });

  it('does not render a help item that has a response item', async () => {
    // Top-level help items get no response item, so the rule in ItemRenderer is only reached when one is present in the state.
    const help: QuestionnaireItem = {
      linkId: 'help',
      type: 'text',
      text: 'Help text',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
        },
      ],
    };
    const questionnaire = questionnaireWith(help);
    await renderWithResponse(questionnaire, items => [...items, { linkId: 'help', answer: [{ valueString: 'Help answer' }] }]);

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    expect(screen.queryByLabelText('Help text')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Help answer')).not.toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('does not render an item with questionnaire-hidden', async () => {
    const hidden: QuestionnaireItem = {
      linkId: 'hidden',
      type: 'string',
      text: 'Hidden',
      extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true }],
    };
    await renderReferoWithStore({ questionnaire: questionnaireWith(hidden) });

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    expect(screen.queryByLabelText('Hidden')).not.toBeInTheDocument();
  });

  it('does not render an item with the rendering option for pdf only', async () => {
    const pdfOnly: QuestionnaireItem = {
      linkId: 'pdf-only',
      type: 'string',
      text: 'Pdf only',
      code: [{ system: 'http://helsenorge.no/fhir/CodeSystem/RenderOptions', code: '2' }],
    };
    await renderReferoWithStore({ questionnaire: questionnaireWith(pdfOnly) });

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    expect(screen.queryByLabelText('Pdf only')).not.toBeInTheDocument();
  });

  it('does not render an item of a type without a component', async () => {
    const unknown = { linkId: 'unknown', type: 'no-such-type', text: 'Unknown type' } as unknown as QuestionnaireItem;
    await renderReferoWithStore({ questionnaire: questionnaireWith(unknown) });

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    expect(screen.queryByText('Unknown type')).not.toBeInTheDocument();
  });

  it('does not render an item that has no response item', async () => {
    const questionnaire = questionnaireWith({ linkId: 'missing', type: 'string', text: 'Missing in response' });
    await renderWithResponse(questionnaire, items => items.filter(item => item.linkId !== 'missing'));

    expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    expect(screen.queryByLabelText('Missing in response')).not.toBeInTheDocument();
  });

  describe('enableWhen', () => {
    // A repeating group that is only enabled in the repetitions where "keep" is answered with true.
    const questionnaire = questionnaireWith({
      linkId: 'group',
      type: 'group',
      text: 'Group',
      repeats: true,
      enableWhen: [{ question: 'keep', operator: '=', answerBoolean: true }],
      item: [
        { linkId: 'keep', type: 'boolean', text: 'Keep' },
        { linkId: 'name', type: 'string', text: 'Name' },
      ],
    });
    const renderRepetitions = (...repetitions: { keep: boolean; name: string }[]): Promise<void> =>
      renderWithResponse(questionnaire, items => [
        ...items.filter(item => item.linkId !== 'group'),
        ...repetitions.map(repetition => ({
          linkId: 'group',
          item: [
            { linkId: 'keep', answer: [{ valueBoolean: repetition.keep }] },
            { linkId: 'name', answer: [{ valueString: repetition.name }] },
          ],
        })),
      ]);

    it('renders every repetition that is enabled', async () => {
      await renderRepetitions({ keep: true, name: 'A' }, { keep: true, name: 'B' });

      expect(getValues('Name')).toEqual(['A', 'B']);
    });

    it('does not render a repetition that is disabled at its own index', async () => {
      await renderRepetitions({ keep: true, name: 'A' }, { keep: false, name: 'B' }, { keep: true, name: 'C' });

      expect(getValues('Name')).toEqual(['A', 'C']);
    });

    it('renders no repetition at all when the item is disabled at the first index', async () => {
      await renderRepetitions({ keep: false, name: 'A' }, { keep: true, name: 'B' });

      expect(getValues('Name')).toEqual([]);
      expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    });

    it('does not render an item that does not repeat while it is disabled', async () => {
      const single = questionnaireWith(
        { linkId: 'switch', type: 'boolean', text: 'Switch' },
        { linkId: 'dependent', type: 'string', text: 'Dependent', enableWhen: [{ question: 'switch', operator: '=', answerBoolean: true }] }
      );
      await renderReferoWithStore({ questionnaire: single });

      expect(screen.queryByLabelText('Dependent')).not.toBeInTheDocument();
    });
  });
});
