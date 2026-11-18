import { afterEach, describe, expect, it, vi } from 'vitest';

import type { QuestionnaireItem } from 'fhir/r4';

import { setFhirPathErrorHandler } from '../fhirpathErrors';
import { evaluateFhirpathExpressionToGetDate } from '../fhirpathHelper';

// The date limit (sdf-minvalue / sdf-maxvalue) of a date field. The date picker formats it while rendering, so only a
// valid date may come back; anything else means the field has no limit.

const item: QuestionnaireItem = { linkId: 'til-dato', text: 'Til dato', type: 'date' };

describe('evaluateFhirpathExpressionToGetDate', () => {
  afterEach(() => setFhirPathErrorHandler(undefined));

  it('gives no limit for an empty result, without reporting an error', async () => {
    const handler = vi.fn();
    setFhirPathErrorHandler(handler);
    expect(await evaluateFhirpathExpressionToGetDate(item, '{}')).toBeUndefined();
    expect(await evaluateFhirpathExpressionToGetDate(item, "QuestionnaireResponse.descendants().where(linkId='fra-dato').answer.valueDate")).toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });

  it('gives no limit for a result that is not a date, and reports it', async () => {
    const handler = vi.fn();
    setFhirPathErrorHandler(handler);
    expect(await evaluateFhirpathExpressionToGetDate(item, "'ikke en dato'")).toBeUndefined();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'evaluateFhirpathExpressionToGetDate', expression: "'ikke en dato'", linkId: 'til-dato' })
    );
  });

  it('gives no limit for an expression that fails, and reports it', async () => {
    const handler = vi.fn();
    setFhirPathErrorHandler(handler);
    expect(await evaluateFhirpathExpressionToGetDate(item, 'today(')).toBeUndefined();
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source: 'evaluateFhirpathExpressionToGetDate', expression: 'today(' }));
  });

  it('gives the date for an expression that gives one', async () => {
    const date = await evaluateFhirpathExpressionToGetDate(item, "@2026-01-31");
    expect(date).toBeInstanceOf(Date);
    expect(date?.toISOString().slice(0, 10)).toBe('2026-01-31');
    const today = await evaluateFhirpathExpressionToGetDate(item, 'today()');
    expect(Number.isNaN(today?.getTime())).toBe(false);
  });
});
