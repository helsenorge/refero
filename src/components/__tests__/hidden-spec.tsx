import * as React from 'react';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { Store, Provider } from 'react-redux';

import rootReducer from '../../reducers';
import '../../util/defineFetch';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '../../components';
import { Questionnaire, QuestionnaireItem, Extension, Reference } from '../../types/fhir';
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

describe('Hidden components should not render', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('unhidden attachment renders', () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Attachment)).toHaveLength(1);
  });

  it('hidden attachment does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Attachment)).toHaveLength(0);
  });

  it('unhidden boolean renders', () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Boolean)).toHaveLength(1);
  });

  it('hidden boolean does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Boolean)).toHaveLength(0);
  });

  it('unhidden date renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Date)).toHaveLength(1);
  });

  it('hidden date does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Date)).toHaveLength(0);
  });

  it('unhidden time renders', () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Time)).toHaveLength(1);
  });

  it('hidden time does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Time)).toHaveLength(0);
  });

  it('unhidden dateTime renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(DateTime)).toHaveLength(1);
  });

  it('hidden dateTime does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(DateTime)).toHaveLength(0);
  });

  it('unhidden decimal renders', () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Decimal)).toHaveLength(1);
  });

  it('hidden decimal does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Decimal)).toHaveLength(0);
  });

  it('unhidden integer renders', () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Integer)).toHaveLength(1);
  });

  it('hidden integer does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Integer)).toHaveLength(0);
  });

  it('unhidden quantity renders', () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Quantity)).toHaveLength(1);
  });

  it('hidden quantity does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Quantity)).toHaveLength(0);
  });

  it('unhidden string renders', () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(StringComponent)).toHaveLength(1);
  });

  it('hidden string does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(StringComponent)).toHaveLength(0);
  });

  it('unhidden text renders', () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(false)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Text)).toHaveLength(1);
  });

  it('hidden text does not render', () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(true)));
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Text)).toHaveLength(0);
  });

  it('unhidden radio-button choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(1);
  });

  it('hidden radio-button choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(0);
  });

  it('unhidden check-box choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(1);
  });

  it('hidden check-box choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(0);
  });

  it('unhidden drop-down choice renders', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(1);
  });

  it('hidden drop-down choice does not render', () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(0);
  });

  it('unhidden radio-button open-choice renders', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(1);
  });

  it('hidden radio-button open-choice does not render', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(0);
  });

  it('unhidden check-box open-choice renders', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(1);
  });

  it('hidden check-box open-choice does not render', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(0);
  });

  it('unhidden drop-down open-choice renders', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(1);
  });

  it('hidden drop-down open-choice does not render', () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(0);
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
  const store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <ReferoContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={q}
      />
    </Provider>
  );
}
