import * as React from 'react';

import '../../../../util/defineFetch';
import { renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { WithCommonFunctionsAndEnhancedProps } from '../../../with-common-functions';
import { act } from 'react-dom/test-utils';
import q from './__data__/';

import { Questionnaire } from 'fhir/r4';

jest.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));

describe('string', () => {
  describe('When input has html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med <html>';
    it('Should render with validation', async () => {
      const { findByText, findByLabelText, findByRole } = renderComponent({ validateScriptInjection }, q);
      await act(async () => {
        userEvent.type(await findByLabelText('String1'), value);
        userEvent.type(await findByLabelText('String2 - Obligatorisk'), 'test');
        userEvent.click(await findByRole('button', { name: 'submit' }));
      });
      const actualElement = await findByText(/er ikke tillatt/i);
      const actualAlert = await findByRole('alert');
      expect(actualElement).toBeInTheDocument();
      expect(actualAlert).toBeInTheDocument();
    });
  });

  describe('When input does not have html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input uten html';
    it('Should render without validation', async () => {
      const { findByDisplayValue, findByLabelText, queryByRole } = renderComponent({ validateScriptInjection }, q);
      userEvent.type(await findByLabelText('String2 - Obligatorisk'), value);
      const actualAlert = queryByRole('alert');
      const item = await findByDisplayValue(value);

      expect(item).toBeInTheDocument();
      expect(actualAlert).not.toBeInTheDocument();
    });
  });

  describe('When input has html and validateScriptInjection = false', () => {
    const validateScriptInjection = false;
    const value = 'input med <html>';
    it('Should render with validation', async () => {
      const { findByDisplayValue, findByLabelText, findByRole, queryByRole } = renderComponent({ validateScriptInjection }, q);
      await act(async () => {
        userEvent.type(await findByLabelText('String2 - Obligatorisk'), value);
        userEvent.click(await findByRole('button', { name: 'submit' }));
      });
      const actualElement = await findByDisplayValue(value);
      const actualAlert = queryByRole('alert');
      expect(actualElement).toBeInTheDocument();
      expect(actualAlert).not.toBeInTheDocument();
    });
  });
});

function renderComponent(props: Partial<WithCommonFunctionsAndEnhancedProps>, questionnaire: Questionnaire) {
  const resources = {
    formSend: 'submit',
  };
  return renderRefero({ questionnaire, props, resources });
}
