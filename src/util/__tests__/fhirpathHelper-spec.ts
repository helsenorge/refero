import * as fhirpath from 'fhirpath';
import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';

import type { Extension, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { setFhirPathErrorHandler, type FhirPathEvaluationError } from '../fhirpathErrors';
import {
  clearCompiledFhirPathExpressionCache,
  descendantsHasAnswer,
  evaluateFhirpathExpressionToGetString,
  getCompiledFhirPathExpression,
  hasDescendants,
} from '../fhirpathHelper';

// Wraps compile() so the tests can count how often an expression is compiled.
// `typeof fhirpath` is erased at compile time, so the factory stays free of
// references to the hoisted import.
vi.mock('fhirpath', async importOriginal => {
  const actual = await importOriginal<typeof fhirpath>();
  return { ...actual, compile: vi.fn(actual.compile) };
});

const CALCULATED_EXPRESSION_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression';

const legacyExtension = (expression: string): Extension => ({
  url: CALCULATED_EXPRESSION_URL,
  valueString: expression,
});

const expressionExtension = (expression: string): Extension => ({
  url: CALCULATED_EXPRESSION_URL,
  valueExpression: { language: 'text/fhirpath', expression },
});

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    { linkId: '1', type: 'integer', text: 'Antall dager' },
    { linkId: '2', type: 'integer', text: 'Antall netter' },
  ],
};

const questionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: '1', answer: [{ valueInteger: 2 }] },
    { linkId: '2', answer: [{ valueInteger: 3 }] },
  ],
};

