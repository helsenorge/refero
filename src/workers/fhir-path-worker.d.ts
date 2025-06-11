import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { AnswerPad } from '../util/FhirPathExtensions'; // Assumes AnswerPad is exported from this file

/**
 * The shape of the data sent FROM the main thread TO the worker.
 */
export interface WorkerInput {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}

/**
 * The shape of the data sent FROM the worker TO the main thread.
 * This is a discriminated union, which allows for robust type checking.
 */
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
