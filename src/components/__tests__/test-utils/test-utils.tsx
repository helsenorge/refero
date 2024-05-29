import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Provider, Store } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { FormProvider, useForm } from 'react-hook-form';
import '@testing-library/jest-dom/extend-expect';
import rootReducer, { GlobalState } from '../../../reducers';
import { applyMiddleware, createStore } from 'redux';
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
  store?: MockStoreEnhanced<Partial<GlobalState>>;
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
    store?: MockStoreEnhanced<Partial<GlobalState>>;
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
    store?: MockStoreEnhanced<Partial<GlobalState>>;
  }
): { renderResult: RenderResult; store: MockStoreEnhanced<Partial<GlobalState>> } => {
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
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

export { customRender as render, customRenderMockStore as renderMockStore, renderWithRedux, renderWithReduxAndHookFormMock };
