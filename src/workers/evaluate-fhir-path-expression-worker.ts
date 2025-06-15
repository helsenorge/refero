import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

import { FhirPathExpressionWorkerInput } from '@/workers/fhir-path-worker';
import { evaluateFhirpathExpression } from '@/workers/utils';

self.addEventListener('message', async (event: MessageEvent<FhirPathExpressionWorkerInput>) => {
  const { extension, questionnaireResponse, questionnaire } = event.data;

  try {
    const context = {
      questionnaire,
      fhirpath_r4_model,
    };

    const results = await evaluateFhirpathExpression<number | string>(extension, questionnaireResponse, context);

    self.postMessage({ type: 'success', payload: results });
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});
