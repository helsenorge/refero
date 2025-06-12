import { createAsyncThunk } from '@reduxjs/toolkit';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runFhirPathQrUpdater } from '@/calculators/runFhirPathUpdater';
import { runScoringCalculator } from '@/calculators/runScoringCalculator';
import { AppDispatch, RootState } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { debounce } from '@/util/debounce';
import { ScoringCalculator } from '@/util/scoringCalculator';

const scoringCalculatorCache = new WeakMap<Questionnaire, ScoringCalculator>();

function getScoringCalculator(questionnaire: Questionnaire): ScoringCalculator {
  let calc = scoringCalculatorCache.get(questionnaire);
  if (!calc) {
    calc = new ScoringCalculator(questionnaire);
    scoringCalculatorCache.set(questionnaire, calc);
  }
  return calc;
}

const debouncedFhirPathRunner = debounce(
  (params: { questionnaire: Questionnaire; questionnaireResponse: QuestionnaireResponse; dispatch: AppDispatch }) => {
    runFhirPathQrUpdater(params);
  },
  50
);

export const runCalculatorsAction = createAsyncThunk<void, void, { state: RootState; dispatch: AppDispatch }>(
  'questionnaireResponse/update',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;

    if (!questionnaire || !questionnaireResponse) {
      return rejectWithValue('Missing questionnaire or questionnaireResponse');
    }

    try {
      const scoringActionRequester = new ActionRequester(questionnaire, questionnaireResponse);

      await runScoringCalculator(questionnaire, questionnaireResponse, scoringActionRequester, getScoringCalculator(questionnaire));

      scoringActionRequester.dispatchAllActions(dispatch);

      const updatedQuestionnaireResponse = getState().refero.form.FormData.Content;
      if (!updatedQuestionnaireResponse) {
        return rejectWithValue('Missing updated questionnaire response');
      }
      debouncedFhirPathRunner({
        questionnaire,
        questionnaireResponse: updatedQuestionnaireResponse,
        dispatch,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
