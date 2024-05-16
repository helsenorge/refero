import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../../../reducers';
import thunk from 'redux-thunk';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
