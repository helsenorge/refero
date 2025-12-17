import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { runCalculatorsAction, runEnableWhenAction } from '@/actions/thunks';
import { type GlobalState, useAppDispatch } from '@/reducers';
import { ActionRequester, type IActionRequester } from '@/util/actionRequester';
import { type IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';

const useOnAnswerChange = (
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void
): ((state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer) => void) => {
  const dispatch = useAppDispatch();

  return (state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer): void => {
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;
    if (questionnaire && questionnaireResponse) {
      const actionRequester = new ActionRequester(questionnaire, questionnaireResponse);
      dispatch(runCalculatorsAction());
      dispatch(runEnableWhenAction());
      const questionnaireInspector = new QuestionniareInspector(questionnaire, questionnaireResponse);
      if (onChange && answer && item) {
        onChange(item, answer, actionRequester, questionnaireInspector);
      }

      actionRequester.dispatchAllActions(dispatch);
    }
  };
};
export default useOnAnswerChange;
