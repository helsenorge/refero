/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, vi } from 'vitest';

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import {
  extractLinkIdFromExpression,
  getColumnsFromGTableItem,
  indexQuestionnaire,
  inferSourceGroupLinkId,
  collectAnswersWithin,
  buildGTableRows,
  extractValueFromCoding,
  extractValueFromQuantity,
  extractValueFromDate,
  extractValueFromDateTime,
  extractValueFromTime,
  answerToStrings,
  type Column,
} from '../utils';

// Constants mocks
vi.mock('@/constants/dateTimeConstants', () => ({
  TIME_SEPARATOR: ':',
}));
vi.mock('../constants', () => ({
  DATEFORMATS: { DATE: 'yyyy-MM-dd', DATETIME: "yyyy-MM-dd'T'HH:mm" },
}));
vi.mock('@/constants/extensions', () => ({
  COPY_EXPRESSION_URL: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
}));

vi.mock('date-fns', () => {
  return {
    format: (date: string | number | Date): string => (typeof date === 'string' ? date : String(date)),
    isValid: (input: unknown): boolean => !!input,
  };
});

// Mock refero-core util
vi.mock('@/util/refero-core', () => ({
  getResponseItemsWithLinkId: (linkId?: string, items?: QuestionnaireResponseItem[]) => {
    const out = [];
    (function dfs(arr?: QuestionnaireResponseItem[]) {
      if (!arr) return;
      for (const it of arr) {
        if (it.linkId === linkId) out.push(it);
        if (it.item?.length) dfs(it.item);
        if (it.answer?.length) for (const a of it.answer) dfs(a.item);
      }
    })(items);
    return out;
  },
}));

describe('extractLinkIdFromExpression', () => {
  it('parses single quotes', () => {
    expect(extractLinkIdFromExpression(`QuestionnaireResponse.descendants().where(linkId='abc').answer.value`)).toBe('abc');
  });

  it('parses double quotes', () => {
    expect(extractLinkIdFromExpression(`QuestionnaireResponse.descendants().where(linkId="xyz").answer.value`)).toBe('xyz');
  });

  it('returns undefined if no match', () => {
    expect(extractLinkIdFromExpression('invalid')).toBeUndefined();
  });
});

describe('getColumnsFromGTableItem', () => {
  const cell = (linkId: string, text: string, source: string): QuestionnaireItem => ({
    linkId,
    type: 'string',
    text,
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
        valueString: `QuestionnaireResponse.descendants().where(linkId='${source}').answer.value`,
      },
    ],
  });

  it('extracts columns correctly', () => {
    const g: QuestionnaireItem = {
      linkId: 'gtable',
      type: 'group',
      item: [cell('col1', 'Dato', 'd1'), cell('col2', 'Tid', 't1')],
    };
    const result = getColumnsFromGTableItem(g);
    expect(result).toEqual<Column[]>([
      { header: 'Dato', sourceLinkId: 'd1', summaryLinkId: 'col1' },
      { header: 'Tid', sourceLinkId: 't1', summaryLinkId: 'col2' },
    ]);
  });

  it('ignores cells without expressions', () => {
    const g: QuestionnaireItem = { linkId: 'gtable', type: 'group', item: [{ linkId: 'col', type: 'string' }] };
    expect(getColumnsFromGTableItem(g)).toEqual([]);
  });
});

describe('indexQuestionnaire & inferSourceGroupLinkId', () => {
  const q: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'draft',
    item: [
      {
        linkId: 'root',
        type: 'group',
        item: [
          {
            linkId: 'outer',
            type: 'group',
            repeats: true,
            item: [
              { linkId: 'd1', type: 'date' },
              { linkId: 't1', type: 'time' },
            ],
          },
        ],
      },
    ],
  };

  it('builds parent paths', () => {
    const idx = indexQuestionnaire(q);
    expect(idx.byLinkId.has('t1')).toBe(true);
    const chain = idx.parentPath.get('t1')!;
    expect(chain.map(n => n.linkId)).toEqual(['root', 'outer']);
  });

  it('infers the deepest repeating group', () => {
    const gTable: QuestionnaireItem = {
      linkId: 'gt',
      type: 'group',
      item: [
        {
          linkId: 'c1',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
              valueString: `QuestionnaireRespons e.descendants().where(linkId='d1').answer.value`,
            },
          ],
        },
        {
          linkId: 'c2',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
              valueString: `QuestionnaireResponse.descendants().where(linkId='t1').answer.value`,
            },
          ],
        },
      ],
    };
    const cols = getColumnsFromGTableItem(gTable);
    const parent = inferSourceGroupLinkId(q, cols);
    expect(parent).toBe('outer');
  });
});

