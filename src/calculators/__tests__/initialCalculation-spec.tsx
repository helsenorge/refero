import '../../util/__tests__/defineFetch';
import { configureStore } from '@reduxjs/toolkit';
import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { vi } from 'vitest';

import type { Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import { runCalculatorsAction } from '@/actions/thunks';
import ChoiceCheckBoxScoring from '@/components/__tests__/__data__/scoring/choice-check-box';
import ChoiceRadioButtonScoring from '@/components/__tests__/__data__/scoring/choice-radio-button';
import CodeScoring from '@/components/__tests__/__data__/scoring/code-scoring';
import FhirpathScoring from '@/components/__tests__/__data__/scoring/fhirpath-score';
import OpenChoiceScoring from '@/components/__tests__/__data__/scoring/open-choice';
import SectionScoring from '@/components/__tests__/__data__/scoring/section-score';
import { Extensions } from '@/constants/extensions';
import rootReducer from '@/reducers';

const TRIGGER = 'trigger';
const COUNT = 'quantity-count';

const calculated = (expression: string): Extension => ({ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: expression });
const scoreUnit: Extension = {
  url: Extensions.QUESTIONNAIRE_UNIT_URL,
  valueCoding: { system: 'http://unitsofmeasure.org', code: '{score}', display: 'score' },
};
const maxDecimals = (places: number): Extension => ({ url: Extensions.MAX_DECIMAL_PLACES, valueInteger: places });

const calculatedItems: QuestionnaireItem[] = [
  {
    linkId: COUNT,
    type: 'quantity',
    text: 'Count',
    readOnly: true,
    extension: [
      calculated(`QuestionnaireResponse.descendants().where(linkId='${TRIGGER}').answer.value.where($this = true).count()`),
      scoreUnit,
    ],
  },
  { linkId: 'quantity-constant', type: 'quantity', text: 'Constant', readOnly: true, extension: [calculated('1'), scoreUnit] },
  { linkId: 'decimal-zero', type: 'decimal', text: 'Decimal zero', readOnly: true, extension: [calculated('0')] },
  { linkId: 'decimal-rounded', type: 'decimal', text: 'Decimal rounded', readOnly: true, extension: [calculated('2.345'), maxDecimals(1)] },
  { linkId: 'integer-rounded', type: 'integer', text: 'Integer rounded', readOnly: true, extension: [calculated('2.6')] },
  {
    linkId: 'boolean-empty',
    type: 'boolean',
    text: 'Boolean empty',
    readOnly: true,
    extension: [calculated("QuestionnaireResponse.descendants().where(linkId='nothing').answer.value")],
  },
  {
    linkId: 'string-multiple',
    type: 'string',
    text: 'String multiple',
    readOnly: true,
    repeats: true,
    extension: [calculated("'a' | 'b'")],
  },
  {
    linkId: 'integer-copy-and-calculated',
    type: 'integer',
    text: 'Copy and calculated',
    readOnly: true,
    extension: [{ url: Extensions.COPY_EXPRESSION_URL, valueString: '1' }, calculated('2')],
  },
  {
    linkId: 'integer-disabled',
    type: 'integer',
    text: 'Disabled',
    readOnly: true,
    enableWhen: [{ question: TRIGGER, operator: '=', answerBoolean: true }],
    extension: [calculated('5')],
  },
];

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [{ linkId: TRIGGER, type: 'boolean', text: 'Trigger' }, ...calculatedItems],
};

function calculatedAnswers(items: QuestionnaireResponseItem[] | undefined): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const item of calculatedItems) {
    answers[item.linkId] = items?.find(x => x.linkId === item.linkId)?.answer;
  }
  return JSON.parse(JSON.stringify(answers));
}

describe('Calculated expressions in a new QuestionnaireResponse', () => {
  it('Should give the same answers as the calculation after a change, so the response does not depend on whether the user changed something', async () => {
    const { store } = await renderReferoWithStore({ questionnaire });
    const generated = calculatedAnswers(store.getState().refero.form.FormData.Content?.item);

    const countOf = (): unknown =>
      store.getState().refero.form.FormData.Content?.item?.find(x => x.linkId === COUNT)?.answer?.[0]?.valueQuantity?.value;

    await userEvent.click(screen.getByLabelText('Trigger'));
    await waitFor(() => expect(countOf()).toBe(1));
    await userEvent.click(screen.getByLabelText('Trigger'));
    await waitFor(() => expect(countOf()).toBe(0));

    const afterChange = calculatedAnswers(store.getState().refero.form.FormData.Content?.item);
    expect(generated).toEqual(afterChange);
  });

  it('Should write a calculated quantity as a Quantity with the unit of the item, since a number is not valid FHIR', async () => {
    const { store } = await renderReferoWithStore({ questionnaire });

    const answer = store.getState().refero.form.FormData.Content?.item?.find(x => x.linkId === 'quantity-constant')?.answer;
    expect(answer).toEqual([{ valueQuantity: { value: 1, unit: 'score', system: 'http://unitsofmeasure.org', code: '{score}' } }]);
  });
});

describe('The calculations the form runs after a change, run on a new QuestionnaireResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['calculated items of every type', questionnaire],
    ['scoring with check boxes', ChoiceCheckBoxScoring],
    ['scoring with radio buttons', ChoiceRadioButtonScoring],
    ['scoring with codes', CodeScoring],
    ['scoring with FHIRPath', FhirpathScoring],
    ['scoring with open choice', OpenChoiceScoring],
    ['section scores', SectionScoring],
  ] as [string, Questionnaire][])('Should change nothing in a form with %s', async (_name, form) => {
    const generated = generateQuestionnaireResponse(form);
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: { refero: { form: { FormDefinition: { Content: form }, FormData: { Content: generated }, Language: 'nb' } } },
    });
    const before = JSON.parse(JSON.stringify(store.getState().refero.form.FormData.Content));

    await store.dispatch(runCalculatorsAction());
    // The FHIRPath part of the calculation is debounced.
    await vi.advanceTimersByTimeAsync(1000);

    expect(JSON.parse(JSON.stringify(store.getState().refero.form.FormData.Content))).toEqual(before);
  });
});
