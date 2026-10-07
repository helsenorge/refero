import { describe, it, expect, afterEach } from 'vitest';

import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { FhirPathExtensions, type AnswerPad } from '../FhirPathExtensions';
import { setFhirPathCalculationOptions, type FhirPathCalculationOptions } from '../fhirPathOptions';

import { Extensions } from '@/constants/extensions';

const calculated = (expression: string): QuestionnaireItem['extension'] => [
  { url: Extensions.CALCULATED_EXPRESSION_URL, valueString: expression },
];

const questionnaireWith = (item: Record<string, unknown>): Questionnaire =>
  ({
    resourceType: 'Questionnaire',
    status: 'active',
    item: [{ linkId: 'a', type: 'integer' }, { linkId: 'b', type: 'integer' }, item],
  }) as unknown as Questionnaire;

const responseWith = (a: number, b: number): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [{ linkId: 'a', answer: [{ valueInteger: a }] }, { linkId: 'b', answer: [{ valueInteger: b }] }, { linkId: 'calculated' }],
});

// The AnswerPad value type is a union, so the tests narrow it once here.
const answersOf = (fhirScores: AnswerPad, linkId = 'calculated'): QuestionnaireResponseItemAnswer[] | null =>
  (fhirScores[linkId] ?? null) as QuestionnaireResponseItemAnswer[] | null;

const firstAnswerOf = (fhirScores: AnswerPad, linkId = 'calculated'): QuestionnaireResponseItemAnswer | undefined =>
  answersOf(fhirScores, linkId)?.[0];

const DIFFERENCE = "item.where(linkId='a').answer.valueInteger.sum() - item.where(linkId='b').answer.valueInteger.sum()";

