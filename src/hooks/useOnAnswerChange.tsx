import { useScoringCalculator } from './useScoringCalculator';
import { ActionRequester, IActionRequester } from '@/util/actionRequester';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';
import { GlobalState, useAppDispatch } from '@/reducers';

const useOnAnswerChange = (
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void
): ((state: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void) => {
  const dispatch = useAppDispatch();
  const { runScoringCalculator } = useScoringCalculator();

  return (state: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): void => {
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;
    if (questionnaire && questionnaireResponse) {
      const actionRequester = new ActionRequester(questionnaire, questionnaireResponse);
      const questionnaireInspector = new QuestionniareInspector(questionnaire, questionnaireResponse);
      onChange && onChange(item, answer, actionRequester, questionnaireInspector);
      for (const action of actionRequester.getActions()) {
        dispatch(action);
      }
    }
    runScoringCalculator(questionnaire, questionnaireResponse);
  };
};
export default useOnAnswerChange;
