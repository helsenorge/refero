import { QuestionnaireItem } from '../../../../types/fhir';
import { getMaxSizeExtensionValue } from '../../../../util/extension';

describe('Attachment form component', () => {
  const question: QuestionnaireItem = {
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
  it('Should give back right value in MB',
    () => {
      const test = getMaxSizeExtensionValue(question);
      expect(test).toBe(5);
    });
});
