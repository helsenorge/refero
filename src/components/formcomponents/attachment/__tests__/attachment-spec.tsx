import { QuestionnaireItem } from '../../../../types/fhir';
import { getMaxSizeExtensionValue } from '../../../../util/extension';

describe('Attachment form component', () => {
  const questionExtention: QuestionnaireItem = {
    linkId: '4c71df6e-d743-46ba-d81f-f62777ffddb4',
    type: 'attachment',
    text: '5mb',
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/maxSize',
        valueDecimal: 5,
      },
    ],
  };
  it('Should give back right value from extention in MB', () => {
    const test = getMaxSizeExtensionValue(questionExtention);
    expect(test).toBe(5);
  });
  const question: QuestionnaireItem = {
    linkId: '4c71df6e-d743-46ba-d81f-f62777ffddb4',
    type: 'attachment',
    text: 'No extention',
  };
  it('Should fail to undefined without extention', () => {
    const test = getMaxSizeExtensionValue(question);
    expect(test).toBe(undefined);
  });
});
