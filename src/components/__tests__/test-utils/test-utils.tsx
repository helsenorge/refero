import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { useFormContext, FormProvider, useForm } from 'react-hook-form';
import { GlobalState } from '../../../reducers';

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn(),
}));

const mockUseFormContext = {
  formState: {},
  getFieldState: jest.fn().mockReturnValue({
    error: undefined,
    invalid: false,
    isDirty: false,
    isTouched: false,
    isValidating: false,
  }),
  control: {
    register: jest.fn(),
    unregister: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    trigger: jest.fn(),
    formState: {
      errors: {},
      isDirty: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isSubmitting: false,
      isValid: true,
      isValidating: false,
      submitCount: 0,
    },
  },
  register: jest.fn(),
};

// Provide the mock implementation
(useFormContext as jest.Mock).mockImplementation(() => mockUseFormContext);

const mockStore = configureMockStore([thunk]);

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const AllTheProviders = ({ children, initialState = {} }: { children: React.ReactNode; initialState?: Partial<GlobalState> }) => {
  const store = mockStore(initialState);
  return (
    <Provider store={store}>
      <FormWrapper>{children}</FormWrapper>
    </Provider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'> & { initialState?: Partial<GlobalState> }) => {
  const { initialState, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders initialState={initialState}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};
export * from '@testing-library/react';
export { customRender as render };
