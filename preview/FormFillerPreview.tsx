import { useState } from 'react';

import {
  Attachment,
  Bundle,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  ValueSet,
} from 'fhir/r4';
import { Provider } from 'react-redux';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import FormFillerSidebar from './FormFillerSidebar';
import { emptyPropertyReplacer } from './helpers';
import { getResources } from './resources/referoResources';
import skjema from './skjema/HV-SOS-1-v2.4.json';

import ReferoContainer from '../src/components/index';
import valueSet from '../src/constants/valuesets';
import rootReducer from '../src/reducers/index';
import { QuestionnaireStatusCodes } from '../src/types/fhirEnums';
import { EnhetType, OrgenhetHierarki } from '../src/types/orgenhetHierarki';
import { IActionRequester, setSkjemaDefinitionAction } from '@/actions/form';
import { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import { configureStore } from '@reduxjs/toolkit';
import HelpButton from './external-components/HelpButton';

type Props = {
  showFormFiller: () => void;
};

const getQuestionnaireFromBubndle = (bundle: Bundle<Questionnaire> | Questionnaire, lang: number = 0): Questionnaire => {
  if (bundle.resourceType === 'Questionnaire') {
    return bundle;
  } else {
    return (
      bundle?.entry?.[lang].resource ?? {
        resourceType: 'Questionnaire',
        status: QuestionnaireStatusCodes.DRAFT,
      }
    );
  }
};
const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void): any => {
  successCallback([
    {
      OrgenhetId: 204,
      Navn: 'Helse Vest',
      EnhetType: 1,
      EndepunktId: null,
      UnderOrgenheter: [
        {
          OrgenhetId: 227,
          Navn: 'Betanien sykehus',
          EnhetType: 2,
          EndepunktId: '18',
          UnderOrgenheter: null,
          VisningType: 2,
          ForelderId: 204,
          ExpectedChildCount: 0,
          StatusType: 2,
        },
        {
          OrgenhetId: 221,
          Navn: 'Helse Førde',
          EnhetType: 2,
          EndepunktId: '12',
          UnderOrgenheter: null,
          VisningType: 2,
          ForelderId: 204,
          ExpectedChildCount: 0,
          StatusType: 2,
        },
        {
          OrgenhetId: 218,
          Navn: 'Helse Stavanger',
          EnhetType: 2,
          EndepunktId: '3',
          UnderOrgenheter: null,
          VisningType: 2,
          ForelderId: 204,
          ExpectedChildCount: 0,
          StatusType: 2,
        },
      ],
      VisningType: 2,
      ForelderId: null,
      ExpectedChildCount: 3,
      StatusType: 2,
    },
    {
      OrgenhetId: 190,
      Navn: 'TestRegion Norsk Helsenett',
      EnhetType: 1,
      EndepunktId: null,
      UnderOrgenheter: [
        {
          OrgenhetId: 187,
          Navn: 'Testforetak 1 Norsk Helsenett',
          EnhetType: 2,
          EndepunktId: 'test-endpoint',
          UnderOrgenheter: null,
          VisningType: 1,
          ForelderId: 190,
          ExpectedChildCount: 0,
          StatusType: 2,
        },
      ],
      VisningType: 2,
      ForelderId: null,
      ExpectedChildCount: 1,
      StatusType: 2,
    },
  ]);
};
const fetchValueSetFn = (
  _searchString: string,
  _item: QuestionnaireItem,
  successCallback: (valueSet: ValueSet) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _errorCallback: (error: string) => void
  // eslint-disable-next-line
): any => {
  successCallback({
    resourceType: 'ValueSet',
    status: 'draft',
    compose: {
      include: [
        {
          system: valueSet.LEGEMIDDELOPPSLAG_SYSTEM,
          concept: [
            {
              code: '1',
              display: 'Fyrstekake',
            },
          ],
        },
      ],
    },
  });
};
const MimeTypes = {
  PlainText: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  PDF: 'application/pdf',
  JSON: 'application/json',
};

const FormFillerPreview = (props: Props): JSX.Element => {
  const store = configureStore({ reducer: rootReducer, middleware: getDefaultMiddleware => getDefaultMiddleware() });

  const questionnaireForPreview = JSON.parse(JSON.stringify(skjema ?? {}, emptyPropertyReplacer)) as Bundle<Questionnaire> | Questionnaire;
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>();
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const handleSubmit = (questionnaireResponse: QuestionnaireResponse): void => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(questionnaireResponse));
  };
  const [lang, setLang] = useState<number>(0);
  const uploadAttachment = (file: File[], onSuccess: (attachment: Attachment) => void): void => {
    onSuccess({ data: file[0].name, contentType: file[0].type, url: 'url' });
  };
  //@ts-expect-error error
  const onDeleteAttachment = (fileId: string, onSuccess: () => void): void => {
    onSuccess();
  };
  const onOpenAttachment = (fileId: string): void => {
    // eslint-disable-next-line no-console
    console.log(fileId);
  };
  const dispatch = store.dispatch;
  const onChange = (
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: QuestionnaireItem,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    answer: QuestionnaireResponseItemAnswer,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    actionRequester: IActionRequester,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    questionnaireInspector: IQuestionnaireInspector
  ): void => {
    // eslint-disable-next-line no-console
    // console.log(item, answer, actionRequester, questionnaireInspector);
  };
  return (
    <Provider store={store}>
      <div className="overlay">
        <div className="preview-window">
          <div className="title align-everything">
            <h1>{'Preview'}</h1>
            <button onClick={(): void => setLang(lang === 0 ? 1 : 0)}>{`Endre språk ${lang === 0 ? 'til engelsk' : 'til norsk'}`}</button>
          </div>
          <FormFillerSidebar questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview, lang)} />

          <div className="referoContainer-div">
            {!showResponse ? (
              <div className="page_refero">
                <ReferoContainer
                  questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview, lang)}
                  onCancel={() => {}}
                  onChange={onChange}
                  onSave={(questionnaireResponse: QuestionnaireResponse): void => {
                    setQuestionnaireResponse(questionnaireResponse);
                    setShowResponse(true);
                    // dispatch(
                    //   setSkjemaDefinitionAction({
                    //     syncQuestionnaireResponse: true,
                    //     questionnaire: getQuestionnaireFromBubndle(questionnaireForPreview, lang),
                    //     questionnaireResponse,
                    //   })
                    // );
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
                  fetchValueSet={fetchValueSetFn}
                  fetchReceivers={fetchReceiversFn}
                  uploadAttachment={uploadAttachment}
                  onDeleteAttachment={onDeleteAttachment}
                  onOpenAttachment={onOpenAttachment}
                  attachmentValidTypes={[MimeTypes.PNG, MimeTypes.JPG, MimeTypes.PDF, MimeTypes.PlainText]}
                  attachmentMaxFileSize={1}
                  onRequestHelpButton={(_1, _2, _3, _4, opening) => {
                    return <HelpButton opening={opening} />;
                  }}
                  // onStepChange={(newIndex: number): void => setStepIndex(newIndex)}
                />
              </div>
            ) : (
              <div>
                <pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>
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