describe('answer value extraction', () => {
  it('handles coding', () => {
    expect(extractValueFromCoding({ display: 'Yes', code: 'ja' }, 'display')).toBe('Yes');
    expect(extractValueFromCoding({ code: 'ja' }, 'display')).toBe('');
  });

  it('handles quantity', () => {
    expect(extractValueFromQuantity({ value: 5, unit: 'kg' }, 'display')).toBe('5 kg');
    expect(extractValueFromQuantity(undefined)).toBe('');
  });

  it('handles dates, datetime, time', () => {
    expect(extractValueFromDate('2025-10-28')).toBe('2025-10-28');
    expect(extractValueFromDateTime('2025-10-28T11:33:00Z')).toBe('2025-10-28T11:33:00Z');
    expect(extractValueFromTime('12:34:56')).toBe('12:34');
    expect(extractValueFromTime('12:34')).toBe('');
  });

  it('answerToStrings covers all value[x]', () => {
    const answers: QuestionnaireResponseItemAnswer[] = [
      { valueString: 'A' },
      { valueBoolean: true },
      { valueInteger: 1 },
      { valueDecimal: 1.5 },
      { valueDate: '2025-10-28' },
      { valueDateTime: '2025-10-28T10:00:00Z' },
      { valueTime: '08:15:00' },
      { valueCoding: { display: 'ja' } },
      { valueQuantity: { value: 10, unit: 'ml' } },
    ];
    const results = answers.map(answerToStrings);
    expect(results[0]).toEqual(['A']);
    expect(results[1]).toEqual(['[X]']);
    expect(results[2]).toEqual(['1']);
    expect(results[3]).toEqual(['1.5']);
    expect(results[4]).toEqual(['2025-10-28']);
    expect(results[5]).toEqual(['2025-10-28T10:00:00Z']);
    expect(results[6]).toEqual(['08:15']);
    expect(results[7]).toEqual(['ja']);
    expect(results[8]).toEqual(['10 ml']);
  });
});

describe('collectAnswersWithin & buildGTableRows', () => {
  const qr: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: [
      {
        linkId: 'root',
        item: [
          {
            linkId: 'outer',
            item: [
              { linkId: 'd1', answer: [{ valueDate: '2025-10-28' }] },
              { linkId: 't1', answer: [{ valueTime: '12:34:56' }] },
            ],
          },
          {
            linkId: 'outer',
            item: [{ linkId: 't1', answer: [{ valueTime: '08:15:00' }] }],
          },
        ],
      },
    ],
  };

  it('collects answers', () => {
    const first = qr.item![0].item![0];
    const vals = collectAnswersWithin(first, 'd1');
    expect(vals).toEqual(['2025-10-28']);
  });

  it('builds rows correctly', () => {
    const columns: Column[] = [
      { header: 'Date', sourceLinkId: 'd1', summaryLinkId: 'col-d' },
      { header: 'Time', sourceLinkId: 't1', summaryLinkId: 'col-t' },
    ];
    const rows = buildGTableRows(qr, 'outer', columns);
    expect(rows).toHaveLength(2);
    expect(rows[0]['col-d']).toBe('2025-10-28');
    expect(rows[0]['col-t']).toBe('12:34');
    expect(rows[1]['col-d']).toBeUndefined();
    expect(rows[1]['col-t']).toBe('08:15');
  });
});
