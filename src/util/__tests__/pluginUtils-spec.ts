import { describe, it, expect } from 'vitest';

import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { normalizeAnswer, getFirstAnswer } from '../pluginUtils';

describe('pluginUtils', () => {
  const singleAnswer: QuestionnaireResponseItemAnswer = { valueInteger: 42 };
  const multipleAnswers: QuestionnaireResponseItemAnswer[] = [
    { valueCoding: { code: 'a', display: 'Option A' } },
    { valueCoding: { code: 'b', display: 'Option B' } },
  ];

  describe('normalizeAnswer', () => {
    it('returns empty array for undefined', () => {
      expect(normalizeAnswer(undefined)).toEqual([]);
    });

    it('wraps a single answer in an array', () => {
      expect(normalizeAnswer(singleAnswer)).toEqual([singleAnswer]);
    });

    it('returns the array as-is when already an array', () => {
      expect(normalizeAnswer(multipleAnswers)).toBe(multipleAnswers);
    });

    it('returns empty array for empty array input', () => {
      expect(normalizeAnswer([])).toEqual([]);
    });
  });

  describe('getFirstAnswer', () => {
    it('returns undefined for undefined', () => {
      expect(getFirstAnswer(undefined)).toBeUndefined();
    });

    it('returns the answer when given a single answer', () => {
      expect(getFirstAnswer(singleAnswer)).toBe(singleAnswer);
    });

    it('returns the first element when given an array', () => {
      expect(getFirstAnswer(multipleAnswers)).toBe(multipleAnswers[0]);
    });

    it('returns undefined for an empty array', () => {
      expect(getFirstAnswer([])).toBeUndefined();
    });
  });
});
