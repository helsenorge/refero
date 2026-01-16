/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactElement, type ReactNode } from 'react';

import { configureStore, type Store } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { Provider } from 'react-redux';

import type { ReferoProps } from '../src/types/referoProps';
import type { Resources } from '../src/util/resources';
import type { ComponentPlugin } from '@/types/componentPlugin';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { getResources } from '../preview/resources/referoResources';
import { generateQuestionnaireResponse } from '../src/actions/generateQuestionnaireResponse';
import ReferoContainer from '../src/components';
import rootReducer, { type GlobalState } from '../src/reducers';
import { createIntitialFormValues, type DefaultValues } from '../src/validation/defaultFormValues';

import { AttachmentProvider } from '@/context/attachment/AttachmentContextProvider';
import { ComponentPluginProvider } from '@/context/componentPlugin';
import { ExternalRenderProvider } from '@/context/externalRender/ExternalRenderContextProvider';

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

/**
 * Wrapper for plugin-related tests that includes ComponentPluginProvider
 */
export const PluginTestWrapper = ({
  children,
  defaultValues = {},
  store,
  referoProps,
  plugins,
}: {
  children: React.ReactNode;
  defaultValues?: any;
  store: Store;
  referoProps?: Partial<ReferoProps>;
  plugins?: ComponentPlugin[];
}): JSX.Element => {
  return (
    <Provider store={store}>
      <ExternalRenderProviderWrapper props={referoProps}>
        <AttachmentProvider {...referoProps}>
          <ComponentPluginProvider plugins={plugins}>
            <FormWrapper defaultValues={defaultValues}>{children}</FormWrapper>
          </ComponentPluginProvider>
        </AttachmentProvider>
      </ExternalRenderProviderWrapper>
    </Provider>
  );
};

const AllTheProviders = ({
  children,
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

/**
 * Creates a store for plugin testing with a single questionnaire item
 */
export const createPluginTestStore = (questionnaireItem?: QuestionnaireItem, answerValue?: QuestionnaireResponseItemAnswer[]): Store => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: questionnaireItem ? [questionnaireItem] : [],
  };

  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: questionnaireItem
      ? [
          {
            linkId: questionnaireItem.linkId,
            answer: answerValue ?? [],
          },
        ]
      : [],
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      refero: {
        form: {
          Language: 'en',
          FormDefinition: { Content: questionnaire },
          FormData: { Content: questionnaireResponse },
        },
      },
    },
  });
};

/**
 * Default resources for plugin testing
 */
export const defaultPluginTestResources: Partial<Resources> = {
  ikkeBesvart: 'Not answered',
  formCancel: 'Cancel',
  formSend: 'Send',
  repeatButtonText: 'Add',
  confirmDeleteButtonText: 'Delete',
  confirmDeleteCancelButtonText: 'Cancel',
  confirmDeleteHeading: 'Delete?',
  confirmDeleteDescription: 'Are you sure?',
  validationNotAllowed: 'Not allowed',
  errorAfterMaxDate: 'After max date',
  errorBeforeMinDate: 'Before min date',
  oppgiVerdi: 'Enter value',
};

interface InputProps {
  questionnaire: Questionnaire | undefined | null;
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
  const defaultReactHookFormValues = defaultValues ?? createIntitialFormValues(questionnaire?.item);

  return customRender(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      questionnaire={questionnaire ?? undefined}
      resources={resourcesDefault}
      onChange={() => {}}
      {...props}
    />,
    { store, defaultValues: defaultReactHookFormValues, referoProps: props }
  );
}
export async function renderReferoWithStore({ questionnaire, props, initialState, resources, defaultValues }: InputProps) {
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

  const defaultReactHookFormValues = defaultValues ?? createIntitialFormValues(questionnaire?.item);

  // do the normal render
  const rtl = customRender(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      questionnaire={questionnaire ?? undefined}
      resources={resourcesDefault}
      onChange={() => {}}
      {...props}
    />,
    { store, defaultValues: defaultReactHookFormValues, referoProps: props }
  );

  // return everything you usually get from RTL + store
  return { ...rtl, store };
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
  const defaultReactHookFormValues = defaultValues ?? createIntitialFormValues(questionnaire?.item);

  return customRender2(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      questionnaire={questionnaire ?? undefined}
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
