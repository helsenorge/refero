import * as React from 'react';

import '../../../../util/defineFetch';
import String from '../string';
import { QuestionnaireItem } from 'fhir/r4';
import { RenderContext } from '../../../../util/renderContext';
import { renderMockStore } from '../../../__tests__/test-utils/test-utils';
import { WithCommonFunctionsAndEnhancedProps } from '../../../with-common-functions';
import { act } from 'react-dom/test-utils';
jest.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function, delay: number, immediate: boolean) => fn,
}));
//TODO: Skal dette fungere å teste må vi rendre hele refero container og ha et questionnaire med kun string.
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
    it.only('Should render with validation', async () => {
      const {
        renderResult: { findByText },
      } = renderComponent({ validateScriptInjection, answer: [{ valueString: value }] });

      const item = await findByText('&lt;html&gt; er ikke tillatt');
      expect(item).toBeInTheDocument();
    });
  });

  describe.skip('When input does not have html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med uten html';
    it('Should render without validation', async () => {
      const {
        renderResult: { findByDisplayValue },
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
        renderResult: { findByDisplayValue },
      } = renderComponent({ validateScriptInjection, answer: [{ valueString: value }] });
      await act(async () => {
        expect(await findByDisplayValue(value)).toBeInTheDocument();
      });
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
