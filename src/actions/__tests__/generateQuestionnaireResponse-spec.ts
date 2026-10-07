import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { evaluateCalculatedExpressions } from '../generateQuestionnaireResponse';
import { q as questionnaire, qr as questionnaireResponse } from './__data__/genereateQuestionnaireResponse';

import { Extensions } from '@/constants/extensions';
import { setFhirPathCalculationOptions } from '@/util/fhirPathOptions';

describe('evaluateCalculatedExpressions with calculation options', () => {
  afterEach(() => {
    setFhirPathCalculationOptions(undefined);
  });

  const questionnaireWith = (type: string, extension: { url: string; valueString: string }[]): Questionnaire =>
    ({
      resourceType: 'Questionnaire',
      status: 'active',
      item: [{ linkId: 'calculated', type, extension }],
    }) as unknown as Questionnaire;

  const emptyResponse = (): QuestionnaireResponse => ({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [{ linkId: 'calculated' }],
  });

  const bothExtensions = [
    { url: Extensions.CALCULATED_EXPRESSION_URL, valueString: '2' },
    { url: Extensions.COPY_EXPRESSION_URL, valueString: '1' },
  ];

  it('Legacy: Should prefer the copy expression when an item has both', () => {
    const result = evaluateCalculatedExpressions(questionnaireWith('integer', bothExtensions), emptyResponse());

    expect(result.item?.[0].answer).toEqual([{ valueInteger: 1 }]);
  });

  it('Should prefer the copy expression with expressionPriority copy-first', () => {
    setFhirPathCalculationOptions({ expressionPriority: 'copy-first' });
    const result = evaluateCalculatedExpressions(questionnaireWith('integer', bothExtensions), emptyResponse());

    expect(result.item?.[0].answer).toEqual([{ valueInteger: 1 }]);
  });

  it('Should prefer the calculated expression with expressionPriority calculated-first', () => {
    setFhirPathCalculationOptions({ expressionPriority: 'calculated-first' });
    const result = evaluateCalculatedExpressions(questionnaireWith('integer', bothExtensions), emptyResponse());

    expect(result.item?.[0].answer).toEqual([{ valueInteger: 2 }]);
  });

  it.each(['integer', 'decimal'])('Legacy: Should produce NaN for a non numeric %s result', type => {
    const extension = [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: "'abc'" }];
    const result = evaluateCalculatedExpressions(questionnaireWith(type, extension), emptyResponse());

    const answer = result.item?.[0].answer?.[0];
    expect(Number.isNaN(type === 'integer' ? answer?.valueInteger : answer?.valueDecimal)).toBe(true);
  });

  it.each(['integer', 'decimal'])('Should produce no answer for a non numeric %s result with omitNonNumericResults', type => {
    setFhirPathCalculationOptions({ omitNonNumericResults: true });
    const extension = [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: "'abc'" }];
    const result = evaluateCalculatedExpressions(questionnaireWith(type, extension), emptyResponse());

    expect(result.item?.[0].answer).toBeUndefined();
  });

  it('Should keep numeric results with omitNonNumericResults', () => {
    setFhirPathCalculationOptions({ omitNonNumericResults: true });
    const extension = [{ url: Extensions.CALCULATED_EXPRESSION_URL, valueString: '0' }];
    const result = evaluateCalculatedExpressions(questionnaireWith('decimal', extension), emptyResponse());

    expect(result.item?.[0].answer).toEqual([{ valueDecimal: 0 }]);
  });
});

describe('evaluateCalculatedExpressions', () => {
  it('should update the calculated boolean field (linkId "1.4")', () => {
    const qrCopy = JSON.parse(JSON.stringify(questionnaireResponse));
    const updatedQR = evaluateCalculatedExpressions(questionnaire, qrCopy);

    const personGroup = updatedQR.item?.find(item => item.linkId === '2');
    expect(personGroup).toBeDefined();

    const item14 = personGroup?.item?.find(item => item.linkId === '1.4');
    expect(item14).toBeDefined();

    expect(item14?.answer?.[0].valueBoolean).toBe(false);
  });

  it('should preserve manually entered answers (email, weight, height)', () => {
    const qrCopy = JSON.parse(JSON.stringify(questionnaireResponse));
    const updatedQR = evaluateCalculatedExpressions(questionnaire, qrCopy);
    // console.log(updatedQR);
    const personGroup = updatedQR.item?.find(item => item.linkId === '2');

    expect(personGroup).toBeDefined();

    // Email answer should remain unchanged.
    const emailItem = personGroup?.item?.find(item => item.linkId === '2.4');
    expect(emailItem).toBeDefined();
    expect(emailItem?.answer?.[0].valueString).toBe('enepost@epost.no');

    // Weight and height answers should remain unchanged.
    const weightItem = personGroup?.item?.find(item => item.linkId === '2.6');
    expect(weightItem).toBeDefined();
    expect(weightItem?.answer?.[0].valueQuantity?.value).toBe(100);

    const heightItem = personGroup?.item?.find(item => item.linkId === '2.7');
    expect(heightItem).toBeDefined();
    expect(heightItem?.answer?.[0].valueQuantity?.value).toBe(180);
  });

  it('should leave unanswered items unchanged', () => {
    const qrCopy = JSON.parse(JSON.stringify(questionnaireResponse));
    const updatedQR = evaluateCalculatedExpressions(questionnaire, qrCopy);

    // Example: In group "400", item "400.50" (attachment) has no answer.
    const group400 = updatedQR.item?.find(item => item.linkId === '400');
    if (group400 && group400.item) {
      const attachmentItem = group400.item.find(item => item.linkId === '400.50');
      expect(attachmentItem?.answer).toBeUndefined();
    }
  });
});
