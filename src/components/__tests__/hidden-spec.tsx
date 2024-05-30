import '../../util/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension, Reference } from 'fhir/r4';
import Choice from '../formcomponents/choice/choice';
import Boolean from '../formcomponents/boolean/boolean';
import Decimal from '../formcomponents/decimal/decimal';
import Integer from '../formcomponents/integer/integer';
import Date from '../formcomponents/date/date';
import Time from '../formcomponents/date/time';
import DateTime from '../formcomponents/date/date-time';
import StringComponent from '../formcomponents/string/string';
import Text from '../formcomponents/text/text';
import OpenChoice from '../formcomponents/open-choice/open-choice';
import Attachment from '../formcomponents/attachment/attachment';
import Quantity from '../formcomponents/quantity/quantity';
import Valueset from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createItemControlExtension } from '../__tests__/utils';
import ItemType from '../../constants/itemType';
import { renderRefero } from './test-utils/test-utils';

describe('Hidden components should not render', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('unhidden attachment renders', () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden attachment does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden boolean renders', () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden boolean does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden date renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden date does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden time renders', () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden time does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden dateTime renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden dateTime does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden decimal renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden decimal does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden integer renders', () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden integer does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden quantity renders', () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden quantity does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden string renders', () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden string does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden text renders', () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(false)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden text does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden radio-button choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden radio-button choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden check-box choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden check-box choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden drop-down choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden drop-down choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden radio-button open-choice renders', () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(false)
    );
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden radio-button open-choice does not render', () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(true)
    );
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden check-box open-choice renders', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden check-box open-choice does not render', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });

  it('unhidden drop-down open-choice renders', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).toBeInTheDocument();
  });

  it('hidden drop-down open-choice does not render', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText('1')).not.toBeInTheDocument();
  });
});

function createQuestionnaireHiddenExtension(value: boolean): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
    valueBoolean: value,
  } as Extension;
}

function createItem(type: string, ...withExtensions: Extension[]): QuestionnaireItem {
  return _createItem(type, '1', withExtensions, undefined);
}

function createChoiceItem(type: string, ...withExtensions: Extension[]): QuestionnaireItem {
  const reference = { reference: '#8459' } as Reference;
  return _createItem(type, '1', withExtensions, reference);
}

function createQuestionnaire(...items: QuestionnaireItem[]): Questionnaire {
  return {
    status: 'draft',
    item: items,
    contained: [Valueset],
  } as Questionnaire;
}

function _createItem(
  type: string,
  text: string,
  extensions: Extension[],
  options: Reference | undefined,
  ...children: QuestionnaireItem[]
): QuestionnaireItem {
  return {
    linkId: '1',
    type: type,
    text: text,
    item: children,
    extension: extensions,
    options: options,
  } as QuestionnaireItem;
}

function createWrapper(q: Questionnaire) {
  return renderRefero({ questionnaire: q });
}
