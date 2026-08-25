import { describe, it, expect, afterEach, vi } from 'vitest';

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runCalculators } from '../helpers';

import { Extensions } from '@/constants/extensions';
import { setFhirPathErrorHandler, type FhirPathEvaluationError } from '@/util/fhirpathErrors';
import { setFhirPathCalculationOptions } from '@/util/fhirPathOptions';

const calculatedItem = (linkId: string, expression: string): Record<string, unknown> => ({
  linkId,
  type: 'integer',
  extension: [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: expression }],
});

/**
 * A four level chain: b reads a, c reads b, d reads c. Each level needs its own
 * pass before it can see the level below it.
 */
const chainedQuestionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    { linkId: 'a', type: 'integer' },
    calculatedItem('b', "%resource.item.where(linkId='a').answer.valueInteger * 2"),
    calculatedItem('c', "%resource.item.where(linkId='b').answer.valueInteger + 1"),
    calculatedItem('d', "%resource.item.where(linkId='c').answer.valueInteger + 1"),
  ],
} as unknown as Questionnaire;

const chainedResponse = (): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [{ linkId: 'a', answer: [{ valueInteger: 5 }] }, { linkId: 'b' }, { linkId: 'c' }, { linkId: 'd' }],
});

/** Two items that each read the other, so the values never settle. */
const cyclicQuestionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    calculatedItem('x', "%resource.item.where(linkId='y').answer.valueInteger + 1"),
    calculatedItem('y', "%resource.item.where(linkId='x').answer.valueInteger + 1"),
  ],
} as unknown as Questionnaire;

const cyclicResponse = (): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [{ linkId: 'x', answer: [{ valueInteger: 1 }] }, { linkId: 'y' }],
});

describe('runCalculators', () => {
  afterEach(() => {
    setFhirPathCalculationOptions(undefined);
    setFhirPathErrorHandler(undefined);
    vi.restoreAllMocks();
  });

  describe('resolveExpressionChains', () => {
    it('Legacy: Should resolve two levels of a chain, but leave the third unresolved', () => {
      const fhirScores = runCalculators({ questionnaire: chainedQuestionnaire, questionnaireResponse: chainedResponse() });

      expect(fhirScores.b).toEqual([{ valueInteger: 10 }]);
      expect(fhirScores.c).toEqual([{ valueInteger: 11 }]);
      expect(fhirScores.d).toBeNull();
    });

    it('Should resolve the whole chain in one update when the option is on', () => {
      const fhirScores = runCalculators({
        questionnaire: chainedQuestionnaire,
        questionnaireResponse: chainedResponse(),
        options: { resolveExpressionChains: true },
      });

      expect(fhirScores.b).toEqual([{ valueInteger: 10 }]);
      expect(fhirScores.c).toEqual([{ valueInteger: 11 }]);
      expect(fhirScores.d).toEqual([{ valueInteger: 12 }]);
    });

    it('Should give the same answers as legacy for expressions that are not chained', () => {
      const questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [{ linkId: 'a', type: 'integer' }, calculatedItem('b', "%resource.item.where(linkId='a').answer.valueInteger * 2")],
      } as unknown as Questionnaire;
      const questionnaireResponse = (): QuestionnaireResponse => ({
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId: 'a', answer: [{ valueInteger: 5 }] }, { linkId: 'b' }],
      });

      expect(runCalculators({ questionnaire, questionnaireResponse: questionnaireResponse() })).toEqual(
        runCalculators({
          questionnaire,
          questionnaireResponse: questionnaireResponse(),
          options: { resolveExpressionChains: true },
        })
      );
    });

    it('Should report, and still return values, when the expressions never settle', () => {
      const handler = vi.fn();
      setFhirPathErrorHandler(handler);

      const fhirScores = runCalculators({
        questionnaire: cyclicQuestionnaire,
        questionnaireResponse: cyclicResponse(),
        options: { resolveExpressionChains: true, maxChainIterations: 3 },
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const [reported] = handler.mock.calls[0] as [FhirPathEvaluationError];
      expect(reported.source).toBe('runCalculators');
      expect((reported.error as Error).message).toContain('did not settle within 3 passes');
      expect(fhirScores.x).not.toBeUndefined();
    });

    it('Should not report anything when the expressions do settle', () => {
      const handler = vi.fn();
      setFhirPathErrorHandler(handler);

      runCalculators({
        questionnaire: chainedQuestionnaire,
        questionnaireResponse: chainedResponse(),
        options: { resolveExpressionChains: true },
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('application wide options', () => {
    it('Should be used when runCalculators is called without options', () => {
      setFhirPathCalculationOptions({ resolveExpressionChains: true });

      const fhirScores = runCalculators({ questionnaire: chainedQuestionnaire, questionnaireResponse: chainedResponse() });

      expect(fhirScores.d).toEqual([{ valueInteger: 12 }]);
    });
  });
});
