/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement, ReactNode } from 'react';

import { configureStore, Store } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { Provider } from 'react-redux';

import { getResources } from '../preview/resources/referoResources';
import { generateQuestionnaireResponse } from '../src/actions/generateQuestionnaireResponse';
import ReferoContainer from '../src/components';
import rootReducer, { GlobalState } from '../src/reducers';
import { ReferoProps } from '../src/types/referoProps';
import { Resources } from '../src/util/resources';
import { createIntitialFormValues, DefaultValues } from '../src/validation/defaultFormValues';

import { AttachmentProvider } from '@/context/attachment/AttachmentContextProvider';
import { ExternalRenderProvider } from '@/context/externalRender/ExternalRenderContextProvider';
import { enableWhenListener } from '@/index';

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
  store,
  referoProps,
}: {
  children: React.ReactNode;
  initialState?: Partial<GlobalState>;
  defaultValues?: any;
  store: Store;
  referoProps?: Partial<ReferoProps>;
}) => {
  return (
    <Provider store={store}>
      <ExternalRenderProviderWrapper props={referoProps}>
        <AttachmentProvider {...referoProps}>
          <FormWrapper defaultValues={defaultValues}>{children}</FormWrapper>
        </AttachmentProvider>
      </ExternalRenderProviderWrapper>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> } & { defaultValues?: any } & {
    store: Store;
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
    store,
  });
};
const customRender2 = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> } & { defaultValues?: any } & {
    store: Store;
  } & { referoProps?: Partial<ReferoProps> }
) => {
  const { initialState, defaultValues, store, referoProps, ...renderOptions } = options || {};
  return {
    render: render(ui, {
      wrapper: ({ children }) => (
        <AllTheProviders initialState={initialState} defaultValues={defaultValues} store={store} referoProps={referoProps}>
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
  store?: Store;
}
const renderWithRedux = (
  ui: React.ReactElement,
  {
    initialState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState as GlobalState,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
};
const renderWithReduxAndHookFormMock = (
  ui: React.ReactElement,
  {
    initialState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState as GlobalState,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
      //.prepend(enableWhenListener.middleware),
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
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

async function renderRefero({ questionnaire, props, initialState, resources, defaultValues }: InputProps) {
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
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: state,
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
    //.prepend(enableWhenListener.middleware),
  });
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

async function renderRefero2({ questionnaire, props, initialState, resources, defaultValues }: InputProps) {
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
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: state,
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
    //.prepend(enableWhenListener.middleware),
  });
  const defaultReactHookFormValues = defaultValues ?? createIntitialFormValues(questionnaire.item);

  return customRender2(
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
const user = userEvent.setup();
export { customRender as render, renderWithRedux, renderWithReduxAndHookFormMock, renderRefero, renderRefero2, user as userEvent };
