import { configureStore } from '@reduxjs/toolkit';

import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import { runCalculatorsAction } from '@/actions/thunks';
import rootReducer, { type GlobalState } from '@/reducers';

export const REPETITION_CONTEXT_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-item-repetition-context';
export const SDC_CALC_URL = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression';
export const SDF_CALC_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression';
export const CQF_EXPRESSION_URL = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
export const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';
export const ITEM_CONTROL_SYSTEM = 'http://hl7.org/fhir/ValueSet/questionnaire-item-control';

export const ALL_MEDISIN = "%resource.repeat(item).where(linkId='medisin')";
export const ROW_NAVN = "%row.item.where(linkId='medisin.navn').answer.value";
export const ROW_DOSE = "%row.item.where(linkId='medisin.dose').answer.value";

export const repetitionContext = (expression: string): Extension => ({
  url: REPETITION_CONTEXT_URL,
  valueExpression: { language: 'text/fhirpath', name: 'row', expression },
});
export const sdcCalc = (expression: string): Extension => ({
  url: SDC_CALC_URL,
  valueExpression: { language: 'text/fhirpath', expression },
});
export const sdfCalc = (expression: string): Extension => ({ url: SDF_CALC_URL, valueString: expression });
export const cqfExpression = (expression: string): Extension => ({
  url: CQF_EXPRESSION_URL,
  valueExpression: { language: 'text/fhirpath', expression },
});
export const cqfExpressionString = (expression: string): Extension => ({ url: CQF_EXPRESSION_URL, valueString: expression });
export const gtableControl: Extension = {
  url: ITEM_CONTROL_URL,
  valueCodeableConcept: { coding: [{ system: ITEM_CONTROL_SYSTEM, code: 'gtable' }] },
};

export const medisinItem = (): QuestionnaireItem => ({
  linkId: 'medisin',
  type: 'group',
  text: 'Medisin',
  repeats: true,
  item: [
    { linkId: 'medisin.navn', type: 'string', text: 'Navn på medisin' },
    { linkId: 'medisin.dose', type: 'string', text: 'Dose' },
  ],
});

export const stringItem = (linkId: string, text: string, extension?: Extension[]): QuestionnaireItem => ({
  linkId,
  type: 'string',
  text,
  ...(extension ? { extension } : {}),
});

export const kopiGroup = (opts: {
  extension?: Extension[];
  readOnly?: boolean;
  children?: QuestionnaireItem[];
  linkId?: string;
}): QuestionnaireItem => ({
  linkId: opts.linkId ?? 'kopi',
  type: 'group',
  text: 'Kopi',
  repeats: true,
  ...(opts.readOnly === false ? {} : { readOnly: true }),
  ...(opts.extension ? { extension: opts.extension } : {}),
  item: opts.children ?? [{ linkId: 'kopi.tekst', type: 'string', text: 'Tekst' }],
});

export const questionnaireOf = (...items: QuestionnaireItem[]): Questionnaire => ({
  resourceType: 'Questionnaire',
  status: 'active',
  item: items,
});

export type MedisinRow = { navn?: string; dose?: string };

export const MEDICINE_DATA: MedisinRow[] = [
  { navn: 'Paracet', dose: '1 g' },
  { navn: 'Ibux', dose: '400 mg' },
];

const stringChild = (linkId: string, value?: string): QuestionnaireResponseItem =>
  value === undefined ? { linkId } : { linkId, answer: [{ valueString: value }] };

export const medisinOccurrence = (row: MedisinRow): QuestionnaireResponseItem => ({
  linkId: 'medisin',
  item: [stringChild('medisin.navn', row.navn), stringChild('medisin.dose', row.dose)],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const withOccurrences = (
  response: QuestionnaireResponse,
  linkId: string,
  occurrences: QuestionnaireResponseItem[]
): QuestionnaireResponse => {
  const result = clone(response);
  const items = result.item ?? [];
  const first = items.findIndex(i => i.linkId === linkId);
  const rest = items.filter(i => i.linkId !== linkId);
  const at = first === -1 ? rest.length : items.slice(0, first).filter(i => i.linkId !== linkId).length;
  rest.splice(at, 0, ...clone(occurrences));
  result.item = rest;
  return result;
};

export const withMedisin = (response: QuestionnaireResponse, rows: MedisinRow[]): QuestionnaireResponse =>
  withOccurrences(response, 'medisin', rows.map(medisinOccurrence));

export const newResponse = (questionnaire: Questionnaire): QuestionnaireResponse => {
  const response = generateQuestionnaireResponse(questionnaire);
  if (!response) throw new Error('generateQuestionnaireResponse gave no response');
  return response;
};

export const stateOf = (questionnaire: Questionnaire, response: QuestionnaireResponse): GlobalState =>
  ({
    refero: { form: { FormDefinition: { Content: questionnaire }, FormData: { Content: response }, Language: 'nb' } },
  }) as unknown as GlobalState;

export async function calculate(questionnaire: Questionnaire, response: QuestionnaireResponse): Promise<QuestionnaireResponse> {
  vi.useFakeTimers();
  try {
    const store = configureStore({ reducer: rootReducer, preloadedState: stateOf(questionnaire, clone(response)) });
    await store.dispatch(runCalculatorsAction());
    await vi.advanceTimersByTimeAsync(1000);
    const result = store.getState().refero.form.FormData.Content;
    if (!result) throw new Error('the store has no QuestionnaireResponse after the calculation');
    return clone(result);
  } finally {
    vi.useRealTimers();
  }
}

export async function calculateWithMedisin(
  questionnaire: Questionnaire,
  rows: MedisinRow[] = MEDICINE_DATA
): Promise<QuestionnaireResponse> {
  return calculate(questionnaire, withMedisin(newResponse(questionnaire), rows));
}

export const occurrencesOf = (items: QuestionnaireResponseItem[] | undefined, linkId: string): QuestionnaireResponseItem[] => {
  const found: QuestionnaireResponseItem[] = [];
  const visit = (list: QuestionnaireResponseItem[] | undefined): void => {
    for (const item of list ?? []) {
      if (item.linkId === linkId) found.push(item);
      visit(item.item);
      for (const answer of item.answer ?? []) visit(answer.item);
    }
  };
  visit(items);
  return found;
};

export const answersOf = (items: QuestionnaireResponseItem[] | undefined, linkId: string): QuestionnaireResponseItemAnswer[] =>
  occurrencesOf(items, linkId).flatMap(i => i.answer ?? []);

export const stringsOf = (items: QuestionnaireResponseItem[] | undefined, linkId: string): (string | undefined)[] =>
  answersOf(items, linkId).map(a => a.valueString);

export const childStrings = (occurrences: QuestionnaireResponseItem[], linkId: string): (string | undefined)[][] =>
  occurrences.map(o => stringsOf(o.item, linkId));
