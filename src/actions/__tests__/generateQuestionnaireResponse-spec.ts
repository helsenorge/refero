import { evaluateCalculatedExpressions } from '../generateQuestionnaireResponse';
import { q as questionnaire, qr as questionnaireResponse } from './__data__/genereateQuestionnaireResponse';

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
