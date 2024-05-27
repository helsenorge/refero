import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider, Store } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { FormProvider, useForm } from 'react-hook-form';
import '@testing-library/jest-dom/extend-expect';
import rootReducer, { GlobalState } from '../../../reducers';
import { applyMiddleware, createStore } from 'redux';
const mockStore = configureMockStore<Partial<GlobalState>>([thunk]);

const FormWrapper = ({ children, defaultValues }: { children: React.ReactNode; defaultValues: any }) => {
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
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  initialState?: Partial<GlobalState>;
  store?: Store<GlobalState>;
}
const renderWithRedux = (
  ui: React.ReactElement,
  { initialState, store = createStore(rootReducer, initialState, applyMiddleware(thunk)), ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

export { customRender as render, renderWithRedux };