describe('FhirPathExtensions calculation options', () => {
  afterEach(() => {
    setFhirPathCalculationOptions(undefined);
  });

  describe('keepZeroValues', () => {
    const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'decimal', extension: calculated(DIFFERENCE) });

    it('Legacy: Should drop a calculated decimal 0, so it cannot be told apart from not calculated', () => {
      const fhirScores = new FhirPathExtensions(questionnaire).calculateFhirScore(responseWith(5, 5));

      expect(answersOf(fhirScores)).toHaveLength(1);
      expect(firstAnswerOf(fhirScores)).toStrictEqual({ valueDecimal: undefined });
    });

    it('Should keep a calculated decimal 0 when the option is on', () => {
      const fhirScores = new FhirPathExtensions(questionnaire, { keepZeroValues: true }).calculateFhirScore(responseWith(5, 5));

      expect(firstAnswerOf(fhirScores)).toEqual({ valueDecimal: 0 });
    });

    it('Should leave non zero decimals alone in both modes', () => {
      expect(firstAnswerOf(new FhirPathExtensions(questionnaire).calculateFhirScore(responseWith(7, 2)))).toEqual({ valueDecimal: 5 });
      expect(firstAnswerOf(new FhirPathExtensions(questionnaire, { keepZeroValues: true }).calculateFhirScore(responseWith(7, 2)))).toEqual(
        { valueDecimal: 5 }
      );
    });

    it('Should also keep a negative result in both modes', () => {
      expect(firstAnswerOf(new FhirPathExtensions(questionnaire).calculateFhirScore(responseWith(2, 7)))).toEqual({ valueDecimal: -5 });
      expect(firstAnswerOf(new FhirPathExtensions(questionnaire, { keepZeroValues: true }).calculateFhirScore(responseWith(2, 7)))).toEqual(
        { valueDecimal: -5 }
      );
    });
  });

  describe('omitNonNumericResults', () => {
    const integerQuestionnaire = questionnaireWith({ linkId: 'calculated', type: 'integer', extension: calculated("'ikke et tall'") });
    const decimalQuestionnaire = questionnaireWith({ linkId: 'calculated', type: 'decimal', extension: calculated("'ikke et tall'") });

    it('Legacy: Should turn a non numeric integer result into 0', () => {
      const fhirScores = new FhirPathExtensions(integerQuestionnaire).calculateFhirScore(responseWith(1, 2));

      expect(answersOf(fhirScores)).toEqual([{ valueInteger: 0 }]);
    });

    it('Legacy: Should turn a non numeric decimal result into NaN', () => {
      const fhirScores = new FhirPathExtensions(decimalQuestionnaire).calculateFhirScore(responseWith(1, 2));

      expect(firstAnswerOf(fhirScores)?.valueDecimal).toBeNaN();
    });

    it('Should produce no answer for a non numeric integer result when the option is on', () => {
      const fhirScores = new FhirPathExtensions(integerQuestionnaire, { omitNonNumericResults: true }).calculateFhirScore(
        responseWith(1, 2)
      );

      expect(answersOf(fhirScores)).toBeNull();
    });

    it('Should produce no answer for a non numeric decimal result when the option is on', () => {
      const fhirScores = new FhirPathExtensions(decimalQuestionnaire, { omitNonNumericResults: true }).calculateFhirScore(
        responseWith(1, 2)
      );

      expect(answersOf(fhirScores)).toBeNull();
    });

    it('Should leave numeric results alone when the option is on', () => {
      const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'integer', extension: calculated(DIFFERENCE) });

      const fhirScores = new FhirPathExtensions(questionnaire, { omitNonNumericResults: true }).calculateFhirScore(responseWith(7, 2));

      expect(answersOf(fhirScores)).toEqual([{ valueInteger: 5 }]);
    });
  });

  describe('expressionPriority', () => {
    const bothExpressions = questionnaireWith({
      linkId: 'calculated',
      type: 'string',
      extension: [
        { url: Extensions.CALCULATED_EXPRESSION_URL, valueString: "'fra calculatedExpression'" },
        { url: Extensions.COPY_EXPRESSION_URL, valueString: "'fra copyExpression'" },
      ],
    });

    const scoreOf = (options?: FhirPathCalculationOptions): unknown =>
      new FhirPathExtensions(bothExpressions, options).calculateFhirScore(responseWith(1, 2)).calculated;

    const answerInResponseOf = (options?: FhirPathCalculationOptions): unknown =>
      new FhirPathExtensions(bothExpressions, options).evaluateAllExpressions(responseWith(1, 2)).item?.find(x => x.linkId === 'calculated')
        ?.answer;

    it('Legacy: Should let the two code paths disagree when an item has both expressions', () => {
      expect(scoreOf()).toEqual([{ valueString: 'fra calculatedExpression' }]);
      expect(answerInResponseOf()).toEqual([{ valueString: 'fra copyExpression' }]);
    });

    it('Should use the copy expression in both paths when copy-first is chosen', () => {
      const options: FhirPathCalculationOptions = { expressionPriority: 'copy-first' };

      expect(scoreOf(options)).toEqual([{ valueString: 'fra copyExpression' }]);
      expect(answerInResponseOf(options)).toEqual([{ valueString: 'fra copyExpression' }]);
    });

    it('Should use the calculated expression in both paths when calculated-first is chosen', () => {
      const options: FhirPathCalculationOptions = { expressionPriority: 'calculated-first' };

      expect(scoreOf(options)).toEqual([{ valueString: 'fra calculatedExpression' }]);
      expect(answerInResponseOf(options)).toEqual([{ valueString: 'fra calculatedExpression' }]);
    });

    it('Should not change items that only carry one of the expressions', () => {
      const onlyCalculated = questionnaireWith({ linkId: 'calculated', type: 'string', extension: calculated("'bare calculated'") });

      for (const priority of ['legacy', 'copy-first', 'calculated-first'] as const) {
        expect(new FhirPathExtensions(onlyCalculated, { expressionPriority: priority }).calculateFhirScore(responseWith(1, 2))).toEqual({
          calculated: [{ valueString: 'bare calculated' }],
        });
      }
    });
  });

  describe('application wide options', () => {
    it('Should be picked up by an engine that is given no options of its own', () => {
      const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'decimal', extension: calculated(DIFFERENCE) });
      setFhirPathCalculationOptions({ keepZeroValues: true });

      expect(firstAnswerOf(new FhirPathExtensions(questionnaire).calculateFhirScore(responseWith(5, 5)))).toEqual({ valueDecimal: 0 });
    });

    it('Should be overridable per engine', () => {
      const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'decimal', extension: calculated(DIFFERENCE) });
      setFhirPathCalculationOptions({ keepZeroValues: true });

      expect(
        firstAnswerOf(new FhirPathExtensions(questionnaire, { keepZeroValues: false }).calculateFhirScore(responseWith(5, 5)))
      ).toStrictEqual({ valueDecimal: undefined });
    });
  });
  describe('numeric conversion of integer results', () => {
    // The integer branch was rewritten when the options were introduced. These
    // pin the coercions it has always done, so a regression in the legacy path
    // fails here rather than in a form.
    it.each([
      ['3.4', 3],
      ['3.5', 4],
      ['-3.5', -3],
      ["'3.7'", 4],
      ["'abc'", 0],
      ['1 > 0', 1],
      ['1 < 0', 0],
    ])('Legacy: Should turn the result of %s into %s', (expression, expected) => {
      const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'integer', extension: calculated(expression) });

      expect(answersOf(new FhirPathExtensions(questionnaire).calculateFhirScore(responseWith(1, 2)))).toEqual([{ valueInteger: expected }]);
    });

    it('Should keep coercing booleans when omitNonNumericResults is on, since they convert to a finite number', () => {
      const questionnaire = questionnaireWith({ linkId: 'calculated', type: 'integer', extension: calculated('1 > 0') });

      expect(
        answersOf(new FhirPathExtensions(questionnaire, { omitNonNumericResults: true }).calculateFhirScore(responseWith(1, 2)))
      ).toEqual([{ valueInteger: 1 }]);
    });
  });
});
