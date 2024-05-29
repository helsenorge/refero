import * as React from 'react';

import '../../../../util/defineFetch';
import String from '../string';
import { QuestionnaireItem } from 'fhir/r4';
import { RenderContext } from '../../../../util/renderContext';
import { findByText, getByLabelText, userEvent, renderMockStore, prettyDOM } from '../../../__tests__/test-utils/test-utils';
import { WithCommonFunctionsAndEnhancedProps } from '../../../with-common-functions';
jest.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function, delay: number, immediate: boolean) => fn,
}));

describe('string', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  describe('When input has html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med <html>';
    it('Should render with validation', async () => {
      const {
        renderResult: { findByLabelText, findByText },
      } = renderComponent({ validateScriptInjection });

      const input = await findByLabelText('Uten html');
      userEvent.type(input, value);
      jest.runAllTimers();
      const item = await findByText('&lt;html&gt; er ikke tillatt');
      expect(item).toBeInTheDocument();
    });
  });

  describe.only('When input does not have html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med uten html';
    it('Should render without validation', async () => {
      const {
        renderResult: { findByDisplayValue, container },
      } = renderComponent({ validateScriptInjection, answer: [{ valueString: value }] });

      const item = await findByDisplayValue(value);
      expect(item).toBeInTheDocument();
    });
  });

  describe('When input has html and validateScriptInjection = false', () => {
    const validateScriptInjection = false;
    const value = 'input med <html>';
    it('Should render with validation', async () => {
      const {
        renderResult: { container },
      } = renderComponent({ validateScriptInjection });
      const input = getByLabelText(container, 'Uten html');
      userEvent.type(input, value);
      const item = await findByText(container, 'er ikke tillatt');
      expect(item).toBeInTheDocument();
    });
  });
});

function renderComponent(props: Partial<WithCommonFunctionsAndEnhancedProps>) {
  const item: QuestionnaireItem = {
    id: '2',
    linkId: '2.1',
    repeats: false,
    type: 'string',
    text: 'Uten html',
  };
  return renderMockStore(
    <String
      {...props}
      idWithLinkIdAndItemIndex={item.linkId}
      item={item}
      path={[]}
      id="item_2"
      repeatButton={<div />}
      renderDeleteButton={() => {
        return null;
      }}
      visibleDeleteButton
      renderHelpButton={() => <React.Fragment />}
      renderHelpElement={() => <React.Fragment />}
      onAnswerChange={() => {}}
      oneToTwoColumn={false}
      renderRepeatButton={() => <React.Fragment />}
      renderContext={new RenderContext()}
    />
  );
}
