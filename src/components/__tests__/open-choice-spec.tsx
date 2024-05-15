import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ReactWrapper, mount } from 'enzyme';
import rootReducer from '../../reducers';

import { OpenChoice } from '../formcomponents/open-choice/open-choice';
import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer, Extension } from 'fhir/r4';
import itemType from '../../constants/itemType';
import '../../util/defineFetch';
import { GlobalState } from '../../reducers/index';
import { NewValueAction } from '../../actions/newValue';
import { createIDataReceiverExpressionExtension } from '../__tests__/utils';
import TextView from '../formcomponents/textview';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../constants';
import { useFormContext, FormProvider, useForm } from 'react-hook-form';

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn(),
}));

const initAnswer: QuestionnaireResponseItemAnswer[] = [{}];
const mockUseFormContext = {
  formState: {},
  getFieldState: jest.fn().mockReturnValue({
    error: undefined,
    invalid: false,
    isDirty: false,
    isTouched: false,
    isValidating: false,
  }),
  control: {},
  register: jest.fn(),
};

(useFormContext as jest.Mock).mockImplementation(() => mockUseFormContext);

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
    const answer = [{ valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } }];
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
      { valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
    ];
    const wrapper = createWrapperWithItem(item, answer);
    wrapper.render();

    const textView = wrapper.find(TextView);
    expect(textView.props().value).toBe('Usikker, Free text');
  });

  it('should render valueStrings as input value', () => {
    const option = createValueStringOption('Home', 'Car');
    const item = createItemWithOption(...option);
    const answer = [
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
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
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
    ] as QuestionnaireResponseItemAnswer[];
    const wrapper = createWrapperWithItem(item, answer);
    wrapper.render();

    const input = wrapper.find('input').at(3);
    expect(input.props().type).toBe('text');
    expect(input.props().readOnly).toBeFalsy();
    expect(input.props().value).toBe('');
  });
});

const FormWrapper = ({ children }: { children: JSX.Element }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

function createWrapperWithItem(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] = initAnswer): ReactWrapper {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <FormWrapper>
        <OpenChoice
          id={item.linkId}
          idWithLinkIdAndItemIndex={item.linkId}
          dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
          answer={answer}
          item={item}
          path={[]}
          renderDeleteButton={() => <></>}
          repeatButton={<React.Fragment />}
          renderHelpButton={() => <React.Fragment />}
          renderHelpElement={() => <React.Fragment />}
          onAnswerChange={() => {}}
          responseItem={{
            linkId: item.linkId,
          }}
        />
      </FormWrapper>
    </Provider>
  );
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueCoding: { code: o, display: o },
    };
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
