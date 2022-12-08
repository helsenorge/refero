import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ReactWrapper, mount } from 'enzyme';
import rootReducer from '../../reducers';

import { OpenChoice } from '../formcomponents/open-choice/open-choice';
import {
    QuestionnaireItem,
    QuestionnaireItemAnswerOption,
    QuestionnaireResponseItemAnswer,
    Extension,
    QuestionnaireResponseItem,
  } from '../../types/fhir';
import itemType from '../../constants/itemType';
import '../../util/defineFetch';
import { Path } from '../../util/refero-core';
import { GlobalState } from '../../reducers/index';
import { NewValueAction } from '../../actions/newValue';
import { createIDataReceiverExpressionExtension } from '../__tests__/utils';
import TextView from '../formcomponents/textview';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../constants';

const initAnswer: QuestionnaireResponseItemAnswer[] = [{}];

describe('Open-Choice component render', () => {
    beforeEach(() => {
        window.matchMedia = jest.fn().mockImplementation(_ => {
            return {};
        });
    });

    it('should render data-receiver with coding answer as text', () => {
        const extensions = [createIDataReceiverExpressionExtension('Test')];
        const item = createItemWithExtensions(...extensions);
        item.readOnly = true;
        const answer = [
          { valueCoding: { code:"3", display:"Usikker", system:"urn:oid:2.16.578.1.12.4.1.9523" }}
        ] as QuestionnaireResponseItemAnswer[];
        const wrapper = createWrapperWithItem(item, answer);
        wrapper.render();

        const textView = wrapper.find(TextView);
        expect(textView.props().value).toBe('Usikker');
      });

    it('should render data-receiver with coding and textvalue as text', () => {
        const extensions = [createIDataReceiverExpressionExtension('Test')];
        const item = createItemWithExtensions(...extensions);
        item.readOnly = true;
        const answer = [
            { valueCoding: { code:"3", display:"Usikker", system:"urn:oid:2.16.578.1.12.4.1.9523" }},
            { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM }},
            { valueString: 'Free text' }
        ] as QuestionnaireResponseItemAnswer[];
        const wrapper = createWrapperWithItem(item, answer);
        wrapper.render();

        const textView = wrapper.find(TextView);
        expect(textView.props().value).toBe('Usikker, Free text');
    });

    it('should render valueStrings as input value', () => {
        const option = createValueStringOption('Home', 'Car');
        const item = createItemWithOption(...option);
        const answer = [
            { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM }},
            { valueString: 'Free text' }
        ] as QuestionnaireResponseItemAnswer[];
        const wrapper = createWrapperWithItem(item, answer);
        wrapper.render();

        const input = wrapper.find('input').at(3);
        expect(input.props().type).toBe('text');
        expect(input.props().readOnly).toBeFalsy();
        expect(input.props().value).toBe('Free text');
    });

    it('should render empty valueString as empty input value', () => {
        const option = createValueStringOption('Home', 'Car');
        const item = createItemWithOption(...option);
        const answer = [
            { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM }},
        ] as QuestionnaireResponseItemAnswer[];
        const wrapper = createWrapperWithItem(item, answer);
        wrapper.render();

        const input = wrapper.find('input').at(3);
        expect(input.props().type).toBe('text');
        expect(input.props().readOnly).toBeFalsy();
        expect(input.props().value).toBe('');
    });
});



function createWrapperWithItem(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] = initAnswer): ReactWrapper<{}, {}> {
    const store: any = createStore(rootReducer, applyMiddleware(thunk));
    return mount(
      <Provider store={store}>
        <OpenChoice
          id={item.linkId}
          dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
          answer={answer}
          item={item}
          path={{} as Path[]}
          renderDeleteButton={() => undefined}
          repeatButton={<React.Fragment />}
          renderHelpButton={() => <React.Fragment />}
          renderHelpElement={() => <React.Fragment />}
          onAnswerChange={() => {}}
          responseItem={{} as QuestionnaireResponseItem}
        />
      </Provider>
    );
  }

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
    return options.map(o => {
      return {
        valueCoding: { code: o, display: o },
      } as QuestionnaireItemAnswerOption;
    });
}

function createItemWithOption(...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
    return {
        linkId: '1',
        type: itemType.OPENCHOICE,
        answerOption: options,
    };
}
  
function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
    return {
        linkId: '1',
        type: itemType.OPENCHOICE,
        extension: extensions,
    };
}