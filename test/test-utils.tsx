import React from 'react';
import { ReactElement } from 'react';

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Questionnaire } from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { Provider, Store } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { GlobalState } from '../src/reducers';
import { ReferoProps } from '../src/types/referoProps';
import { Resources } from '../src/util/resources';

const mockStore = configureMockStore<Partial<GlobalState>>([thunk]);

export const FormWrapper = ({ children, defaultValues }: { children: React.ReactNode; defaultValues: any }) => {
  const methods = useForm({
    shouldFocusError: false,
    criteriaMode: 'all',
    defaultValues: defaultValues,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const AllTheProviders = ({
  children,
  initialState = {},
  defaultValues = {},
  store = mockStore(initialState),
}: {
  children: React.ReactNode;
  initialState?: Partial<GlobalState>;
  defaultValues?: any;
  store?: Store<any>;
}) => {
  return (
    <Provider store={store}>
      <FormWrapper defaultValues={defaultValues}>{children}</FormWrapper>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> } & { defaultValues?: any } & {
    store?: Store<any>;
  }
) => {
  const { initialState, defaultValues, store, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialState={initialState} defaultValues={defaultValues} store={store}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};
const customRenderMockStore = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> } & { defaultValues?: any } & {
    store?: Store<any>;
  }
): { renderResult: RenderResult; store: Store<any> } => {
  const { initialState, defaultValues, store = mockStore(initialState || {}), ...renderOptions } = options || {};
  return {
    renderResult: render(ui, {
      wrapper: ({ children }) => (
        <AllTheProviders initialState={initialState} defaultValues={defaultValues} store={store}>
          {children}
        </AllTheProviders>
      ),
      ...renderOptions,
    }),
    store,
  };
};
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  initialState?: Partial<GlobalState>;
  store?: Store<any>;
}
const renderWithRedux = (
  ui: React.ReactElement,
  { initialState, store = createStore(rootReducer, initialState, applyMiddleware(thunk)), ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
};
const renderWithReduxAndHookFormMock = (
  ui: React.ReactElement,
  { initialState, store = createStore(rootReducer, initialState, applyMiddleware(thunk)), ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC = ({ children }) => (
    <Provider store={store}>
      <FormWrapper defaultValues={{}}>{children}</FormWrapper>
    </Provider>
  );
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
};

interface InputProps {
  questionnaire: Questionnaire;
  props?: Partial<ReferoProps>;
  initialState?: GlobalState;
  resources?: Partial<Resources>;
}

function renderRefero({ questionnaire, props, initialState, resources }: InputProps) {
  const resourcesDefault = {
    ...getResources(''),
    ...resources,
  };
  const state = initialState || {
    refero: {
      form: {
        FormDefinition: {
          Content: questionnaire,
        },
        FormData: {
          Content: generateQuestionnaireResponse(questionnaire),
        },
        Language: 'nb',
      },
    },
  };
  const store = createStore(rootReducer, state, applyMiddleware(thunk));
  const defaultValues = generateDefaultValues(questionnaire.item);

  return customRender(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      questionnaire={questionnaire}
      resources={resourcesDefault}
      onChange={() => {}}
      {...props}
    />,
    { store, defaultValues }
  );
}
export * from '@testing-library/react';

export {
  customRender as render,
  customRenderMockStore as renderMockStore,
  renderWithRedux,
  renderWithReduxAndHookFormMock,
  renderRefero,
  userEvent,
};
