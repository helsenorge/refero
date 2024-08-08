/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react';

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { getResources } from '../preview/resources/referoResources';
import { generateQuestionnaireResponse } from '../src/actions/generateQuestionnaireResponse';
import ReferoContainer from '../src/components';
import rootReducer, { GlobalState } from '../src/reducers';
import { ReferoProps } from '../src/types/referoProps';
import { Resources } from '../src/util/resources';
import { createIntitialFormValues, DefaultValues } from '../src/validation/defaultFormValues';
import { ExternalRenderProvider } from '@/context/externalRenderContext';

const mockStore = configureMockStore<Partial<GlobalState>>([thunk]);

export const FormWrapper = ({ children, defaultValues }: { children: React.ReactNode; defaultValues: any }) => {
  const methods = useForm({
    shouldFocusError: false,
    criteriaMode: 'all',
    defaultValues: defaultValues,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};
export const ExternalRenderProviderWrapper = ({ children, props }: { children: React.ReactNode; props?: Partial<ReferoProps> }) => {
  return <ExternalRenderProvider {...props}>{children}</ExternalRenderProvider>;
};
const AllTheProviders = ({
  children,
  initialState = {},
  defaultValues = {},
  store = mockStore(initialState),
  referoProps,
}: {
  children: React.ReactNode;
  initialState?: Partial<GlobalState>;
  defaultValues?: any;
  store?: Store<any>;
  referoProps?: Partial<ReferoProps>;
}) => {
  return (
    <ExternalRenderProviderWrapper props={referoProps}>
      <Provider store={store}>
        <FormWrapper defaultValues={defaultValues}>{children}</FormWrapper>
      </Provider>
    </ExternalRenderProviderWrapper>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> } & { defaultValues?: any } & {
    store?: Store<any>;
  } & { referoProps?: Partial<ReferoProps> }
) => {
  const { initialState, defaultValues, store, referoProps, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialState={initialState} defaultValues={defaultValues} store={store} referoProps={referoProps}>
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
  defaultValues?: DefaultValues;
}

function renderRefero({ questionnaire, props, initialState, resources, defaultValues }: InputProps) {
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
  const defaultReactHookFormValues = defaultValues ?? createIntitialFormValues(questionnaire.item);

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
    { store, defaultValues: defaultReactHookFormValues, referoProps: props }
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
