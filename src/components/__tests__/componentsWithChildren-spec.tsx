import { mount } from 'enzyme';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { Store, Provider } from 'react-redux';
import { SkjemautfyllerContainer } from '../../components';
import * as React from 'react';
import { Resources } from '../../util/resources';
import { Questionnaire, QuestionnaireItem, QuestionnaireItemTypeList, Extension, Coding, uri, Reference } from '../../types/fhir';
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

describe('Components render children', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('attachments with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('attachment'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Attachment)).toHaveLength(3);
  });

  it('booleans with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('boolean'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Boolean)).toHaveLength(3);
  });

  it('date with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('date'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Date)).toHaveLength(3);
  });

  it('time with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('time'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Time)).toHaveLength(3);
  });

  it('dateTime with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('dateTime'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(DateTime)).toHaveLength(3);
  });

  it('decimal with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('decimal'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Decimal)).toHaveLength(3);
  });

  it('integer with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('integer'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Integer)).toHaveLength(3);
  });

  it('quantity with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('quantity'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Quantity)).toHaveLength(3);
  });

  it('string with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('string'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(StringComponent)).toHaveLength(3);
  });

  it('text with children renders', () => {
    var q = createQuestionnaire(creatNestedItem('text'));
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Text)).toHaveLength(3);
  });

  it('radio-button choice with children renders', () => {
    var item = createNestedChoiceItem('choice', createItemControlExtension('radio-button'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(3);
  });

  it('check-box choice with children renders', () => {
    var item = createNestedChoiceItem('choice', createItemControlExtension('check-box'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(3);
  });

  it('drop-down choice with children renders', () => {
    var item = createNestedChoiceItem('choice', createItemControlExtension('drop-down'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(Choice)).toHaveLength(3);
  });

  it('radio-button open-choice with children renders', () => {
    var item = createNestedChoiceItem('open-choice', createItemControlExtension('radio-button'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(3);
  });

  it('check-box open-choice with children renders', () => {
    var item = createNestedChoiceItem('open-choice', createItemControlExtension('check-box'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(3);
  });

  it('drop-down open-choice with children renders', () => {
    var item = createNestedChoiceItem('open-choice', createItemControlExtension('drop-down'));
    var q = createQuestionnaire(item);
    var wrapper = createWrapper(q);

    wrapper.render();

    expect(wrapper.find(OpenChoice)).toHaveLength(3);
  });
});

function createItemControlExtension(code: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: {
      coding: [createItemControlCoding(code)],
    },
  } as Extension;
}

function createItemControlCoding(code: string): Coding {
  return {
    code: code,
    system: { value: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' } as uri,
  } as Coding;
}

function creatNestedItem(type: QuestionnaireItemTypeList, ...withExtensions: Extension[]): QuestionnaireItem {
  return createItem(
    type,
    '1',
    withExtensions,
    undefined,
    createItem(type, '2', withExtensions, undefined, createItem(type, '3', withExtensions, undefined))
  );
}

function createNestedChoiceItem(type: QuestionnaireItemTypeList, ...withExtensions: Extension[]): QuestionnaireItem {
  var reference = { reference: '#8459' } as Reference;
  return createItem(
    type,
    '1',
    withExtensions,
    reference,
    createItem(type, '2', withExtensions, reference, createItem(type, '3', withExtensions, reference))
  );
}

function createQuestionnaire(...items: QuestionnaireItem[]): Questionnaire {
  return {
    status: 'draft',
    item: items,
    contained: [Valueset],
  } as Questionnaire;
}

function createItem(
  type: QuestionnaireItemTypeList,
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
  let store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <SkjemautfyllerContainer
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
