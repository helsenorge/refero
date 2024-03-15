import React, { useState } from 'react';

import { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { Provider } from 'react-redux';
import { Store, legacy_createStore as createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { QuestionnaireStatusCodes } from '../types/fhirEnums';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import FormFillerSidebar from './FormFillerSidebar';
import { emptyPropertyReplacer } from './helpers';
import { getResources } from './resources/referoResources';
import skjema from './skjema/all_simple_fields.json';
import { ReferoContainer } from '../components';
import rootReducer from '../reducers';

type Props = {
  showFormFiller: () => void;
};

const getQuestionnaireFromBubndle = (bundle: Bundle<Questionnaire> | Questionnaire): Questionnaire => {
  if (bundle.resourceType === 'Questionnaire') {
    return bundle;
  } else {
    return (
      bundle?.entry?.[0].resource ?? {
        resourceType: 'Questionnaire',
        status: QuestionnaireStatusCodes.DRAFT,
      }
    );
  }
};

const FormFillerPreview = ({ showFormFiller }: Props): JSX.Element => {
  const store: Store = createStore(rootReducer, applyMiddleware(thunk));

  const questionnaireForPreview = JSON.parse(JSON.stringify(skjema ?? {}, emptyPropertyReplacer)) as Bundle<Questionnaire> | Questionnaire;
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>();
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const handleSubmit = (questionnaireResponse: QuestionnaireResponse): void => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(questionnaireResponse));
  };
  return (
    <Provider store={store}>
      <div className="overlay">
        <div className="preview-window">
          <div className="title align-everything">
            <h1>{'Preview'}</h1>
          </div>
          <FormFillerSidebar questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview)} />

          <div className="referoContainer-div">
            {!showResponse ? (
              <div className="page_refero">
                <ReferoContainer
                  key={123}
                  store={store}
                  questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview)}
                  onCancel={showFormFiller}
                  onSave={(questionnaireResponse: QuestionnaireResponse): void => {
                    setQuestionnaireResponse(questionnaireResponse);
                    setShowResponse(true);
                  }}
                  // eslint-disable-next-line no-console
                  onSubmit={handleSubmit}
                  authorized={true}
                  resources={getResources('')}
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
