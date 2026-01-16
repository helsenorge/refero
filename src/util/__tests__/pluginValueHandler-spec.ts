import { describe, it, expect } from 'vitest';

import { getAnswerValueType } from '../pluginValueHandler';

describe('pluginValueHandler', () => {
  describe('getAnswerValueType', () => {
    it('returns valueString for string answers', () => {
      expect(getAnswerValueType({ valueString: 'test' })).toBe('valueString');
    });

    it('returns valueInteger for integer answers', () => {
      expect(getAnswerValueType({ valueInteger: 42 })).toBe('valueInteger');
    });

    it('returns valueDecimal for decimal answers', () => {
      expect(getAnswerValueType({ valueDecimal: 3.14 })).toBe('valueDecimal');
    });

    it('returns valueBoolean for boolean answers', () => {
      expect(getAnswerValueType({ valueBoolean: true })).toBe('valueBoolean');
      expect(getAnswerValueType({ valueBoolean: false })).toBe('valueBoolean');
    });

    it('returns valueDate for date answers', () => {
      expect(getAnswerValueType({ valueDate: '2024-01-15' })).toBe('valueDate');
    });

    it('returns valueDateTime for datetime answers', () => {
      expect(getAnswerValueType({ valueDateTime: '2024-01-15T10:30:00Z' })).toBe('valueDateTime');
    });

    it('returns valueTime for time answers', () => {
      expect(getAnswerValueType({ valueTime: '10:30:00' })).toBe('valueTime');
    });

    it('returns valueCoding for coding answers', () => {
      expect(
        getAnswerValueType({
          valueCoding: { code: 'test', system: 'http://example.com' },
        })
      ).toBe('valueCoding');
    });

    it('returns valueQuantity for quantity answers', () => {
      expect(
        getAnswerValueType({
          valueQuantity: { value: 100, unit: 'kg' },
        })
      ).toBe('valueQuantity');
    });

    it('returns valueAttachment for attachment answers', () => {
      expect(
        getAnswerValueType({
          valueAttachment: { url: 'http://example.com/file.pdf' },
        })
      ).toBe('valueAttachment');
    });

    it('returns valueReference for reference answers', () => {
      expect(
        getAnswerValueType({
          valueReference: { reference: 'Patient/123' },
        })
      ).toBe('valueReference');
    });

    it('returns valueUri for uri answers', () => {
      expect(getAnswerValueType({ valueUri: 'http://example.com' })).toBe('valueUri');
    });

    it('returns undefined for empty answers', () => {
      expect(getAnswerValueType({})).toBeUndefined();
    });

    it('returns first found value type when multiple present', () => {
      // This is an edge case - answers should typically have only one value
      // The function will return the first one found in the check order
      const result = getAnswerValueType({
        valueBoolean: true,
        valueString: 'test',
      });
      expect(result).toBe('valueBoolean');
    });
  });
});
