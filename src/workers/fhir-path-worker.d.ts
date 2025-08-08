import { Extension, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { AnswerPad } from '../util/FhirPathExtensions';

export interface WorkerInput {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}
export interface FhirPathExpressionWorkerInput {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  extension: Extension;
}

export type WorkerResponse =
  | {
      type: 'success';
      payload: {
        fhirScores: AnswerPad;
      };
    }
  | {
      type: 'error';
      payload: {
        message: string;
        stack?: string;
      };
    };
