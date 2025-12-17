import type { QuestionnaireItem, Extension } from 'fhir/r4';

import { Extensions } from '../../constants/extensions';
import { getExtension, getCopyExtension } from '../extension';

describe('extensions', () => {
  describe('getExtension', () => {
    it('should return correct extension', () => {
      const extension: Extension = {
        url: Extensions.VALIDATIONTEXT_URL,
        valueString: 'Du må fylle ut feltet',
      };
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getExtension(Extensions.VALIDATIONTEXT_URL, item)).toEqual(extension);
    });
  });

  describe('getCopyExtension', () => {
    it('should return extension', () => {
      const extension: Extension = {
        url: Extensions.COPY_EXPRESSION_URL,
        valueString: 'Du må fylle ut feltet',
      };
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getCopyExtension(item)).toEqual(extension);
    });
    it('should return extension with expression', () => {
      const extension: Extension = {
        url: Extensions.COPY_EXPRESSION_URL,
        valueExpression: { expression: 'today()', language: 'text/fhirpath' },
      };
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getCopyExtension(item, false)).toEqual(extension);
    });
  });
});
