import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import '../../util/defineFetch';
import { Questionnaire } from 'fhir/r4';
import { ReferoContainer } from '..';
import { Resources } from '../../util/resources';
import questionnaireWithEnableWhen from './__data__/enableWhen';
import { changeCheckBoxOption } from './utils';
import rootReducer from '../../reducers';
import { render } from './test-utils/test-utils';

describe('enableWhen with checkboxes and multiple answers', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('enableWhen should trigger when correct answer is selected', async () => {
    const { container, queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText('Flere sykdommer')).not.toBeInTheDocument();
    await changeCheckBoxOption('Andre sykdommer', container);

    expect(queryByLabelText('Flere sykdommer')).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    const { container, queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText('Flere sykdommer')).not.toBeInTheDocument();
    await changeCheckBoxOption('Allergi', container);
    await changeCheckBoxOption('Hepatitt C', container);
    await changeCheckBoxOption('Andre sykdommer', container);

    expect(queryByLabelText('Flere sykdommer')).toBeInTheDocument();
  });
});

function createWrapper(questionnaire: Questionnaire) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return render(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      resources={{} as Resources}
      questionnaire={questionnaire}
    />,
    {
      store,
    }
  );
}
