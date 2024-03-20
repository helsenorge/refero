import { ThunkDispatch } from 'redux-thunk';
import { NewValueAction } from '../store/actions/newValue';
import { GlobalState } from '../store/reducers';
import { Path } from '../util/refero-core';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export interface DispatchProps {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  mount: () => void;
  updateSkjema: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    language?: string,
    syncQuestionnaireResponse?: boolean
  ) => void;
  path: Array<Path>;
}
