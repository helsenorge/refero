import '@helsenorge/designsystem-react/scss/supernova/index.css';
import '../../../preview/styles/skjemautfyller.scss';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import type { Bundle, Questionnaire } from 'fhir/r4';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import { getResources } from '../../../preview/resources/referoResources';

// What is used of the implementation under test. Keep it to things that exist on every ref that is compared.
import ReferoContainer from '@/components/index';
import { store as createStore } from '@/reducers';

/**
 * The smallest page that shows refero, built for production by run.mjs and filled in by fill.mjs. The form is
 * put on the page by the test (window.__BENCH_FORM__); the store is handed back to it (window.__referoStore).
 */
type Store = ReturnType<typeof createStore>;
const benchWindow = window as unknown as { __BENCH_FORM__?: Bundle | Questionnaire; __referoStore?: Store };

const form = benchWindow.__BENCH_FORM__;
const questionnaire =
  form?.resourceType === 'Bundle'
    ? (form.entry?.find(entry => entry.resource?.resourceType === 'Questionnaire')?.resource as Questionnaire | undefined)
    : form;
const store = createStore();
benchWindow.__referoStore = store;

createRoot(document.getElementById('root')!).render(
  questionnaire ? (
    <Provider store={store}>
      <div className="page_refero">
        <ReferoContainer
          questionnaire={questionnaire}
          onCancel={() => {}}
          onSave={() => {}}
          onSubmit={() => {}}
          authorized={true}
          loginButton={<button>{'Login'}</button>}
          resources={getResources('')}
          syncQuestionnaireResponse={false}
          language={LanguageLocales.NORWEGIAN}
        />
      </div>
    </Provider>
  ) : (
    <p>{'No form'}</p>
  )
);
