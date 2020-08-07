import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { SkjemautfyllerContainer } from '../index';
import { Resources } from '../../util/resources';
import { Questionnaire, QuestionnaireItem, Extension, QuestionnaireItemEnableWhen } from '../../types/fhir';
import HelpButton from '../help-button/help-button';
import itemControlConstants from '../../constants/itemcontrol';
import { RepeatButton as RepeatButtonInstance } from '../../components/formcomponents/repeat/repeat-button';
import Boolean from '../../components/formcomponents/boolean/boolean';

describe('Component renders help items', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('help button should be visible and control the help element', () => {
    let expectedOpeningStatus: boolean = false;

    const helpButtonCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return <div className="helpButton">{'help button'}</div>;
    };

    const helpElementCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return opening ? <div className="helpElement">{'help element'}</div> : <React.Fragment />;
    };

    // Render schema with 1 help button
    const wrapper = createWrapper(questionnaireWithHelp(), helpButtonCb, helpElementCb);
    wrapper.render();

    expect(wrapper.find('.helpButton')).toHaveLength(1);
    expect(wrapper.find('.helpElement')).toHaveLength(0);

    // click help button to open the help element
    expectedOpeningStatus = true;
    wrapper.find(HelpButton).simulate('click');
    expect(wrapper.find('.helpElement')).toHaveLength(1);

    // click help button to close the help element
    expectedOpeningStatus = false;
    wrapper.find(HelpButton).simulate('click');
    expect(wrapper.find('.helpElement')).toHaveLength(0);
  });
});

describe('repeat with enableWhen', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('When we add a section with repeat, the enableWhen component should be hidden per default', () => {
    const wrapper = createWrapper(questionnaireWithRepeatedEnableWhens());
    wrapper.render();

    // clicking the repeat button, repeats the elements
    expect(wrapper.find(Boolean)).toHaveLength(1);

    wrapper.find(RepeatButtonInstance).simulate('click');
    expect(wrapper.find(Boolean)).toHaveLength(2);

    // no enableWhen components should be visible
    expect(wrapper.find(SafeInputField)).toHaveLength(0);

    // Click first boolean input, and enableWhen component should be enabled
    wrapper
      .find("input[type='checkbox']")
      .first()
      .simulate('change', { taget: { checked: true } });
    expect(wrapper.find(SafeInputField)).toHaveLength(1);

    // Click last boolean input, and enableWhen component should be enabled
    wrapper
      .find("input[type='checkbox']")
      .last()
      .simulate('change', { target: { checked: true } });
    expect(wrapper.find(SafeInputField)).toHaveLength(2);
  });
});

function createWrapper(
  questionnaire: Questionnaire,
  helpButtonCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
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
        questionnaire={questionnaire}
        onRequestHelpButton={helpButtonCb}
        onRequestHelpElement={helpElementCb}
      />
    </Provider>
  );
}

function questionnaireWithRepeatedEnableWhens(): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: '8',
        text: 'Gruppe',
        type: 'group',
        item: [
          {
            linkId: '8.1',
            text: 'Gruppe med repeat',
            type: 'group',
            repeats: true,
            item: [
              {
                linkId: '8.1.1',
                text: 'Checkbox',
                type: 'boolean',
              },
              {
                linkId: '8.1.2',
                text: 'enableWhen',
                type: 'string',
                enableBehavior: 'any',
                enableWhen: [
                  {
                    question: '8.1.1',
                    answerBoolean: true,
                  } as QuestionnaireItemEnableWhen,
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function questionnaireWithHelp(): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: '1',
        type: 'group',
        text: 'Group Header',
        item: [
          {
            linkId: '1.1',
            type: 'text',
            text: 'help text',
            extension: [helpExtension()],
          },
        ],
      } as QuestionnaireItem,
    ],
  };
}

function helpExtension(): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control',
          code: 'help',
        },
      ],
    },
  } as Extension;
}
