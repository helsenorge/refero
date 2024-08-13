import { useDispatch } from 'react-redux';
import { useScoringCalculator } from './useScoringCalculator';
import { ActionRequester, IActionRequester } from '@/util/actionRequester';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';
import { GlobalState } from '@/reducers';

const useOnAnswerChange = (
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void
): ((state: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void) => {
  const dispatch = useDispatch();
  const { runScoringCalculator } = useScoringCalculator();

  const onAnswerChange = (state: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): void => {
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
  return onAnswerChange;
};
export default useOnAnswerChange;
