import extensionConstants from '../../constants/extensions';
import itemcontrol from '../../constants/itemcontrol';
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
  getLinkIdFromCopyExpression,
  isDataReceiver,
} from '../extension';
import { createItemControlExtension } from '../../components/__tests__/utils';

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
});

describe('isDataReceiver', () => {
  it('ItemControl is Datareceiver, should return true', () => {
    const extension = createItemControlExtension(itemcontrol.DATARECEIVER);
    const item: QuestionnaireItem = {
      linkId: '2.1',
      type: 'string',
      extension: [extension],
    };

    expect(isDataReceiver(item)).toBeTruthy();
  });

  it('ItemControl is help, should return false', () => {
    const extension = createItemControlExtension(itemcontrol.HELP);
    const item: QuestionnaireItem = {
      linkId: '2.1',
      type: 'string',
      extension: [extension],
    };

    expect(isDataReceiver(item)).toBeFalsy();
  });
});

describe('getLinkIdFromCopyExpression', () => {
  const testData = [
    { input: 'valueInteger', itemType: 'integer' },
    { input: 'value', itemType: 'quantity' },
    { input: 'valueDecimal', itemType: 'decimal' },
    { input: 'valueDateTime', itemType: 'date' },
    { input: 'valueTime', itemType: 'time' },
    { input: 'valueString', itemType: 'text' },
    { input: 'valueString', itemType: 'string' },
    { input: 'choice', itemType: 'valueCoding.system' },
  ];

  test.each(testData)('Questionnaire ItemType is %s', data => {
    const extension = {
      url: extensionConstants.Copy_EXPRESSION,
      valueString: `QuestionnaireResponse.descendants().where(linkId='24655ca8-7802-47d2-80a0-faa5bd6d0645').answer.value.${data.input}}`,
    };
    const item: QuestionnaireItem = {
      linkId: '2.1',
      type: data.itemType,
      extension: [extension],
    };
    expect(getLinkIdFromCopyExpression(item)).toBe('24655ca8-7802-47d2-80a0-faa5bd6d0645');
  });
});