describe('fhirpathHelper', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    clearCompiledFhirPathExpressionCache();
    vi.mocked(fhirpath.compile).mockClear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setFhirPathErrorHandler(undefined);
    clearCompiledFhirPathExpressionCache();
    vi.restoreAllMocks();
  });

  describe('getCompiledFhirPathExpression', () => {
    it('Should compile an expression only once and reuse the compiled function', () => {
      const first = getCompiledFhirPathExpression("item.where(linkId='1').answer.valueInteger");
      const second = getCompiledFhirPathExpression("item.where(linkId='1').answer.valueInteger");

      expect(first).toBe(second);
      expect(fhirpath.compile).toHaveBeenCalledTimes(1);
    });

    it('Should compile different expressions separately', () => {
      getCompiledFhirPathExpression("item.where(linkId='1').answer.valueInteger");
      getCompiledFhirPathExpression("item.where(linkId='2').answer.valueInteger");

      expect(fhirpath.compile).toHaveBeenCalledTimes(2);
    });

    it('Should compile again after the cache is cleared', () => {
      const first = getCompiledFhirPathExpression("item.where(linkId='1').answer.valueInteger");
      clearCompiledFhirPathExpressionCache();
      const second = getCompiledFhirPathExpression("item.where(linkId='1').answer.valueInteger");

      expect(first).not.toBe(second);
      expect(fhirpath.compile).toHaveBeenCalledTimes(2);
    });

    it('Should not cache an expression that fails to compile', () => {
      expect(() => getCompiledFhirPathExpression('item.where(')).toThrow();
      expect(() => getCompiledFhirPathExpression('item.where(')).toThrow();

      expect(fhirpath.compile).toHaveBeenCalledTimes(2);
    });
  });

  describe('evaluateFhirpathExpressionToGetString', () => {
    it('Should evaluate an expression against the QuestionnaireResponse, as before', () => {
      const result = evaluateFhirpathExpressionToGetString(
        legacyExtension("item.where(linkId='1').answer.valueInteger"),
        questionnaireResponse
      );

      expect(result).toEqual([2]);
    });

    it('Should reuse the compiled expression across evaluations', () => {
      const extension = legacyExtension("item.where(linkId='1').answer.valueInteger");

      evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);
      evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);
      evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);

      expect(fhirpath.compile).toHaveBeenCalledTimes(1);
    });

    it('Should return an empty result when the extension holds no expression', () => {
      expect(evaluateFhirpathExpressionToGetString({ url: CALCULATED_EXPRESSION_URL }, questionnaireResponse)).toEqual([]);
      expect(fhirpath.compile).not.toHaveBeenCalled();
    });

    it('Should read the expression from valueExpression when useLegacyValueString is false', () => {
      const result = evaluateFhirpathExpressionToGetString(
        expressionExtension("item.where(linkId='2').answer.valueInteger"),
        questionnaireResponse,
        false
      );

      expect(result).toEqual([3]);
    });

    describe('environment variables', () => {
      it('Should bind %resource to the QuestionnaireResponse', () => {
        const result = evaluateFhirpathExpressionToGetString(
          legacyExtension("%resource.item.where(linkId='2').answer.valueInteger"),
          questionnaireResponse
        );

        expect(result).toEqual([3]);
      });

      it('Should make caller supplied variables available to the expression', () => {
        const result = evaluateFhirpathExpressionToGetString(
          legacyExtension("%questionnaire.item.where(linkId='1').text"),
          questionnaireResponse,
          true,
          { questionnaire }
        );

        expect(result).toEqual(['Antall dager']);
      });

      it('Should let caller supplied variables win over the defaults', () => {
        const result = evaluateFhirpathExpressionToGetString(legacyExtension('%resource.resourceType'), questionnaireResponse, true, {
          resource: questionnaire,
        });

        expect(result).toEqual(['Questionnaire']);
      });

      it('Should not mutate a resource passed in as a variable', () => {
        const questionnaireCopy = structuredClone(questionnaire);

        evaluateFhirpathExpressionToGetString(legacyExtension("%questionnaire.item.where(linkId='1').text"), questionnaireResponse, true, {
          questionnaire: questionnaireCopy,
        });

        expect(questionnaireCopy).toEqual(questionnaire);
        expect(JSON.stringify(questionnaireCopy)).toEqual(JSON.stringify(questionnaire));
      });

      it('Should report, and not throw, when the expression uses an unknown variable', () => {
        const handler = vi.fn();
        setFhirPathErrorHandler(handler);

        const result = evaluateFhirpathExpressionToGetString(legacyExtension('%patient.name.given'), questionnaireResponse);

        expect(result).toEqual([]);
        expect(handler).toHaveBeenCalledTimes(1);
      });
    });

    describe('error reporting', () => {
      it('Should report an invalid expression instead of failing silently', () => {
        const handler = vi.fn();
        setFhirPathErrorHandler(handler);

        const result = evaluateFhirpathExpressionToGetString(legacyExtension('item.where('), questionnaireResponse);

        expect(result).toEqual([]);
        expect(handler).toHaveBeenCalledTimes(1);
        const [reported] = handler.mock.calls[0] as [FhirPathEvaluationError];
        expect(reported.source).toBe('evaluateFhirpathExpressionToGetString');
        expect(reported.expression).toBe('item.where(');
        expect(reported.error).toBeDefined();
      });

      it('Should log on the console when no handler is registered', () => {
        const result = evaluateFhirpathExpressionToGetString(legacyExtension('item.where('), questionnaireResponse);

        expect(result).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      });

      it('Should keep returning an empty result so rendering is not broken', () => {
        setFhirPathErrorHandler(vi.fn());

        expect(evaluateFhirpathExpressionToGetString(legacyExtension('this is not fhirpath'), questionnaireResponse)).toEqual([]);
      });
    });
  });
  describe('hasDescendants', () => {
    it('Should tell whether the response items have descendants', () => {
      expect(hasDescendants([{ linkId: '1', item: [{ linkId: '1.1' }] }])).toBe(true);
    });

    it('Should return false without evaluating anything when there is nothing to look at', () => {
      expect(hasDescendants(null)).toBe(false);
      expect(hasDescendants(undefined)).toBe(false);
      expect(hasDescendants([])).toBe(false);
    });

    it('Should not write the evaluation result to the console', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      hasDescendants([{ linkId: '1', item: [{ linkId: '1.1' }] }]);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('descendantsHasAnswer', () => {
    it('Should tell whether any descendant carries an answer', () => {
      expect(descendantsHasAnswer([{ linkId: '1', item: [{ linkId: '1.1', answer: [{ valueString: 'a' }] }] }])).toBe(true);
      expect(descendantsHasAnswer([{ linkId: '1', item: [{ linkId: '1.1' }] }])).toBe(false);
    });

    it('Should return false without evaluating anything when there is nothing to look at', () => {
      expect(descendantsHasAnswer(null)).toBe(false);
      expect(descendantsHasAnswer([])).toBe(false);
    });

    it('Should not write to the console', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      descendantsHasAnswer([{ linkId: '1', item: [{ linkId: '1.1', answer: [{ valueString: 'a' }] }] }]);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
