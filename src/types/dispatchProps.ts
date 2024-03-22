import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export interface DispatchProps {
  mount: () => void;
  updateSkjema: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    language?: string,
    syncQuestionnaireResponse?: boolean
  ) => void;
}
