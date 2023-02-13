import { ThunkDispatch } from "redux-thunk";
import { NewValueAction } from "../actions/newValue";
import { GlobalState } from "../reducers";
import { Path } from "../util/refero-core";
import { Questionnaire, QuestionnaireResponse } from "./fhir";

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