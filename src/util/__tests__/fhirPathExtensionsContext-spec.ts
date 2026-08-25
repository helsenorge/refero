import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { setFhirPathErrorHandler, type FhirPathEvaluationError } from '../fhirpathErrors';
import { FhirPathExtensions } from '../FhirPathExtensions';
import { clearCompiledFhirPathExpressionCache } from '../fhirpathHelper';

import { Extensions } from '@/constants/extensions';

/**
 * Reads the ordinalValue of the answerOption the user picked. This is only
 * expressible because %questionnaire gives the expression access to the
 * definition side of the form - the answers alone do not carry the score.
 */
const ORDINAL_OF_SELECTED_OPTION = `%questionnaire.item.where(linkId='choice').answerOption.valueCoding
  .where(code = %resource.item.where(linkId='choice').answer.valueCoding.code)
  .extension.where(url='${Extensions.ORDINAL_VALUE_URL}').valueDecimal`;

const option = (code: string, display: string, ordinalValue: number): Record<string, unknown> => ({
  valueCoding: {
    system: 'urn:oid:2.16.578.1.12.4.1.1101',
    code,
    display,
    extension: [{ url: Extensions.ORDINAL_VALUE_URL, valueDecimal: ordinalValue }],
  },
});

const questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    {
      linkId: 'choice',
      type: 'choice',
      text: 'Hvor ofte?',
      answerOption: [option('1', 'Aldri', 0), option('2', 'Av og til', 2), option('3', 'Ofte', 5)],
    },
    {
      linkId: 'score',
      type: 'integer',
      text: 'Skår',
      extension: [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: ORDINAL_OF_SELECTED_OPTION }],
    },
  ],
} as unknown as Questionnaire;

const responseWithChoice = (code: string): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'choice',
      answer: [{ valueCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code, display: 'display' } }],
    },
    { linkId: 'score' },
  ],
});

describe('FhirPathExtensions with context variables', () => {
  beforeEach(() => {
    clearCompiledFhirPathExpressionCache();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setFhirPathErrorHandler(undefined);
    clearCompiledFhirPathExpressionCache();
    vi.restoreAllMocks();
  });

  describe('%questionnaire', () => {
    it('Should let a calculated expression read metadata from the Questionnaire', () => {
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);

      const fhirScores = fhirPathUpdater.calculateFhirScore(responseWithChoice('2'));

      expect(fhirScores).toEqual({ score: [{ valueInteger: 2 }] });
    });

    it('Should follow the answer when another option is picked', () => {
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);

      expect(fhirPathUpdater.calculateFhirScore(responseWithChoice('3'))).toEqual({ score: [{ valueInteger: 5 }] });
      expect(fhirPathUpdater.calculateFhirScore(responseWithChoice('1'))).toEqual({ score: [{ valueInteger: 0 }] });
    });

    it('Should write the calculated value into the QuestionnaireResponse', () => {
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);

      const updated = fhirPathUpdater.evaluateAllExpressions(responseWithChoice('3'));

      expect(updated.item?.find(x => x.linkId === 'score')?.answer).toEqual([{ valueInteger: 5 }]);
    });

    it('Should only track items that actually carry an expression', () => {
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);

      expect(Object.keys(fhirPathUpdater.calculateFhirScore(responseWithChoice('2')))).toEqual(['score']);
    });

    it('Should not mutate the Questionnaire it exposes to the expressions', () => {
      const questionnaireCopy = structuredClone(questionnaire);
      const fhirPathUpdater = new FhirPathExtensions(questionnaireCopy);

      fhirPathUpdater.calculateFhirScore(responseWithChoice('2'));

      expect(JSON.stringify(questionnaireCopy)).toEqual(JSON.stringify(questionnaire));
    });
  });

  describe('%resource', () => {
    it('Should be bound to the QuestionnaireResponse being evaluated', () => {
      const q = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'a', type: 'integer' },
          {
            linkId: 'sum',
            type: 'integer',
            extension: [
              {
                url: Extensions.CALCULATED_EXPRESSION_URL,
                valueString: "%resource.item.where(linkId='a').answer.valueInteger.sum()",
              },
            ],
          },
        ],
      } as unknown as Questionnaire;
      const qr: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId: 'a', answer: [{ valueInteger: 4 }, { valueInteger: 6 }] }, { linkId: 'sum' }],
      };

      expect(new FhirPathExtensions(q).calculateFhirScore(qr)).toEqual({ sum: [{ valueInteger: 10 }] });
    });
  });

  describe('backwards compatibility', () => {
    it('Should still evaluate expressions that use neither variable', () => {
      const q = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'a', type: 'integer' },
          {
            linkId: 'sum',
            type: 'integer',
            extension: [
              {
                url: Extensions.CALCULATED_EXPRESSION_URL,
                valueString: "item.where(linkId='a').answer.valueInteger.sum()",
              },
            ],
          },
        ],
      } as unknown as Questionnaire;
      const qr: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId: 'a', answer: [{ valueInteger: 4 }, { valueInteger: 6 }] }, { linkId: 'sum' }],
      };

      expect(new FhirPathExtensions(q).calculateFhirScore(qr)).toEqual({ sum: [{ valueInteger: 10 }] });
    });
  });

  describe('error reporting', () => {
    it('Should report the failing expression instead of silently producing no answer', () => {
      const handler = vi.fn();
      setFhirPathErrorHandler(handler);
      const q = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'broken',
            type: 'string',
            extension: [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: "item.where(linkId='a'" }],
          },
        ],
      } as unknown as Questionnaire;
      const qr: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId: 'broken' }],
      };

      const fhirScores = new FhirPathExtensions(q).calculateFhirScore(qr);

      expect(fhirScores).toEqual({ broken: null });
      expect(handler).toHaveBeenCalled();
      const [reported] = handler.mock.calls[0] as [FhirPathEvaluationError];
      expect(reported.expression).toBe("item.where(linkId='a'");
    });
  });
});
