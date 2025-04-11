import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

// import { runCalculatorsAction } from '@/actions/thunks';
import { GlobalState, useAppDispatch } from '@/reducers';
import { ActionRequester, IActionRequester } from '@/util/actionRequester';
import { IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';

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
      const questionnaireInspector = new QuestionniareInspector(questionnaire, questionnaireResponse);
      if (onChange && answer && item) {
        onChange(item, answer, actionRequester, questionnaireInspector);
      }

      actionRequester.dispatchAllActions(dispatch);
    }
  };
};
export default useOnAnswerChange;
