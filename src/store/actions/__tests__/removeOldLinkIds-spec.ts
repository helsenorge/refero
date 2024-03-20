import { syncQuestionnaireResponse } from '../syncQuestionnaireResponse';
import { q, qr, qrWithOldLinkIds } from './__data__/removeOldLinkIds';

describe('Rmove old linkIds (ids with ^ in them) from QuestionnaireResponse', () => {
  it('When the response has linkIds wiht ^, the caret and everything after should be removed', () => {
    let newQr = syncQuestionnaireResponse(q, qrWithOldLinkIds);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });
});
