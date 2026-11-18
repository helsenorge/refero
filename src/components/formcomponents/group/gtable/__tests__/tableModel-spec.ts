import { describe, it, expect } from 'vitest';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { getSortedOrder, getSortValues, getVisibleColumns } from '../tableModel';

const hidden = { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true };
const group: QuestionnaireItem = {
  linkId: 'tabell',
  type: 'group',
  repeats: true,
  item: [
    { linkId: 'tabell.navn', text: 'Navn', type: 'string' },
    { linkId: 'tabell.type', text: 'Type', type: 'string' },
    {
      linkId: 'tabell.styrke',
      text: 'Styrke',
      type: 'string',
      enableWhen: [{ question: 'tabell.type', operator: '=', answerString: 'mikstur' }],
    },
    { linkId: 'tabell.dose', text: 'Dose', type: 'string', enableWhen: [{ question: 'vis-dose', operator: '=', answerBoolean: true }] },
    { linkId: 'tabell.intern', text: 'Intern', type: 'string', extension: [hidden] },
    { linkId: 'tabell.info', text: 'Info', type: 'display' },
  ],
};
const occurrence = (navn: string, type: string, tid: string[] = []): QuestionnaireResponseItem => ({
  linkId: 'tabell',
  item: [
    { linkId: 'tabell.navn', answer: [{ valueString: navn }] },
    { linkId: 'tabell.type', answer: [{ valueString: type }] },
    { linkId: 'tabell.tid', answer: tid.map(t => ({ valueString: t })) },
  ],
});
const visDose = (value: boolean): QuestionnaireResponseItem => ({ linkId: 'vis-dose', answer: [{ valueBoolean: value }] });
const firstRow = [{ linkId: 'tabell', index: 0 }];

describe('getVisibleColumns', () => {
  it('leaves out hidden questions and display items', () => {
    const columns = getVisibleColumns(group, firstRow, [visDose(true), occurrence('Paracet', 'tablett')]);
    expect(columns).toEqual(['tabell.navn', 'tabell.type', 'tabell.styrke', 'tabell.dose']);
  });

  it('leaves out a column turned off by a question outside the group, checked once', () => {
    expect(getVisibleColumns(group, firstRow, [visDose(false), occurrence('Paracet', 'tablett')])).not.toContain('tabell.dose');
    expect(getVisibleColumns(group, firstRow, [visDose(true), occurrence('Paracet', 'tablett')])).toContain('tabell.dose');
  });

  it('keeps a column whose condition is inside the group, since it can differ per row', () => {
    expect(getVisibleColumns(group, firstRow, [visDose(true), occurrence('Paracet', 'tablett')])).toContain('tabell.styrke');
  });
});

describe('sorting', () => {
  const occurrences = [
    occurrence('Paracet', 'tablett', ['08:00', '20:00']),
    occurrence('Albyl-E', 'tablett'),
    occurrence('Ibux', 'tablett', ['12:00']),
  ];

  it('reads one column, the first answer when there are several', () => {
    expect(getSortValues(occurrences, 'tabell.tid')).toEqual(['08:00', '', '12:00']);
  });

  it('gives the occurrences in sorted order, by index', () => {
    const names = getSortValues(occurrences, 'tabell.navn');
    expect(getSortedOrder(names, SortDirection.asc)).toEqual([1, 2, 0]);
    expect(getSortedOrder(names, SortDirection.desc)).toEqual([0, 2, 1]);
  });
});

describe('sorting on raw values', () => {
  const row = (answer: QuestionnaireResponseItem['answer']): QuestionnaireResponseItem => ({
    linkId: 'tabell',
    item: [{ linkId: 'tabell.verdi', answer }],
  });

  it('sorts dates as dates, not by the day in the displayed text', () => {
    const occurrences = [row([{ valueDate: '2026-03-05' }]), row([{ valueDate: '2025-12-24' }]), row([{ valueDate: '2026-01-01' }])];
    expect(getSortedOrder(getSortValues(occurrences, 'tabell.verdi'))).toEqual([1, 2, 0]);
  });

  it('sorts numbers and quantities as numbers', () => {
    const occurrences = [row([{ valueInteger: 10 }]), row([{ valueQuantity: { value: 9, unit: 'kg' } }]), row([{ valueDecimal: 100.5 }])];
    expect(getSortedOrder(getSortValues(occurrences, 'tabell.verdi'))).toEqual([1, 0, 2]);
  });

  it('sorts a choice on its display text, and puts empty values last', () => {
    const occurrences = [
      row([{ valueCoding: { code: 'b', display: 'Nei' } }]),
      row(undefined),
      row([{ valueCoding: { code: 'a', display: 'Ja' } }]),
    ];
    expect(getSortedOrder(getSortValues(occurrences, 'tabell.verdi'))).toEqual([2, 0, 1]);
  });
});
