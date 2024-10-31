import { useEffect, useState } from 'react';

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

import { emptyPropertyReplacer } from './helpers';
import { getResources } from './resources/referoResources';
import skjema from './skjema/q.json';
import qr from './skjema/responses/qr.json';
import ReferoContainer from '../src/components/index';
import valueSet from '../src/constants/valuesets';
import rootReducer from '../src/reducers/index';
import { QuestionnaireStatusCodes } from '../src/types/fhirEnums';
import { EnhetType, OrgenhetHierarki } from '../src/types/orgenhetHierarki';
import { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import { configureStore } from '@reduxjs/toolkit';
import HelpButton from './external-components/HelpButton';
import Button from '@helsenorge/designsystem-react/components/Button';
import { MimeType } from '@/util/attachmentHelper';

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
      OrgenhetId: 1,
      EndepunktId: null,
      Navn: 'Region 1',
      EnhetType: EnhetType.Region,
      UnderOrgenheter: [
        { OrgenhetId: 11, EndepunktId: '1', Navn: 'Receiver 1', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
        { OrgenhetId: 12, EndepunktId: '11', Navn: 'Receiver 11', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
      ],
    },
    {
      OrgenhetId: 2,
      EndepunktId: null,
      Navn: 'Region 2',
      EnhetType: EnhetType.Region,
      UnderOrgenheter: [{ OrgenhetId: 21, EndepunktId: '2', Navn: 'Receiver 2', EnhetType: EnhetType.Foretak, UnderOrgenheter: null }],
    },
    {
      OrgenhetId: 2,
      EndepunktId: '1',
      Navn: 'Region 3',
      EnhetType: EnhetType.Foretak,
      UnderOrgenheter: null,
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

const FormFillerPreview = (): JSX.Element => {
  const store = configureStore({ reducer: rootReducer, middleware: getDefaultMiddleware => getDefaultMiddleware() });
  const [lang, setLang] = useState<number>(0);

  const parsedQuestionnaire = JSON.parse(JSON.stringify(skjema ?? {}, emptyPropertyReplacer)) as Bundle<Questionnaire> | Questionnaire;
  const mainQuestionnaire = getQuestionnaireFromBubndle(parsedQuestionnaire, 0);

  const parsedQuestionnaireResponse = JSON.parse(JSON.stringify(qr ?? {}, emptyPropertyReplacer)) as QuestionnaireResponse;

  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(mainQuestionnaire);
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(parsedQuestionnaireResponse);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const handleSubmit = (questionnaireResponse: QuestionnaireResponse): void => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(questionnaireResponse));
  };
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
  const setQr = (): void => {
    dispatch(
      setSkjemaDefinitionAction({
        questionnaire: mainQuestionnaire,
        questionnaireResponse: parsedQuestionnaireResponse,
      })
    );
  };

  if (!questionnaire) return <div>{'loading...'}</div>;
  return (
    <Provider store={store}>
      <div className="overlay">
        <div className="preview-window">
          <div className="title align-everything" style={{ marginBottom: '2rem' }}>
            <h1>{'Preview'}</h1>
            <div style={{ display: 'inline-flex', gap: '2rem' }}>
              <Button onClick={(): void => setLang(lang === 0 ? 1 : 0)}>{`Endre språk ${lang === 0 ? 'til engelsk' : 'til norsk'}`}</Button>{' '}
              <Button onClick={setQr}>{'Set QR'}</Button>
            </div>
          </div>

          <div className="referoContainer-div">
            {!showResponse ? (
              <div className="page_refero">
                <ReferoContainer
                  questionnaire={questionnaire}
                  onCancel={() => {}}
                  onChange={onChange}
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
                  fetchValueSet={fetchValueSetFn}
                  fetchReceivers={fetchReceiversFn}
                  uploadAttachment={uploadAttachment}
                  onDeleteAttachment={onDeleteAttachment}
                  onOpenAttachment={onOpenAttachment}
                  attachmentValidTypes={[MimeType.PNG, MimeType.JPG, MimeType.JPEG, MimeType.PDF, MimeType.PlainText]}
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
                <Button
                  onClick={(): void => {
                    setShowResponse(false);
                    setQr();
                  }}
                >
                  {'Tilbake til skjemautfyller'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default FormFillerPreview;
