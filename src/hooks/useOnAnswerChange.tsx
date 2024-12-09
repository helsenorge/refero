import { useScoringCalculator } from './useScoringCalculator';
import { ActionRequester, IActionRequester } from '@/util/actionRequester';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';
import { GlobalState, useAppDispatch } from '@/reducers';
import { useFhirPathQrUpdater } from './useFhirPathQrUpdater';

const useOnAnswerChange = (
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void
): ((state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer) => void) => {
  const dispatch = useAppDispatch();
  const { runScoringCalculator } = useScoringCalculator();
  const { runFhirPathQrUpdater } = useFhirPathQrUpdater();

  return (state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer): void => {
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;
    if (questionnaire && questionnaireResponse) {
      const actionRequester = new ActionRequester(questionnaire, questionnaireResponse);
      runFhirPathQrUpdater(questionnaire, questionnaireResponse, actionRequester);
      runScoringCalculator(questionnaire, questionnaireResponse, actionRequester);

      const questionnaireInspector = new QuestionniareInspector(questionnaire, questionnaireResponse);
      onChange && answer && item && onChange(item, answer, actionRequester, questionnaireInspector);
      for (const action of actionRequester.getActions()) {
        dispatch(action);
      }
    }
  };
};
export default useOnAnswerChange;
