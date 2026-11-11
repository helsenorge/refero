import { describe, it, expect } from 'vitest';

import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { FhirPathExtensions, type AnswerPad } from '../FhirPathExtensions';

import { Extensions } from '@/constants/extensions';

const coding = { system: 'urn:test', code: 'a', display: 'A' };

const SOURCE_STRING = "item.where(linkId='src').answer.valueString";
const SOURCE_CODING = "item.where(linkId='coded').answer.valueCoding";

const questionnaireWithTarget = (type: string, url: string, expression: string): Questionnaire =>
  ({
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      { linkId: 'src', type: 'string' },
      { linkId: 'coded', type: 'choice' },
      { linkId: 'target', type, extension: [{ url, valueString: expression }] },
    ],
  }) as unknown as Questionnaire;

const answeredResponse = (): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [{ linkId: 'src', answer: [{ valueString: 'Ola' }] }, { linkId: 'coded', answer: [{ valueCoding: coding }] }, { linkId: 'target' }],
});

const answersOf = (fhirScores: AnswerPad): QuestionnaireResponseItemAnswer[] | null =>
  (fhirScores['target'] ?? null) as QuestionnaireResponseItemAnswer[] | null;

describe.each([
  ['cqf-expression', Extensions.COPY_EXPRESSION_URL],
  ['sdf-calculatedExpression', Extensions.CALCULATED_EXPRESSION_URL],
])('FhirPathExtensions with %s', (_name, url) => {
  describe.each([
    ['string', SOURCE_STRING, { valueString: 'Ola' }],
    ['integer', `${SOURCE_STRING}.length()`, { valueInteger: 3 }],
    ['boolean', `${SOURCE_STRING}.exists()`, { valueBoolean: true }],
    ['choice', SOURCE_CODING, { valueCoding: coding }],
  ])('on a %s item', (type, expression, expected) => {
    const questionnaire = questionnaireWithTarget(type, url, expression);

    it('Should still calculate the answer in calculateFhirScore', () => {
      expect(answersOf(new FhirPathExtensions(questionnaire).calculateFhirScore(answeredResponse()))).toEqual([expected]);
    });

    it('Should still write the answer in evaluateAllExpressions', () => {
      const result = new FhirPathExtensions(questionnaire).evaluateAllExpressions(answeredResponse());

      expect(result.item?.[2].answer).toEqual([expected]);
    });
  });

  describe('on a display item, which cannot have answers in FHIR R4', () => {
    const questionnaire = questionnaireWithTarget('display', url, SOURCE_STRING);

    it('Should leave the item out of the calculateFhirScore result', () => {
      const fhirScores = new FhirPathExtensions(questionnaire).calculateFhirScore(answeredResponse());

      expect(Object.keys(fhirScores)).not.toContain('target');
    });

    it('Should leave the item without an answer in evaluateAllExpressions', () => {
      const result = new FhirPathExtensions(questionnaire).evaluateAllExpressions(answeredResponse());

      expect(result.item?.[2].answer).toBeUndefined();
    });
  });
});
