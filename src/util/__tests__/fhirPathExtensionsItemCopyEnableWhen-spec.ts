import { describe, it, expect } from 'vitest';

import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { withoutDisabledAnswers } from '../FhirPathExtensions';

import { runCalculators } from '@/workers/helpers';

const CQF = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
const copy = (expression: string, name?: string): QuestionnaireItem['extension'] => [
  { url: CQF, valueExpression: { ...(name && { name }), language: 'text/fhirpath', expression } },
];
const fromRow = (linkId: string): string => `%row.descendants().where(linkId='${linkId}').answer.value`;

// Medisin (navn, type, dose) is copied to Kopi. Dose is shown when "vis-dose" is ticked; Styrke only for a mikstur.
const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'medisin',
      type: 'group',
      repeats: true,
      item: [
        { linkId: 'medisin.navn', type: 'string' },
        { linkId: 'medisin.type', type: 'string' },
        { linkId: 'medisin.dose', type: 'string' },
      ],
    },
    { linkId: 'vis-dose', type: 'boolean' },
    {
      linkId: 'kopi',
      type: 'group',
      repeats: true,
      readOnly: true,
      extension: copy("%resource.descendants().where(linkId='medisin')", 'row'),
      item: [
        { linkId: 'kopi.navn', type: 'string', readOnly: true, extension: copy(fromRow('medisin.navn')) },
        { linkId: 'kopi.type', type: 'string', readOnly: true, extension: copy(fromRow('medisin.type')) },
        {
          linkId: 'kopi.styrke',
          type: 'string',
          readOnly: true,
          extension: copy(fromRow('medisin.navn')),
          enableWhen: [{ question: 'kopi.type', operator: '=', answerString: 'mikstur' }],
        },
        {
          linkId: 'kopi.dose',
          type: 'string',
          readOnly: true,
          extension: copy(fromRow('medisin.dose')),
          enableWhen: [{ question: 'vis-dose', operator: '=', answerBoolean: true }],
        },
      ],
    },
  ],
};

const medisin = (navn: string, type: string, dose: string): QuestionnaireResponseItem => ({
  linkId: 'medisin',
  item: [
    { linkId: 'medisin.navn', answer: [{ valueString: navn }] },
    { linkId: 'medisin.type', answer: [{ valueString: type }] },
    { linkId: 'medisin.dose', answer: [{ valueString: dose }] },
  ],
});
const response = (visDose: boolean): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    medisin('Paracet', 'tablett', '2 tabletter'),
    medisin('Mikstur X', 'mikstur', '5 ml'),
    { linkId: 'vis-dose', answer: [{ valueBoolean: visDose }] },
    { linkId: 'kopi', item: [{ linkId: 'kopi.navn' }, { linkId: 'kopi.type' }, { linkId: 'kopi.styrke' }, { linkId: 'kopi.dose' }] },
  ],
});

/** Each copied occurrence as { linkId: value }, only for the questions that have an answer. */
const copiedRows = (visDose: boolean): Record<string, string | undefined>[] => {
  const result = runCalculators({ questionnaire, questionnaireResponse: response(visDose) });
  const items = result.itemCopies.find(c => c.linkId === 'kopi')?.items ?? [];
  return items.map(occurrence =>
    Object.fromEntries((occurrence.item ?? []).filter(child => child.answer).map(child => [child.linkId, child.answer?.[0]?.valueString]))
  );
};

describe('copied questions turned off by enableWhen', () => {
  it('get no answer when a question outside the copy turns them off', () => {
    expect(copiedRows(false).map(row => row['kopi.dose'])).toEqual([undefined, undefined]);
    expect(copiedRows(true).map(row => row['kopi.dose'])).toEqual(['2 tabletter', '5 ml']);
  });

  it('get no answer when a question in the same copy turns them off, row by row', () => {
    expect(copiedRows(true).map(row => row['kopi.styrke'])).toEqual([undefined, 'Mikstur X']);
  });

  it('withoutDisabledAnswers keeps questions without enableWhen and removes only the answer', () => {
    const qItems = questionnaire.item?.[2].item ?? [];
    const children: QuestionnaireResponseItem[] = [
      { linkId: 'kopi.navn', answer: [{ valueString: 'Paracet' }] },
      { linkId: 'kopi.type', answer: [{ valueString: 'tablett' }] },
      { linkId: 'kopi.styrke', text: 'Styrke', answer: [{ valueString: 'x' }] },
      { linkId: 'kopi.dose', answer: [{ valueString: '2 tabletter' }] },
    ];
    const result = withoutDisabledAnswers(qItems, children, response(true));
    expect(result).toEqual([children[0], children[1], { linkId: 'kopi.styrke', text: 'Styrke' }, children[3]]);
  });
});
