import * as React from 'react';

import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { Questionnaire, QuestionnaireItem, QuestionnaireItemEnableWhen } from '../../types/fhir';

import SafeInputField from '@helsenorge/form/components/safe-input-field';

import '../../util/defineFetch';
import Boolean from '../../components/formcomponents/boolean/boolean';
import { RepeatButton as RepeatButtonInstance } from '../../components/formcomponents/repeat/repeat-button';
import itemControlConstants from '../../constants/itemcontrol';
import rootReducer from '../../reducers';
import { Resources } from '../../util/resources';
import HelpButton from '../help-button/help-button';
import TextView from '../formcomponents/textview';
import { ReferoContainer } from '../index';
import RenderingOptionsData from './__data__/renderingOptions';
import ChoiceCopyFrom from './__data__/copyFrom/choice';
import { createItemControlExtension, selectCheckBoxOption } from '../__tests__/utils';
import itemcontrol from '../../constants/itemcontrol';

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

describe('Coding system (RenderingOptions)', () => {
  it('Only displayes items that have system code as KunSkjemautfyll or Default', () => {
    const wrapper = createWrapper(RenderingOptionsData);
    wrapper.render();

    expect(wrapper.find('#item_group1_default').exists()).toBeTruthy();
    expect(wrapper.find('#item_group1_default_text').exists()).toBeTruthy();
    expect(wrapper.find('#item_group1_default_checkbox').exists()).toBeTruthy();
    expect(wrapper.find('#item_group2').exists()).toBeTruthy();
    expect(wrapper.find('#item_group2_kunskjemautfyll_text').exists()).toBeTruthy();
    expect(wrapper.find('#item_group4_kunskjemautfyll').exists()).toBeTruthy();
    expect(wrapper.find('#item_group4_kunskjemautfyll_text').exists()).toBeTruthy();
    expect(wrapper.find('#item_group4_kunskjemautfyll_checkbox').exists()).toBeTruthy();

    expect(wrapper.find('#item_group2_kunpdf_checkbox').exists()).toBeFalsy();
    expect(wrapper.find('#item_group3_kunpdf').exists()).toBeFalsy();
    expect(wrapper.find('#item_group3_kunpdf_text').exists()).toBeFalsy();
    expect(wrapper.find('#item_group3_kunpdf_checkbox').exists()).toBeFalsy();
  });
});

describe('Copying from ...', () => {
  describe('Choice', () => {
    it('Choice selected options displays in data-receiver element', () => {
      const wrapper = createWrapper(ChoiceCopyFrom);
      wrapper.render();
      selectCheckBoxOption('parent-choice-id', 'option-1', wrapper);
      wrapper.update();

      const textView = wrapper.find(TextView);
      expect(textView).toHaveLength(1);
      expect(textView.find('#item_data-receiver-choice-id').exists()).toBeTruthy();
    });
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
      <ReferoContainer
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
                    operator: '=',
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
            extension: [createItemControlExtension(itemcontrol.HELP)],
          },
        ],
      } as QuestionnaireItem,
    ],
  };
}
