import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { Provider, Store } from 'react-redux';
import { SkjemautfyllerContainer } from '../index';
import { Resources } from '../../util/resources';
import { Questionnaire, QuestionnaireItem, uri, Coding, Extension } from '../../types/fhir';
import HelpButton from '../help-button/help-button';
import itemControlConstants from '../../constants/itemcontrol';

describe('Component renders help items', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('help button should be visible and control the help element', () => {
    let expectedOpeningStatus: boolean = false;

    let helpButtonCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return <div className="helpButton">help button</div>;
    };

    let helpElementCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return opening ? <div className="helpElement">help element</div> : <React.Fragment />;
    };

    // Render schema with 1 help button
    let wrapper = createWrapper(helpButtonCb, helpElementCb);
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

function createWrapper(
  helpButtonCb: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
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
        questionnaire={questinnaire()}
        onRequestHelpButton={helpButtonCb}
        onRequestHelpElement={helpElementCb}
      />
    </Provider>
  );
}

function questinnaire(): Questionnaire {
  return {
    resourceType: 'questionnaire',
    status: { value: 'active' },
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
          system: { value: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' } as uri,
          code: 'help',
        },
      ],
    },
  } as Extension;
}
