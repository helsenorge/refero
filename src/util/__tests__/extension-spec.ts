import extensionConstants from '../../constants/extensions';
import { QuestionnaireItem, Extension } from '../../types/fhir';
import {
  getValidationTextExtension,
  getExtension,
  getPlaceholder,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getMinOccursExtensionValue,
  getMaxOccursExtensionValue,
  getMinLengthExtensionValue,
  getRepeatsTextExtension,
  getRegexExtension,
  getCopyExtension,
} from '../extension';

describe('extensions', () => {
  describe('getValidationTextExtension', () => {
    it('should return validation text', () => {
      const extension: Extension = {
        url: extensionConstants.VALIDATIONTEXT_URL,
        valueString: 'Du må fylle ut feltet',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getValidationTextExtension(item)).toMatchSnapshot();
    });
  });

  describe('getExtension', () => {
    it('should return correct extension', () => {
      const extension: Extension = {
        url: extensionConstants.VALIDATIONTEXT_URL,
        valueString: 'Du må fylle ut feltet',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getExtension(extensionConstants.VALIDATIONTEXT_URL, item)).toEqual(extension);
    });
  });

  describe('getPlaceholder', () => {
    it('should return placeholder', () => {
      const extension: Extension = {
        url: extensionConstants.ENTRY_FORMAT_URL,
        valueString: 'placeholdervalue',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getPlaceholder(item)).toMatchSnapshot();
    });
  });

  describe('getMaxValueExtensionValue', () => {
    it('should return max value', () => {
      const valueInteger = 2;
      const extension: Extension = {
        url: extensionConstants.MAX_VALUE_URL,
        valueInteger,
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getMaxValueExtensionValue(item)).toMatchSnapshot();
    });
  });

  describe('getMinValueExtensionValue', () => {
    it('should return min value', () => {
      const valueInteger = 2;
      const extension: Extension = {
        url: extensionConstants.MIN_VALUE_URL,
        valueInteger,
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getMinValueExtensionValue(item)).toMatchSnapshot();
    });
  });

  describe('getMinOccursExtensionValue', () => {
    it('should return min occurs value', () => {
      const valueInteger = 2;
      const extension: Extension = {
        url: extensionConstants.MIN_OCCURS_URL,
        valueInteger,
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getMinOccursExtensionValue(item)).toMatchSnapshot();
    });
  });

  describe('getMaxOccursExtensionValue', () => {
    it('should return max occurs value', () => {
      const valueInteger = 2;
      const extension: Extension = {
        url: extensionConstants.MAX_OCCURS_URL,
        valueInteger,
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getMaxOccursExtensionValue(item)).toMatchSnapshot();
    });
  });

  describe('getMinLengthExtensionValue', () => {
    it('should return min length value', () => {
      const valueInteger = 2;
      const extension: Extension = {
        url: extensionConstants.MIN_LENGTH_URL,
        valueInteger,
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getMinLengthExtensionValue(item)).toMatchSnapshot();
    });
  });

  describe('getRepeatsTextExtension', () => {
    it('should return repeats text', () => {
      const extension: Extension = {
        url: extensionConstants.REPEATSTEXT_URL,
        valueString: 'repeats text',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getRepeatsTextExtension(item)).toMatchSnapshot();
    });
  });

  describe('getRegexExtension', () => {
    it('should return regex', () => {
      const extension: Extension = {
        url: extensionConstants.REGEX_URL,
        valueString: 'regex',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getRegexExtension(item)).toMatchSnapshot();
    });
  });

  describe('getCopyExtension', () => {
    it('should return extension', () => {
      const extension: Extension = {
        url: extensionConstants.Copy_EXPRESSION,
        valueString: 'Du må fylle ut feltet',
      } as Extension;
      const item: QuestionnaireItem = {
        linkId: '2.1',
        type: 'group',
        extension: [extension],
      };
      expect(getCopyExtension(item)).toEqual(extension);
    });
  });
});
