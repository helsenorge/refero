import { describe, it, expect } from 'vitest';

import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import {
  extractValueFromCoding,
  extractValueFromQuantity,
  extractValueFromDate,
  extractValueFromDateTime,
  extractValueFromTime,
  answerToStrings,
} from '../utils';
vi.mock('@/constants/dateTimeConstants', () => ({
  TIME_SEPARATOR: ':',
}));
vi.mock('../constants', () => ({
  DATEFORMATS: { DATE: 'yyyy-MM-dd', DATETIME: "yyyy-MM-dd'T'HH:mm" },
}));
vi.mock('@/constants/extensions', () => ({
  COPY_EXPRESSION_URL: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
}));

// Mock date-fns for predictable test behavior
vi.mock('date-fns', () => {
  return {
    format: (date: string | number | Date): string => (typeof date === 'string' ? date : String(date)),
    isValid: (input: unknown): boolean => !!input,
  };
});
describe('Coding & Quantity formatting', () => {
  it('coding prefers display over code/system', () => {
    expect(extractValueFromCoding({ display: 'Shown', code: 'C' })).toBe('Shown');
    expect(extractValueFromCoding({ code: 'C' })).toBe('');
  });

  it('quantity display falls back safely and strips apostrophes', () => {
    expect(extractValueFromQuantity({ value: 10, unit: "m'l" }, 'display')).toBe('10 ml');
    expect(extractValueFromQuantity({ value: 2 })).toBe('2 ');
    expect(extractValueFromQuantity(undefined)).toBe('');
  });
});

describe('Date/Time normalization', () => {
  it('date/datetime are passed through (mocked date-fns)', () => {
    expect(extractValueFromDate('2025-10-28')).toBe('2025-10-28');
    expect(extractValueFromDateTime('2025-10-28T09:00:00Z')).toBe('2025-10-28T09:00:00Z');
  });

  it('time requires HH:mm:ss and returns HH:mm', () => {
    expect(extractValueFromTime('08:15:00')).toBe('08:15');
    expect(extractValueFromTime('08:15')).toBe('');
    expect(extractValueFromTime('')).toBe('');
  });
});

describe('answerToStrings covers all value[x]', () => {
  const cases: QuestionnaireResponseItemAnswer[] = [
    { valueString: 'S' },
    { valueBoolean: true },
    { valueBoolean: false },
    { valueInteger: 42 },
    { valueDecimal: 3.14 },
    { valueDate: '2025-10-28' },
    { valueDateTime: '2025-10-28T12:00:00Z' },
    { valueTime: '07:30:00' },
    { valueCoding: { display: 'ja', code: 'ja' } },
    { valueQuantity: { value: 1, unit: 'kg' } },
  ];

  it('maps to formatted strings', () => {
    const results = cases.map(answerToStrings);
    expect(results).toEqual([
      ['S'],
      ['[X]'],
      ['[ ]'],
      ['42'],
      ['3.14'],
      ['2025-10-28'],
      ['2025-10-28T12:00:00Z'],
      ['07:30'],
      ['ja'],
      ['1 kg'],
    ]);
  });
});
