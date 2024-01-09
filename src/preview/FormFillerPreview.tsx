import React, { useState } from 'react';

import { Provider } from 'react-redux';
import { Store, legacy_createStore as createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { QuestionnaireResponse } from '../types/fhir';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import FormFillerSidebar from './FormFillerSidebar';
import { emptyPropertyReplacer } from './helpers';
import { getResources } from './resources/referoResources';
import skjema from './skjema/kun_qest_hn2.json';
// import { getResources } from './resources/referoResources';
import { ReferoContainer } from '../components';
import rootReducer from '../reducers';
import { Resources } from '../util/resources';

type Props = {
  showFormFiller: () => void;
};

const FormFillerPreview = ({ showFormFiller }: Props): JSX.Element => {
  const store: Store = createStore(rootReducer, applyMiddleware(thunk));

  const questionnaireForPreview = JSON.parse(JSON.stringify(skjema ?? {}, emptyPropertyReplacer));
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>();
  const [showResponse, setShowResponse] = useState<boolean>(false);
  return (
    <Provider store={store}>
      <div className="overlay">
        <div className="preview-window">
          <div className="title align-everything">
            <h1>{'Preview'}</h1>
          </div>
          <FormFillerSidebar questionnaire={questionnaireForPreview} />

          <div className="referoContainer-div">
            {!showResponse ? (
              <div className="page_refero">
                <ReferoContainer
                  store={store}
                  questionnaire={questionnaireForPreview}
                  onCancel={showFormFiller}
                  onSave={(questionnaireResponse: QuestionnaireResponse): void => {
                    setQuestionnaireResponse(questionnaireResponse);
                    setShowResponse(true);
                  }}
                  // eslint-disable-next-line no-console
                  onSubmit={(): void => console.log('onSubmit')}
                  authorized={true}
                  resources={getResources('') as unknown as Resources}
                  sticky={true}
                  saveButtonDisabled={false}
                  loginButton={<button>{'Login'}</button>}
                  syncQuestionnaireResponse
                  validateScriptInjection
                  language={LanguageLocales.NORWEGIAN}
                />
              </div>
            ) : (
              <div>
                <p>{JSON.stringify(questionnaireResponse)}</p>
                <button onClick={(): void => setShowResponse(false)}>{'Tilbake til skjemautfyller'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default FormFillerPreview;
