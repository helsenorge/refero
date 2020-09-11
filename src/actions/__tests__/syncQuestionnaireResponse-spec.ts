import { syncQuestionnaireResponse } from '../syncQuestionnaireResponse';
import {
  q,
  qr,
  qrMissingFieldFromTopLevelGroup,
  qrMissingGroupFromTopLevelGroup,
  qrMissingNestedFieldFromTopLevelField,
  qrMissingTopLevelField,
  qrMissingTopLevelGroup,
  qrTypeChanged,
  qrSuperfluousNestedField,
  qrSuperfluousTopLevelField,
} from './__data__/syncQuestionnaireResponse';

describe('Reflects changes on Questionnaire in QuestionnaireResponse', () => {
  it('When the response is missing a group-item on top level, it should be created', () => {
    let newQr = syncQuestionnaireResponse(q, qrMissingTopLevelGroup);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response is missing a field-item on top level, it should be created', () => {
    let newQr = syncQuestionnaireResponse(q, qrMissingFieldFromTopLevelGroup);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response is missing a field-item on top level, it should be created', () => {
    let newQr = syncQuestionnaireResponse(q, qrMissingTopLevelField);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response is missing a group-item inside a top level item, it should be created', () => {
    let newQr = syncQuestionnaireResponse(q, qrMissingGroupFromTopLevelGroup);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response is missing a field-item inside a top level item, it should be created', () => {
    let newQr = syncQuestionnaireResponse(q, qrMissingNestedFieldFromTopLevelField);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the type of an item has been changed, the item should be recreated', () => {
    let newQr = syncQuestionnaireResponse(q, qrTypeChanged);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response has a superfluous top level item, it should be deleted', () => {
    let newQr = syncQuestionnaireResponse(q, qrSuperfluousTopLevelField);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });

  it('When the response has a superfluous nested item, it should be deleted', () => {
    let newQr = syncQuestionnaireResponse(q, qrSuperfluousNestedField);
    expect(newQr).toMatchObject(qr);
    expect(qr).toMatchObject(newQr);
  });
});
